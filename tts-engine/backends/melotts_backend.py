"""
MeloTTS Backend
Source: https://github.com/myshell-ai/MeloTTS
Quality: Good, fast inference
Languages: Multi-lingual (English, Chinese, Japanese, etc.)
License: MIT
"""

import time
import numpy as np
from typing import Optional
from .base import TTSBackend, TTSResult


class MeloTTsBackend(TTSBackend):
    """MeloTTS — fast multi-lingual TTS backend."""

    VOICES = {
        'EN':    {'name': 'English',    'gender': 'female', 'lang': 'en'},
        'EN_M':  {'name': 'English M',  'gender': 'male',   'lang': 'en'},
        'ZH':    {'name': 'Chinese',    'gender': 'female', 'lang': 'zh'},
        'ZH_M':  {'name': 'Chinese M',  'gender': 'male',   'lang': 'zh'},
        'JA':    {'name': 'Japanese',   'gender': 'female', 'lang': 'ja'},
        'JA_M':  {'name': 'Japanese M', 'gender': 'male',   'lang': 'ja'},
        'KO':    {'name': 'Korean',     'gender': 'female', 'lang': 'ko'},
        'KO_M':  {'name': 'Korean M',   'gender': 'male',   'lang': 'ko'},
        'FR':    {'name': 'French',     'gender': 'female', 'lang': 'fr'},
        'FR_M':  {'name': 'French M',   'gender': 'male',   'lang': 'fr'},
        'ES':    {'name': 'Spanish',    'gender': 'female', 'lang': 'es'},
        'ES_M':  {'name': 'Spanish M',  'gender': 'male',   'lang': 'es'},
        'DE':    {'name': 'German',     'gender': 'female', 'lang': 'de'},
        'DE_M':  {'name': 'German M',   'gender': 'male',   'lang': 'de'},
        'PT':    {'name': 'Portuguese', 'gender': 'female', 'lang': 'pt'},
        'PT_M':  {'name': 'Portuguese M','gender': 'male',  'lang': 'pt'},
        'AR':    {'name': 'Arabic',     'gender': 'female', 'lang': 'ar'},
        'AR_M':  {'name': 'Arabic M',   'gender': 'male',   'lang': 'ar'},
        'RU':    {'name': 'Russian',    'gender': 'female', 'lang': 'ru'},
        'RU_M':  {'name': 'Russian M',  'gender': 'male',   'lang': 'ru'},
        'HI':    {'name': 'Hindi',      'gender': 'female', 'lang': 'hi'},
        'HI_M':  {'name': 'Hindi M',    'gender': 'male',   'lang': 'hi'},
        'IT':    {'name': 'Italian',    'gender': 'female', 'lang': 'it'},
        'IT_M':  {'name': 'Italian M',  'gender': 'male',   'lang': 'it'},
        'TR':    {'name': 'Turkish',    'gender': 'female', 'lang': 'tr'},
        'TR_M':  {'name': 'Turkish M',  'gender': 'male',   'lang': 'tr'},
        'PL':    {'name': 'Polish',     'gender': 'female', 'lang': 'pl'},
        'PL_M':  {'name': 'Polish M',   'gender': 'male',   'lang': 'pl'},
    }

    def __init__(self):
        self._model = None
        self._loaded = False

    @property
    def name(self) -> str:
        return 'melotts'

    @property
    def is_available(self) -> bool:
        return self._loaded

    def load(self, model_path: Optional[str] = None, device: Optional[str] = None) -> bool:
        try:
            from melo.api import TTS as MeloTTS
            self._model = MeloTTS(language='EN', device=device or 'auto')
            self._loaded = True
            print("[MeloTTS] Loaded successfully")
            return True
        except ImportError:
            print("[MeloTTS] Not installed. Run: pip install git+https://github.com/myshell-ai/MeloTTS.git")
            return False
        except Exception as e:
            print(f"[MeloTTS] Failed to load: {e}")
            return False

    def synthesize(self, text: str, voice_id: str, speed: float = 1.0) -> TTSResult:
        if not self._loaded:
            raise RuntimeError("MeloTTS backend not loaded")

        import tempfile, os
        t0 = time.time()

        # Map voice_id to language
        lang = voice_id.split('_')[0] if '_' in voice_id else voice_id
        speaker_id = 0 if '_M' in voice_id else 0

        # MeloTTS outputs to file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            tmp_path = f.name

        try:
            self._model.tts_to_file(text, speaker_id, tmp_path, speed=speed)

            import soundfile as sf
            audio, sr = sf.read(tmp_path)
            if audio.ndim > 1:
                audio = audio.mean(axis=1)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

        duration = len(audio) / sr
        print(f"  [MeloTTS] {duration:.2f}s audio in {time.time()-t0:.2f}s")

        return TTSResult(
            audio=audio.astype(np.float32),
            sample_rate=sr,
            model_name='melotts',
            voice_id=voice_id,
            duration_seconds=duration,
            backend_name=self.name
        )

    def list_voices(self) -> list[dict]:
        return [
            {'id': vid, **info}
            for vid, info in self.VOICES.items()
        ]
