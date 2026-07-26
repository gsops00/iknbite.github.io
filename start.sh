#!/bin/bash
# iknbite local dev server
cd "$(dirname "$0")"

PORT=${1:-8080}

echo "🎙️  iknbite — AI Voice Studio"
echo "=============================="
echo ""
echo "Starting local server on port $PORT ..."
echo "Open: http://localhost:$PORT"
echo "Press Ctrl+C to stop"
echo ""

python3 -m http.server "$PORT"
