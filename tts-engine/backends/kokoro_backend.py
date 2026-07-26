"""
Kokoro TTS Backend
Model: kokoro-82m (82M parameters)
Quality: Excellent for its size
Speed: Fast on CPU, very fast on GPU
Languages: English (+ basic multilingual)
"""

import time
import numpy as np
from typing import Optional
from .base import TTSBackend, TTSResult


class KokoroBackend(TTSBackend):
    """Kokoro TTS — primary backend, best quality/size ratio."""

    VOICES = {
        # Female
        'af_aoede':  {'name': 'Aoede',    'gender': 'female', 'lang': 'en'},
        'af_bella':  {'name': 'Bella',    'gender': 'female', 'lang': 'en'},
        'af_heart':  {'name': 'Heart',    'gender': 'female', 'lang': 'en'},
        'af_nova':   {'name': 'Nova',     'gender': 'female', 'lang': 'en'},
        'af_sky':    {'name': 'Sky',      'gender': 'female', 'lang': 'en'},
        # Male
        'am_adam':   {'name': 'Adam',     'gender': 'male',   'lang': 'en'},
        'am_echo':   {'name': 'Echo',     'gender': 'male',   'lang': 'en'},
        'am_eric':   {'name': 'Eric',     'gender': 'male',   'lang': 'en'},
        'am_michael': {'name': 'Michael', 'gender': 'male',   'lang': 'en'},
        'am_to':     {'name': 'To',       'gender': 'male',   'lang': 'en'},
    }

    def __init__(self):
        self._pipeline = None
        self._device = None
        self._loaded = False

    @property
    def name(self) -> str:
        return 'kokoro'

    @property
    def is_available(self) -> bool:
        return self._loaded

    def load(self, model_path: Optional[str] = None, device: Optional[str] = None) -> bool:
        try:
            from kokoro import KPipeline
            self._device = device or self._detect_device()
            self._pipeline = KPipeline(lang_code='a')  # 'a' = American English
            self._loaded = True
            print(f"[Kokoro] Loaded successfully on {self._device}")
            return True
        except ImportError:
            print("[Kokoro] Not installed. Run: pip install kokoro")
            return False
        except Exception as e:
            print(f"[Kokoro] Failed to load: {e}")
            return False

    def synthesize(self, text: str, voice_id: str, speed: float = 1.0) -> TTSResult:
        if not self._loaded:
            raise RuntimeError("Kokoro backend not loaded")

        t0 = time.time()
        # Kokoro generates audio via pipeline
        audio_chunks = []
        for _, _, audio in self._pipeline(text, voice=voice_id, speed=speed):
            audio_chunks.append(audio)

        if not audio_chunks:
            raise RuntimeError("Kokoro produced no audio")

        audio = np.concatenate(audio_chunks)
        # Kokoro outputs at 24kHz
        sample_rate = 24000
        duration = len(audio) / sample_rate

        return TTSResult(
            audio=audio.astype(np.float32),
            sample_rate=sample_rate,
            model_name='kokoro-82m',
            voice_id=voice_id,
            duration_seconds=duration,
            backend_name=self.name
        )

    def list_voices(self) -> list[dict]:
        return [
            {'id': vid, **info}
            for vid, info in self.VOICES.items()
        ]

    def _detect_device(self) -> str:
        try:
            import torch
            return 'cuda' if torch.cuda.is_available() else 'cpu'
        except ImportError:
            return 'cpu'
