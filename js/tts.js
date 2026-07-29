/* ============================================
   iknbite  |  TTS Engine
   Uses openai-edge-tts backend (Edge TTS neural voices)
   Falls back to Web Speech API if backend unavailable
   ============================================ */

// Edge TTS voice ID mapping per voice definition
const EDGE_VOICE_MAP = {
  // English
  'ava':      'en-US-AvaNeural',      'andrew':   'en-US-AndrewNeural',
  'brian':    'en-US-BrianNeural',     'emma':     'en-US-EmmaNeural',
  'jenny':    'en-US-JennyNeural',     'guy':      'en-US-GuyNeural',
  'aria':     'en-US-AriaNeural',      'davis':    'en-US-DavisNeural',
  'sonia':    'en-GB-SoniaNeural',     'ryan':     'en-GB-RyanNeural',
  'natasha':  'en-AU-NatashaNeural',   'neerja':   'en-IN-NeerjaNeural',
  'tony':     'en-US-TonyNeural',      'michelle': 'en-US-MichelleNeural',
  'jason':    'en-US-JasonNeural',     'sara':     'en-US-SaraNeural',
  // Japanese
  'nanami':   'ja-JP-NanamiNeural',    'keita':    'ja-JP-KeitaNeural',
  'mayu':     'ja-JP-MayuNeural',
  // Chinese
  'xiaoxiao': 'zh-CN-XiaoxiaoNeural',  'yunxi':    'zh-CN-YunxiNeural',
  'xiaohan':  'zh-CN-XiaohanNeural',
  // Korean
  'sunhi':    'ko-KR-SunHiNeural',     'injoon':   'ko-KR-InJoonNeural',
  'hyejin':   'ko-KR-HyeJinNeural',
  // French
  'denise':   'fr-FR-DeniseNeural',    'henri':    'fr-FR-HenriNeural',
  // Spanish
  'elvira':   'es-ES-ElviraNeural',    'alvaro':   'es-ES-AlvaroNeural',
  'dalia':    'es-ES-DaliaNeural',
  // German
  'katja':    'de-DE-KatjaNeural',     'conrad':   'de-DE-ConradNeural',
  // Portuguese
  'francisca':'pt-BR-FranciscaNeural', 'antonio':  'pt-BR-AntonioNeural',
  // Italian
  'elsa':     'it-IT-ElsaNeural',      'diego':    'it-IT-DiegoNeural',
  // Russian
  'svetlana': 'ru-RU-SvetlanaNeural',  'dmitry':   'ru-RU-DmitryNeural',
  // Arabic
  'zariyah':  'ar-SA-ZariyahNeural',   'hamed':    'ar-SA-HamedNeural',
  // Turkish
  'emel':     'tr-TR-EmelNeural',      'ahmet':    'tr-TR-AhmetNeural',
  // Polish
  'agnieszka':'pl-PL-AgnieszkaNeural', 'marek':    'pl-PL-MarekNeural',
  // Dutch
  'colette':  'nl-NL-ColetteNeural',
  // Swedish
  'sofie':    'sv-SE-SofieNeural',
  // Greek
  'athina':   'el-GR-AthinaNeural',
  // Indonesian
  'gadis':    'id-ID-GadisNeural',
  // Czech
  'eliska':   'cs-CZ-VlastaNeural',
  // Thai
  'premw':    'th-TH-PremwadeeNeural', 'somsak':  'th-TH-NiwatNeural',
  // Vietnamese
  'hoai':     'vi-VN-HoaiMyNeural',   'tuan':    'vi-VN-NamMinhNeural',
  // Hindi
  'swara':    'hi-IN-SwaraNeural',     'madhur':   'hi-IN-MadhurNeural',
  // Finnish
  'mikko':    'fi-FI-HarriNeural',     'aino':    'fi-FI-SelmaNeural',
  // Norwegian
  'erling':   'nb-NO-FinnNeural',      'inger':   'nb-NO-PernilleNeural',
  // Danish
  'lars':     'da-DK-JeppeNeural',     'freja':   'da-DK-ChristelNeural',
  // Hungarian
  'zoltan':   'hu-HU-TamasNeural',     'eva':     'hu-HU-NoemiNeural',
  // Romanian
  'radu':     'ro-RO-EmilNeural',      'alina':   'ro-RO-AlinaNeural',
  // Ukrainian
  'taras':    'uk-UA-BorysNeural',     'polina':  'uk-UA-PolinaNeural',
  // Malay
  'yusof':    'ms-MY-OsmanNeural',     'nurul':   'ms-MY-YasminNeural',
  // Filipino
  'rafael':   'tl-PH-BlessicaNeural',  'maria':   'tl-PH-AngeloNeural',
  // Finnish
  'fenna':    'fi-FI-SelmaNeural',
  // Norwegian
  'noemi':    'nb-NO-PernilleNeural',  'finn':     'nb-NO-FinnNeural',
  // Danish
  'helena':   'da-DK-ChristelNeural',  'jeppe':    'da-DK-JeppeNeural',
  // Hungarian
  'gudje':    'hu-HU-NoemiNeural',
  // Romanian
  'edyta':    'ro-RO-AlinaNeural',
};

