"""
iknbite TTS Engine — OpenAI-Compatible HTTP Server
Drop-in replacement for OpenAI TTS API.
"""

import os
import sys
import functools
import time
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from config import EngineConfig
from engine import TTSEngine

app = Flask(__name__)
CORS(app)

engine: TTSEngine = None


def require_api_key(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if engine.config.server.api_key:
            auth = request.headers.get('Authorization', '')
            token = auth.replace('Bearer ', '').strip()
            if token != engine.config.server.api_key:
                return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'engine': 'iknbite-tts', 'status': 'ok', 'version': '1.0'})


@app.route('/v1/audio/speech', methods=['POST'])
@app.route('/audio/speech', methods=['POST'])
@require_api_key
def text_to_speech():
    try:
        data = request.json
        if not data or 'input' not in data:
            return jsonify({'error': "Missing 'input' in request body"}), 400

        text = data['input']
        voice = data.get('voice', 'af_aoede')
        speed = float(data.get('speed', 1.0))
        response_format = data.get('response_format', 'mp3')

        audio_bytes, mime = engine.synthesize(text, voice, speed, response_format)

        return Response(
            audio_bytes,
            mimetype=mime,
            headers={
                'Content-Disposition': f'attachment; filename="speech.{response_format}"',
                'Content-Length': str(len(audio_bytes)),
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/voices', methods=['GET'])
@app.route('/voices', methods=['GET'])
def list_voices():
    voices = engine.list_voices()
    return jsonify({'voices': voices})


@app.route('/v1/models', methods=['GET'])
@app.route('/models', methods=['GET'])
def list_models():
    return jsonify({'models': [{'id': 'tts-1'}, {'id': 'tts-1-hd'}]})


@app.route('/status', methods=['GET'])
def status():
    return jsonify(engine.get_status())


@app.route('/dsp/info', methods=['GET'])
def dsp_info():
    return jsonify(engine.dsp.get_pipeline_info())


def main():
    global engine

    config = EngineConfig.from_env()
    engine = TTSEngine(config)

    if not engine.start():
        print("Failed to start TTS engine")
        sys.exit(1)

    host = config.server.host
    port = config.server.port
    print(f"\nServer: http://{host}:{port}")
    print(f"Endpoint: POST http://{host}:{port}/v1/audio/speech")
    print(f"Voices: GET http://{host}:{port}/v1/voices")
    print(f"Status: GET http://{host}:{port}/status")

    try:
        from gevent.pywsgi import WSGIServer
        http_server = WSGIServer((host, port), app)
        http_server.serve_forever()
    except ImportError:
        app.run(host=host, port=port, debug=False)


if __name__ == '__main__':
    main()
