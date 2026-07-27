FROM python:3.12-slim

# Install system deps for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install TTS backends (optional — each adds ~200MB-1GB)
RUN pip install --no-cache-dir kokoro || echo "Kokoro install failed"
RUN pip install --no-cache-dir piper-tts || echo "Piper install failed"
RUN pip install --no-cache-dir "git+https://github.com/myshell-ai/MeloTTS.git" || echo "MeloTTS install failed"

# Copy engine code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5050/health')" || exit 1

EXPOSE 5050

CMD ["python", "server.py"]
