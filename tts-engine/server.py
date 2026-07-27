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
from dsp.evaluation import AudioEvaluator
from data.common_voice import CommonVoiceLoader
from data.libritts import LibriTTSLoader

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


@app.route('/v1/audio/evaluate', methods=['POST'])
@require_api_key
def evaluate_audio():
    """Evaluate audio quality of generated speech."""
    try:
        data = request.json
        if not data or 'input' not in data:
            return jsonify({'error': "Missing 'input' in request body"}), 400

        text = data['input']
        voice = data.get('voice', 'af_aoede')
        speed = float(data.get('speed', 1.0))

        # Generate audio
        audio_bytes, mime = engine.synthesize(text, voice, speed, 'wav')

        # Load audio for evaluation
        import io
        from scipy.io import wavfile
        audio_data = io.BytesIO(audio_bytes)
        sr, audio_np = wavfile.read(audio_data)
        if audio_np.ndim > 1:
            audio_np = audio_np.mean(axis=1)
        audio_float = audio_np.astype(np.float64) / 32768.0

        # Evaluate
        evaluator = AudioEvaluator(sample_rate=sr)
        report = evaluator.evaluate(audio_float)

        return jsonify({
            'text': text,
            'voice': voice,
            'evaluation': report.to_dict()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---- Common Voice Dataset ----
cv_loader = CommonVoiceLoader(data_dir=os.path.join(os.path.dirname(__file__), 'data', 'common_voice'))


@app.route('/v1/datasets/common-voice/languages', methods=['GET'])
def cv_languages():
    """List available Common Voice languages."""
    return jsonify({'languages': cv_loader.list_languages()})


@app.route('/v1/datasets/common-voice/download', methods=['POST'])
@require_api_key
def cv_download():
    """Download Common Voice dataset for a language."""
    try:
        data = request.json
        language = data.get('language', 'en')
        version = data.get('version', '15.0')
        force = data.get('force', False)

        success = cv_loader.download(language, version=version, force=force)
        if success:
            stats = cv_loader.get_statistics(language)
            return jsonify({'status': 'downloaded', 'language': language, 'statistics': stats})
        else:
            return jsonify({'error': f'Failed to download {language}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/datasets/common-voice/stats/<language>', methods=['GET'])
def cv_stats(language):
    """Get statistics for a Common Voice language."""
    stats = cv_loader.get_statistics(language)
    return jsonify(stats)


@app.route('/v1/datasets/common-voice/search', methods=['GET'])
def cv_search():
    """Search Common Voice samples by text."""
    language = request.args.get('language', 'en')
    query = request.args.get('q', '')
    max_results = int(request.args.get('limit', 10))

    if not query:
        return jsonify({'error': 'Missing query parameter q'}), 400

    samples = cv_loader.search_samples(language, query, max_results)
    return jsonify({
        'language': language,
        'query': query,
        'results': [
            {
                'audio_path': s.audio_path,
                'text': s.text,
                'speaker_id': s.speaker_id,
                'duration_seconds': s.duration_seconds,
            }
            for s in samples
        ]
    })

# ---- LibriTTS Dataset ----
ltts_loader = LibriTTSLoader(data_dir=os.path.join(os.path.dirname(__file__), 'data', 'libritts'))


@app.route('/v1/datasets/libritts/subsets', methods=['GET'])
def ltts_subsets():
    """List available LibriTTS subsets."""
    return jsonify({'subsets': ltts_loader.list_subsets()})


@app.route('/v1/datasets/libritts/download', methods=['POST'])
@require_api_key
def ltts_download():
    """Download a LibriTTS subset."""
    try:
        data = request.json
        subset = data.get('subset', 'train-clean-100')
        force = data.get('force', False)

        success = ltts_loader.download(subset, force=force)
        if success:
            stats = ltts_loader.get_statistics(subset)
            return jsonify({'status': 'downloaded', 'subset': subset, 'statistics': stats})
        else:
            return jsonify({'error': f'Failed to download {subset}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/datasets/libritts/stats/<subset>', methods=['GET'])
def ltts_stats(subset):
    """Get statistics for a LibriTTS subset."""
    stats = ltts_loader.get_statistics(subset)
    return jsonify(stats)


@app.route('/v1/datasets/libritts/speakers/<subset>', methods=['GET'])
def ltts_speakers(subset):
    """Get all speakers in a LibriTTS subset."""
    speakers = ltts_loader.get_speakers(subset)
    return jsonify({
        'subset': subset,
        'speakers': [
            {
                'speaker_id': s.speaker_id,
                'name': s.name,
                'gender': s.gender,
                'subset': s.subset,
            }
            for s in speakers
        ]
    })


@app.route('/v1/datasets/libritts/search', methods=['GET'])
def ltts_search():
    """Search LibriTTS samples by text."""
    subset = request.args.get('subset', 'train-clean-100')
    query = request.args.get('q', '')
    max_results = int(request.args.get('limit', 10))

    if not query:
        return jsonify({'error': 'Missing query parameter q'}), 400

    samples = ltts_loader.search_samples(subset, query, max_results)
    return jsonify({
        'subset': subset,
        'query': query,
        'results': [
            {
                'audio_path': s.audio_path,
                'text': s.normalized_text,
                'speaker_id': s.speaker_id,
                'gender': s.gender,
                'duration_seconds': s.duration_seconds,
            }
            for s in samples
        ]
    })

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
