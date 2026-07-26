"""
Professional DSP Post-Processing Pipeline
Processes raw TTS audio into commercial-grade WAV output.

Pipeline order (matches professional mastering chain):
1. Silence trimming
2. DC offset removal
3. Noise gate
4. Equalization (3-band)
5. De-essing
6. Dynamic range compression
7. Loudness normalization (EBU R128)
8. True peak limiting
9. Sample rate conversion
10. WAV encoding
"""

import numpy as np
from typing import Optional
from scipy import signal
from scipy.io import wavfile
import io
import soundfile as sf


class DSPProcessor:
    """Professional audio post-processing pipeline."""

    def __init__(self, config=None):
        from ..config import DSPConfig
        self.cfg = config or DSPConfig()

    def process(self, audio: np.ndarray, sample_rate: int) -> tuple[np.ndarray, int]:
        """
        Run the full DSP pipeline on raw audio.
        Returns (processed_audio, output_sample_rate).
        """
        if len(audio) == 0:
            raise ValueError("Empty audio input")

        # Ensure float64 for processing precision
        audio = audio.astype(np.float64)
        sr = sample_rate

        # 1. Silence trimming
        if self.cfg.enable_silence_trim:
            audio, sr = self._trim_silence(audio, sr)

        # 2. DC offset removal
        audio = audio - np.mean(audio)

        # 3. Noise gate
        if self.cfg.enable_noise_gate:
            audio = self._noise_gate(audio, sr)

        # 4. Equalization
        if self.cfg.enable_eq:
            audio = self._equalize(audio, sr)

        # 5. De-essing
        if self.cfg.enable_deesser:
            audio = self._deesser(audio, sr)

        # 6. Compression
        if self.cfg.enable_compressor:
            audio = self._compress(audio, sr)

        # 7. Loudness normalization
        if self.cfg.enable_normalization:
            audio = self._normalize_loudness(audio, sr)

        # 8. True peak limiting
        if self.cfg.enable_limiter:
            audio = self._limit(audio)

        # 9. Clip protection
        audio = np.clip(audio, -1.0, 1.0)

        # Convert back to float32
        audio = audio.astype(np.float32)

        return audio, sr

    def process_to_wav(self, audio: np.ndarray, sample_rate: int) -> bytes:
        """Process audio and return WAV bytes."""
        processed, sr = self.process(audio, sample_rate)
        buf = io.BytesIO()
        sf.write(buf, processed, sr, format='WAV', subtype='PCM_16')
        return buf.getvalue()

    def process_to_mp3(self, audio: np.ndarray, sample_rate: int) -> bytes:
        """Process audio and return MP3 bytes (requires lame)."""
        processed, sr = self.process(audio, sample_rate)
        buf = io.BytesIO()
        sf.write(buf, processed, sr, format='MP3')
        return buf.getvalue()

    # ---- Pipeline stages ----

    def _trim_silence(self, audio: np.ndarray, sr: int) -> tuple[np.ndarray, int]:
        """Remove leading and trailing silence."""
        threshold = 10 ** (self.cfg.trim_silence_threshold_db / 20)
        min_samples = int(sr * self.cfg.trim_silence_duration_ms / 1000)

        # Find first non-silent sample
        abs_audio = np.abs(audio)
        active = abs_audio > threshold

        if not np.any(active):
            return audio, sr

        # Find bounds
        indices = np.where(active)[0]
        start = max(0, indices[0] - min_samples // 2)
        end = min(len(audio), indices[-1] + min_samples // 2)

        return audio[start:end], sr

    def _noise_gate(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Apply noise gate to reduce background noise in silence."""
        threshold = 10 ** (self.cfg.noise_gate_threshold_db / 20)
        attack_samples = int(sr * 0.005)    # 5ms attack
        release_samples = int(sr * 0.050)   # 50ms release

        output = np.copy(audio)
        gain = 0.0
        in_gate = True

        for i in range(len(audio)):
            level = abs(audio[i])

            if level > threshold:
                # Open gate
                if in_gate:
                    gain = min(1.0, gain + 1.0 / attack_samples)
                    if gain >= 1.0:
                        in_gate = False
            else:
                # Close gate
                if not in_gate:
                    gain = max(0.0, gain - 1.0 / release_samples)
                    if gain <= 0.0:
                        in_gate = True

            output[i] = audio[i] * gain

        return output

    def _equalize(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """3-band parametric equalizer."""
        nyq = sr / 2

        # Low shelf (< 200 Hz)
        if self.cfg.eq_low_gain_db != 0:
            freq = min(200, nyq - 1)
            gain = self.cfg.eq_low_gain_db
            b, a = signal.iirfilter(2, freq / nyq, btype='low', ftype='butter')
            low = signal.lfilter(b, a, audio)
            audio = audio + gain / 20 * low

        # Mid peak (200-4000 Hz)
        if self.cfg.eq_mid_gain_db != 0:
            low_freq = min(200, nyq - 1)
            high_freq = min(4000, nyq - 1)
            b_band, a_band = signal.iirfilter(
                2, [low_freq / nyq, high_freq / nyq],
                btype='band', ftype='butter'
            )
            mid = signal.lfilter(b_band, a_band, audio)
            audio = audio + self.cfg.eq_mid_gain_db / 20 * mid

        # High shelf (> 4000 Hz)
        if self.cfg.eq_high_gain_db != 0:
            freq = min(4000, nyq - 1)
            b, a = signal.iirfilter(2, freq / nyq, btype='high', ftype='butter')
            high = signal.lfilter(b, a, audio)
            audio = audio + self.cfg.eq_high_gain_db / 20 * high

        return audio

    def _deesser(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Reduce sibilance (harsh 's' and 't' sounds)."""
        nyq = sr / 2
        freq = min(self.cfg.deesser_frequency_hz, nyq - 1)

        # Bandpass filter around sibilance frequency
        b, a = signal.iirfilter(2, [freq * 0.8 / nyq, min(freq * 1.2, nyq - 1) / nyq],
                                btype='band', ftype='butter')
        sibilance = signal.lfilter(b, a, audio)

        # Detect sibilant regions
        envelope = np.abs(signal.hilbert(sibilance))
        threshold = 10 ** (self.cfg.deesser_threshold_db / 20)

        # Compress sibilant regions
        gain = np.ones_like(audio)
        mask = envelope > threshold
        gain[mask] = threshold / (envelope[mask] + 1e-10)
        gain = np.clip(gain, 0.3, 1.0)  # Don't reduce more than 70%

        # Smooth the gain to avoid clicks
        win = int(sr * 0.002)  # 2ms window
        if win > 1:
            kernel = np.ones(win) / win
            gain = np.convolve(gain, kernel, mode='same')

        return audio * gain

    def _compress(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Dynamic range compressor with attack/release envelope."""
        threshold = 10 ** (self.cfg.compressor_threshold_db / 20)
        ratio = self.cfg.compressor_ratio
        attack = np.exp(-1.0 / (sr * self.cfg.compressor_attack_ms / 1000))
        release = np.exp(-1.0 / (sr * self.cfg.compressor_release_ms / 1000))

        output = np.copy(audio)
        envelope = 0.0

        for i in range(len(audio)):
            level = abs(audio[i])

            # Envelope follower
            if level > envelope:
                envelope = attack * envelope + (1 - attack) * level
            else:
                envelope = release * envelope + (1 - release) * level

            # Apply compression
            if envelope > threshold:
                gain_reduction = (threshold / envelope) ** (1 - 1/ratio)
                output[i] = audio[i] * gain_reduction

        # Makeup gain
        makeup = 1.0 + (self.cfg.compressor_threshold_db + 18) / 40
        return output * max(0.5, min(2.0, makeup))

    def _normalize_loudness(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """EBU R128 loudness normalization."""
        try:
            import pyloudnorm as pyln
            meter = pyln.Meter(sr)
            current_loudness = meter.integrated_loudness(audio)
            if np.isinf(current_loudness):
                return audio
            return pyln.normalize.loudness(
                audio, current_loudness, self.cfg.target_loudness_lufs
            )
        except ImportError:
            # Fallback: RMS-based normalization
            rms = np.sqrt(np.mean(audio ** 2))
            if rms < 1e-10:
                return audio
            target_rms = 10 ** (self.cfg.target_loudness_lufs / 20)
            return audio * (target_rms / rms)

    def _limit(self, audio: np.ndarray) -> np.ndarray:
        """True peak limiter."""
        ceiling = 10 ** (self.cfg.target_peak_db / 20)
        lookahead = 64  # samples

        # Find peaks with lookahead
        padded = np.pad(audio, (lookahead, 0), mode='edge')
        peak_env = np.array([
            np.max(np.abs(padded[i:i + lookahead * 2 + 1]))
            for i in range(len(audio))
        ])

        # Calculate gain reduction
        gain = np.ones_like(audio)
        mask = peak_env > ceiling
        gain[mask] = ceiling / (peak_env[mask] + 1e-10)

        # Smooth the gain (release)
        release_samples = int(len(audio) * 0.001)  # 1ms release
        if release_samples > 0:
            kernel = np.exp(-np.arange(release_samples) / release_samples)
            kernel /= kernel.sum()
            gain = np.minimum(gain, np.convolve(gain, kernel, mode='same'))

        return audio * gain

    def get_pipeline_info(self) -> dict:
        """Return info about the active pipeline stages."""
        stages = []
        if self.cfg.enable_silence_trim:
            stages.append('silence_trim')
        stages.append('dc_removal')
        if self.cfg.enable_noise_gate:
            stages.append('noise_gate')
        if self.cfg.enable_eq:
            stages.append('equalizer_3band')
        if self.cfg.enable_deesser:
            stages.append('deesser')
        if self.cfg.enable_compressor:
            stages.append('compressor')
        if self.cfg.enable_normalization:
            stages.append(f'loudness_norm_{self.cfg.target_loudness_lufs}LUFS')
        if self.cfg.enable_limiter:
            stages.append(f'limiter_{self.cfg.target_peak_db}dBTP')
        stages.append('clip_protection')
        return {'stages': stages, 'count': len(stages)}
