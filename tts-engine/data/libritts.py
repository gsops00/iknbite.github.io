"""
LibriTTS Dataset Loader
Source: https://www.openslr.org/60/
License: CC-BY-4.0

LibriTTS is a large-scale multi-speaker English corpus (~585 hours)
designed for TTS research. Derived from LibriVox audiobooks.

Features:
- 2,456 speakers (balanced male/female)
- High-quality audio (24kHz)
- Aligned text transcriptions
- Speaker and chapter metadata
- Train/dev/test splits

LibriTTS-R (https://www.openslr.org/141/) is the cleaned version
with improved audio quality and reduced noise.
"""

import os
import csv
import json
import tarfile
import hashlib
import requests
import subprocess
from pathlib import Path
from typing import Optional, Generator
from dataclasses import dataclass


@dataclass
class LibriTTSSample:
    """Single LibriTTS sample."""
    audio_path: str
    text: str
    normalized_text: str
    speaker_id: str
    chapter_id: str
    book_id: str
    duration_seconds: float = 0.0
    split: str = 'train'
    gender: str = 'unknown'


@dataclass
class LibriTTSSpeaker:
    """Speaker metadata."""
    speaker_id: str
    name: str
    gender: str
    subset: str


class LibriTTSLoader:
    """
    LibriTTS dataset loader and manager.

    Usage:
        loader = LibriTTSLoader(data_dir='./data/libritts')
        loader.download('train-clean-100')
        samples = loader.load('train-clean-100')
    """

    # Available subsets
    SUBSETS = {
        'train-clean-100':  {
            'hours': 100, 'size_gb': 6.5, 'speakers': 251,
            'url': 'https://www.openslr.org/resources/60/train-clean-100.tar.gz',
        },
        'train-clean-360':  {
            'hours': 360, 'size_gb': 23, 'speakers': 922,
            'url': 'https://www.openslr.org/resources/60/train-clean-360.tar.gz',
        },
        'train-other-500':  {
            'hours': 500, 'size_gb': 32, 'speakers': 1166,
            'url': 'https://www.openslr.org/resources/60/train-other-500.tar.gz',
        },
        'dev-clean':        {
            'hours': 5.4, 'size_gb': 0.34, 'speakers': 40,
            'url': 'https://www.openslr.org/resources/60/dev-clean.tar.gz',
        },
        'dev-other':        {
            'hours': 5.4, 'size_gb': 0.34, 'speakers': 33,
            'url': 'https://www.openslr.org/resources/60/dev-other.tar.gz',
        },
        'test-clean':       {
            'hours': 5.4, 'size_gb': 0.34, 'speakers': 40,
            'url': 'https://www.openslr.org/resources/60/test-clean.tar.gz',
        },
        'test-other':       {
            'hours': 5.4, 'size_gb': 0.34, 'speakers': 33,
            'url': 'https://www.openslr.org/resources/60/test-other.tar.gz',
        },
    }

    # LibriTTS-R (cleaned) subsets
    SUBSETS_R = {
        'train-clean-100':  {
            'hours': 100, 'size_gb': 5.7, 'speakers': 251,
            'url': 'https://www.openslr.org/resources/141/train-clean-100.tar.gz',
        },
        'train-clean-360':  {
            'hours': 360, 'size_gb': 20, 'speakers': 922,
            'url': 'https://www.openslr.org/resources/141/train-clean-360.tar.gz',
        },
        'train-other-500':  {
            'hours': 500, 'size_gb': 28, 'speakers': 1166,
            'url': 'https://www.openslr.org/resources/141/train-other-500.tar.gz',
        },
        'dev-clean':        {
            'hours': 5.4, 'size_gb': 0.3, 'speakers': 40,
            'url': 'https://www.openslr.org/resources/141/dev-clean.tar.gz',
        },
        'dev-other':        {
            'hours': 5.4, 'size_gb': 0.3, 'speakers': 33,
            'url': 'https://www.openslr.org/resources/141/dev-other.tar.gz',
        },
        'test-clean':       {
            'hours': 5.4, 'size_gb': 0.3, 'speakers': 40,
            'url': 'https://www.openslr.org/resources/141/test-clean.tar.gz',
        },
        'test-other':       {
            'hours': 5.4, 'size_gb': 0.3, 'speakers': 33,
            'url': 'https://www.openslr.org/resources/141/test-other.tar.gz',
        },
    }

    def __init__(self, data_dir: str = './data/libritts', version: str = 'R'):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.version = version  # 'R' for cleaned version
        self.subsets = self.SUBSETS_R if version == 'R' else self.SUBSETS
        self._speakers_cache = {}

    def list_subsets(self) -> list[dict]:
        """List all available subsets."""
        return [
            {
                'name': name,
                'hours': info['hours'],
                'size_gb': info['size_gb'],
                'speakers': info['speakers'],
                'downloaded': self._is_downloaded(name),
            }
            for name, info in self.subsets.items()
        ]

    def _is_downloaded(self, subset: str) -> bool:
        """Check if subset is already downloaded."""
        subset_dir = self.data_dir / subset
        return subset_dir.exists() and any(subset_dir.rglob('*.wav'))

    def download(self, subset: str, force: bool = False) -> bool:
        """
        Download a LibriTTS subset.

        Args:
            subset: Subset name (e.g., 'train-clean-100', 'dev-clean')
            force: Re-download even if already present

        Returns:
            True if successful
        """
        if subset not in self.subsets:
            raise ValueError(
                f"Subset '{subset}' not available. "
                f"Available: {', '.join(self.subsets.keys())}"
            )

        if self._is_downloaded(subset) and not force:
            print(f"[LibriTTS] {subset} already downloaded")
            return True

        info = self.subsets[subset]
        url = info['url']
        tar_path = self.data_dir / f'{subset}.tar.gz'

        print(f"[LibriTTS] Downloading {subset} ({info['hours']}h, {info['size_gb']}GB)...")
        print(f"  URL: {url}")

        try:
            # Download with progress
            response = requests.get(url, stream=True, timeout=600)
            response.raise_for_status()

            total = int(response.headers.get('content-length', 0))
            downloaded = 0

            with open(tar_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=65536):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total > 0:
                        pct = (downloaded / total) * 100
                        mb = downloaded // (1024 * 1024)
                        print(f"\r  Downloaded: {pct:.1f}% ({mb}MB)", end='', flush=True)

            print(f"\n  Extracting...")
            subset_dir = self.data_dir / subset
            subset_dir.mkdir(parents=True, exist_ok=True)

            # Extract
            with tarfile.open(tar_path, 'r:gz') as tar:
                tar.extractall(path=self.data_dir, filter='data')

            # Cleanup tar
            tar_path.unlink()

            # Load speakers
            self._load_speakers(subset)

            print(f"[LibriTTS] ✅ {subset} downloaded to {subset_dir}")
            return True

        except requests.exceptions.HTTPError as e:
            print(f"[LibriTTS] ❌ Download failed: {e}")
            if tar_path.exists():
                tar_path.unlink()
            return False
        except Exception as e:
            print(f"[LibriTTS] ❌ Error: {e}")
            if tar_path.exists():
                tar_path.unlink()
            return False

    def _load_speakers(self, subset: str):
        """Load speaker metadata from the subset."""
        speakers_file = self.data_dir / subset / 'SPEAKERS.TXT'
        if not speakers_file.exists():
            return

        self._speakers_cache[subset] = {}
        try:
            with open(speakers_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith(';'):
                        continue
                    parts = line.strip().split('|')
                    if len(parts) >= 4:
                        speaker_id = parts[0].strip()
                        self._speakers_cache[subset][speaker_id] = {
                            'name': parts[1].strip(),
                            'gender': parts[2].strip(),
                            'subset': parts[3].strip(),
                        }
        except Exception as e:
            print(f"[LibriTTS] Warning: Error loading speakers: {e}")

    def load(self, subset: str, max_samples: Optional[int] = None,
             min_duration: float = 0.5, max_duration: float = 20.0,
             speaker_filter: Optional[str] = None) -> Generator[LibriTTSSample, None, None]:
        """
        Load voice samples from a LibriTTS subset.

        Args:
            subset: Subset name
            max_samples: Maximum samples to load
            min_duration: Minimum audio duration in seconds
            max_duration: Maximum audio duration in seconds
            speaker_filter: Optional speaker ID to filter by

        Yields:
            LibriTTSSample objects
        """
        subset_dir = self.data_dir / subset
        if not subset_dir.exists():
            raise FileNotFoundError(
                f"Subset not found. Download first: loader.download('{subset}')"
            )

        # Load speaker info
        if subset not in self._speakers_cache:
            self._load_speakers(subset)

        # Find all normalized text files
        text_files = list(subset_dir.rglob('*.normalized.txt'))

        count = 0
        for text_file in text_files:
            if max_samples and count >= max_samples:
                return

            # Derive paths
            audio_file = text_file.with_suffix('.wav')
            original_file = text_file.parent / text_file.name.replace('.normalized.txt', '.original.txt')

            if not audio_file.exists():
                continue

            # Get audio path parts for metadata
            rel_path = audio_file.relative_to(subset_dir)
            parts = list(rel_path.parts)

            # Extract IDs from path: LibriTTS/subset/speaker_id/chapter_id/speaker_id-chapter_id-xxxx.wav
            if len(parts) >= 3:
                speaker_id = parts[0] if parts[0] != 'LibriTTS' else parts[1] if len(parts) > 1 else 'unknown'
                chapter_id = parts[2] if len(parts) > 2 else 'unknown'
            else:
                speaker_id = 'unknown'
                chapter_id = 'unknown'

            book_id = parts[1] if len(parts) > 1 else 'unknown'

            # Speaker filter
            if speaker_filter and speaker_id != speaker_filter:
                continue

            # Read text
            try:
                with open(text_file, 'r', encoding='utf-8') as f:
                    text = f.read().strip()
            except Exception:
                continue

            if not text:
                continue

            # Read original text if available
            normalized_text = text
            if original_file.exists():
                try:
                    with open(original_file, 'r', encoding='utf-8') as f:
                        text = f.read().strip()
                except Exception:
                    pass

            # Get gender from speaker info
            gender = 'unknown'
            if subset in self._speakers_cache and speaker_id in self._speakers_cache[subset]:
                gender = self._speakers_cache[subset][speaker_id].get('gender', 'unknown')

            # Estimate duration (160 words per minute rule of thumb)
            word_count = len(text.split())
            estimated_duration = (word_count / 160) * 60

            if estimated_duration < min_duration or estimated_duration > max_duration:
                continue

            yield LibriTTSSample(
                audio_path=str(audio_file),
                text=text,
                normalized_text=normalized_text,
                speaker_id=speaker_id,
                chapter_id=chapter_id,
                book_id=book_id,
                duration_seconds=estimated_duration,
                split=subset,
                gender=gender,
            )
            count += 1

    def get_speakers(self, subset: str) -> list[LibriTTSSpeaker]:
        """Get all speakers in a subset."""
        if subset not in self._speakers_cache:
            self._load_speakers(subset)

        return [
            LibriTTSSpeaker(
                speaker_id=sid,
                name=info['name'],
                gender=info['gender'],
                subset=info['subset'],
            )
            for sid, info in self._speakers_cache.get(subset, {}).items()
        ]

    def get_statistics(self, subset: str) -> dict:
        """Get dataset statistics."""
        subset_dir = self.data_dir / subset
        if not subset_dir.exists():
            return {'error': 'Subset not downloaded'}

        # Count files
        wav_files = list(subset_dir.rglob('*.wav'))
        text_files = list(subset_dir.rglob('*.normalized.txt'))

        # Load speakers
        if subset not in self._speakers_cache:
            self._load_speakers(subset)

        speakers = self._speakers_cache.get(subset, {})
        male = sum(1 for s in speakers.values() if s.get('gender') == 'M')
        female = sum(1 for s in speakers.values() if s.get('gender') == 'F')

        return {
            'subset': subset,
            'total_wav_files': len(wav_files),
            'total_text_files': len(text_files),
            'total_speakers': len(speakers),
            'male_speakers': male,
            'female_speakers': female,
            'estimated_hours': self.subsets.get(subset, {}).get('hours', 0),
            'size_gb': self.subsets.get(subset, {}).get('size_gb', 0),
        }

    def search_samples(self, subset: str, query: str,
                       max_results: int = 10) -> list[LibriTTSSample]:
        """Search for samples containing specific text."""
        results = []
        for sample in self.load(subset, max_samples=5000):
            if query.lower() in sample.normalized_text.lower():
                results.append(sample)
                if len(results) >= max_results:
                    break
        return results

    def get_speaker_samples(self, subset: str, speaker_id: str,
                            max_samples: int = 50) -> list[LibriTTSSample]:
        """Get all samples from a specific speaker."""
        samples = []
        for sample in self.load(subset, speaker_filter=speaker_id):
            samples.append(sample)
            if len(samples) >= max_samples:
                break
        return samples


# Convenience function
def download_libritts(subset: str = 'train-clean-100',
                      data_dir: str = './data/libritts') -> bool:
    """Quick download helper."""
    loader = LibriTTSLoader(data_dir=data_dir)
    return loader.download(subset)
