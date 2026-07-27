"""
TTS Voice Training — Model Selection & Evaluation

Evaluates and selects the best TTS model based on:
- Speech quality
- Training speed
- Inference speed
- Hardware requirements
- Language support
- License compatibility
"""

import os
import time
import json
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
from dataclasses import dataclass, field, asdict


@dataclass
class ModelProfile:
    """Profile of a TTS model."""
    name: str
    source: str
    license: str
    quality_rating: float  # 0-10
    training_speed: float  # samples/sec
    inference_speed: float  # seconds/sec of audio
    memory_gb: float  # GPU memory required
    languages: list = field(default_factory=list)
    voice_clone: bool = False
    multilingual: bool = False
    min_dataset_hours: float = 1.0
    recommended_dataset_hours: float = 10.0
    pros: list = field(default_factory=list)
    cons: list = field(default_factory=list)


# Available models
AVAILABLE_MODELS = {
    'kokoro': ModelProfile(
        name='Kokoro TTS',
        source='https://github.com/hexgrad/kokoro',
        license='Apache-2.0',
        quality_rating=9.0,
        training_speed=50.0,
        inference_speed=0.1,
        memory_gb=2.0,
        languages=['en'],
        voice_clone=False,
        multilingual=False,
        min_dataset_hours=1.0,
        recommended_dataset_hours=10.0,
        pros=['Excellent quality', 'Fast inference', 'Small model size'],
        cons=['English only', 'Limited voices'],
    ),
    'piper': ModelProfile(
        name='Piper TTS',
        source='https://github.com/rhasspy/piper',
        license='MIT',
        quality_rating=7.5,
        training_speed=100.0,
        inference_speed=0.05,
        memory_gb=1.0,
        languages=['en', 'de', 'fr', 'es', 'it', 'nl', 'ru', 'uk', 'pl', 'cs', 'hu', 'ro', 'hr', 'da', 'fi', 'nb', 'sv', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'bn', 'el', 'lt', 'lv', 'pt', 'sk', 'sl', 'sq'],
        voice_clone=False,
        multilingual=True,
        min_dataset_hours=5.0,
        recommended_dataset_hours=50.0,
        pros=['Very fast', 'Low memory', 'ONNX format', 'Edge-optimized'],
        cons=['Lower quality than Kokoro', 'Requires more data'],
    ),
    'melotts': ModelProfile(
        name='MeloTTS',
        source='https://github.com/myshell-ai/MeloTTS',
        license='MIT',
        quality_rating=8.0,
        training_speed=80.0,
        inference_speed=0.15,
        memory_gb=4.0,
        languages=['en', 'zh', 'ja', 'ko', 'fr', 'es', 'de', 'pt', 'ar', 'ru', 'hi', 'it', 'tr', 'pl'],
        voice_clone=False,
        multilingual=True,
        min_dataset_hours=5.0,
        recommended_dataset_hours=20.0,
        pros=['Multi-lingual', 'Fast training', 'Good quality'],
        cons=['Moderate memory', 'Limited voices per language'],
    ),
    'chatterbox': ModelProfile(
        name='Chatterbox TTS',
        source='https://github.com/resemble-ai/chatterbox',
        license='Custom',
        quality_rating=8.5,
        training_speed=30.0,
        inference_speed=0.2,
        memory_gb=8.0,
        languages=['en'],
        voice_clone=True,
        multilingual=False,
        min_dataset_hours=0.5,
        recommended_dataset_hours=5.0,
        pros=['Voice cloning', 'Expressive', 'Emotion-aware'],
        cons=['English only', 'High memory', 'Custom license'],
    ),
    'coqui_xtts': ModelProfile(
        name='Coqui XTTS v2',
        source='https://github.com/coqui-ai/TTS',
        license='CPML-NC',
        quality_rating=8.0,
        training_speed=40.0,
        inference_speed=0.25,
        memory_gb=6.0,
        languages=['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh', 'ja', 'hu', 'ko'],
        voice_clone=True,
        multilingual=True,
        min_dataset_hours=6.0,
        recommended_dataset_hours=24.0,
        pros=['Voice cloning', 'Multi-lingual', 'Well-documented'],
        cons=['Slower inference', 'Complex setup'],
    ),
    'styletts2': ModelProfile(
        name='StyleTTS 2',
        source='https://github.com/yl4579/StyleTTS2',
        license='MIT',
        quality_rating=9.5,
        training_speed=20.0,
        inference_speed=0.15,
        memory_gb=8.0,
        languages=['en'],
        voice_clone=False,
        multilingual=False,
        min_dataset_hours=10.0,
        recommended_dataset_hours=100.0,
        pros=['State-of-the-art quality', 'Natural prosody'],
        cons=['English only', 'Requires lots of data', 'Slow training'],
    ),
}


