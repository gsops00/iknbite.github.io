"""
Mozilla Common Voice Dataset Loader
Source: https://commonvoice.mozilla.org/
License: CC-0 (public domain)

Common Voice is a crowdsourced, multi-language dataset of voices
that anyone can use to train speech-enabled applications.

Datasets available:
- English: ~2,600 hours
- Arabic: ~400 hours
- Chinese: ~900 hours
- French: ~300 hours
- German: ~300 hours
- Spanish: ~300 hours
- Japanese: ~100 hours
- Korean: ~100 hours
- Portuguese: ~300 hours
- Russian: ~200 hours
- Hindi: ~200 hours
- And 60+ more languages

Download: https://commonvoice.mozilla.org/en/datasets
GitHub: https://github.com/common-voice/common-voice
"""

import os
import csv
import json
import hashlib
import requests
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Generator, Tuple
from dataclasses import dataclass


@dataclass
class VoiceSample:
    """Single voice sample from Common Voice."""
    audio_path: str
    text: str
    language: str
    speaker_id: Optional[str] = None
    duration_seconds: float = 0.0
    split: str = 'train'  # train, dev, test


@dataclass
class DatasetInfo:
    """Dataset metadata."""
    language: str
    language_code: str
    total_hours: float
    total_samples: int
    speakers: int
    license: str = 'CC-0'
    url: str = 'https://commonvoice.mozilla.org/'


