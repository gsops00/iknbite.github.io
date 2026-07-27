"""
Model Pipeline — auto-detects and manages available TTS backends.
Priority: Kokoro > Piper > (others in future)
"""

from typing import Optional
from .base import TTSBackend, TTSResult
from ..config import ModelConfig


class ModelPipeline:
    """
    Manages multiple TTS backends with automatic fallback.
    Tries backends in priority order until one succeeds.
    """

    def __init__(self, config: ModelConfig):
        self.config = config
        self.backends: dict[str, TTSBackend] = {}
        self.active_backend: Optional[str] = None
        self._loaded = False

    def discover_and_load(self) -> bool:
        """Auto-detect and load the best available backend."""
        print("[Pipeline] Discovering TTS backends...")

        # Import all available backends
        backend_classes = {}
        try:
            from .kokoro_backend import KokoroBackend
            backend_classes['kokoro'] = KokoroBackend
        except ImportError:
            pass

        try:
            from .piper_backend import PiperBackend
            backend_classes['piper'] = PiperBackend
        except ImportError:
            pass

        try:
            from .melotts_backend import MeloTTsBackend
            backend_classes['melotts'] = MeloTTsBackend
        except ImportError:
            pass

        try:
            from .chatterbox_backend import ChatterboxBackend
            backend_classes['chatterbox'] = ChatterboxBackend
        except ImportError:
            pass

        if not backend_classes:
            print("[Pipeline] ⚠️  No TTS backends available!")
            print("[Pipeline] Install at least one:")
            print("  pip install kokoro                           # Best quality (82M params)")
            print("  pip install piper-tts                        # Lightweight, fast")
            print("  pip install git+https://github.com/myshell-ai/MeloTTS.git  # Multi-lingual")
            print("  pip install chatterbox-tts                   # Expressive, voice cloning")
            return False

        # Try each backend in priority order
        device = self.config.device
        for name in self.config.backend_priority:
            if name not in backend_classes:
                continue

            print(f"[Pipeline] Trying {name}...")
            backend = backend_classes[name]()

            if backend.load(device=device):
                self.backends[name] = backend
                if not self.active_backend:
                    self.active_backend = name
                    print(f"[Pipeline] ✅ Active backend: {name}")
                self._loaded = True
            else:
                print(f"[Pipeline] ❌ {name} failed to load")

        if self._loaded:
            print(f"[Pipeline] Loaded {len(self.backends)} backend(s), active: {self.active_backend}")
        else:
            print("[Pipeline] ❌ No backends loaded successfully")

        return self._loaded

    def synthesize(self, text: str, voice_id: str, speed: float = 1.0,
                   backend_override: Optional[str] = None) -> TTSResult:
        """
        Synthesize speech using the best available backend.
        Tries active backend first, then falls back to others.
        """
        target = backend_override or self.active_backend
        if not target:
            raise RuntimeError("No TTS backend available")

        # Try the target backend first
        if target in self.backends:
            try:
                return self.backends[target].synthesize(text, voice_id, speed)
            except Exception as e:
                print(f"[Pipeline] {target} failed: {e}, trying fallback...")

        # Fallback to any available backend
        for name, backend in self.backends.items():
            if name == target:
                continue
            try:
                return backend.synthesize(text, voice_id, speed)
            except Exception as e:
                print(f"[Pipeline] {name} fallback failed: {e}")

        raise RuntimeError("All TTS backends failed")

    def list_all_voices(self) -> list[dict]:
        """List voices from all loaded backends."""
        voices = []
        for name, backend in self.backends.items():
            for v in backend.list_voices():
                v['backend'] = name
                voices.append(v)
        return voices

    def get_status(self) -> dict:
        return {
            'loaded': self._loaded,
            'active_backend': self.active_backend,
            'available_backends': {
                name: {
                    'available': b.is_available,
                    'voices': len(b.list_voices())
                }
                for name, b in self.backends.items()
            }
        }

    def unload(self):
        for backend in self.backends.values():
            backend.unload()
        self.backends.clear()
        self.active_backend = None
        self._loaded = False
