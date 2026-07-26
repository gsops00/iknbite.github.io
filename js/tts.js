/* ============================================
   iknbite  |  TTS Engine
   Supports Edge TTS server (MP3) + Web Speech API fallback
   ============================================ */

class TTSEngine {
  constructor() {
    this.synth = window.speechSynthesis;
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
    this.edgeTTSAvailable = null;
    this._init();
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
    if (!blob && !url) {
      throw new Error('No audio available to share');
    }
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
      // Fallback: open in new tab for manual save
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
    const load = () => {
      this._voicesLoaded = true;
      this._voices = this.synth.getVoices();
    };
    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
    setTimeout(load, 500);
    setTimeout(load, 1500);
  }

  getVoices() {
    if (!this._voicesLoaded) {
      this._voices = this.synth.getVoices();
    }
    return this._voices || [];
  }

  findSpeechVoice(voiceDef) {
    const allVoices = this.getVoices();
    if (allVoices.length === 0) return null;

    const gender = voiceDef.gender || 'f';
    const lang = voiceDef.lang || 'en';

    const map = WEB_SPEECH_MAP[lang];
    if (map && map[gender]) {
      for (const name of map[gender]) {
        const found = allVoices.find(v => v.name === name || v.name.includes(name));
        if (found) return found;
      }
    }

    const candidates = allVoices.filter(v => v.lang.startsWith(lang));
    if (candidates.length > 0) {
      const local = candidates.filter(v => v.localService);
      return local[0] || candidates[0];
    }

    return allVoices.find(v => v.lang.startsWith('en')) || allVoices[0];
  }

  // Map voice def to Edge TTS voice ID
  _getEdgeVoiceId(voiceDef) {
    const EDGE_MAP = {
      'en': { 'f': 'en-US-AvaNeural', 'm': 'en-US-AndrewNeural' },
      'ja': { 'f': 'ja-JP-NanamiNeural', 'm': 'ja-JP-KeitaNeural' },
      'zh': { 'f': 'zh-CN-XiaoxiaoNeural', 'm': 'zh-CN-YunxiNeural' },
      'ko': { 'f': 'ko-KR-SunHiNeural', 'm': 'ko-KR-InJoonNeural' },
      'hi': { 'f': 'hi-IN-SwaraNeural', 'm': 'hi-IN-MadhurNeural' },
      'fr': { 'f': 'fr-FR-DeniseNeural', 'm': 'fr-FR-HenriNeural' },
      'es': { 'f': 'es-ES-ElviraNeural', 'm': 'es-ES-AlvaroNeural' },
      'de': { 'f': 'de-DE-KatjaNeural', 'm': 'de-DE-ConradNeural' },
      'pt': { 'f': 'pt-BR-FranciscaNeural', 'm': 'pt-BR-AntonioNeural' },
      'it': { 'f': 'it-IT-ElsaNeural', 'm': 'it-IT-DiegoNeural' },
      'ru': { 'f': 'ru-RU-SvetlanaNeural', 'm': 'ru-RU-DmitryNeural' },
      'ar': { 'f': 'ar-SA-ZariyahNeural', 'm': 'ar-SA-HamedNeural' },
      'tr': { 'f': 'tr-TR-EmelNeural', 'm': 'tr-TR-AhmetNeural' },
      'pl': { 'f': 'pl-PL-AgnieszkaNeural', 'm': 'pl-PL-MarekNeural' },
      'nl': { 'f': 'nl-NL-ColetteNeural', 'm': 'nl-NL-MaartenNeural' },
      'sv': { 'f': 'sv-SE-SofieNeural', 'm': 'sv-SE-MattiasNeural' },
      'da': { 'f': 'da-DK-ChristelNeural', 'm': 'da-DK-JeppeNeural' },
      'fi': { 'f': 'fi-FI-SelmaNeural', 'm': 'fi-FI-HarriNeural' },
      'nb': { 'f': 'nb-NO-PernilleNeural', 'm': 'nb-NO-FinnNeural' },
      'cs': { 'f': 'cs-CZ-VlastaNeural', 'm': 'cs-CZ-AntoninNeural' },
      'el': { 'f': 'el-GR-AthinaNeural', 'm': 'el-GR-NestorNeural' },
      'hu': { 'f': 'hu-HU-NoemiNeural', 'm': 'hu-HU-TamasNeural' },
      'ro': { 'f': 'ro-RO-AlinaNeural', 'm': 'ro-RO-EmilNeural' },
      'th': { 'f': 'th-TH-PremwadeeNeural', 'm': 'th-TH-NiwatNeural' },
      'vi': { 'f': 'vi-VN-HoaiMyNeural', 'm': 'vi-VN-NamMinhNeural' },
      'id': { 'f': 'id-ID-GadisNeural', 'm': 'id-ID-ArdiNeural' },
      'ms': { 'f': 'ms-MY-YasminNeural', 'm': 'ms-MY-OsmanNeural' },
      'uk': { 'f': 'uk-UA-PolinaNeural', 'm': 'uk-UA-BorysNeural' },
    };
    const lang = voiceDef.lang || 'en';
    const gender = voiceDef.gender || 'f';
    const map = EDGE_MAP[lang];
    if (map && map[gender]) return map[gender];
    return 'en-US-AvaNeural';
  }

