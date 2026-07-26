"""
iknbite TTS Engine — Configuration
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class DSPConfig:
    """DSP post-processing pipeline settings."""
    target_loudness_lufs: float = -16.0       # EBU R128 loudness target
    target_peak_db: float = -1.0              # True peak ceiling
    sample_rate: int = 24000                  # Output sample rate
    enable_eq: bool = True                    # 3-band equalizer
    enable_compressor: bool = True            # Dynamic range compression
    enable_limiter: bool = True               # True peak limiter
    enable_deesser: bool = True               # Sibilance reduction
    enable_noise_gate: bool = True            # Silence gating
    enable_silence_trim: bool = True          # Trim leading/trailing silence
    enable_normalization: bool = True         # Loudness normalization
    noise_gate_threshold_db: float = -45.0    # Gate opening threshold
    compressor_threshold_db: float = -18.0    # Compression onset
    compressor_ratio: float = 3.0             # Compression ratio
    compressor_attack_ms: float = 5.0         # Attack time
    compressor_release_ms: float = 50.0       # Release time
    deesser_frequency_hz: float = 6000.0      # Sibilance center freq
    deesser_threshold_db: float = -20.0       # De-esser threshold
    eq_low_gain_db: float = 0.0               # Low shelf gain (Hz < 200)
    eq_mid_gain_db: float = 1.5               # Mid peak gain (200-4000 Hz)
    eq_high_gain_db: float = 0.5              # High shelf gain (Hz > 4000)
    trim_silence_threshold_db: float = -40.0  # Silence detection threshold
    trim_silence_duration_ms: float = 200.0   # Min silence duration to trim


@dataclass
class ModelConfig:
    """TTS model backend settings."""
    # Auto-detection priority
    backend_priority: list = field(default_factory=lambda: [
        'kokoro', 'piper', 'coqui_xtts', 'vits', 'styletts2', 'melotts'
    ])
    # Device selection
    device: Optional[str] = None  # None = auto-detect ('cuda' or 'cpu')
    # Model-specific paths (auto-detected if None)
    kokoro_model_path: Optional[str] = None
    piper_model_path: Optional[str] = None
    piper_voice_path: Optional[str] = None
    # Default voice per backend
    default_voice_kokoro: str = 'af_aoede'
    default_voice_piper: str = 'en_US-lessac-medium'
    # Max text length per request (chars)
    max_text_length: int = 5000
    # Batch size for inference
    batch_size: int = 1


@dataclass
class ServerConfig:
    """HTTP server settings."""
    host: str = '0.0.0.0'
    port: int = 5050
    api_key: Optional[str] = None  # None = no auth required
    cors_origins: list = field(default_factory=lambda: ['*'])
    max_concurrent: int = 4
    timeout_seconds: int = 60


@dataclass
class EngineConfig:
    """Top-level engine configuration."""
    dsp: DSPConfig = field(default_factory=DSPConfig)
    model: ModelConfig = field(default_factory=ModelConfig)
    server: ServerConfig = field(default_factory=ServerConfig)

    @classmethod
    def from_env(cls) -> 'EngineConfig':
        """Load configuration from environment variables."""
        cfg = cls()
        # Server
        cfg.server.host = os.getenv('TTS_HOST', cfg.server.host)
        cfg.server.port = int(os.getenv('TTS_PORT', str(cfg.server.port)))
        cfg.server.api_key = os.getenv('TTS_API_KEY', cfg.server.api_key)
        # Model
        cfg.model.device = os.getenv('TTS_DEVICE', cfg.model.device)
        cfg.model.kokoro_model_path = os.getenv('KOKORO_MODEL_PATH', cfg.model.kokoro_model_path)
        cfg.model.piper_model_path = os.getenv('PIPER_MODEL_PATH', cfg.model.piper_model_path)
        cfg.model.piper_voice_path = os.getenv('PIPER_VOICE_PATH', cfg.model.piper_voice_path)
        # DSP
        cfg.dsp.target_loudness_lufs = float(os.getenv('TTS_TARGET_LUFS', str(cfg.dsp.target_loudness_lufs)))
        cfg.dsp.sample_rate = int(os.getenv('TTS_SAMPLE_RATE', str(cfg.dsp.sample_rate)))
        return cfg
