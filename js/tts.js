/* ============================================
   iknbite  |  TTS Engine
   Uses Web Speech API (client-side, no server)
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
    this._init();
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
    // Retry in case voices aren't loaded yet
    setTimeout(load, 500);
    setTimeout(load, 1500);
  }

  getVoices() {
    if (!this._voicesLoaded) {
      this._voices = this.synth.getVoices();
    }
    return this._voices || [];
  }

  // Find best matching Web Speech voice for a voice definition
  findSpeechVoice(voiceDef) {
    const allVoices = this.getVoices();
    if (allVoices.length === 0) return null;

    const gender = voiceDef.gender || 'f';
    const lang = voiceDef.lang || 'en';

    // Try mapped voice names first
    const map = WEB_SPEECH_MAP[lang];
    if (map && map[gender]) {
      for (const name of map[gender]) {
        const found = allVoices.find(v => v.name === name || v.name.includes(name));
        if (found) return found;
      }
    }

    // Fallback: match by language prefix
    const langPrefix = lang + '-';
    const candidates = allVoices.filter(v => v.lang.startsWith(lang));
    if (candidates.length > 0) {
      // Prefer local voices
      const local = candidates.filter(v => v.localService);
      return local[0] || candidates[0];
    }

    // Last resort: any English voice
    return allVoices.find(v => v.lang.startsWith('en')) || allVoices[0];
  }

  speak(text, voiceDef, options = {}) {
    return new Promise((resolve, reject) => {
      this.stop();

      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const speechVoice = this.findSpeechVoice(voiceDef);
      if (!speechVoice) {
        reject(new Error('No suitable voice found for ' + voiceDef.lang));
        return;
      }

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
        // Don't reject on 'canceled' — that's expected when we call stop()
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

  // Preview: speak a short sample text for the voice
  preview(voiceDef) {
    const sampleTexts = {
      en: 'Hello! I\'m your new voice. Let me read something for you.',
      es: '¡Hola! Soy tu nueva voz. Déjame leerte algo.',
      fr: 'Bonjour! Je suis ta nouvelle voix. Laisse-moi te lire quelque chose.',
      de: 'Hallo! Ich bin deine neue Stimme. Lass mich dir etwas vorlesen.',
      ja: 'こんにちは！私はあなたの新しい声です。何か読みましょう。',
      zh: '你好！我是你的新声音。让我给你读点什么。',
      ko: '안녕하세요! 저는 당신의 새로운 목소리예요. 뭔가 읽어드릴게요.',
      hi: 'नमस्ते! मैं आपकी नई आवाज़ हूँ। मुझे कुछ पढ़ने दीजिए.',
      pt: 'Olá! Eu sou sua nova voz. Deixe-me ler algo para você.',
      it: 'Ciao! Sono la tua nuova voce. Lasciami leggerti qualcosa.',
      ru: 'Привет! Я ваш новый голос. Позвольте мне вам что-нибудь прочитать.',
      ar: 'مرحبا! أنا صوتك الجديد. دعني أقرأ لك شيئاً.',
      tr: 'Merhaba! Ben senin yeni sesin. Sana bir şey okuyayım.',
      pl: 'Cześć! Jestem twoim nowym głosem. Pozwól, że przeczytam ci coś.',
      nl: 'Hallo! Ik ben je nieuwe stem. Laat me iets voor je voorlezen.',
      sv: 'Hej! Jag är din nya röst. Låt mig läsa något för dig.',
      da: 'Hej! Jeg er din nye stemme. Lad mig læse noget for dig.',
      fi: 'Hei! Olen uusi äänesi. Anna minun lukea sinulle jotain.',
      nb: 'Hei! Jeg er den nye stemmen din. La meg lese noe for deg.',
      cs: 'Ahoj! Jsem tvůj nový hlas. Dovol mi přečíst něco.',
      el: 'Γεια σας! Είμαι η νέα σας φωνή. Αφήστε με να σας διαβάσω κάτι.',
      hu: 'Szia! Az új hangod vagyok. Hadd olvassak fel neked valamit.',
      ro: 'Bună! Sunt vocea ta nouă. Lasă-mă să îți citesc ceva.',
      th: 'สวัสดี! ฉันเป็นเสียงใหม่ของคุณ ให้ฉันอ่านอะไรสักอย่างให้คุณฟัง',
      vi: 'Xin chào! Tôi là giọng nói mới của bạn. Để tôi đọc cho bạn nghe.',
      id: 'Halo! Aku suara barumu. Biar aku bacakan sesuatu untukmu.',
      ms: 'Halo! Aku suara baru kamu. Biar aku baca sesuatu untuk kamu.',
      uk: 'Привіт! Я твій новий голос. Дозволь мені тобі щось прочитати.',
    };
    const text = sampleTexts[voiceDef.lang] || sampleTexts.en;
    return this.speak(text, voiceDef, { rate: 1.0, pitch: 1.0, volume: 1.0 });
  }

  pause() {
    if (this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  isSupported() {
    return 'speechSynthesis' in window;
  }
}

const tts = new TTSEngine();