class CommonVoiceLoader:
    """
    Mozilla Common Voice dataset loader and manager.

    Usage:
        loader = CommonVoiceLoader(data_dir='./data/common_voice')
        loader.download('en', version='15.0')
        samples = loader.load('en', split='train')
    """

    BASE_URL = 'https://commonvoice.mozilla.org/api/v1'
    DATASET_URL = 'https://commonvoice.mozilla.org/cv-corpus-{version}/{language}/cv-corpus-{version}-{language}.tar.gz'

    SUPPORTED_LANGUAGES = {
        'en': {'name': 'English',    'hours': 2600, 'samples': 2_000_000},
        'ar': {'name': 'Arabic',     'hours': 400,  'samples': 400_000},
        'zh': {'name': 'Chinese',    'hours': 900,  'samples': 800_000},
        'fr': {'name': 'French',     'hours': 300,  'samples': 300_000},
        'de': {'name': 'German',     'hours': 300,  'samples': 300_000},
        'es': {'name': 'Spanish',    'hours': 300,  'samples': 300_000},
        'ja': {'name': 'Japanese',   'hours': 100,  'samples': 100_000},
        'ko': {'name': 'Korean',     'hours': 100,  'samples': 100_000},
        'pt': {'name': 'Portuguese', 'hours': 300,  'samples': 300_000},
        'ru': {'name': 'Russian',    'hours': 200,  'samples': 200_000},
        'hi': {'name': 'Hindi',      'hours': 200,  'samples': 200_000},
        'it': {'name': 'Italian',    'hours': 100,  'samples': 100_000},
        'tr': {'name': 'Turkish',    'hours': 100,  'samples': 100_000},
        'pl': {'name': 'Polish',     'hours': 100,  'samples': 100_000},
        'nl': {'name': 'Dutch',      'hours': 100,  'samples': 100_000},
        'sv': {'name': 'Swedish',    'hours': 100,  'samples': 100_000},
        'da': {'name': 'Danish',     'hours': 100,  'samples': 100_000},
        'fi': {'name': 'Finnish',    'hours': 100,  'samples': 100_000},
        'nb': {'name': 'Norwegian',  'hours': 100,  'samples': 100_000},
        'cs': {'name': 'Czech',      'hours': 100,  'samples': 100_000},
        'el': {'name': 'Greek',      'hours': 100,  'samples': 100_000},
        'hu': {'name': 'Hungarian',  'hours': 100,  'samples': 100_000},
        'ro': {'name': 'Romanian',   'hours': 100,  'samples': 100_000},
        'th': {'name': 'Thai',       'hours': 100,  'samples': 100_000},
        'vi': {'name': 'Vietnamese', 'hours': 100,  'samples': 100_000},
        'id': {'name': 'Indonesian', 'hours': 100,  'samples': 100_000},
        'ms': {'name': 'Malay',      'hours': 100,  'samples': 100_000},
        'uk': {'name': 'Ukrainian',  'hours': 100,  'samples': 100_000},
    }

    def __init__(self, data_dir: str = './data/common_voice'):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self._cache = {}

    def list_languages(self) -> list[dict]:
        """List all supported languages."""
        return [
            {
                'code': code,
                'name': info['name'],
                'estimated_hours': info['hours'],
                'estimated_samples': info['samples'],
                'downloaded': self._is_downloaded(code),
            }
            for code, info in self.SUPPORTED_LANGUAGES.items()
        ]

    def _is_downloaded(self, language: str) -> bool:
        """Check if dataset is already downloaded."""
        lang_dir = self.data_dir / language
        return lang_dir.exists() and any(lang_dir.glob('*.tsv'))

    def download(self, language: str, version: str = '15.0',
                 force: bool = False) -> bool:
        """
        Download Common Voice dataset for a language.

        Args:
            language: Language code (e.g., 'en', 'ar', 'zh')
            version: Dataset version (default: 15.0)
            force: Re-download even if already present

        Returns:
            True if successful
        """
        if language not in self.SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Language '{language}' not supported. "
                f"Available: {', '.join(self.SUPPORTED_LANGUAGES.keys())}"
            )

        lang_dir = self.data_dir / language
        if self._is_downloaded(language) and not force:
            print(f"[CommonVoice] {language} already downloaded at {lang_dir}")
            return True

        lang_name = self.SUPPORTED_LANGUAGES[language]['name']
        print(f"[CommonVoice] Downloading {lang_name} ({language}) v{version}...")

        # Build download URL
        url = self.DATASET_URL.format(version=version, language=language)
        tar_path = self.data_dir / f'{language}.tar.gz'

        try:
            # Download with progress
            print(f"  URL: {url}")
            response = requests.get(url, stream=True, timeout=300)
            response.raise_for_status()

            total = int(response.headers.get('content-length', 0))
            downloaded = 0

            with open(tar_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total > 0:
                        pct = (downloaded / total) * 100
                        print(f"\r  Downloaded: {pct:.1f}% ({downloaded // 1024 // 1024}MB)", end='', flush=True)

            print(f"\n  Extracting...")
            lang_dir.mkdir(parents=True, exist_ok=True)

            # Extract
            subprocess.run(
                ['tar', '-xzf', str(tar_path), '-C', str(lang_dir), '--strip-components=2'],
                check=True
            )

            # Cleanup tar
            tar_path.unlink()

            # Cache metadata
            self._cache_language(language, lang_dir)

            print(f"[CommonVoice] ✅ {lang_name} downloaded to {lang_dir}")
            return True

        except requests.exceptions.HTTPError as e:
            print(f"[CommonVoice] ❌ Download failed: {e}")
            if tar_path.exists():
                tar_path.unlink()
            return False
        except Exception as e:
            print(f"[CommonVoice] ❌ Error: {e}")
            if tar_path.exists():
                tar_path.unlink()
            return False

    def _cache_language(self, language: str, lang_dir: Path):
        """Cache dataset metadata for fast access."""
        cache_file = self.data_dir / f'{language}_meta.json'

        tsv_files = list(lang_dir.glob('*.tsv'))
        total_samples = 0
        speakers = set()

        for tsv_file in tsv_files:
            try:
                with open(tsv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f, delimiter='\t')
                    for row in reader:
                        total_samples += 1
                        if 'client_id' in row:
                            speakers.add(row['client_id'])
            except Exception:
                continue

        meta = {
            'language': language,
            'total_samples': total_samples,
            'speakers': len(speakers),
            'tsv_files': [str(f.name) for f in tsv_files],
        }

        with open(cache_file, 'w') as f:
            json.dump(meta, f, indent=2)

    def load(self, language: str, split: str = 'train',
             max_samples: Optional[int] = None) -> Generator[VoiceSample, None, None]:
        """
        Load voice samples from Common Voice dataset.

        Args:
            language: Language code
            split: 'train', 'dev', or 'test'
            max_samples: Maximum samples to load (None = all)

        Yields:
            VoiceSample objects
        """
        lang_dir = self.data_dir / language
        if not lang_dir.exists():
            raise FileNotFoundError(
                f"Dataset not found. Download first: loader.download('{language}')"
            )

        # Find the TSV file for the split
        tsv_files = list(lang_dir.glob(f'*{split}*.tsv'))
        if not tsv_files:
            # Try any TSV file
            tsv_files = list(lang_dir.glob('*.tsv'))

        if not tsv_files:
            raise FileNotFoundError(f"No TSV files found in {lang_dir}")

        count = 0
        for tsv_file in tsv_files:
            if max_samples and count >= max_samples:
                return

            try:
                with open(tsv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f, delimiter='\t')
                    for row in reader:
                        if max_samples and count >= max_samples:
                            return

                        # Get audio path
                        audio_path = lang_dir / 'clips' / row.get('path', '')
                        if not audio_path.exists():
                            continue

                        # Get text (cleaned sentence)
                        text = row.get('sentence', '').strip()
                        if not text:
                            continue

                        # Get speaker ID
                        speaker_id = row.get('client_id', None)

                        # Get duration if available
                        duration = 0.0
                        if 'duration' in row:
                            try:
                                duration = float(row['duration'])
                            except (ValueError, TypeError):
                                pass

                        yield VoiceSample(
                            audio_path=str(audio_path),
                            text=text,
                            language=language,
                            speaker_id=speaker_id,
                            duration_seconds=duration,
                            split=split,
                        )
                        count += 1

            except Exception as e:
                print(f"[CommonVoice] Warning: Error reading {tsv_file}: {e}")
                continue

    def get_statistics(self, language: str) -> dict:
        """Get dataset statistics for a language."""
        meta_file = self.data_dir / f'{language}_meta.json'

        if meta_file.exists():
            with open(meta_file, 'r') as f:
                return json.load(f)

        # Compute from TSV
        lang_dir = self.data_dir / language
        if not lang_dir.exists():
            return {'error': 'Dataset not downloaded'}

        stats = {
            'language': language,
            'total_samples': 0,
            'speakers': set(),
            'total_duration': 0.0,
        }

        for tsv_file in lang_dir.glob('*.tsv'):
            try:
                with open(tsv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f, delimiter='\t')
                    for row in reader:
                        stats['total_samples'] += 1
                        if 'client_id' in row:
                            stats['speakers'].add(row['client_id'])
                        if 'duration' in row:
                            try:
                                stats['total_duration'] += float(row['duration'])
                            except (ValueError, TypeError):
                                pass
            except Exception:
                continue

        stats['speakers'] = len(stats['speakers'])
        stats['total_hours'] = stats['total_duration'] / 3600

        # Cache
        cache_data = {k: v for k, v in stats.items() if k != 'speakers'}
        cache_data['speakers'] = stats['speakers']
        with open(meta_file, 'w') as f:
            json.dump(cache_data, f, indent=2)

        return stats

    def search_samples(self, language: str, query: str,
                       max_results: int = 10) -> list[VoiceSample]:
        """Search for samples containing specific text."""
        results = []
        for sample in self.load(language, max_samples=10000):
            if query.lower() in sample.text.lower():
                results.append(sample)
                if len(results) >= max_results:
                    break
        return results

    def get_speaker_samples(self, language: str, speaker_id: str,
                            max_samples: int = 50) -> list[VoiceSample]:
        """Get all samples from a specific speaker."""
        samples = []
        for sample in self.load(language):
            if sample.speaker_id == speaker_id:
                samples.append(sample)
                if len(samples) >= max_samples:
                    break
        return samples


# Convenience function
def download_common_voice(language: str = 'en', data_dir: str = './data/common_voice') -> bool:
    """Quick download helper."""
    loader = CommonVoiceLoader(data_dir=data_dir)
    return loader.download(language)
