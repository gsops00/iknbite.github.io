#!/bin/bash
# iknbite TTS Engine — Quick Setup
set -e

echo "======================================"
echo "  iknbite TTS Engine Setup"
echo "======================================"

# Check Python
if ! command -v python3 &>/dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.10+"
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Python: $PYTHON_VERSION"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install core deps
echo "Installing core dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

# Install TTS backends (try each)
echo ""
echo "Installing TTS backends..."

echo -n "  Kokoro TTS... "
pip install kokoro -q 2>/dev/null && echo "✅" || echo "❌ (optional)"

echo -n "  Piper TTS... "
pip install piper-tts -q 2>/dev/null && echo "✅" || echo "❌ (optional)"

echo ""
echo "======================================"
echo "  Setup complete!"
echo ""
echo "  Start server:"
echo "    source venv/bin/activate"
echo "    python server.py"
echo ""
echo "  Or with Docker:"
echo "    docker compose up"
echo ""
echo "  Test:"
echo "    curl -X POST http://localhost:5050/v1/audio/speech \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"input\":\"Hello world\",\"voice\":\"af_aoede\"}' \\"
echo "      --output test.wav"
echo "======================================"
