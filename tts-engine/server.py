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
from data.vctk import VCTKLoader
from training.model_selector import ModelSelector, AVAILABLE_MODELS, auto_select_model
from training.data_prep import DataPreparator
from training.trainer import TTSTrainer, TrainingConfig
from training.evaluator import VoiceEvaluator
from training.exporter import ModelExporter, ExportConfig

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

# ---- VCTK Corpus ----
vctk_loader = VCTKLoader(data_dir=os.path.join(os.path.dirname(__file__), 'data', 'vctk'))


@app.route('/v1/datasets/vctk/info', methods=['GET'])
def vctk_info():
    """Get VCTK dataset info."""
    return jsonify({
        'name': 'VCTK Corpus',
        'description': 'Multi-speaker English speech corpus with 110 speakers',
        'speakers': 110,
        'hours': 44,
        'license': 'ODC-BY',
        'url': 'https://datashare.ed.ac.uk/handle/10283/3443',
        'downloaded': vctk_loader.is_downloaded(),
    })


@app.route('/v1/datasets/vctk/download', methods=['POST'])
@require_api_key
def vctk_download():
    """Download VCTK corpus."""
    try:
        data = request.json or {}
        force = data.get('force', False)

        success = vctk_loader.download(force=force)
        if success:
            stats = vctk_loader.get_statistics()
            return jsonify({'status': 'downloaded', 'statistics': stats})
        else:
            return jsonify({'error': 'Failed to download VCTK'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/datasets/vctk/stats', methods=['GET'])
def vctk_stats():
    """Get VCTK statistics."""
    stats = vctk_loader.get_statistics()
    return jsonify(stats)


@app.route('/v1/datasets/vctk/speakers', methods=['GET'])
def vctk_speakers():
    """List all VCTK speakers."""
    speakers = vctk_loader.get_speakers()
    return jsonify({
        'speakers': [
            {
                'speaker_id': s.speaker_id,
                'gender': s.gender,
                'accent': s.accent,
            }
            for s in speakers
        ]
    })


@app.route('/v1/datasets/vctk/search', methods=['GET'])
def vctk_search():
    """Search VCTK samples by text."""
    query = request.args.get('q', '')
    max_results = int(request.args.get('limit', 10))

    if not query:
        return jsonify({'error': 'Missing query parameter q'}), 400

    samples = vctk_loader.search_samples(query, max_results)
    return jsonify({
        'query': query,
        'results': [
            {
                'audio_path': s.audio_path,
                'text': s.text,
                'speaker_id': s.speaker_id,
                'gender': s.gender,
                'accent': s.accent,
                'duration_seconds': s.duration_seconds,
            }
            for s in samples
        ]
    })

# ---- Voice Training Pipeline ----
@app.route('/v1/training/models', methods=['GET'])
def training_models():
    """List available TTS models for training."""
    selector = ModelSelector()
    return jsonify({
        'models': [
            {
                'name': name,
                'model_name': profile.name,
                'source': profile.source,
                'license': profile.license,
                'quality_rating': profile.quality_rating,
                'languages': profile.languages,
                'voice_clone': profile.voice_clone,
                'pros': profile.pros,
                'cons': profile.cons,
            }
            for name, profile in AVAILABLE_MODELS.items()
        ],
        'hardware': selector.get_hardware_info(),
    })


@app.route('/v1/training/select', methods=['POST'])
@require_api_key
def training_select():
    """Auto-select best model for training."""
    try:
        data = request.json
        language = data.get('language', 'en')
        dataset_hours = data.get('dataset_hours', 10.0)
        voice_clone = data.get('voice_clone', False)

        result = auto_select_model(language, dataset_hours)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/training/compare', methods=['GET'])
def training_compare():
    """Compare all suitable models."""
    language = request.args.get('language', 'en')
    dataset_hours = float(request.args.get('dataset_hours', 10.0))

    selector = ModelSelector()
    models = selector.compare_models(language, dataset_hours)
    return jsonify({'models': models})


@app.route('/v1/training/prepare', methods=['POST'])
@require_api_key
def training_prepare():
    """Prepare datasets for training."""
    try:
        data = request.json
        datasets = data.get('datasets', [('en', 'train-clean-100')])
        speaker_id = data.get('speaker_id')
        output_dir = data.get('output_dir', './data/training')

        prep = DataPreparator(output_dir=output_dir)
        stats = prep.prepare(datasets, speaker_id=speaker_id)
        return jsonify({'status': 'prepared', 'statistics': stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/training/start', methods=['POST'])
@require_api_key
def training_start():
    """Start voice training."""
    try:
        data = request.json
        config = TrainingConfig(
            model_name=data.get('model_name', 'kokoro'),
            voice_id=data.get('voice_id', 'custom_voice'),
            language=data.get('language', 'en'),
            epochs=data.get('epochs', 100),
            batch_size=data.get('batch_size', 16),
            learning_rate=data.get('learning_rate', 0.001),
        )

        trainer = TTSTrainer(config)
        report = trainer.train(resume=data.get('resume', True))
        return jsonify({'status': 'complete', 'report': report})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/training/evaluate/<voice_id>', methods=['GET'])
def training_evaluate(voice_id):
    """Evaluate a trained voice."""
    try:
        language = request.args.get('language', 'en')
        evaluator = VoiceEvaluator()

        model_path = f'./data/models/{voice_id}'
        result = evaluator.evaluate(model_path, language)
        return jsonify({
            'voice_id': voice_id,
            'metrics': {
                'naturalness': result.naturalness,
                'pronunciation_accuracy': result.pronunciation_accuracy,
                'intelligibility': result.intelligibility,
                'stability': result.stability,
                'speaker_consistency': result.speaker_consistency,
                'inference_speed': result.inference_speed,
                'memory_usage_mb': result.memory_usage_mb,
                'overall_score': result.overall_score,
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/v1/training/export', methods=['POST'])
@require_api_key
def training_export():
    """Export trained model for deployment."""
    try:
        data = request.json
        config = ExportConfig(
            model_path=data.get('model_path', './data/models/custom_voice'),
            voice_id=data.get('voice_id', 'custom_voice'),
            language=data.get('language', 'en'),
            format=data.get('format', 'onnx'),
        )

        exporter = ModelExporter()
        result = exporter.export(config)
        return jsonify({'status': 'exported', 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
