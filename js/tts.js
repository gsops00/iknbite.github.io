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
  'premw':    'th-TH-PremwadeeNeural',
  // Vietnamese
  'hoai':     'vi-VN-HoaiMyNeural',
  // Hindi
  'swara':    'hi-IN-SwaraNeural',     'madhur':   'hi-IN-MadhurNeural',
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

// Web Speech API voice name fallbacks
const WEB_SPEECH_MAP = {
  en: { f: ['Google UK English Female','Google US English','Microsoft Zira','Samantha','Karen'],
        m: ['Google UK English Male','Google US English','Microsoft David','Daniel','Alex'] },
  es: { f: ['Google español','Microsoft Helena'], m: ['Google español','Microsoft Pablo'] },
  fr: { f: ['Google français','Microsoft Hortense'], m: ['Google français','Microsoft Paul'] },
  de: { f: ['Google Deutsch','Microsoft Hedda'], m: ['Google Deutsch','Microsoft Stefan'] },
  ja: { f: ['Google 日本語','Microsoft Haruka'], m: ['Google 日本語','Microsoft Ichiro'] },
  zh: { f: ['Google 普通话','Microsoft Lili','Ting-Ting'], m: ['Google 普通话','Kangkang'] },
  ko: { f: ['Google 한국의','Microsoft Heami'], m: ['Google 한국의','Microsoft SunHi'] },
  hi: { f: ['Google हिन्दी','Microsoft Heera'], m: ['Google हिन्दी','Microsoft Ravi'] },
  pt: { f: ['Google português','Microsoft Maria'], m: ['Google português','Microsoft Antonio'] },
  it: { f: ['Google italiano','Microsoft Cosimo'], m: ['Google italiano','Microsoft Cosimo'] },
  ru: { f: ['Google русский','Microsoft Irina'], m: ['Google русский','Microsoft Dmitri'] },
  ar: { f: ['Google العربية','Microsoft Hoda'], m: ['Google العربية','Microsoft Naief'] },
  tr: { f: ['Google Türkçe'], m: ['Google Türkçe'] },
  pl: { f: ['Google Polski','Microsoft Paulina'], m: ['Google Polski'] },
};

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
    this.edgeTTSApiUrl = null;  // Set via configure()
    this._currentAudio = null;
    this._init();
  }

  // ---- Configuration ----
  configure(options) {
    if (options.apiUrl) this.edgeTTSApiUrl = options.apiUrl.replace(/\/$/, '');
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
    if (!this.synth) throw new Error('Speech synthesis not supported');

    const speechVoice = this.findSpeechVoice(voiceDef);
    if (!speechVoice) throw new Error('No suitable voice found for ' + voiceDef.lang);

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

    // 1. Try Edge TTS API first (real neural voices)
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

    // 2. Fallback: Web Speech API
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
    return !!(this.edgeTTSApiUrl || (typeof speechSynthesis !== 'undefined'));
  }

  canDownload() {
    return this.lastAudioBlob !== null || this.lastAudioUrl !== null;
  }

  downloadAudio() {
    if (!this.lastAudioBlob && !this.lastAudioUrl) throw new Error('No audio available');
    const filename = this._getFilename();
    if (this.lastAudioBlob) {
      const url = URL.createObjectURL(this.lastAudioBlob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      return filename;
    }
    const a = document.createElement('a');
    a.href = this.lastAudioUrl; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => document.body.removeChild(a), 100);
    return filename;
  }
}

const tts = new TTSEngine();
