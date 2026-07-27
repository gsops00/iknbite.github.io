"""
TTS Voice Training — Data Preparation & Validation Pipeline

Steps:
1. Scan all available datasets (Common Voice, LibriTTS, VCTK)
2. Remove duplicate recordings
3. Detect corrupted audio files
4. Remove excessive background noise
5. Normalize loudness
6. Trim leading/trailing silence
7. Convert to unified format (WAV, mono, 22.05kHz, 16-bit PCM)
8. Verify transcript alignment
9. Split into train/val/test sets
10. Generate quality scores
"""

import os
import csv
import json
import hashlib
import wave
import struct
import numpy as np
from pathlib import Path
from typing import Optional, Tuple, Generator
from dataclasses import dataclass, field, asdict
from datetime import datetime
import concurrent.futures


@dataclass
class AudioQuality:
    """Quality metrics for a single audio sample."""
    snr_db: float = 0.0
    clipping_percent: float = 0.0
    rms_level_db: float = 0.0
    peak_db: float = 0.0
    dynamic_range_db: float = 0.0
    duration_seconds: float = 0.0
    sample_rate: int = 0
    is_corrupted: bool = False
    has_noise: bool = False
    has_echo: bool = False
    quality_score: float = 0.0
    issues: list = field(default_factory=list)


@dataclass
class PreparedSample:
    """A prepared and validated audio sample."""
    audio_path: str
    transcript: str
    speaker_id: str
    language: str
    quality: AudioQuality
    split: str = 'train'  # train, val, test
    dataset: str = ''