@dataclass
class HardwareInfo:
    """Detected hardware information."""
    has_gpu: bool = False
    gpu_name: str = 'None'
    gpu_memory_gb: float = 0.0
    cpu_cores: int = 0
    ram_gb: float = 0.0
    platform: str = 'unknown'


class ModelSelector:
    """
    Automatically selects the best TTS model based on requirements.

    Usage:
        selector = ModelSelector()
        best = selector.select(
            language='en',
            dataset_hours=100,
            has_gpu=True,
            voice_clone_required=False,
        )
    """

    def __init__(self):
        self.hardware = self._detect_hardware()

    def _detect_hardware(self) -> HardwareInfo:
        """Detect available hardware."""
        info = HardwareInfo()

        # CPU
        import multiprocessing
        info.cpu_cores = multiprocessing.cpu_count()

        # RAM
        try:
            import psutil
            info.ram_gb = psutil.virtual_memory().total / (1024 ** 3)
        except ImportError:
            info.ram_gb = 16.0  # Default estimate

        # GPU
        try:
            import torch
            if torch.cuda.is_available():
                info.has_gpu = True
                info.gpu_name = torch.cuda.get_device_name(0)
                info.gpu_memory_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        except ImportError:
            pass

        # Platform
        import platform
        info.platform = platform.system()

        return info

    def select(self, language: str = 'en',
               dataset_hours: float = 10.0,
               voice_clone_required: bool = False,
               quality_priority: bool = True,
               speed_priority: bool = False) -> Tuple[str, ModelProfile, str]:
        """
        Select the best model for the given requirements.

        Returns:
            (model_name, model_profile, justification)
        """
        candidates = []

        for name, profile in AVAILABLE_MODELS.items():
            score = self._score_model(profile, language, dataset_hours,
                                       voice_clone_required, quality_priority,
                                       speed_priority)
            if score > 0:
                candidates.append((name, profile, score))

        if not candidates:
            # Fallback to default
            return 'kokoro', AVAILABLE_MODELS['kokoro'], 'Default model (no suitable candidate found)'

        # Sort by score
        candidates.sort(key=lambda x: x[2], reverse=True)
        best_name, best_profile, best_score = candidates[0]

        # Generate justification
        justification = self._generate_justification(
            best_name, best_profile, language, dataset_hours,
            voice_clone_required, quality_priority, speed_priority,
            self.hardware
        )

        return best_name, best_profile, justification

    def _score_model(self, profile: ModelProfile, language: str,
                     dataset_hours: float, voice_clone_required: bool,
                     quality_priority: bool, speed_priority: bool) -> float:
        """Score a model based on requirements."""
        score = 0.0

        # Language support
        if language not in profile.languages:
            return 0.0

        # Voice clone requirement
        if voice_clone_required and not profile.voice_clone:
            return 0.0

        # Dataset size compatibility
        if dataset_hours < profile.min_dataset_hours:
            return 0.0

        # Hardware compatibility
        if self.hardware.has_gpu:
            if profile.memory_gb > self.hardware.gpu_memory_gb * 0.8:
                return 0.0
        else:
            if profile.memory_gb > 4.0:
                score -= 20  # Penalize GPU-heavy models on CPU

        # Quality score
        quality_weight = 2.0 if quality_priority else 1.0
        score += profile.quality_rating * quality_weight

        # Speed score
        speed_weight = 2.0 if speed_priority else 1.0
        score += (1.0 / max(profile.inference_speed, 0.01)) * speed_weight

        # Dataset size bonus (larger datasets = better quality potential)
        if dataset_hours >= profile.recommended_dataset_hours:
            score += 2.0
        elif dataset_hours >= profile.min_dataset_hours:
            score += 1.0

        # Multilingual bonus
        if profile.multilingual:
            score += 1.0

        return score

    def _generate_justification(self, name: str, profile: ModelProfile,
                                 language: str, dataset_hours: float,
                                 voice_clone_required: bool,
                                 quality_priority: bool, speed_priority: bool,
                                 hardware: HardwareInfo) -> str:
        """Generate human-readable justification for the selection."""
        lines = [f"Selected: {profile.name}"]

        # Language
        lines.append(f"  Language: {language} ✓")

        # Quality
        if quality_priority:
            lines.append(f"  Quality: {profile.quality_rating}/10 (highest available)")

        # Speed
        if speed_priority:
            lines.append(f"  Speed: {profile.inference_speed}s per second of audio")

        # Memory
        if hardware.has_gpu:
            lines.append(f"  GPU: {hardware.gpu_name} ({hardware.gpu_memory_gb:.1f}GB)")
            lines.append(f"  Memory: {profile.memory_gb}GB required ✓")
        else:
            lines.append(f"  Running on CPU ({hardware.cpu_cores} cores)")

        # Dataset
        lines.append(f"  Dataset: {dataset_hours:.1f} hours")
        if dataset_hours >= profile.recommended_dataset_hours:
            lines.append(f"  Dataset size: Excellent (recommended: {profile.recommended_dataset_hours}h)")
        else:
            lines.append(f"  Dataset size: Adequate (minimum: {profile.min_dataset_hours}h)")

        # Pros
        if profile.pros:
            lines.append(f"  Pros: {', '.join(profile.pros)}")

        return '\n'.join(lines)

    def compare_models(self, language: str = 'en',
                       dataset_hours: float = 10.0) -> list[dict]:
        """Compare all suitable models."""
        results = []

        for name, profile in AVAILABLE_MODELS.items():
            if language not in profile.languages:
                continue

            score = self._score_model(profile, language, dataset_hours,
                                       False, True, False)

            results.append({
                'name': name,
                'model': profile.name,
                'quality': profile.quality_rating,
                'speed': profile.inference_speed,
                'memory_gb': profile.memory_gb,
                'languages': len(profile.languages),
                'voice_clone': profile.voice_clone,
                'score': round(score, 1),
                'pros': profile.pros,
                'cons': profile.cons,
            })

        results.sort(key=lambda x: x['score'], reverse=True)
        return results

    def get_hardware_info(self) -> dict:
        """Get detected hardware information."""
        return {
            'has_gpu': self.hardware.has_gpu,
            'gpu_name': self.hardware.gpu_name,
            'gpu_memory_gb': round(self.hardware.gpu_memory_gb, 1),
            'cpu_cores': self.hardware.cpu_cores,
            'ram_gb': round(self.hardware.ram_gb, 1),
            'platform': self.hardware.platform,
        }


def auto_select_model(language: str = 'en', dataset_hours: float = 10.0) -> dict:
    """Auto-select the best model and return recommendation."""
    selector = ModelSelector()
    name, profile, justification = selector.select(
        language=language,
        dataset_hours=dataset_hours,
    )
    return {
        'selected_model': name,
        'model_name': profile.name,
        'justification': justification,
        'hardware': selector.get_hardware_info(),
        'all_models': selector.compare_models(language, dataset_hours),
    }
