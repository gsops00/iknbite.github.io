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

## Common Voice Integration

iknbite includes built-in support for Mozilla Common Voice datasets.

### API Endpoints

```bash
# List available languages
curl http://localhost:5050/v1/datasets/common-voice/languages

# Download a language dataset
curl -X POST http://localhost:5050/v1/datasets/common-voice/download \
  -H "Content-Type: application/json" \
  -d '{"language": "en", "version": "15.0"}'

# Get dataset statistics
curl http://localhost:5050/v1/datasets/common-voice/stats/en

# Search samples by text
curl "http://localhost:5050/v1/datasets/common-voice/search?language=en&q=hello+world"
```

### Supported Languages

| Code | Language | Est. Hours | Status |
|------|----------|------------|--------|
| en | English | 2,600 | ✅ |
| ar | Arabic | 400 | ✅ |
| zh | Chinese | 900 | ✅ |
| fr | French | 300 | ✅ |
| de | German | 300 | ✅ |
| es | Spanish | 300 | ✅ |
| ja | Japanese | 100 | ✅ |
| ko | Korean | 100 | ✅ |
| pt | Portuguese | 300 | ✅ |
| ru | Russian | 200 | ✅ |
| hi | Hindi | 200 | ✅ |
| + 17 more languages | | | ✅ |

### Usage in Python

```python
from data.common_voice import CommonVoiceLoader

loader = CommonVoiceLoader(data_dir='./data/common_voice')

# Download English dataset
loader.download('en')

# Load samples
for sample in loader.load('en', split='train', max_samples=100):
    print(f"{sample.text} ({sample.duration_seconds:.1f}s)")

# Search for specific text
results = loader.search_samples('en', 'hello world')

# Get speaker samples
speaker_samples = loader.get_speaker_samples('en', 'speaker_id_here')
```

## LibriTTS Integration

iknbite includes built-in support for LibriTTS datasets (English only).

### About LibriTTS

- **585 hours** of high-quality English speech
- **2,456 speakers** (balanced male/female)
- **24kHz** audio with aligned transcriptions
- **LibriTTS-R** (cleaned version) with improved audio quality
- **License:** CC-BY-4.0

### Available Subsets

| Subset | Hours | Size | Speakers | Quality |
|--------|-------|------|----------|---------|
| train-clean-100 | 100h | 6.5GB | 251 | Clean |
| train-clean-360 | 360h | 23GB | 922 | Clean |
| train-other-500 | 500h | 32GB | 1,166 | Noisy |
| dev-clean | 5.4h | 0.34GB | 40 | Clean |
| dev-other | 5.4h | 0.34GB | 33 | Noisy |
| test-clean | 5.4h | 0.34GB | 40 | Clean |
| test-other | 5.4h | 0.34GB | 33 | Noisy |

### API Endpoints

```bash
# List available subsets
curl http://localhost:5050/v1/datasets/libritts/subsets

# Download a subset
curl -X POST http://localhost:5050/v1/datasets/libritts/download \
  -H "Content-Type: application/json" \
  -d '{"subset": "train-clean-100"}'

# Get statistics
curl http://localhost:5050/v1/datasets/libritts/stats/train-clean-100

# List speakers
curl http://localhost:5050/v1/datasets/libritts/speakers/train-clean-100

# Search samples
curl "http://localhost:5050/v1/datasets/libritts/search?subset=train-clean-100&q=hello+world"
```

### Usage in Python

```python
from data.libritts import LibriTTSLoader

loader = LibriTTSLoader(data_dir='./data/libritts')

# Download clean 100h subset
loader.download('train-clean-100')

# Load samples with duration filter
for sample in loader.load('train-clean-100', min_duration=2.0, max_duration=10.0):
    print(f"[{sample.gender}] {sample.normalized_text[:50]}... ({sample.duration_seconds:.1f}s)")

# Get specific speaker's samples
speaker_samples = loader.get_speaker_samples('train-clean-100', '19')

# Search for text
results = loader.search_samples('train-clean-100', 'once upon a time')
```

## VCTK Corpus Integration

iknbite includes built-in support for the VCTK Corpus (English only).

### About VCTK

- **110 speakers** (56 female, 54 male)
- **~44 hours** of speech
- Various English accents
- High-quality 48kHz audio
- **License:** ODC-BY

### API Endpoints

```bash
# Get dataset info
curl http://localhost:5050/v1/datasets/vctk/info

# Download corpus
curl -X POST http://localhost:5050/v1/datasets/vctk/download \
  -H "Content-Type: application/json"

# Get statistics
curl http://localhost:5050/v1/datasets/vctk/stats

# List speakers
curl http://localhost:5050/v1/datasets/vctk/speakers

# Search samples
curl "http://localhost:5050/v1/datasets/vctk/search?q=hello+world"
```

### Usage in Python

```python
from data.vctk import VCTKLoader

loader = VCTKLoader(data_dir='./data/vctk')
loader.download()

# Load samples with filters
for sample in loader.load(min_duration=2.0, max_duration=10.0, gender_filter='F'):
    print(f"[{sample.accent}] {sample.text[:50]}... ({sample.duration_seconds:.1f}s)")
```

## Resources

See [DEPENDENCIES.md](DEPENDENCIES.md) for complete list of all dependencies, licenses, and sources.

## License

MIT