// EasyVoice (Kokoro) voice mapping — maps iknbite IDs to Kokoro voice IDs

// ElevenLabs voice mapping — maps iknbite IDs to ElevenLabs pre-made voice IDs
const EL_VOICE_MAP = {
  // English
  'ava': '21m00Tcm4TlvDq8ikWAM',     // Rachel
  'andrew': '29vD33N1CtxCmqQRPOHJ',  // Drew
  'brian': 'nPczCjzI2devNBz1zQrb',   // Brian
  'emma': 'g5CIjZEefAph4nQFvHAz',    // Emma
  'jenny': 'EXAVITQu4vr4xnSDxMaL',   // Bella
  'guy': 'CwhRBWXzGAHq8TQ4Fs17',     // Sam
  'aria': '9BWtsMINqrJLrRacOk9x',    // Aria
  'davis': 'CYw3kZ02Hs0563khs1Fj',   // Clyde
  'sonia': 'FGY2WhTYpPnrIDTdsKH5',   // Charlotte (British)
  'ryan': 'IKne3meq5aSn9XLyUdCD',    // Matilda
  'natasha': 'z9fAnlkpzviPz146aGWa', // Glinda
  'neerja': 'pFZP5JQG7iQjIQuC4Bku',  // Lily
  'tony': 'ErXwobaYiN019PkySvjV',    // Antoni
  'michelle': 'TXY1ij23mvauJGzg0IbG', // Lily
  'jason': 'TxGEqnHWrfWFTfGW9XjX',   // Josh
  'sara': 'EXAVITQu4vr4xnSDxMaL',    // Bella

  // Japanese
  'nanami': '2BJmEhMFGbEOh8F7dOLz',  // Chihiro
  'keita': 'onwK4e9ZLuTAKqWW03F9',   // Daniel

  // Chinese
  'xiaoxiao': 'zrHiDhphv9ZnVXBqCLjz', // Chinese (Mandarin)
  'yunxi': 'zrHiDhphv9ZnVXBqCLjz',
  'xiaohan': 'zrHiDhphv9ZnVXBqCLjz',

  // Korean
  'sunhi': 'mFrX3fCHFBh2I1pP589n',   // Korean
  'injoon': 'mFrX3fCHFBh2I1pP589n',
  'hyejin': 'mFrX3fCHFBh2I1pP589n',

  // French
  'denise': 'TX3LPaxmHKxFdv7VOQHJ',  // Lily (French)
  'henri': 'CwhRBWXzGAHq8TQ4Fs17',

  // Spanish
  'elvira': 'jsCqWAovK2LkecY7zXl4',  // Elli
  'alvaro': 'ErXwobaYiN019PkySvjV',
  'dalia': 'TX3LPaxmHKxFdv7VOQHJ',

  // German
  'katja': 'cjVigY5qzO86Huf0OWal',   // German
  'conrad': 'nPczCjzI2devNBz1zQrb',

  // Portuguese
  'francisca': 'vBKpLl0mTxTXr8jBSJUj', // Portuguese
  'antonio': 'ErXwobaYiN019PkySvjV',

  // Italian
  'elsa': 'MF3mGyEYCl7XYWbV9V6O',    // Elli
  'diego': 'TxGEqnHWrfWFTfGW9XjX',

  // Russian
  'svetlana': 'cjVigY5qzO86Huf0OWal',
  'dmitry': 'nPczCjzI2devNBz1zQrb',

  // Arabic
  'zariyah': 'pFZP5JQG7iQjIQuC4Bku',
  'hamed': 'onwK4e9ZLuTAKqWW03F9',

  // Turkish
  'emel': '2BJmEhMFGbEOh8F7dOLz',
  'ahmet': 'IKne3meq5aSn9XLyUdCD',

  // Hindi
  'swara': 'pFZP5JQG7iQjIQuC4Bku',
  'madhur': 'IKne3meq5aSn9XLyUdCD',

  // Polish
  'agnieszka': '2BJmEhMFGbEOh8F7dOLz',
  'marek': 'nPczCjzI2devNBz1zQrb',

  // Dutch
  'colette': 'TX3LPaxmHKxFdv7VOQHJ',

  // Swedish
  'sofie': 'TX3LPaxmHKxFdv7VOQHJ',

  // Greek
  'athina': 'TX3LPaxmHKxFdv7VOQHJ',

  // Indonesian
  'gadis': 'TX3LPaxmHKxFdv7VOQHJ',

  // Vietnamese
  'hoai': 'TX3LPaxmHKxFdv7VOQHJ',
  'tuan': 'IKne3meq5aSn9XLyUdCD',

  // Finnish
  'mikko': 'TX3LPaxmHKxFdv7VOQHJ',
  'aino': 'TX3LPaxmHKxFdv7VOQHJ',

  // Norwegian
  'erling': 'nPczCjzI2devNBz1zQrb',
  'inger': 'TX3LPaxmHKxFdv7VOQHJ',

  // Danish
  'lars': 'nPczCjzI2devNBz1zQrb',
  'freja': 'TX3LPaxmHKxFdv7VOQHJ',
};

