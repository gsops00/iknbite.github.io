"""
iknbite TTS Engine — Main orchestrator
Coordinates model pipeline + DSP processing + API.
"""

import time
import numpy as np
from typing import Optional
from config import EngineConfig
from backends.pipeline import ModelPipeline
from dsp.processor import DSPProcessor


class TTSEngine:
    """Main TTS engine — coordinates synthesis and processing."""

    def __init__(self, config: Optional[EngineConfig] = None):
        self.config = config or EngineConfig.from_env()
        self.pipeline = ModelPipeline(self.config.model)
        self.dsp = DSPProcessor(self.config.dsp)
        self._started = False

    def start(self) -> bool:
        """Initialize and load models."""
        print("=" * 60)
        print("  iknbite TTS Engine — Local Neural Speech Synthesis")
        print("=" * 60)

        # Detect device
        device = self._detect_device()
        self.config.model.device = device
        print(f"Device: {device}")

        # Load models
        success = self.pipeline.discover_and_load()
        self._started = success

        if success:
            print(f"DSP Pipeline: {self.dsp.get_pipeline_info()['count']} stages")
            print("=" * 60)

        return success

    def synthesize(self, text: str, voice_id: str, speed: float = 1.0,
                   output_format: str = 'mp3') -> tuple[bytes, str]:
        """
        Full synthesis pipeline: TTS → DSP → encoded audio.
        Returns (audio_bytes, mime_type).
        """
        if not self._started:
            raise RuntimeError("Engine not started. Call start() first.")

        if not text or not text.strip():
            raise ValueError("Empty text")

        if len(text) > self.config.model.max_text_length:
            raise ValueError(f"Text exceeds {self.config.model.max_text_length} chars")

        t0 = time.time()

        # 1. Synthesize raw audio
        result = self.pipeline.synthesize(text, voice_id, speed)
        t_synth = time.time() - t0
        print(f"  Synthesis: {t_synth:.2f}s ({result.backend_name}/{result.model_name})")

        # 2. Process through DSP pipeline
        t1 = time.time()
        if output_format == 'wav':
            audio_bytes = self.dsp.process_to_wav(result.audio, result.sample_rate)
            mime = 'audio/wav'
        else:
            audio_bytes = self.dsp.process_to_wav(result.audio, result.sample_rate)
            mime = 'audio/wav'
            # For MP3, try soundfile fallback
            try:
                import io
                from scipy.io import wavfile
                processed, sr = self.dsp.process(result.audio, result.sample_rate)
                buf = io.BytesIO()
                wavfile.write(buf, sr, (processed * 32767).astype(np.int16))
                audio_bytes = buf.getvalue()
                mime = 'audio/wav'
            except Exception:
                pass

        t_dsp = time.time() - t1
        total = time.time() - t0
        print(f"  DSP: {t_dsp:.2f}s | Total: {total:.2f}s | Output: {len(audio_bytes)} bytes")

        return audio_bytes, mime

    def list_voices(self) -> list[dict]:
        return self.pipeline.list_all_voices()

    def get_status(self) -> dict:
        status = self.pipeline.get_status()
        status['dsp'] = self.dsp.get_pipeline_info()
        status['started'] = self._started
        return status

    def _detect_device(self) -> str:
        """Auto-detect best compute device."""
        try:
            import torch
            if torch.cuda.is_available():
                name = torch.cuda.get_device_name(0)
                print(f"GPU detected: {name}")
                return 'cuda'
        except ImportError:
            pass

        # Check for Apple Silicon
        import platform
        if platform.system() == 'Darwin' and platform.machine() == 'arm64':
            print("Apple Silicon detected — using CPU (MPS available with PyTorch)")
            return 'cpu'

        print("No GPU detected — using CPU")
        return 'cpu'
