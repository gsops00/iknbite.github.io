"""Lightweight Edge TTS API server + static file server for iknbite.
Run: python3 edge-tts-server.py
Provides free Microsoft Edge TTS with 400+ voices, no API key needed.
Also serves the index.html on the same port.
"""
import asyncio, io, json, os, uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

import edge_tts

PORT = int(os.environ.get("EDGE_TTS_PORT", 5050))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

POPULAR_VOICES = {
    "en": [
        {"id": "en-US-AvaNeural", "name": "Ava", "gender": "Female", "label": "Warm"},
        {"id": "en-US-AndrewNeural", "name": "Andrew", "gender": "Male", "label": "Deep"},
        {"id": "en-US-BrianNeural", "name": "Brian", "gender": "Male", "label": "Natural"},
        {"id": "en-US-EmmaNeural", "name": "Emma", "gender": "Female", "label": "Bright"},
        {"id": "en-US-JennyNeural", "name": "Jenny", "gender": "Female", "label": "Friendly"},
        {"id": "en-US-GuyNeural", "name": "Guy", "gender": "Male", "label": "Casual"},
        {"id": "en-US-AriaNeural", "name": "Aria", "gender": "Female", "label": "Expressive"},
        {"id": "en-US-DavisNeural", "name": "Davis", "gender": "Male", "label": "Strong"},
        {"id": "en-GB-SoniaNeural", "name": "Sonia", "gender": "Female", "label": "British"},
        {"id": "en-GB-RyanNeural", "name": "Ryan", "gender": "Male", "label": "British M"},
        {"id": "en-AU-NatashaNeural", "name": "Natasha", "gender": "Female", "label": "Australian"},
        {"id": "en-IN-NeerjaNeural", "name": "Neerja", "gender": "Female", "label": "Indian"},
    ],
    "fr": [
        {"id": "fr-FR-DeniseNeural", "name": "Denise", "gender": "Female", "label": "Français"},
        {"id": "fr-FR-HenriNeural", "name": "Henri", "gender": "Male", "label": "Français M"},
    ],
    "es": [
        {"id": "es-ES-ElviraNeural", "name": "Elvira", "gender": "Female", "label": "Español"},
        {"id": "es-ES-AlvaroNeural", "name": "Alvaro", "gender": "Male", "label": "Español M"},
    ],
    "de": [
        {"id": "de-DE-KatjaNeural", "name": "Katja", "gender": "Female", "label": "Deutsch"},
        {"id": "de-DE-ConradNeural", "name": "Conrad", "gender": "Male", "label": "Deutsch M"},
    ],
    "ja": [
        {"id": "ja-JP-NanamiNeural", "name": "Nanami", "gender": "Female", "label": "日本語"},
        {"id": "ja-JP-KeitaNeural", "name": "Keita", "gender": "Male", "label": "日本語 M"},
    ],
    "zh": [
        {"id": "zh-CN-XiaoxiaoNeural", "name": "Xiaoxiao", "gender": "Female", "label": "中文"},
        {"id": "zh-CN-YunxiNeural", "name": "Yunxi", "gender": "Male", "label": "中文 M"},
    ],
    "ko": [
        {"id": "ko-KR-SunHiNeural", "name": "SunHi", "gender": "Female", "label": "한국어"},
        {"id": "ko-KR-InJoonNeural", "name": "InJoon", "gender": "Male", "label": "한국어 M"},
    ],
    "hi": [
        {"id": "hi-IN-SwaraNeural", "name": "Swara", "gender": "Female", "label": "हिन्दी"},
        {"id": "hi-IN-MadhurNeural", "name": "Madhur", "gender": "Male", "label": "हिन्दी M"},
    ],
    "pt": [
        {"id": "pt-BR-FranciscaNeural", "name": "Francisca", "gender": "Female", "label": "Português"},
        {"id": "pt-BR-AntonioNeural", "name": "Antonio", "gender": "Male", "label": "Português M"},
    ],
    "it": [
        {"id": "it-IT-ElsaNeural", "name": "Elsa", "gender": "Female", "label": "Italiano"},
        {"id": "it-IT-DiegoNeural", "name": "Diego", "gender": "Male", "label": "Italiano M"},
    ],
    "ru": [
        {"id": "ru-RU-SvetlanaNeural", "name": "Svetlana", "gender": "Female", "label": "Русский"},
        {"id": "ru-RU-DmitryNeural", "name": "Dmitry", "gender": "Male", "label": "Русский M"},
    ],
    "ar": [
        {"id": "ar-SA-ZariyahNeural", "name": "Zariyah", "gender": "Female", "label": "العربية"},
        {"id": "ar-SA-HamedNeural", "name": "Hamed", "gender": "Male", "label": "العربية M"},
    ],
}

class TTSHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "engine": "edge-tts"}).encode())
        elif parsed.path == "/voices":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps(POPULAR_VOICES).encode())
        elif parsed.path == "/" or parsed.path == "/index.html":
            filepath = os.path.join(BASE_DIR, "index.html")
            if os.path.exists(filepath):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self._cors()
                self.end_headers()
                with open(filepath, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/tts":
            content_len = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_len))
            text = body.get("text", "")
            voice = body.get("voice", "en-US-AvaNeural")
            rate = body.get("rate", "+0%")
            volume = body.get("volume", "+0%")

            if not text:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error":"text is required"}')
                return

            loop = asyncio.new_event_loop()
            audio_data = loop.run_until_complete(self._generate(text, voice, rate, volume))
            loop.close()

            if audio_data:
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(len(audio_data)))
                self._cors()
                self.end_headers()
                self.wfile.write(audio_data)
            else:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self._cors()
                self.end_headers()
                self.wfile.write(b'{"error":"TTS generation failed"}')
        else:
            self.send_response(404)
            self.end_headers()

    async def _generate(self, text, voice, rate, volume):
        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume)
            buf = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buf.write(chunk["data"])
            return buf.getvalue()
        except Exception as e:
            print(f"TTS error: {e}")
            return None

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), TTSHandler)
    print(f"🗣️  iknbite server running on http://0.0.0.0:{PORT}")
    print(f"   Voices: {sum(len(v) for v in POPULAR_VOICES.values())} popular + 400+ total")
    print(f"   Serves index.html + TTS API")
    print(f"   Free, no API key needed!")
    server.serve_forever()
