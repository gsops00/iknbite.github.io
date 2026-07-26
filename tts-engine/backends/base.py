"""
Abstract TTS backend interface.
All neural TTS backends must implement this.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
import numpy as np


@dataclass
class TTSResult:
    """Result from a TTS backend."""
    audio: np.ndarray           # Audio samples (float32, mono)
    sample_rate: int            # Sample rate of the audio
    model_name: str             # Name of the model used
    voice_id: str               # Voice identifier
    duration_seconds: float     # Audio duration
    backend_name: str           # Backend that produced this


class TTSBackend(ABC):
    """Abstract base class for TTS backends."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Backend name (e.g., 'kokoro', 'piper')."""
        ...

    @property
    @abstractmethod
    def is_available(self) -> bool:
        """Whether this backend is loaded and ready."""
        ...

    @abstractmethod
    def load(self, model_path: Optional[str] = None, device: Optional[str] = None) -> bool:
        """
        Load the model. Returns True if successful.
        model_path: Optional path to model weights/config.
        device: 'cuda', 'cpu', or None for auto-detect.
        """
        ...

    @abstractmethod
    def synthesize(self, text: str, voice_id: str, speed: float = 1.0) -> TTSResult:
        """
        Generate speech from text.
        Returns raw audio (before DSP processing).
        """
        ...

    @abstractmethod
    def list_voices(self) -> list[dict]:
        """Return available voices with metadata."""
        ...

    def unload(self):
        """Release model resources."""
        pass

    def __repr__(self):
        status = "ready" if self.is_available else "not loaded"
        return f"<{self.__class__.__name__} [{self.name}] {status}>"
