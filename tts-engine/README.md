# iknbite TTS Engine

Fully local, offline neural text-to-speech engine with professional DSP post-processing.

## Features

- **Neural TTS**: Kokoro (82M), Piper, MeloTTS, Chatterbox — runs locally, no cloud APIs
- **Professional DSP**: Loudness normalization, EQ, compression, de-essing, limiting
- **Audio Quality Evaluation**: SNR, SI-SDR, MOS prediction, clipping detection
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

# Evaluate audio quality
curl -X POST http://localhost:5050/v1/audio/evaluate \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello world", "voice": "af_aoede"}'
```

## TTS Backends

| Backend | Male | Female | Languages | Quality | Install |
|---------|------|--------|-----------|---------|---------|
| Kokoro | am_adam, am_echo, am_eric, am_michael, am_to | af_aoede, af_bella, af_heart, af_nova, af_sky | English | ⭐⭐⭐⭐⭐ | `pip install kokoro` |
| Piper | 30+ voices | 30+ voices | 30+ | ⭐⭐⭐⭐ | `pip install piper-tts` |
| MeloTTS | EN_M, ZH_M, JA_M, KO_M, ... | EN, ZH, JA, KO, FR, ES, DE, ... | 10+ | ⭐⭐⭐⭐ | `pip install git+https://github.com/myshell-ai/MeloTTS.git` |
| Chatterbox | (default) | (default) | English | ⭐⭐⭐⭐⭐ | `pip install chatterbox-tts` |
| Edge TTS | 150+ voices | 150+ voices | 80+ | ⭐⭐⭐⭐⭐ | Free Cloudflare Worker |

## Voice Reference

### Kokoro Voices (Best Quality)
- **Female**: aoede, bella, heart, nova, sky
- **Male**: adam, echo, eric, michael, to

### Edge TTS Voices (Free, 300+)
- **English**: Ava, Andrew, Brian, Emma, Jenny, Guy, Aria, Davis, Sonia, Ryan, Tony, Michelle, Jason, Sara
- **Japanese**: Nanami, Keita, Mayu
- **Chinese**: Xiaoxiao, Yunxi, Xiaohan
- **Korean**: SunHi, InJoon, HyeJin
- **French**: Denise, Henri
- **Spanish**: Elvira, Alvaro, Dalia
- **German**: Katja, Conrad
- **Arabic**: Zariyah, Hamed
- **Hindi**: Swara, Madhur
- **And 60+ more languages**

## DSP Pipeline

```
Raw Audio → Trim Silence → DC Removal → Noise Gate → 3-Band EQ →
De-esser → Compressor → Loudness Norm (EBU R128) → True Peak Limiter →
Clip Protection → WAV/MP3 Output
```

## Audio Quality Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| SNR | Signal-to-Noise Ratio | >30 dB |
| SI-SDR | Scale-Invariant Signal-to-Distortion | >15 dB |
| THD | Total Harmonic Distortion | <1% |
| MOS | Mean Opinion Score (predicted) | >4.0 |
| Dynamic Range | Peak-to-RMS ratio | 8-18 dB |
| Clipping | Peak sample detection | 0% |

## Configuration

Environment variables:
- `TTS_PORT` — Server port (default: 5050)
- `TTS_API_KEY` — Optional API key
- `TTS_DEVICE` — `cuda` or `cpu` (default: auto-detect)
- `TTS_TARGET_LUFS` — Target loudness (default: -16.0)
- `TTS_SAMPLE_RATE` — Output sample rate (default: 24000)

## Resources

See [DEPENDENCIES.md](DEPENDENCIES.md) for complete list of all dependencies, licenses, and sources.

## License

MIT
