"""
Chatterbox TTS Backend
Source: https://github.com/resemble-ai/chatterbox
Quality: High — expressive, emotion-aware speech
License: Custom (see repo)
Note: Voice cloning capable — needs reference audio for custom voices.
"""

import time
import numpy as np
from typing import Optional
from .base import TTSBackend, TTSResult


class ChatterboxBackend(TTSBackend):
    """Chatterbox TTS — expressive, emotion-aware synthesis with voice cloning."""

    VOICES = {
        'default': {'name': 'Default', 'gender': 'neutral', 'lang': 'en'},
    }

    def __init__(self):
        self._model = None
        self._loaded = False

    @property
    def name(self) -> str:
        return 'chatterbox'

    @property
    def is_available(self) -> bool:
        return self._loaded

    def load(self, model_path: Optional[str] = None, device: Optional[str] = None) -> bool:
        try:
            from chatterbox.tts import ChatterboxTTS
            self._model = ChatterboxTTS.from_pretrained(device=device or 'cpu')
            self._loaded = True
            print("[Chatterbox] Loaded successfully")
            return True
        except ImportError:
            print("[Chatterbox] Not installed. Run: pip install chatterbox-tts")
            return False
        except Exception as e:
            print(f"[Chatterbox] Failed to load: {e}")
            return False

    def synthesize(self, text: str, voice_id: str, speed: float = 1.0) -> TTSResult:
        if not self._loaded:
            raise RuntimeError("Chatterbox backend not loaded")

        t0 = time.time()

        # Chatterbox uses its own internal voice for basic TTS
        wav = self._model.generate(text)
        audio = wav.squeeze().cpu().numpy()
        sr = self._model.sr  # Usually 24000

        # Apply speed if not 1.0
        if speed != 1.0:
            indices = np.linspace(0, len(audio) - 1, int(len(audio) / speed))
            audio = np.interp(indices, np.arange(len(audio)), audio).astype(np.float32)

        duration = len(audio) / sr
        print(f"  [Chatterbox] {duration:.2f}s audio in {time.time()-t0:.2f}s")

        return TTSResult(
            audio=audio.astype(np.float32),
            sample_rate=sr,
            model_name='chatterbox',
            voice_id=voice_id,
            duration_seconds=duration,
            backend_name=self.name
        )

    def synthesize_clone(self, text: str, reference_audio: np.ndarray,
                         reference_sr: int, speed: float = 1.0) -> TTSResult:
        """
        Voice cloning — synthesize speech mimicking the reference voice.
        """
        if not self._loaded:
            raise RuntimeError("Chatterbox backend not loaded")

        import torch
        t0 = time.time()

        # Convert numpy to torch tensor
        ref_tensor = torch.from_numpy(reference_audio).float()
        if ref_tensor.ndim == 1:
            ref_tensor = ref_tensor.unsqueeze(0)

        wav = self._model.generate(text, audio_prompt=ref_tensor)
        audio = wav.squeeze().cpu().numpy()
        sr = self._model.sr

        if speed != 1.0:
            indices = np.linspace(0, len(audio) - 1, int(len(audio) / speed))
            audio = np.interp(indices, np.arange(len(audio)), audio).astype(np.float32)

        duration = len(audio) / sr
        print(f"  [Chatterbox Clone] {duration:.2f}s audio in {time.time()-t0:.2f}s")

        return TTSResult(
            audio=audio.astype(np.float32),
            sample_rate=sr,
            model_name='chatterbox-clone',
            voice_id='cloned',
            duration_seconds=duration,
            backend_name=self.name
        )

    def list_voices(self) -> list[dict]:
        return [
            {'id': vid, **info}
            for vid, info in self.VOICES.items()
        ]