const EASYVOICE_MAP = {
  // English Female
  'ava': 'af_aoede', 'emma': 'af_bella', 'jenny': 'af_heart',
  'aria': 'af_nova', 'sonia': 'af_sky', 'natasha': 'af_aoede',
  'neerja': 'af_bella', 'michelle': 'af_heart', 'sara': 'af_nova',
  // English Male
  'andrew': 'am_adam', 'brian': 'am_echo', 'guy': 'am_eric',
  'davis': 'am_michael', 'ryan': 'am_adam', 'tony': 'am_echo',
  'jason': 'am_eric',
  // Non-English (reuse English equivalents by gender)
  'nanami': 'af_aoede', 'keita': 'am_adam', 'mayu': 'af_bella',
  'xiaoxiao': 'af_heart', 'yunxi': 'am_echo', 'xiaohan': 'af_nova',
  'sunhi': 'af_sky', 'injoon': 'am_eric', 'hyejin': 'af_aoede',
  'denise': 'af_bella', 'henri': 'am_adam',
  'elvira': 'af_heart', 'alvaro': 'am_echo', 'dalia': 'af_nova',
  'katja': 'af_sky', 'conrad': 'am_eric',
  'francisca': 'af_aoede', 'antonio': 'am_michael',
  'elsa': 'af_bella', 'diego': 'am_adam',
  'svetlana': 'af_heart', 'dmitry': 'am_echo',
  'zariyah': 'af_nova', 'hamed': 'am_eric',
  'emel': 'af_sky', 'ahmet': 'am_adam',
  'premw': 'af_aoede', 'hoai': 'af_bella',
  'agnieszka': 'af_heart', 'marek': 'am_echo',
  'colette': 'af_nova', 'sofie': 'af_sky',
  'athina': 'af_aoede', 'gadis': 'af_bella', 'eliska': 'af_heart',
  'somsak': 'am_adam', 'tuan': 'am_echo', 'daan': 'am_eric',
  'erik_sv': 'am_michael', 'nikos': 'am_adam', 'budi': 'am_echo',
  'ondrej': 'am_eric', 'mikko': 'am_adam', 'aino': 'af_bella',
  'erling': 'am_echo', 'inger': 'af_heart', 'lars': 'am_eric',
  'freja': 'af_nova', 'zoltan': 'am_michael', 'eva': 'af_sky',
  'radu': 'am_adam', 'alina': 'af_bella', 'taras': 'am_echo',
  'polina': 'af_heart', 'yusof': 'am_eric', 'nurul': 'af_nova',
  'rafael': 'am_adam', 'maria': 'af_bella',
};

