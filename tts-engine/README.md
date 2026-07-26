# iknbite TTS Engine

Fully local, offline neural text-to-speech engine with professional DSP post-processing.

## Features

- **Neural TTS**: Kokoro (82M), Piper — runs locally, no cloud APIs
- **Professional DSP**: Loudness normalization, EQ, compression, de-essing, limiting
- **Auto-detection**: Finds best available model automatically
- **GPU support**: CUDA acceleration when available, CPU fallback
- **OpenAI-compatible API**: Drop-in replacement for OpenAI TTS

## Quick Start

```bash
# Docker (recommended)
docker compose up

# Or local
./setup.sh
source venv/bin/activate
python server.py
```

## API

```bash
# Generate speech
curl -X POST http://localhost:5050/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello world", "voice": "af_aoede"}' \
  --output speech.wav

# List voices
curl http://localhost:5050/v1/voices

# Engine status
curl http://localhost:5050/status
```

## Voices

| Backend | Male | Female | Quality |
|---------|------|--------|---------|
| Kokoro | am_adam, am_echo, am_eric, am_michael, am_to | af_aoede, af_bella, af_heart, af_nova, af_sky | ⭐⭐⭐⭐⭐ |
| Piper | 30+ voices across languages | 30+ voices | ⭐⭐⭐⭐ |

## DSP Pipeline

```
Raw Audio → Trim Silence → DC Removal → Noise Gate → 3-Band EQ →
De-esser → Compressor → Loudness Norm (EBU R128) → True Peak Limiter →
Clip Protection → WAV/MP3 Output
```

## Configuration

Environment variables:
- `TTS_PORT` — Server port (default: 5050)
- `TTS_API_KEY` — Optional API key
- `TTS_DEVICE` — `cuda` or `cpu` (default: auto-detect)
- `TTS_TARGET_LUFS` — Target loudness (default: -16.0)
- `TTS_SAMPLE_RATE` — Output sample rate (default: 24000)