  async _checkEdgeTTS() {
    if (this.edgeTTSAvailable !== null) return this.edgeTTSAvailable;
    try {
      const origin = window.location.origin;
      const resp = await fetch(origin + '/health', { signal: AbortSignal.timeout(2000) });
      if (resp.ok) {
        const data = await resp.json();
        this.edgeTTSAvailable = data.engine === 'edge-tts';
      } else {
        this.edgeTTSAvailable = false;
      }
    } catch {
      this.edgeTTSAvailable = false;
    }
    return this.edgeTTSAvailable;
  }

  async _generateEdgeTTS(text, voiceDef, rate) {
    const voiceId = this._getEdgeVoiceId(voiceDef);
    const rateStr = rate !== 1.0 ? `${Math.round((rate - 1) * 100)}%` : '+0%';

    const resp = await fetch(window.location.origin + '/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voiceId, rate: rateStr, volume: '+0%' }),
    });

    if (!resp.ok) throw new Error('Edge TTS generation failed');

    const blob = await resp.blob();
    return blob;
  }

  async _playBlob(blob) {
    const url = URL.createObjectURL(blob);
    this.lastAudioBlob = blob;
    this.lastAudioUrl = url;

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this._currentAudio = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        if (this.onStart) this.onStart();
      };

      audio.onended = () => {
        this.isSpeaking = false;
        if (this.onEnd) this.onEnd();
        URL.revokeObjectURL(url);
        this.lastAudioUrl = null;
        resolve();
      };

      audio.onerror = (e) => {
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        this.lastAudioUrl = null;
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    });
  }

  async speak(text, voiceDef, options = {}) {
    this.stop();
    this.lastAudioBlob = null;
    this.lastAudioUrl = null;

    if (!text || !text.trim()) {
      throw new Error('No text provided');
    }

    // Try Edge TTS first (produces downloadable MP3)
    const useEdge = await this._checkEdgeTTS();
    if (useEdge) {
      try {
        const blob = await this._generateEdgeTTS(text, voiceDef, options.rate || 1.0);
        await this._playBlob(blob);
        return;
      } catch (e) {
        console.warn('Edge TTS failed, falling back to Web Speech API:', e);
      }
    }

    // Fallback: Web Speech API
    if (!this.synth) {
      throw new Error('Speech synthesis not supported');
    }

    const speechVoice = this.findSpeechVoice(voiceDef);
    if (!speechVoice) {
      throw new Error('No suitable voice found for ' + voiceDef.lang);
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechVoice;
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        if (this.onStart) this.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        if (this.onEnd) this.onEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        if (this.onError) this.onError(e);
        if (e.error !== 'canceled') {
          reject(e);
        } else {
          resolve();
        }
      };

      utterance.onboundary = (e) => {
        if (this.onBoundary) this.onBoundary(e);
      };

      this.currentUtterance = utterance;
      this.currentVoice = voiceDef;
      this.synth.speak(utterance);
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
      nl: "Hallo! Ik ben je nieuwe stem. Laat me iets voor je voorlezen.",
      sv: "Hej! Jag är din nya röst. Låt mig läsa något för dig.",
      da: "Hej! Jeg er din nye stemme. Lad mig læse noget for dig.",
      fi: "Hei! Olen uusi äänesi. Anna minun lukea sinulle jotain.",
      nb: "Hei! Jeg er den nye stemmen din. La meg lese noe for deg.",
      cs: "Ahoj! Jsem tvůj nový hlas. Dovol mi přečíst něco.",
      el: "Γεια σας! Είμαι η νέα σας φωνή. Αφήστε με να σας διαβάσω κάτι.",
      hu: "Szia! Az új hangod vagyok. Hadd olvassak fel neked valamit.",
      ro: "Bună! Sunt vocea ta nouă. Lasă-mă să îți citesc ceva.",
      th: "สวัสดี! ฉันเป็นเสียงใหม่ของคุณ ให้ฉันอ่านอะไรสักอย่างให้คุณฟัง",
      vi: "Xin chào! Tôi là giọng nói mới của bạn. Để tôi đọc cho bạn nghe.",
      id: "Halo! Aku suara barumu. Biar aku bacakan sesuatu untukmu.",
      ms: "Halo! Aku suara baru kamu. Biar aku baca sesuatu untuk kamu.",
      uk: "Привіт! Я твій новий голос. Дозволь мені тобі щось прочитати.",
    };
    const text = sampleTexts[voiceDef.lang] || sampleTexts.en;
    return this.speak(text, voiceDef, { rate: 1.0, pitch: 1.0, volume: 1.0 });
  }

  pause() {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this.isPaused = true;
    } else if (this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this._currentAudio && this.isPaused) {
      this._currentAudio.play();
      this.isPaused = false;
    } else if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stop() {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio.currentTime = 0;
      if (this.lastAudioUrl) {
        URL.revokeObjectURL(this.lastAudioUrl);
      }
      this._currentAudio = null;
    }
    this.synth.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  isSupported() {
    return 'speechSynthesis' in window;
  }

  canDownload() {
    return this.lastAudioBlob !== null || this.lastAudioUrl !== null;
  }

  downloadAudio() {
    if (!this.lastAudioBlob && !this.lastAudioUrl) {
      throw new Error('No audio available for download');
    }

    const filename = this._getFilename();

    if (this.lastAudioBlob) {
      const url = URL.createObjectURL(this.lastAudioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      return filename;
    }

    // URL-based download (Edge TTS)
    const a = document.createElement('a');
    a.href = this.lastAudioUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
    return filename;
  }
}

const tts = new TTSEngine();