// WEB_SPEECH_MAP is defined in voices.js (loaded first)

// Voice pitch/rate offsets for Web Speech API fallback differentiation
const VOICE_OFFSETS = {
  andrew: {pitch:0.70,rate:0.90}, brian: {pitch:0.75,rate:1.00}, guy: {pitch:0.80,rate:0.95},
  davis: {pitch:0.65,rate:0.85}, ryan: {pitch:0.72,rate:0.92}, tony: {pitch:0.78,rate:1.05},
  jason: {pitch:0.68,rate:0.88},
  ava: {pitch:1.15,rate:1.00}, emma: {pitch:1.20,rate:1.05}, jenny: {pitch:1.10,rate:0.98},
  aria: {pitch:1.25,rate:1.02}, sonia: {pitch:1.08,rate:0.95}, natasha: {pitch:1.12,rate:1.00},
  neerja: {pitch:1.18,rate:1.02}, michelle: {pitch:1.14,rate:0.97}, sara: {pitch:1.22,rate:1.03},
  nanami: {pitch:1.15,rate:1.00}, keita: {pitch:0.75,rate:0.95}, mayu: {pitch:1.20,rate:1.02},
  xiaoxiao: {pitch:1.18,rate:1.00}, yunxi: {pitch:0.78,rate:0.95}, xiaohan: {pitch:1.12,rate:1.02},
  sunhi: {pitch:1.15,rate:1.00}, injoon: {pitch:0.72,rate:0.92}, hyejin: {pitch:1.20,rate:1.03},
  denise: {pitch:1.12,rate:0.98}, henri: {pitch:0.70,rate:0.90},
  elvira: {pitch:1.15,rate:1.00}, alvaro: {pitch:0.75,rate:0.95}, dalia: {pitch:1.18,rate:1.02},
  katja: {pitch:1.10,rate:0.97}, conrad: {pitch:0.72,rate:0.88},
  francisca: {pitch:1.12,rate:1.00}, antonio: {pitch:0.78,rate:0.92},
  elsa: {pitch:1.15,rate:1.00}, diego: {pitch:0.70,rate:0.90},
  svetlana: {pitch:1.10,rate:0.95}, dmitry: {pitch:0.68,rate:0.88},
  zariyah: {pitch:1.15,rate:1.00}, hamed: {pitch:0.72,rate:0.92},
  emel: {pitch:1.12,rate:1.00}, ahmet: {pitch:0.75,rate:0.90},
  somsak: {pitch:0.72,rate:0.92}, tuan: {pitch:0.75,rate:0.95},
  daan: {pitch:0.70,rate:0.90}, erik_sv: {pitch:0.72,rate:0.88},
  nikos: {pitch:0.68,rate:0.92}, budi: {pitch:0.75,rate:0.95},
  ondrej: {pitch:0.70,rate:0.90}, mikko: {pitch:0.72,rate:0.88},
  aino: {pitch:1.15,rate:1.00}, erling: {pitch:0.70,rate:0.90},
  inger: {pitch:1.12,rate:1.00}, lars: {pitch:0.72,rate:0.88},
  freja: {pitch:1.18,rate:1.02}, zoltan: {pitch:0.68,rate:0.92},
  eva: {pitch:1.15,rate:1.00}, radu: {pitch:0.75,rate:0.90},
  alina: {pitch:1.12,rate:1.00}, taras: {pitch:0.70,rate:0.92},
  polina: {pitch:1.18,rate:1.02}, yusof: {pitch:0.72,rate:0.88},
  nurul: {pitch:1.15,rate:1.00}, rafael: {pitch:0.75,rate:0.95},
  maria: {pitch:1.12,rate:1.00},
};

class TTSEngine {
  constructor() {
    this.synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
    this.currentUtterance = null;
    this.currentVoice = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.onStart = null;
    this.onEnd = null;
    this.onError = null;
    this.onBoundary = null;
    this._voicesLoaded = false;
    this.lastAudioBlob = null;
    this.lastAudioUrl = null;
    this.edgeTTSApiUrl = null;
    this.easyVoiceKey = null;
    this.easyVoiceUrl = null;
    this.elevenLabsKey = null;
    this._currentAudio = null;
    this._init();
  }

