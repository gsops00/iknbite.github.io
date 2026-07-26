"""
Piper TTS Backend
Model: ONNX-based, very lightweight
Quality: Good, designed for edge devices
Speed: Very fast on CPU
Languages: 30+ languages
"""

import os
import time
import subprocess
import tempfile
import wave
import struct
import numpy as np
from typing import Optional
from .base import TTSBackend, TTSResult


class PiperBackend(TTSBackend):
    """Piper TTS — lightweight fallback backend."""

    # Common Piper voices (can be downloaded)
    COMMON_VOICES = {
        'en_US-lessac-medium':       {'gender': 'male',   'lang': 'en', 'quality': 'medium'},
        'en_US-lessac-low':          {'gender': 'male',   'lang': 'en', 'quality': 'low'},
        'en_US-amy-medium':          {'gender': 'female', 'lang': 'en', 'quality': 'medium'},
        'en_US-arctic-medium':       {'gender': 'male',   'lang': 'en', 'quality': 'medium'},
        'en_GB-alba-medium':         {'gender': 'female', 'lang': 'en', 'quality': 'medium'},
        'fr_FR-siwis-medium':        {'gender': 'female', 'lang': 'fr', 'quality': 'medium'},
        'de_DE-karlsten-medium':     {'gender': 'male',   'lang': 'de', 'quality': 'medium'},
        'es_ES-sharvard-medium':     {'gender': 'male',   'lang': 'es', 'quality': 'medium'},
        'ja_JP-kokoro-medium':       {'gender': 'female', 'lang': 'ja', 'quality': 'medium'},
        'zh_CN-huayan-medium':       {'gender': 'female', 'lang': 'zh', 'quality': 'medium'},
        'ko_KR-jangmi-medium':       {'gender': 'female', 'lang': 'ko', 'quality': 'medium'},
        'ar_SA-kareem-medium':       {'gender': 'male',   'lang': 'ar', 'quality': 'medium'},
        'ru_RU-irina-medium':        {'gender': 'female', 'lang': 'ru', 'quality': 'medium'},
        'pt_BR-faber-medium':        {'gender': 'male',   'lang': 'pt', 'quality': 'medium'},
        'it_IT-riccardo-medium':     {'gender': 'male',   'lang': 'it', 'quality': 'medium'},
    }

    def __init__(self):
        self._piper_bin = None
        self._loaded = False
        self._model_dir = None

    @property
    def name(self) -> str:
        return 'piper'

    @property
    def is_available(self) -> bool:
        return self._loaded

    def load(self, model_path: Optional[str] = None, device: Optional[str] = None) -> bool:
        # Try Python package first
        try:
            from piper import PiperVoice
            self._loaded = True
            print("[Piper] Loaded via Python package")
            return True
        except ImportError:
            pass

        # Try CLI binary
        for candidate in ['piper', '/usr/local/bin/piper', '/usr/bin/piper']:
            if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                self._piper_bin = candidate
                self._loaded = True
                print(f"[Piper] Loaded CLI: {candidate}")
                return True

        # Try to find in common locations
        for path in [
            os.path.expanduser('~/.local/bin/piper'),
            '/opt/piper/piper',
        ]:
            if os.path.isfile(path):
                self._piper_bin = path
                self._loaded = True
                print(f"[Piper] Found at: {path}")
                return True

        print("[Piper] Not found. Install: pip install piper-tts")
        return False

    def synthesize(self, text: str, voice_id: str, speed: float = 1.0) -> TTSResult:
        if not self._loaded:
            raise RuntimeError("Piper backend not loaded")

        t0 = time.time()

        # Try Python API first
        try:
            return self._synthesize_python(text, voice_id, speed)
        except Exception:
            pass

        # Fallback to CLI
        return self._synthesize_cli(text, voice_id, speed)

    def _synthesize_python(self, text: str, voice_id: str, speed: float) -> TTSResult:
        from piper import PiperVoice
        import io

        model_path = self._find_model(voice_id)
        if not model_path:
            raise FileNotFoundError(f"No model found for {voice_id}")

        voice = PiperVoice.load(model_path)

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            wav_path = f.name

        with wave.open(wav_path, 'wb') as wav_file:
            voice.synthesize(text, wav_file)

        # Read back
        with wave.open(wav_path, 'rb') as wf:
            frames = wf.readframes(wf.getnframes())
            sample_rate = wf.getframerate()
            audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0

        os.unlink(wav_path)

        # Apply speed
        if speed != 1.0:
            audio = self._change_speed(audio, speed)

        return TTSResult(
            audio=audio,
            sample_rate=sample_rate,
            model_name='piper',
            voice_id=voice_id,
            duration_seconds=len(audio) / sample_rate,
            backend_name=self.name
        )

    def _synthesize_cli(self, text: str, voice_id: str, speed: float) -> TTSResult:
        model_path = self._find_model(voice_id)
        if not model_path:
            raise FileNotFoundError(f"No model found for {voice_id}")

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            wav_path = f.name

        cmd = [self._piper_bin, '--model', model_path, '--output_file', wav_path]
        if speed != 1.0:
            cmd.extend(['--length-scale', str(1.0 / speed)])

        proc = subprocess.run(
            cmd, input=text.encode('utf-8'),
            capture_output=True, timeout=30
        )

        if proc.returncode != 0:
            raise RuntimeError(f"Piper failed: {proc.stderr.decode()}")

        with wave.open(wav_path, 'rb') as wf:
            frames = wf.readframes(wf.getnframes())
            sample_rate = wf.getframerate()
            audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0

        os.unlink(wav_path)

        return TTSResult(
            audio=audio,
            sample_rate=sample_rate,
            model_name='piper',
            voice_id=voice_id,
            duration_seconds=len(audio) / sample_rate,
            backend_name=self.name
        )

    def _find_model(self, voice_id: str) -> Optional[str]:
        """Find .onnx model file for a voice."""
        search_dirs = [
            self._model_dir,
            os.path.expanduser('~/.local/share/piper'),
            '/usr/local/share/piper',
            os.path.expanduser('~/piper-models'),
        ]
        for d in search_dirs:
            if not d:
                continue
            candidate = os.path.join(d, f'{voice_id}.onnx')
            if os.path.isfile(candidate):
                return candidate
        return None

    @staticmethod
    def _change_speed(audio: np.ndarray, speed: float) -> np.ndarray:
        """Change audio speed using linear interpolation."""
        indices = np.linspace(0, len(audio) - 1, int(len(audio) / speed))
        return np.interp(indices, np.arange(len(audio)), audio).astype(np.float32)

    def list_voices(self) -> list[dict]:
        return [
            {'id': vid, 'name': vid.split('-')[-2] if '-' in vid else vid, **info}
            for vid, info in self.COMMON_VOICES.items()
        ]
