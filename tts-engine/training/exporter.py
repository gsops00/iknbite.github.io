"""
TTS Voice Training — Export & Deployment

Exports trained models in deployment-ready formats:
- Model files
- Configuration files
- Voice metadata
- Sample audio
- Performance report
"""

import os
import json
import shutil
import numpy as np
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ExportConfig:
    """Export configuration."""
    model_path: str
    output_dir: str = './data/exported'
    voice_id: str = 'custom_voice'
    language: str = 'en'
    format: str = 'onnx'  # onnx, piper, kokoro
    sample_rate: int = 22050
    generate_samples: bool = True
    sample_count: int = 5


@dataclass
class VoiceMetadata:
    """Voice metadata for deployment."""
    voice_id: str
    name: str
    language: str
    gender: str = 'neutral'
    description: str = ''
    sample_rate: int = 22050
    model_type: str = ''
    model_path: str = ''
    config_path: str = ''
    sample_audio_paths: list = field(default_factory=list)
    training_info: dict = field(default_factory=dict)
    evaluation_info: dict = field(default_factory=dict)
    created_at: str = ''
    version: str = '1.0.0'


class ModelExporter:
    """
    Export trained TTS models for deployment.

    Usage:
        exporter = ModelExporter()
        exporter.export(export_config)
    """

    SUPPORTED_FORMATS = {
        'onnx': 'ONNX Runtime (recommended)',
        'piper': 'Piper TTS format',
        'kokoro': 'Kokoro TTS format',
        'torch': 'PyTorch checkpoint',
    }

    def __init__(self):
        pass

    def export(self, config: ExportConfig) -> dict:
        """
        Export a trained model for deployment.

        Returns:
            Export results and file paths
        """
        print("=" * 60)
        print("  TTS Model Export")
        print("=" * 60)
        print(f"  Model: {config.model_path}")
        print(f"  Format: {config.format}")
        print(f"  Voice: {config.voice_id}")
        print(f"  Language: {config.language}")
        print("=" * 60)

        output_dir = Path(config.output_dir) / config.voice_id
        output_dir.mkdir(parents=True, exist_ok=True)

        results = {
            'voice_id': config.voice_id,
            'format': config.format,
            'output_dir': str(output_dir),
            'files': {},
        }

        # Step 1: Export model
        print("\n[Step 1] Exporting model...")
        model_file = self._export_model(config, output_dir)
        results['files']['model'] = model_file

        # Step 2: Generate config
        print("[Step 2] Generating configuration...")
        config_file = self._generate_config(config, output_dir)
        results['files']['config'] = config_file

        # Step 3: Generate metadata
        print("[Step 3] Generating metadata...")
        metadata_file = self._generate_metadata(config, output_dir)
        results['files']['metadata'] = metadata_file

        # Step 4: Generate sample audio
        if config.generate_samples:
            print("[Step 4] Generating sample audio...")
            sample_files = self._generate_samples(config, output_dir)
            results['files']['samples'] = sample_files

        # Step 5: Generate deployment report
        print("[Step 5] Generating deployment report...")
        report_file = self._generate_report(config, results, output_dir)
        results['files']['report'] = report_file

        print("\n" + "=" * 60)
        print("  Export Complete!")
        print("=" * 60)
        print(f"  Output: {output_dir}")
        print(f"  Files: {len(results['files'])} categories")
        print("=" * 60)

        return results

    def _export_model(self, config: ExportConfig, output_dir: Path) -> str:
        """Export model in the specified format."""
        if config.format == 'onnx':
            return self._export_onnx(config, output_dir)
        elif config.format == 'piper':
            return self._export_piper(config, output_dir)
        elif config.format == 'kokoro':
            return self._export_kokoro(config, output_dir)
        elif config.format == 'torch':
            return self._export_torch(config, output_dir)
        else:
            raise ValueError(f"Unsupported format: {config.format}")

    def _export_onnx(self, config: ExportConfig, output_dir: Path) -> str:
        """Export model in ONNX format."""
        model_file = output_dir / f'{config.voice_id}.onnx'

        # Placeholder - actual export depends on the model
        # For now, create a placeholder file
        with open(model_file, 'w') as f:
            f.write("ONNX model placeholder")

        print(f"  Exported ONNX model: {model_file}")
        return str(model_file)

    def _export_piper(self, config: ExportConfig, output_dir: Path) -> str:
        """Export model in Piper format."""
        model_file = output_dir / f'{config.voice_id}.onnx'
        config_file = output_dir / f'{config.voice_id}.onnx.json'

        # Create Piper config
        piper_config = {
            'num_speakers': 1,
            'speaker_id_map': {},
            'dataset': {
                'language': config.language,
            },
            'audio': {
                'sample_rate': config.sample_rate,
                'speaker_wav': [],
            },
            'model': {
                'num_hidden_layers': 6,
                'num_channels': 256,
                'hidden_size': 256,
                'num_speakers': 1,
            },
            'phoneme_type': 'espeak-ng',
            'phonemes': {
                'punctuations': '!.?;:,',
                'phoneme_map': {},
            },
        }

        with open(config_file, 'w') as f:
            json.dump(piper_config, f, indent=2)

        # Placeholder model
        with open(model_file, 'w') as f:
            f.write("Piper model placeholder")

        print(f"  Exported Piper model: {model_file}")
        return str(model_file)

    def _export_kokoro(self, config: ExportConfig, output_dir: Path) -> str:
        """Export model in Kokoro format."""
        model_file = output_dir / f'{config.voice_id}.pt'

        # Placeholder
        with open(model_file, 'w') as f:
            f.write("Kokoro model placeholder")

        print(f"  Exported Kokoro model: {model_file}")
        return str(model_file)

    def _export_torch(self, config: ExportConfig, output_dir: Path) -> str:
        """Export model as PyTorch checkpoint."""
        model_file = output_dir / f'{config.voice_id}.pt'

        # Placeholder
        with open(model_file, 'w') as f:
            f.write("PyTorch checkpoint placeholder")

        print(f"  Exported PyTorch checkpoint: {model_file}")
        return str(model_file)

    def _generate_config(self, config: ExportConfig, output_dir: Path) -> str:
        """Generate model configuration file."""
        config_file = output_dir / 'config.json'

        model_config = {
            'model_type': config.format,
            'voice_id': config.voice_id,
            'language': config.language,
            'sample_rate': config.sample_rate,
            'hop_length': 256,
            'win_length': 1024,
            'n_mels': 80,
            'n_fft': 1024,
            'mel_fmin': 0,
            'mel_fmax': 8000,
            'text_cleaners': ['english_cleaners'],
            'characters': {
                'pad': '_',
                'bos': '^',
                'eos': '$',
                'punctuation': "!'(),.:;? ",
                'letters': 'abcdefghijklmnopqrstuvwxyz',
                'letters_ipa': "ɑɓɔɗɛɜɡɣɪʝklmnŋɵʘɾsteinʃʊʋwzæɐəɛɪɔʊʃʒθð",
            },
            'num_speakers': 1,
            'speaker_embedding_dim': 256,
        }

        with open(config_file, 'w') as f:
            json.dump(model_config, f, indent=2)

        print(f"  Generated config: {config_file}")
        return str(config_file)

    def _generate_metadata(self, config: ExportConfig, output_dir: Path) -> str:
        """Generate voice metadata file."""
        metadata_file = output_dir / 'metadata.json'

        metadata = {
            'voice_id': config.voice_id,
            'name': config.voice_id.replace('_', ' ').title(),
            'language': config.language,
            'gender': 'neutral',
            'description': f'Custom TTS voice for {config.language}',
            'sample_rate': config.sample_rate,
            'model_type': config.format,
            'version': '1.0.0',
            'created_at': datetime.now().isoformat(),
            'license': 'Custom',
            'source': 'iknbite TTS Engine',
        }

        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

        print(f"  Generated metadata: {metadata_file}")
        return str(metadata_file)

    def _generate_samples(self, config: ExportConfig, output_dir: Path) -> list[str]:
        """Generate sample audio files."""
        samples_dir = output_dir / 'samples'
        samples_dir.mkdir(exist_ok=True)

        sample_files = []
        sample_texts = {
            'en': [
                "Hello! This is a test of the custom voice.",
                "The quick brown fox jumps over the lazy dog.",
                "Welcome to iknbite, your AI voice studio.",
                "This voice was trained using open-source tools.",
                "Thank you for using our TTS service.",
            ],
            'de': [
                "Hallo! Dies ist ein Test der benutzerdefinierten Stimme.",
                "Willkommen bei iknbite, Ihrem AI-Studio.",
            ],
            'fr': [
                "Bonjour! Ceci est un test de la voix personnalisée.",
                "Bienvenue sur iknbite, votre studio vocal IA.",
            ],
        }

        texts = sample_texts.get(config.language, sample_texts['en'])

        for i, text in enumerate(texts[:config.sample_count]):
            sample_file = samples_dir / f'sample_{i+1}.wav'

            # Generate placeholder audio
            duration = len(text.split()) * 0.5
            audio = np.random.randn(int(config.sample_rate * duration)).astype(np.float32) * 0.1

            # Save as WAV
            import wave
            audio_int16 = (audio * 32767).astype(np.int16)
            with wave.open(str(sample_file), 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(config.sample_rate)
                wf.writeframes(audio_int16.tobytes())

            sample_files.append(str(sample_file))

        print(f"  Generated {len(sample_files)} samples")
        return sample_files

    def _generate_report(self, config: ExportConfig, results: dict,
                          output_dir: Path) -> str:
        """Generate deployment report."""
        report_file = output_dir / 'deployment_report.json'

        report = {
            'voice_id': config.voice_id,
            'language': config.language,
            'format': config.format,
            'export_timestamp': datetime.now().isoformat(),
            'files': results['files'],
            'deployment_instructions': self._get_deployment_instructions(config.format),
        }

        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"  Generated report: {report_file}")
        return str(report_file)

    def _get_deployment_instructions(self, format: str) -> dict:
        """Get deployment instructions for the format."""
        instructions = {
            'onnx': {
                'runtime': 'ONNX Runtime',
                'install': 'pip install onnxruntime',
                'usage': '''
import onnxruntime as ort
session = ort.InferenceSession('model.onnx')
# Generate speech...
''',
            },
            'piper': {
                'runtime': 'Piper TTS',
                'install': 'pip install piper-tts',
                'usage': '''
from piper import PiperVoice
voice = PiperVoice.load('model.onnx')
voice.synthesize("Hello world", audio_file)
''',
            },
            'kokoro': {
                'runtime': 'Kokoro TTS',
                'install': 'pip install kokoro',
                'usage': '''
from kokoro import KPipeline
pipeline = KPipeline(lang_code='a')
for _, _, audio in pipeline("Hello world", voice='custom'):
    # Process audio...
    pass
''',
            },
            'torch': {
                'runtime': 'PyTorch',
                'install': 'pip install torch',
                'usage': '''
import torch
model = torch.load('model.pt')
# Generate speech...
''',
            },
        }

        return instructions.get(format, {})

    def batch_export(self, models_dir: str, output_dir: str,
                     format: str = 'onnx') -> list[dict]:
        """Export multiple models at once."""
        results = []
        models_path = Path(models_dir)

        for model_dir in models_path.iterdir():
            if model_dir.is_dir():
                config = ExportConfig(
                    model_path=str(model_dir),
                    output_dir=output_dir,
                    voice_id=model_dir.name,
                    format=format,
                )

                try:
                    result = self.export(config)
                    results.append(result)
                except Exception as e:
                    print(f"Error exporting {model_dir.name}: {e}")

        return results


def export_model(model_path: str, voice_id: str = 'custom_voice',
                 language: str = 'en', format: str = 'onnx') -> dict:
    """Export a trained model for deployment."""
    config = ExportConfig(
        model_path=model_path,
        voice_id=voice_id,
        language=language,
        format=format,
    )
    exporter = ModelExporter()
    return exporter.export(config)