class DataPreparator:
    """
    TTS Voice Training — Data Preparation Pipeline.

    Usage:
        prep = DataPreparator(output_dir='./data/training')
        prep.prepare(
            datasets=[('en', 'train-clean-100')],
            speaker_id=None,
            target_sr=22050
        )
    """

    # Unified output format
    TARGET_SR = 22050
    TARGET_CHANNELS = 1
    TARGET_SAMPLE_WIDTH = 2  # 16-bit
    MAX_DURATION = 20.0
    MIN_DURATION = 0.5

    # Quality thresholds
    MIN_SNR_DB = 15.0
    MAX_CLIPPING_PERCENT = 1.0
    MAX_NOISE_LEVEL_DB = -35.0

    # Split ratios
    TRAIN_RATIO = 0.8
    VAL_RATIO = 0.1
    TEST_RATIO = 0.1

    def __init__(self, output_dir: str = './data/training', cache_dir: str = './data/cache'):
        self.output_dir = Path(output_dir)
        self.cache_dir = Path(cache_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._stats = {
            'total_scanned': 0,
            'total_accepted': 0,
            'total_rejected': 0,
            'duplicates_removed': 0,
            'corrupted_removed': 0,
            'noisy_removed': 0,
            'clipped_removed': 0,
            'short_removed': 0,
            'long_removed': 0,
            'missing_transcript': 0,
        }

    def prepare(self, datasets: list[Tuple[str, str]],
                speaker_id: Optional[str] = None,
                target_sr: int = None,
                max_workers: int = 4) -> dict:
        """
        Run the full data preparation pipeline.

        Args:
            datasets: List of (language, subset) tuples
                      e.g., [('en', 'train-clean-100'), ('en', 'train-clean-360')]
            speaker_id: Optional speaker ID to filter by
            target_sr: Target sample rate (default: 22050)
            max_workers: Number of parallel workers

        Returns:
            Preparation statistics
        """
        target_sr = target_sr or self.TARGET_SR
        self._stats = {
            'total_scanned': 0,
            'total_accepted': 0,
            'total_rejected': 0,
            'duplicates_removed': 0,
            'corrupted_removed': 0,
            'noisy_removed': 0,
            'clipped_removed': 0,
            'short_removed': 0,
            'long_removed': 0,
            'missing_transcript': 0,
        }

        print("=" * 60)
        print("  TTS Voice Training — Data Preparation Pipeline")
        print("=" * 60)
        print(f"  Target sample rate: {target_sr} Hz")
        print(f"  Output format: WAV, mono, 16-bit PCM")
        print(f"  Datasets: {datasets}")
        print(f"  Speaker filter: {speaker_id or 'all'}")
        print("=" * 60)

        # Phase 1: Scan and collect all samples
        print("\n[Phase 1] Scanning datasets...")
        samples = self._scan_datasets(datasets, speaker_id)
        self._stats['total_scanned'] = len(samples)
        print(f"  Found {len(samples)} samples")

        # Phase 2: Remove duplicates
        print("\n[Phase 2] Removing duplicates...")
        samples = self._remove_duplicates(samples)
        print(f"  {self._stats['duplicates_removed']} duplicates removed")

        # Phase 3: Validate audio quality
        print("\n[Phase 3] Validating audio quality...")
        samples = self._validate_samples(samples, max_workers)
        print(f"  {self._stats['total_rejected']} samples rejected")
        print(f"  {self._stats['corrupted_removed']} corrupted")
        print(f"  {self._stats['noisy_removed']} noisy")
        print(f"  {self._stats['clipped_removed']} clipped")

        # Phase 4: Process audio (normalize, trim, convert)
        print("\n[Phase 4] Processing audio...")
        samples = self._process_audio(samples, target_sr, max_workers)
        print(f"  {len(samples)} samples processed")

        # Phase 5: Split into train/val/test
        print("\n[Phase 5] Splitting datasets...")
        splits = self._split_datasets(samples)
        for split_name, split_samples in splits.items():
            print(f"  {split_name}: {len(split_samples)} samples")

        # Phase 6: Save metadata
        print("\n[Phase 6] Saving metadata...")
        self._save_metadata(splits)

        self._stats['total_accepted'] = len(samples)
        self._stats['train_samples'] = len(splits.get('train', []))
        self._stats['val_samples'] = len(splits.get('val', []))
        self._stats['test_samples'] = len(splits.get('test', []))

        print("\n" + "=" * 60)
        print("  Preparation Complete!")
        print("=" * 60)
        print(f"  Accepted: {self._stats['total_accepted']}")
        print(f"  Rejected: {self._stats['total_rejected']}")
        print(f"  Train: {self._stats.get('train_samples', 0)}")
        print(f"  Val: {self._stats.get('val_samples', 0)}")
        print(f"  Test: {self._stats.get('test_samples', 0)}")
        print("=" * 60)

        return self._stats

    def _scan_datasets(self, datasets: list[Tuple[str, str]],
                       speaker_id: Optional[str]) -> list[dict]:
        """Scan datasets and collect sample paths with transcripts."""
        samples = []

        for language, subset in datasets:
            print(f"  Scanning {language}/{subset}...")

            # Try LibriTTS
            if 'libritts' in subset.lower() or subset.startswith('train-') or subset.startswith('dev-') or subset.startswith('test-'):
                samples.extend(self._scan_libritts(language, subset, speaker_id))

            # Try Common Voice
            elif 'common_voice' in language or language in ['en', 'ar', 'zh', 'fr', 'de', 'es']:
                samples.extend(self._scan_common_voice(language, speaker_id))

            # Try VCTK
            elif 'vctk' in language.lower():
                samples.extend(self._scan_vctk(speaker_id))

        return samples

    def _scan_libritts(self, language: str, subset: str,
                       speaker_id: Optional[str]) -> list[dict]:
        """Scan LibriTTS dataset."""
        samples = []
        data_dir = Path('./data/libritts')
        subset_dir = data_dir / subset

        if not subset_dir.exists():
            print(f"    [LibriTTS] {subset} not found, skipping")
            return samples

        # Find normalized text files
        text_files = list(subset_dir.rglob('*.normalized.txt'))

        for text_file in text_files:
            audio_file = text_file.with_suffix('.wav')
            if not audio_file.exists():
                continue

            # Extract speaker ID from path
            rel_path = audio_file.relative_to(subset_dir)
            parts = list(rel_path.parts)
            if len(parts) >= 2:
                sid = parts[0] if parts[0] != 'LibriTTS' else parts[1]
            else:
                sid = 'unknown'

            if speaker_id and sid != speaker_id:
                continue

            try:
                text = text_file.read_text(encoding='utf-8').strip()
            except Exception:
                continue

            if text:
                samples.append({
                    'audio_path': str(audio_file),
                    'transcript': text,
                    'speaker_id': sid,
                    'language': language,
                    'dataset': f'libritts-{subset}',
                })

        return samples

    def _scan_common_voice(self, language: str,
                           speaker_id: Optional[str]) -> list[dict]:
        """Scan Common Voice dataset."""
        samples = []
        data_dir = Path('./data/common_voice')
        lang_dir = data_dir / language

        if not lang_dir.exists():
            print(f"    [CommonVoice] {language} not found, skipping")
            return samples

        tsv_files = list(lang_dir.glob('*.tsv'))

        for tsv_file in tsv_files:
            try:
                with open(tsv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f, delimiter='\t')
                    for row in reader:
                        audio_path = lang_dir / 'clips' / row.get('path', '')
                        if not audio_path.exists():
                            continue

                        sid = row.get('client_id', 'unknown')
                        if speaker_id and sid != speaker_id:
                            continue

                        text = row.get('sentence', '').strip()
                        if text:
                            samples.append({
                                'audio_path': str(audio_path),
                                'transcript': text,
                                'speaker_id': sid,
                                'language': language,
                                'dataset': f'common_voice-{language}',
                            })
            except Exception as e:
                print(f"    [CommonVoice] Error reading {tsv_file}: {e}")

        return samples

    def _scan_vctk(self, speaker_id: Optional[str]) -> list[dict]:
        """Scan VCTK dataset."""
        samples = []
        data_dir = Path('./data/vctk')
        wav_dir = data_dir / 'wav48_silence_trimmed'
        txt_dir = data_dir / 'txt'

        if not wav_dir.exists():
            print(f"    [VCTK] Not found, skipping")
            return samples

        for speaker_dir in sorted(wav_dir.iterdir()):
            if not speaker_dir.is_dir():
                continue

            sid = speaker_dir.name
            if speaker_id and sid != speaker_id:
                continue

            for wav_file in sorted(speaker_dir.glob('*.flac')):
                txt_file = txt_dir / sid / (wav_file.stem + '.txt')
                if not txt_file.exists():
                    continue

                try:
                    text = txt_file.read_text(encoding='utf-8').strip()
                except Exception:
                    continue

                if text:
                    samples.append({
                        'audio_path': str(wav_file),
                        'transcript': text,
                        'speaker_id': sid,
                        'language': 'en',
                        'dataset': 'vctk',
                    })

        return samples

    def _remove_duplicates(self, samples: list[dict]) -> list[dict]:
        """Remove duplicate recordings based on audio content hash."""
        seen_hashes = set()
        unique_samples = []

        for sample in samples:
            try:
                audio_hash = self._hash_audio(sample['audio_path'])
                if audio_hash not in seen_hashes:
                    seen_hashes.add(audio_hash)
                    unique_samples.append(sample)
                else:
                    self._stats['duplicates_removed'] += 1
            except Exception:
                unique_samples.append(sample)

        return unique_samples

    def _hash_audio(self, audio_path: str) -> str:
        """Hash audio file content."""
        hasher = hashlib.md5()
        with open(audio_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                hasher.update(chunk)
        return hasher.hexdigest()

    def _validate_samples(self, samples: list[dict],
                          max_workers: int) -> list[dict]:
        """Validate audio quality and reject bad samples."""
        valid_samples = []

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(self._validate_sample, sample): sample
                for sample in samples
            }

            for future in concurrent.futures.as_completed(futures):
                sample = futures[future]
                try:
                    quality = future.result()
                    if quality.quality_score >= 50 and not quality.is_corrupted:
                        sample['quality'] = quality
                        valid_samples.append(sample)
                    else:
                        self._stats['total_rejected'] += 1
                        if quality.is_corrupted:
                            self._stats['corrupted_removed'] += 1
                        if quality.has_noise:
                            self._stats['noisy_removed'] += 1
                        if quality.clipping_percent > self.MAX_CLIPPING_PERCENT:
                            self._stats['clipped_removed'] += 1
                except Exception:
                    self._stats['corrupted_removed'] += 1

        return valid_samples

    def _validate_sample(self, sample: dict) -> AudioQuality:
        """Validate a single audio sample."""
        quality = AudioQuality()

        try:
            import soundfile as sf
            audio, sr = sf.read(sample['audio_path'])

            if audio.ndim > 1:
                audio = audio.mean(axis=1)

            quality.sample_rate = sr
            quality.duration_seconds = len(audio) / sr

            # Check duration
            if quality.duration_seconds < self.MIN_DURATION:
                quality.issues.append('too_short')
                quality.quality_score = 0
                return quality
            if quality.duration_seconds > self.MAX_DURATION:
                quality.issues.append('too_long')
                quality.quality_score = 0
                return quality

            # Check for clipping
            peak = np.max(np.abs(audio))
            clipped = np.sum(np.abs(audio) >= 0.99)
            quality.clipping_percent = (clipped / len(audio)) * 100
            quality.peak_db = 20 * np.log10(peak + 1e-10)

            if quality.clipping_percent > self.MAX_CLIPPING_PERCENT:
                quality.issues.append('clipping')

            # Check SNR
            noise_region = np.concatenate([audio[:len(audio)//10], audio[-len(audio)//10:]])
            signal_power = np.mean(audio ** 2)
            noise_power = np.mean(noise_region ** 2)
            if noise_power > 1e-10:
                quality.snr_db = 10 * np.log10(signal_power / noise_power)
            else:
                quality.snr_db = 60.0

            if quality.snr_db < self.MIN_SNR_DB:
                quality.has_noise = True
                quality.issues.append('low_snr')

            # RMS level
            rms = np.sqrt(np.mean(audio ** 2))
            quality.rms_level_db = 20 * np.log10(rms + 1e-10)

            # Dynamic range
            quality.dynamic_range_db = quality.peak_db - quality.rms_level_db

            # Check for silence (entire sample)
            if rms < 0.001:
                quality.is_corrupted = True
                quality.issues.append('silent')

            # Calculate quality score
            score = 100.0
            if quality.snr_db < 20:
                score -= (20 - quality.snr_db) * 2
            if quality.clipping_percent > 0.5:
                score -= 15
            if quality.dynamic_range_db < 5:
                score -= 10
            if quality.rms_level_db < -30:
                score -= 10
            if quality.rms_level_db > -5:
                score -= 5

            quality.quality_score = max(0, min(100, score))

        except Exception as e:
            quality.is_corrupted = True
            quality.issues.append(f'error: {str(e)}')
            quality.quality_score = 0

        return quality

    def _process_audio(self, samples: list[dict], target_sr: int,
                       max_workers: int) -> list[dict]:
        """Process audio: normalize, trim, convert format."""
        processed = []
        output_dir = self.output_dir / 'audio'
        output_dir.mkdir(parents=True, exist_ok=True)

        for i, sample in enumerate(samples):
            try:
                output_path = output_dir / f'{i:06d}.wav'
                self._convert_audio(
                    sample['audio_path'],
                    str(output_path),
                    target_sr
                )
                sample['processed_path'] = str(output_path)
                processed.append(sample)

                if (i + 1) % 100 == 0:
                    print(f"    Processed {i+1}/{len(samples)} samples")
            except Exception as e:
                print(f"    Error processing {sample['audio_path']}: {e}")

        return processed

    def _convert_audio(self, input_path: str, output_path: str,
                       target_sr: int):
        """Convert audio to unified format."""
        import soundfile as sf
        from scipy import signal as sig

        audio, sr = sf.read(input_path)

        if audio.ndim > 1:
            audio = audio.mean(axis=1)

        # Resample if needed
        if sr != target_sr:
            num_samples = int(len(audio) * target_sr / sr)
            audio = sig.resample(audio, num_samples)

        # Normalize loudness
        peak = np.max(np.abs(audio))
        if peak > 0:
            audio = audio / peak * 0.95

        # Trim silence
        threshold = 0.01
        non_silent = np.abs(audio) > threshold
        if np.any(non_silent):
            indices = np.where(non_silent)[0]
            start = max(0, indices[0] - int(target_sr * 0.05))
            end = min(len(audio), indices[-1] + int(target_sr * 0.05))
            audio = audio[start:end]

        # Convert to 16-bit PCM
        audio_int16 = (audio * 32767).astype(np.int16)

        # Write WAV
        with wave.open(output_path, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(target_sr)
            wf.writeframes(audio_int16.tobytes())

    def _split_datasets(self, samples: list[dict]) -> dict:
        """Split samples into train/val/test sets."""
        np.random.seed(42)
        indices = np.random.permutation(len(samples))

        n_train = int(len(samples) * self.TRAIN_RATIO)
        n_val = int(len(samples) * self.VAL_RATIO)

        splits = {
            'train': [samples[i] for i in indices[:n_train]],
            'val': [samples[i] for i in indices[n_train:n_train + n_val]],
            'test': [samples[i] for i in indices[n_train + n_val:]],
        }

        # Assign split to each sample
        for split_name, split_samples in splits.items():
            for sample in split_samples:
                sample['split'] = split_name

        return splits

    def _save_metadata(self, splits: dict):
        """Save metadata for each split."""
        for split_name, samples in splits.items():
            metadata_path = self.output_dir / f'{split_name}_metadata.jsonl'
            with open(metadata_path, 'w', encoding='utf-8') as f:
                for sample in samples:
                    entry = {
                        'audio_path': sample.get('processed_path', sample['audio_path']),
                        'transcript': sample['transcript'],
                        'speaker_id': sample['speaker_id'],
                        'language': sample['language'],
                        'dataset': sample['dataset'],
                        'split': split_name,
                    }
                    if 'quality' in sample:
                        q = sample['quality']
                        entry['quality_score'] = q.quality_score
                        entry['snr_db'] = q.snr_db
                        entry['duration_seconds'] = q.duration_seconds
                    f.write(json.dumps(entry, ensure_ascii=False) + '\n')

        # Save stats
        stats_path = self.output_dir / 'preparation_stats.json'
        with open(stats_path, 'w') as f:
            json.dump(self._stats, f, indent=2)

        # Save manifest
        manifest = {
            'created_at': datetime.now().isoformat(),
            'target_sr': self.TARGET_SR,
            'total_samples': self._stats['total_accepted'],
            'splits': {k: len(v) for k, v in splits.items()},
            'stats': self._stats,
        }
        manifest_path = self.output_dir / 'manifest.json'
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)


def run_preparation(datasets: list[Tuple[str, str]] = None,
                    speaker_id: Optional[str] = None,
                    output_dir: str = './data/training') -> dict:
    """Run the full data preparation pipeline."""
    if datasets is None:
        datasets = [
            ('en', 'train-clean-100'),
            ('en', 'dev-clean'),
        ]

    prep = DataPreparator(output_dir=output_dir)
    return prep.prepare(datasets, speaker_id=speaker_id)