  // ---- Configuration ----
  configure(options) {
    if (options.apiUrl) this.edgeTTSApiUrl = options.apiUrl.replace(/\/$/, '');
    if (options.easyVoiceKey) this.easyVoiceKey = options.easyVoiceKey;
    if (options.easyVoiceUrl) this.easyVoiceUrl = options.easyVoiceUrl.replace(/\/$/, '');
    if (options.elevenLabsKey) this.elevenLabsKey = options.elevenLabsKey;
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  canShareAudio() {
    return this.lastAudioBlob !== null || this.lastAudioUrl !== null;
  }

  async shareAudio() {
    const blob = this.lastAudioBlob;
    const url = this.lastAudioUrl;
    if (!blob && !url) throw new Error('No audio available to share');
    const audioUrl = blob ? URL.createObjectURL(blob) : url;
    const fileName = this._getFilename();
    try {
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'audio/mpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: fileName });
          return 'shared';
        }
      }
      window.open(audioUrl, '_blank');
      return 'opened';
    } finally {
      if (blob) setTimeout(() => URL.revokeObjectURL(audioUrl), 5000);
    }
  }

  _getFilename() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `voice-${ts}.mp3`;
  }

  _init() {
    if (!this.synth) return;
    const load = () => { this._voicesLoaded = true; this._voices = this.synth.getVoices(); };
    load();
    if (this.synth.onvoiceschanged !== undefined) this.synth.onvoiceschanged = load;
    setTimeout(load, 500);
    setTimeout(load, 1500);
  }

  getVoices() {
    if (!this._voicesLoaded && this.synth) this._voices = this.synth.getVoices();
    return this._voices || [];
  }

  // ---- Edge TTS API (primary) ----

  async _fetchElevenLabs(text, voiceId) {
    if (!this.elevenLabsKey) return null;
    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenLabsKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        console.warn('ElevenLabs error:', resp.status, err);
        return null;
      }
      return await resp.blob();
    } catch (e) {
      console.warn('ElevenLabs request failed:', e);
      return null;
    }
  }

  async _fetchEdgeTTS(text, voiceId, speed) {
    if (!this.edgeTTSApiUrl) return null;
    try {
      const resp = await fetch(`${this.edgeTTSApiUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          voice: voiceId,
          model: 'tts-1',
          speed: speed || 1.0,
          response_format: 'mp3'
        })
      });
      if (!resp.ok) throw new Error(`Edge TTS API error: ${resp.status}`);
      const blob = await resp.blob();
      if (blob.size < 100) throw new Error('Audio too small, likely error');
      return blob;
    } catch (e) {
      console.warn('Edge TTS API failed:', e.message);
      return null;
    }
  }

  // ---- EasyVoice API (Kokoro TTS) ----
  async _fetchEasyVoice(text, voiceId, speed) {
    if (!this.easyVoiceKey || !this.easyVoiceUrl) return null;
    try {
      const resp = await fetch(`${this.easyVoiceUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.easyVoiceKey}`
        },
        body: JSON.stringify({
          model: 'kokoro-82m',
          input: text,
          voice: voiceId,
          speed: speed || 1.0,
          response_format: 'mp3'
        })
      });
      if (!resp.ok) throw new Error(`EasyVoice API error: ${resp.status}`);
      const blob = await resp.blob();
      if (blob.size < 100) throw new Error('Audio too small');
      return blob;
    } catch (e) {
      console.warn('EasyVoice API failed:', e.message);
      return null;
    }
  }

  // ---- Web Speech API (fallback) ----
  findSpeechVoice(voiceDef) {
    if (!this.synth) return null;
    const allVoices = this.getVoices();
    if (allVoices.length === 0) return null;

    const gender = voiceDef.gender || 'f';
    const lang = voiceDef.lang || 'en';

    // Try WEB_SPEECH_MAP
    const map = WEB_SPEECH_MAP[lang];
    if (map && map[gender]) {
      for (const name of map[gender]) {
        const found = allVoices.find(v => v.name === name || v.name.includes(name));
        if (found) return found;
      }
    }

    // For male voices, search harder
    if (gender === 'm') {
      const maleWords = ['Male','David','Daniel','Paul','Stefan'];
      for (const w of maleWords) {
        const found = allVoices.find(v => v.lang.startsWith(lang) && v.name.includes(w));
        if (found) return found;
      }
    }

    // Any voice in the language
    const candidates = allVoices.filter(v => v.lang.startsWith(lang));
    if (candidates.length > 0) return candidates.filter(v => v.localService)[0] || candidates[0];

    return allVoices.find(v => v.lang.startsWith('en')) || allVoices[0];
  }

  _speakWebSpeech(text, voiceDef, options) {
    if (!this.synth) throw new Error('Speech synthesis not supported in this browser. Connect an Edge TTS backend in Settings for AI voices.');

    const speechVoice = this.findSpeechVoice(voiceDef);
    if (!speechVoice) {
      const msg = 'No voice found for ' + (voiceDef.lang || 'this language') + '. Connect an Edge TTS backend in Settings for 300+ AI voices.';
      throw new Error(msg);
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechVoice;
      const offsets = VOICE_OFFSETS[voiceDef.id] || {};
      utterance.rate = (options.rate || 1.0) * (offsets.rate || 1.0);
      utterance.pitch = (options.pitch || 1.0) * (offsets.pitch || 1.0);
      utterance.volume = options.volume || 1.0;

      utterance.onstart = () => { this.isSpeaking = true; this.isPaused = false; if (this.onStart) this.onStart(); };
      utterance.onend = () => { this.isSpeaking = false; this.isPaused = false; this.currentUtterance = null; if (this.onEnd) this.onEnd(); resolve(); };
      utterance.onerror = (e) => { this.isSpeaking = false; this.isPaused = false; this.currentUtterance = null; if (this.onError) this.onError(e); if (e.error !== 'canceled') reject(e); else resolve(); };
      utterance.onboundary = (e) => { if (this.onBoundary) this.onBoundary(e); };

      this.currentUtterance = utterance;
      this.currentVoice = voiceDef;
      this.synth.speak(utterance);
    });
  }

  // ---- Main speak method ----
  async speak(text, voiceDef, options = {}) {
    if (!text || !text.trim()) throw new Error('No text to speak');
    if (this.isSpeaking) this.stop();

    this.isGenerating = true;

    // 0. Try ElevenLabs first (highest quality)
    const elVoiceId = EL_VOICE_MAP[voiceDef.id];
    if (elVoiceId && this.elevenLabsKey) {
      const blob = await this._fetchElevenLabs(text, elVoiceId);
      if (blob) {
        this.lastAudioBlob = blob;
        this.lastAudioUrl = URL.createObjectURL(blob);
        await this._playBlob(blob);
        this.isGenerating = false;
        return;
      }
    }

    // 1. Try EasyVoice (Kokoro) first
    const evVoiceId = EASYVOICE_MAP[voiceDef.id];
    if (evVoiceId && this.easyVoiceKey) {
      const rate = options.rate || 1.0;
      const blob = await this._fetchEasyVoice(text, evVoiceId, rate);
      if (blob) {
        this.lastAudioBlob = blob;
        this.lastAudioUrl = URL.createObjectURL(blob);
        await this._playBlob(blob);
        this.isGenerating = false;
        return;
      }
    }

    // 2. Try Edge TTS API (neural voices)
    const edgeVoiceId = EDGE_VOICE_MAP[voiceDef.id];
    if (edgeVoiceId) {
      const rate = options.rate || 1.0;
      const blob = await this._fetchEdgeTTS(text, edgeVoiceId, rate);
      if (blob) {
        this.lastAudioBlob = blob;
        this.lastAudioUrl = URL.createObjectURL(blob);
        await this._playBlob(blob);
        this.isGenerating = false;
        return;
      }
    }

    // 3. Fallback: Web Speech API
    this.isGenerating = false;
    return this._speakWebSpeech(text, voiceDef, options);
  }

  async _playBlob(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      this._currentAudio = audio;
      this.isSpeaking = true;

      audio.onended = () => {
        this.isSpeaking = false;
        this._currentAudio = null;
        URL.revokeObjectURL(url);
        if (this.onEnd) this.onEnd();
        resolve();
      };
      audio.onerror = (e) => {
        this.isSpeaking = false;
        this._currentAudio = null;
        URL.revokeObjectURL(url);
        if (this.onError) this.onError(e);
        reject(e);
      };
      audio.play().catch(reject);
    });
  }

  preview(voiceDef) {
    const sampleTexts = {
      en: "Hello! I'm your new voice. Let me read something for you.",
      es: "¡Hola! Soy tu nueva voz. Déjame leerte algo.",
      fr: "Bonjour! Je suis ta nouvelle voix. Laisse-moi te lire quelque chose.",
      de: "Hallo! Ich bin deine neue Stimme. Lass mich dir etwas vorlesen.",
      ja: "こんにちは！私はあなたの新しい声です。何か読みましょう。",
      zh: "你好！我是你的新声音。让我给你读点什么。",
      ko: "안녕하세요! 저는 당신의 새로운 목소리예요. 뭔가 읽어드릴게요.",
      hi: "नमस्ते! मैं आपकी नई आवाज़ हूँ। मुझे कुछ पढ़ने दीजिए.",
      pt: "Olá! Eu sou sua nova voz. Deixe-me ler algo para você.",
      it: "Ciao! Sono la tua nuova voce. Lasciami leggerti qualcosa.",
      ru: "Привет! Я ваш новый голос. Позвольте мне вам что-нибудь прочитать.",
      ar: "مرحبا! أنا صوتك الجديد. دعني أقرأ لك شيئاً.",
      tr: "Merhaba! Ben senin yeni sesin. Sana bir şey okuyayım.",
      pl: "Cześć! Jestem twoim nowym głosem. Pozwól, że przeczytam ci coś.",
    };
    const text = sampleTexts[voiceDef.lang] || sampleTexts.en;
    return this.speak(text, voiceDef, { rate: 1.0, pitch: 1.0, volume: 1.0 });
  }

  pause() {
    if (this._currentAudio) { this._currentAudio.pause(); this.isPaused = true; }
    else if (this.isSpeaking && !this.isPaused && this.synth) { this.synth.pause(); this.isPaused = true; }
  }

  resume() {
    if (this._currentAudio && this.isPaused) { this._currentAudio.play(); this.isPaused = false; }
    else if (this.isPaused && this.synth) { this.synth.resume(); this.isPaused = false; }
  }

  stop() {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio.currentTime = 0;
      this._currentAudio = null;
    }
    if (this.synth) this.synth.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  isSupported() {
    return !!(this.elevenLabsKey || this.edgeTTSApiUrl || this.easyVoiceKey || (typeof speechSynthesis !== 'undefined'));
  }

  canDownload() {
    return this.lastAudioBlob !== null || this.lastAudioUrl !== null;
  }

  downloadAudio() {
    if (!this.lastAudioBlob && !this.lastAudioUrl) throw new Error('No audio available');
    const filename = this._getFilename();

    if (this.lastAudioBlob) {
      try {
        // Strategy 1: Classic blob URL + <a> click (works on desktop, some mobile)
        const url = URL.createObjectURL(this.lastAudioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
        return filename;
      } catch (e) {
        console.warn('Strategy 1 failed:', e);
      }
      try {
        // Strategy 2: Fetch blob → base64 data URL (better mobile support)
        const url = URL.createObjectURL(this.lastAudioBlob);
        return this._downloadViaFetch(this.lastAudioBlob, filename)
          .then(result => { URL.revokeObjectURL(url); return result; })
          .catch(e => { URL.revokeObjectURL(url); throw e; });
      } catch (e) {
        console.warn('Strategy 2 failed:', e);
      }
      // Strategy 3: Open in new tab as last resort
      const url = URL.createObjectURL(this.lastAudioBlob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return filename;
    }
    // If only URL available (e.g., external URL from Web Speech)
    if (this.lastAudioUrl) {
      const a = document.createElement('a');
      a.href = this.lastAudioUrl;
      a.download = filename;
      a.target = '_blank';
      a.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 200);
      return filename;
    }
    throw new Error('No audio available');
  }

  async _downloadViaFetch(blob, filename) {
    try {
      const url = URL.createObjectURL(blob);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = 'data:audio/mpeg;base64,' + base64;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
      return filename;
    } catch (e) {
      throw new Error('Download failed: ' + e.message);
    }
  }
}

const tts = new TTSEngine();
