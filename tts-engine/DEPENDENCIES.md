# iknbite TTS Engine — Dependencies Report

## Overview

This document lists every external dependency, its version, license, download URL, and purpose within the iknbite TTS Engine.

**Generated:** 2026-07-27  
**Engine Version:** 1.0.0

---

## TTS Backends

| Package | Version | License | URL | Purpose |
|---------|---------|---------|-----|---------|
| kokoro | ≥0.1 | Apache-2.0 | https://github.com/hexgrad/kokoro | Primary TTS backend — 82M parameter neural model, excellent quality |
| piper-tts | ≥2.0 | MIT | https://github.com/rhasspy/piper | Lightweight ONNX-based TTS — 30+ languages, fast CPU inference |
| MeloTTS | ≥0.1 | MIT | https://github.com/myshell-ai/MeloTTS | Multi-lingual TTS — 10+ languages with male/female voices |
| chatterbox-tts | ≥0.1 | Custom | https://github.com/resemble-ai/chatterbox | Expressive TTS with voice cloning capability |

---

## Audio Processing Libraries

| Package | Version | License | URL | Purpose |
|---------|---------|---------|-----|---------|
| numpy | ≥1.24 | BSD-3 | https://numpy.org/ | Array operations, audio sample manipulation |
| scipy | ≥1.11 | BSD-3 | https://scipy.org/ | Signal processing (filters, FFT, compression) |
| soundfile | ≥0.12 | BSD-3 | https://pypi.org/project/SoundFile/ | WAV/FLAC/OGG reading and writing |
| pyloudnorm | ≥0.1.0 | MIT | https://github.com/csteinmetz1/pyloudnorm | EBU R128 loudness normalization |

---

## Web Framework

| Package | Version | License | URL | Purpose |
|---------|---------|---------|-----|---------|
| flask | ≥3.0 | BSD-3 | https://flask.palletsprojects.com/ | HTTP API server |
| flask-cors | ≥4.0 | MIT | https://github.com/corydolphin/flask-cors | Cross-origin resource sharing |
| gunicorn | ≥21.2 | MIT | https://gunicorn.org/ | Production WSGI server |

---

## Optional: GPU Acceleration

| Package | Version | License | URL | Purpose |
|---------|---------|---------|-----|---------|
| torch | ≥2.0 | BSD-3 | https://pytorch.org/ | Neural network inference (CUDA/MPS/CPU) |
| onnxruntime | ≥1.16 | MIT | https://onnxruntime.ai/ | ONNX model inference (Piper backend) |

---

## Cloud/Edge TTS (No local install required)

| Service | License | URL | Purpose |
|---------|---------|-----|---------|
| Edge TTS (Cloudflare Worker) | Free | https://github.com/DIYgod/cloudflare-edge-tts | 300+ Microsoft neural voices, free, no API key |
| Edge TTS (openai-edge-tts) | Free | https://github.com/travisvn/openai-edge-tts | Docker-based OpenAI-compatible Edge TTS |

---

## Voice Datasets (Optional — for fine-tuning)

| Dataset | License | URL | Size | Languages |
|---------|---------|-----|------|-----------|
| Mozilla Common Voice | CC-0 | https://commonvoice.mozilla.org/ | 30K+ hours | 100+ |
| Common Voice API | CC-0 | Integrated in TTS engine | On-demand | 28+ |
| LibriTTS | MIT | https://www.openslr.org/60/ | 585 hours | English |
| LibriTTS-R | MIT | https://www.openslr.org/141/ | 585 hours | English (cleaned) |
| LJSpeech | Public Domain | https://keithito.com/LJ-Speech-Dataset/ | 24 hours | English |
| VCTK | ODC-BY | https://datashare.ed.ac.uk/handle/10283/3443 | 44 hours | English |

---

## Audio Quality Evaluation

| Metric | Standard | Implementation | Purpose |
|--------|----------|---------------|---------|
| SNR | ITU-R BS.468 | Custom (scipy) | Signal-to-Noise Ratio |
| SI-SDR | — | Custom (numpy) | Scale-Invariant Signal-to-Distortion |
| THD | — | Custom | Total Harmonic Distortion |
| MOS Prediction | ITU-T P.800 | Heuristic | Mean Opinion Score estimation |
| Clipping Detection | — | Custom | Audio peak clipping |
| Silence Detection | — | Custom | Active vs silent duration |
| Spectral Analysis | — | FFT-based | Frequency content characterization |

---

## Development & Deployment

| Tool | License | URL | Purpose |
|------|---------|-----|---------|
| Docker | Apache-2.0 | https://docker.com/ | Containerized deployment |
| Docker Compose | Apache-2.0 | https://docs.docker.com/compose/ | Multi-container orchestration |
| Python 3.11+ | PSF | https://python.org/ | Runtime |
| GitHub Actions | — | https://github.com/features/actions | CI/CD |

---

## License Summary

| License | Count | Packages |
|---------|-------|----------|
| MIT | 8 | piper-tts, flask-cors, pyloudnorm, onnxruntime, MeloTTS, gunicorn, ... |
| BSD-3 | 5 | numpy, scipy, soundfile, flask, torch |
| Apache-2.0 | 2 | kokoro, Docker |
| Custom | 1 | chatterbox-tts |
| CC-0 / Public Domain | 2 | Common Voice, LJSpeech |
| ODC-BY | 1 | VCTK |

---

## How to Install All Backends

```bash
# Full installation (all backends)
pip install kokoro piper-tts
pip install git+https://github.com/myshell-ai/MeloTTS.git
pip install chatterbox-tts

# Or selective installation
pip install kokoro                    # Best quality, English-focused
pip install piper-tts                 # Lightweight, 30+ languages
pip install git+https://github.com/myshell-ai/MeloTTS.git  # Multi-lingual
pip install chatterbox-tts            # Voice cloning
```

## Docker (Recommended)

```bash
cd tts-engine
docker compose up -d
```

## Verification

```bash
# Check engine status
curl http://localhost:5050/status

# List available voices
curl http://localhost:5050/v1/voices

# Generate test audio
curl -X POST http://localhost:5050/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello world", "voice": "af_aoede"}' \
  --output test.wav

# Evaluate audio quality
curl -X POST http://localhost:5050/v1/audio/evaluate \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello world", "voice": "af_aoede"}'
```
