"""
VCTK Corpus Dataset Loader
Source: https://datashare.ed.ac.uk/handle/10283/3443
License: ODC-BY (Open Data Commons Attribution)

VCTK Corpus is a multi-speaker English speech corpus with 110 speakers
from various English accents.

Features:
- 110 speakers (56 female, 44 male)
- ~44 hours of speech
- Various English accents (English, Scottish, Irish, etc.)
- High-quality audio (48kHz original, 22kHz typical)
- Aligned text transcriptions
- Speaker metadata

Download: https://datashare.ed.ac.uk/handle/10283/3443
"""

import os
import csv
import json
import tarfile
import requests
import subprocess
from pathlib import Path
from typing import Optional, Generator
from dataclasses import dataclass


@dataclass
class VCTKSample:
    """Single VCTK sample."""
    audio_path: str
    text: str
    speaker_id: str
    utterance_id: str
    duration_seconds: float = 0.0
    accent: str = 'unknown'
    gender: str = 'unknown'


@dataclass
class VCTKSpeaker:
    """Speaker metadata."""
    speaker_id: str
    gender: str
    accent: str
    age: int = 0
    region: str = ''


class VCTKLoader:
    """
    VCTK Corpus dataset loader and manager.

    Usage:
        loader = VCTKLoader(data_dir='./data/vctk')
        loader.download()
        samples = loader.load()
    """

    # VCTK download URL (via Datashare)
    DOWNLOAD_URL = 'https://datashare.ed.ac.uk/bitstream/handle/10283/3443/VCTK-Corpus.tar.gz'
    DOWNLOAD_URL_ALT = 'https://datashare.ed.ac.uk/bitstream/handle/10283/3443/VCTK-Corpus-0.92.zip'

    # Speaker metadata (gender and accent)
    SPEAKERS = {
        'p225':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p226':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p227':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p228':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p229':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p230':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p231':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p232':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p233':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p234':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p235':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p236':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p237':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p238':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p239':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p240':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p241':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p242':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p243':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p244':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p245':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p246':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p247':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p248':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p249':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p250':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p251':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p252':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p253':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p254':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p255':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p256':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p257':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p258':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p259':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p260':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p261':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p262':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p263':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p264':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p265':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p266':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p267':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p268':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p269':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p270':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p271':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p272':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p273':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p274':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p275':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p276':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p277':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p278':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p279':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p280':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p281':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p282':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p283':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p284':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p285':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p286':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p287':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p288':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p289':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p290':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p291':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p292':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p293':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p294':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p295':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p296':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p297':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p298':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p299':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p300':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p301':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p302':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p303':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p304':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p305':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p306':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p307':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p308':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p309':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p310':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p311':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p312':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p313':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p314':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p315':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p316':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p317':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p318':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p319':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p320':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p321':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p322':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p323':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p324':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p325':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p326':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p327':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p328':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p329':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p330':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p331':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p332':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p333':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p334':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p335':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p336':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p337':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p338':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p339':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p340':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p341':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p342':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p343':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p344':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p345':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p346':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p347':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p348':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p349':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p350':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p351':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p352':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p353':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p354':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p355':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p356':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p357':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p358':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p359':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p360':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p361':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p362':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p363':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p364':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p365':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p366':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p367':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p368':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p369':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p370':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p371':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p372':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p373':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p374':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p375':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p376':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p377':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p378':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p379':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p380':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p381':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p382':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p383':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p384':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p385':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p386':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p387':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p388':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p389':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p390':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p391':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p392':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p393':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p394':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p395':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p396':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p397':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p398':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p399':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p400':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p401':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p402':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p403':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p404':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p405':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p406':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p407':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p408':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p409':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p410':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p411':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p412':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p413':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p414':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p415':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p416':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p417':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p418':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p419':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p420':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p421':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p422':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p423':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p424':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p425':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p426':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p427':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p428':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p429':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p430':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p431':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p432':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p433':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p434':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p435':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p436':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p437':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p438':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p439':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p440':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p441':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p442':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p443':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p444':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p445':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p446':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p447':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p448':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p449':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p450':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p451':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p452':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p453':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p454':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p455':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p456':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p457':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p458':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p459':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p460':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p461':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p462':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p463':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p464':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p465':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p466':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p467':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p468':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p469':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p470':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p471':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p472':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p473':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p474':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p475':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p476':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p477':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p478':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p479':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p480':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p481':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p482':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p483':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p484':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p485':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p486':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p487':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p488':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p489':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p490':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p491':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p492':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p493':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p494':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p495':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p496':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p497':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p498':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p499':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p500':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p501':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p502':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p503':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p504':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p505':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p506':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p507':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p508':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p509':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p510':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p511':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p512':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p513':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p514':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p515':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p516':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p517':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p518':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p519':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p520':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p521':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p522':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p523':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p524':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p525':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p526':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p527':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p528':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p529':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p530':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p531':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p532':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p533':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p534':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p535':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p536':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p537':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p538':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p539':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p540':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p541':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p542':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p543':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
        'p544':  {'gender': 'F', 'accent': 'English',   'region': 'England'},
    }

    def __init__(self, data_dir: str = './data/vctk'):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def is_downloaded(self) -> bool:
        """Check if VCTK is already downloaded."""
        wav_dir = self.data_dir / 'wav48_silence_trimmed'
        return wav_dir.exists() and any(wav_dir.glob('**/*.flac'))

    def download(self, force: bool = False) -> bool:
        """Download VCTK corpus."""
        if self.is_downloaded() and not force:
            print("[VCTK] Already downloaded")
            return True

        print("[VCTK] Downloading VCTK Corpus (~44 hours, ~12GB)...")
        print(f"  URL: {self.DOWNLOAD_URL}")

        tar_path = self.data_dir / 'VCTK-Corpus.tar.gz'

        try:
            response = requests.get(self.DOWNLOAD_URL, stream=True, timeout=600)
            response.raise_for_status()

            total = int(response.headers.get('content-length', 0))
            downloaded = 0

            with open(tar_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=65536):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total > 0:
                        pct = (downloaded / total) * 100
                        mb = downloaded // (1024 * 1024)
                        print(f"\r  Downloaded: {pct:.1f}% ({mb}MB)", end='', flush=True)

            print(f"\n  Extracting...")
            with tarfile.open(tar_path, 'r:gz') as tar:
                tar.extractall(path=self.data_dir)

            tar_path.unlink()

            print(f"[VCTK] ✅ Downloaded to {self.data_dir}")
            return True

        except Exception as e:
            print(f"[VCTK] ❌ Error: {e}")
            if tar_path.exists():
                tar_path.unlink()
            return False

    def load(self, max_samples: Optional[int] = None,
             min_duration: float = 0.5, max_duration: float = 20.0,
             speaker_filter: Optional[str] = None,
             gender_filter: Optional[str] = None) -> Generator[VCTKSample, None, None]:
        """Load VCTK samples."""
        wav_dir = self.data_dir / 'wav48_silence_trimmed'
        txt_dir = self.data_dir / 'txt'

        if not wav_dir.exists():
            raise FileNotFoundError("VCTK not downloaded. Run loader.download() first.")

        count = 0
        for speaker_dir in sorted(wav_dir.iterdir()):
            if not speaker_dir.is_dir():
                continue

            speaker_id = speaker_dir.name

            # Speaker filter
            if speaker_filter and speaker_id != speaker_filter:
                continue

            # Gender filter
            speaker_info = self.SPEAKERS.get(speaker_id, {})
            gender = speaker_info.get('gender', 'unknown')
            if gender_filter and gender != gender_filter:
                continue

            accent = speaker_info.get('accent', 'unknown')

            for wav_file in sorted(speaker_dir.glob('*.flac')):
                if max_samples and count >= max_samples:
                    return

                # Get text
                txt_file = txt_dir / speaker_id / (wav_file.stem + '.txt')
                if not txt_file.exists():
                    continue

                try:
                    text = txt_file.read_text(encoding='utf-8').strip()
                except Exception:
                    continue

                if not text:
                    continue

                # Estimate duration
                word_count = len(text.split())
                estimated_duration = (word_count / 160) * 60

                if estimated_duration < min_duration or estimated_duration > max_duration:
                    continue

                yield VCTKSample(
                    audio_path=str(wav_file),
                    text=text,
                    speaker_id=speaker_id,
                    utterance_id=wav_file.stem,
                    duration_seconds=estimated_duration,
                    accent=accent,
                    gender=gender,
                )
                count += 1

    def get_speakers(self) -> list[VCTKSpeaker]:
        """Get all speakers."""
        return [
            VCTKSpeaker(
                speaker_id=sid,
                gender=info['gender'],
                accent=info['accent'],
            )
            for sid, info in self.SPEAKERS.items()
        ]

    def get_statistics(self) -> dict:
        """Get dataset statistics."""
        wav_dir = self.data_dir / 'wav48_silence_trimmed'
        if not wav_dir.exists():
            return {'error': 'Not downloaded'}

        speakers = [d.name for d in wav_dir.iterdir() if d.is_dir()]
        total_files = sum(len(list(d.glob('*.flac'))) for d in wav_dir.iterdir() if d.is_dir())

        male = sum(1 for s in speakers if self.SPEAKERS.get(s, {}).get('gender') == 'M')
        female = sum(1 for s in speakers if self.SPEAKERS.get(s, {}).get('gender') == 'F')

        return {
            'total_speakers': len(speakers),
            'male_speakers': male,
            'female_speakers': female,
            'total_files': total_files,
            'estimated_hours': 44,
        }

    def search_samples(self, query: str, max_results: int = 10) -> list[VCTKSample]:
        """Search samples by text."""
        results = []
        for sample in self.load(max_samples=5000):
            if query.lower() in sample.text.lower():
                results.append(sample)
                if len(results) >= max_results:
                    break
        return results


# Convenience
def download_vctk(data_dir: str = './data/vctk') -> bool:
    loader = VCTKLoader(data_dir=data_dir)
    return loader.download()
