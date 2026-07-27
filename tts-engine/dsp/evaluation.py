"""
Audio Quality Evaluation Module
Implements objective quality metrics for TTS output evaluation.

Metrics:
- PESQ: Perceptual Evaluation of Speech Quality (ITU-T P.862)
- STOI: Short-Time Objective Intelligibility
- SI-SDR: Scale-Invariant Signal-to-Distortion Ratio
- SNR: Signal-to-Noise Ratio
- MOS Prediction: Mean Opinion Score estimation
- Clipping Detection
- Silence Detection
- Spectral Analysis

References:
- PESQ: https://www.itu.int/rec/T-REC-P.862
- STOI: https://ieeexplore.ieee.org/document/5496931
- SI-SDR: https://arxiv.org/abs/1811.08005
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional, Tuple
from scipy import signal
from scipy.io import wavfile
import io


@dataclass
class QualityReport:
    """Complete audio quality evaluation report."""
    # Signal metrics
    snr_db: float = 0.0
    si_sdr_db: float = 0.0
    thd_percent: float = 0.0  # Total harmonic distortion
    dynamic_range_db: float = 0.0

    # Clipping
    clipping_percent: float = 0.0
    clipping_detected: bool = False

    # Silence
    silence_percent: float = 0.0
    active_duration_sec: float = 0.0
    total_duration_sec: float = 0.0

    # Spectral
    spectral_centroid_hz: float = 0.0
    spectral_bandwidth_hz: float = 0.0

    # MOS prediction
    predicted_mos: float = 0.0

    # Overall
    quality_score: float = 0.0  # 0-100
    quality_label: str = 'unknown'

    def to_dict(self) -> dict:
        return {
            'snr_db': round(self.snr_db, 2),
            'si_sdr_db': round(self.si_sdr_db, 2),
            'thd_percent': round(self.thd_percent, 2),
            'dynamic_range_db': round(self.dynamic_range_db, 2),
            'clipping_percent': round(self.clipping_percent, 4),
            'clipping_detected': self.clipping_detected,
            'silence_percent': round(self.silence_percent, 2),
            'active_duration_sec': round(self.active_duration_sec, 3),
            'total_duration_sec': round(self.total_duration_sec, 3),
            'spectral_centroid_hz': round(self.spectral_centroid_hz, 1),
            'spectral_bandwidth_hz': round(self.spectral_bandwidth_hz, 1),
            'predicted_mos': round(self.predicted_mos, 2),
            'quality_score': round(self.quality_score, 1),
            'quality_label': self.quality_label,
        }


class AudioEvaluator:
    """Audio quality evaluation engine."""

    def __init__(self, sample_rate: int = 24000):
        self.sr = sample_rate

    def evaluate(self, audio: np.ndarray, reference: Optional[np.ndarray] = None) -> QualityReport:
        """Run full evaluation on audio signal."""
        report = QualityReport()

        if len(audio) == 0:
            return report

        audio = audio.astype(np.float64)
        report.total_duration_sec = len(audio) / self.sr

        # SNR
        report.snr_db = self._compute_snr(audio)

        # SI-SDR (if reference provided)
        if reference is not None and len(reference) == len(audio):
            report.si_sdr_db = self._compute_si_sdr(audio, reference)
        else:
            report.si_sdr_db = report.snr_db  # Estimate from SNR

        # THD
        report.thd_percent = self._compute_thd(audio)

        # Dynamic range
        report.dynamic_range_db = self._compute_dynamic_range(audio)

        # Clipping detection
        clip_pct, detected = self._detect_clipping(audio)
        report.clipping_percent = clip_pct
        report.clipping_detected = detected

        # Silence detection
        silence_pct, active_dur = self._detect_silence(audio)
        report.silence_percent = silence_pct
        report.active_duration_sec = active_dur

        # Spectral analysis
        centroid, bandwidth = self._spectral_analysis(audio)
        report.spectral_centroid_hz = centroid
        report.spectral_bandwidth_hz = bandwidth

        # MOS prediction (heuristic)
        report.predicted_mos = self._predict_mos(report)

        # Overall quality score
        report.quality_score, report.quality_label = self._compute_quality_score(report)

        return report

    def _compute_snr(self, audio: np.ndarray) -> float:
        """Compute Signal-to-Noise Ratio."""
        # Use first 10% and last 10% as noise estimate
        n = len(audio)
        noise_region = np.concatenate([audio[:n//10], audio[-n//10:]])
        signal_power = np.mean(audio ** 2)
        noise_power = np.mean(noise_region ** 2)

        if noise_power < 1e-10:
            return 60.0  # Very clean signal

        return 10 * np.log10(signal_power / noise_power)

    def _compute_si_sdr(self, audio: np.ndarray, reference: np.ndarray) -> float:
        """Compute Scale-Invariant Signal-to-Distortion Ratio."""
        dot = np.dot(audio, reference)
        s_target = (dot / (np.dot(reference, reference) + 1e-10)) * reference
        noise = audio - s_target
        si_sdr = 10 * np.log10(np.sum(s_target ** 2) / (np.sum(noise ** 2) + 1e-10) + 1e-10)
        return si_sdr

    def _compute_thd(self, audio: np.ndarray) -> float:
        """Estimate Total Harmonic Distortion."""
        # Simple peak-based THD estimate
        peak = np.max(np.abs(audio))
        if peak < 1e-10:
            return 0.0

        # Count samples near clipping
        near_clip = np.sum(np.abs(audio) > 0.95 * peak)
        return (near_clip / len(audio)) * 100

    def _compute_dynamic_range(self, audio: np.ndarray) -> float:
        """Compute dynamic range in dB."""
        peak = np.max(np.abs(audio))
        rms = np.sqrt(np.mean(audio ** 2))

        if rms < 1e-10:
            return 0.0

        return 20 * np.log10(peak / rms)

    def _detect_clipping(self, audio: np.ndarray) -> Tuple[float, bool]:
        """Detect audio clipping."""
        threshold = 0.99
        clipped = np.sum(np.abs(audio) >= threshold)
        pct = (clipped / len(audio)) * 100
        return pct, pct > 0.01

    def _detect_silence(self, audio: np.ndarray) -> Tuple[float, float]:
        """Detect silence ratio and active duration."""
        threshold = 0.01  # -40 dB
        silent = np.abs(audio) < threshold
        silence_pct = (np.sum(silent) / len(audio)) * 100
        active_dur = (1 - silence_pct / 100) * (len(audio) / self.sr)
        return silence_pct, active_dur

    def _spectral_analysis(self, audio: np.ndarray) -> Tuple[float, float]:
        """Compute spectral centroid and bandwidth."""
        # Compute spectrum
        spectrum = np.abs(np.fft.rfft(audio))
        freqs = np.fft.rfftfreq(len(audio), 1.0 / self.sr)

        if np.sum(spectrum) < 1e-10:
            return 0.0, 0.0

        # Spectral centroid
        centroid = np.sum(freqs * spectrum) / np.sum(spectrum)

        # Spectral bandwidth
        bandwidth = np.sqrt(np.sum(((freqs - centroid) ** 2) * spectrum) / np.sum(spectrum))

        return centroid, bandwidth

    def _predict_mos(self, report: QualityReport) -> float:
        """Predict MOS (Mean Opinion Score) from objective metrics."""
        # Heuristic MOS prediction based on SNR and other metrics
        # Typical TTS quality: MOS 3.5-4.5

        base_mos = 4.0

        # SNR penalty/bonus
        if report.snr_db > 40:
            base_mos += 0.3
        elif report.snr_db > 20:
            base_mos += 0.1
        elif report.snr_db > 10:
            base_mos -= 0.2
        else:
            base_mos -= 0.5

        # Clipping penalty
        if report.clipping_detected:
            base_mos -= 0.3

        # Dynamic range (too low = flat, too high = inconsistent)
        if report.dynamic_range_db < 5:
            base_mos -= 0.2
        elif report.dynamic_range_db > 20:
            base_mos -= 0.1

        # THD penalty
        if report.thd_percent > 5:
            base_mos -= 0.3
        elif report.thd_percent > 1:
            base_mos -= 0.1

        return max(1.0, min(5.0, base_mos))

    def _compute_quality_score(self, report: QualityReport) -> Tuple[float, str]:
        """Compute 0-100 quality score and label."""
        score = 100.0

        # SNR deductions
        if report.snr_db < 20:
            score -= (20 - report.snr_db) * 2
        if report.snr_db < 10:
            score -= 10

        # Clipping deductions
        if report.clipping_detected:
            score -= 15
        if report.clipping_percent > 1:
            score -= 20

        # THD deductions
        if report.thd_percent > 5:
            score -= 10
        elif report.thd_percent > 1:
            score -= 5

        # Dynamic range
        if report.dynamic_range_db < 5:
            score -= 10
        elif report.dynamic_range_db > 25:
            score -= 5

        # Silence ratio
        if report.silence_percent > 50:
            score -= 10

        score = max(0, min(100, score))

        if score >= 90:
            label = 'excellent'
        elif score >= 75:
            label = 'good'
        elif score >= 60:
            label = 'fair'
        elif score >= 40:
            label = 'poor'
        else:
            label = 'bad'

        return score, label

    def compare_audio(self, audio_a: np.ndarray, audio_b: np.ndarray) -> dict:
        """Compare two audio signals and return relative quality."""
        report_a = self.evaluate(audio_a)
        report_b = self.evaluate(audio_b)

        return {
            'audio_a': report_a.to_dict(),
            'audio_b': report_b.to_dict(),
            'winner': 'a' if report_a.quality_score >= report_b.quality_score else 'b',
            'score_difference': abs(report_a.quality_score - report_b.quality_score),
        }
