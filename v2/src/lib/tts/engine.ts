// Edge TTS voice mapping
const EDGE_VOICE_MAP: Record<string, string> = {
  'ava': 'en-US-AvaNeural', 'andrew': 'en-US-AndrewNeural',
  'brian': 'en-US-BrianNeural', 'emma': 'en-US-EmmaNeural',
  'jenny': 'en-US-JennyNeural', 'guy': 'en-US-GuyNeural',
  'aria': 'en-US-AriaNeural', 'davis': 'en-US-DavisNeural',
  'sonia': 'en-GB-SoniaNeural', 'ryan': 'en-GB-RyanNeural',
  'natasha': 'en-AU-NatashaNeural', 'neerja': 'en-IN-NeerjaNeural',
  'tony': 'en-US-TonyNeural', 'michelle': 'en-US-MichelleNeural',
  'jason': 'en-US-JasonNeural', 'sara': 'en-US-SaraNeural',
  'nanami': 'ja-JP-NanamiNeural', 'keita': 'ja-JP-KeitaNeural',
  'mayu': 'ja-JP-MayuNeural',
  'xiaoxiao': 'zh-CN-XiaoxiaoNeural', 'yunxi': 'zh-CN-YunxiNeural',
  'xiaohan': 'zh-CN-XiaohanNeural',
  'sunhi': 'ko-KR-SunHiNeural', 'injoon': 'ko-KR-InJoonNeural',
  'hyejin': 'ko-KR-HyeJinNeural',
  'denise': 'fr-FR-DeniseNeural', 'henri': 'fr-FR-HenriNeural',
  'elvira': 'es-ES-ElviraNeural', 'alvaro': 'es-ES-AlvaroNeural',
  'dalia': 'es-ES-DaliaNeural',
  'katja': 'de-DE-KatjaNeural', 'conrad': 'de-DE-ConradNeural',
  'francisca': 'pt-BR-FranciscaNeural', 'antonio': 'pt-BR-AntonioNeural',
  'elsa': 'it-IT-ElsaNeural', 'diego': 'it-IT-DiegoNeural',
  'svetlana': 'ru-RU-SvetlanaNeural', 'dmitry': 'ru-RU-DmitryNeural',
  'zariyah': 'ar-SA-ZariyahNeural', 'hamed': 'ar-SA-HamedNeural',
  'emel': 'tr-TR-EmelNeural', 'ahmet': 'tr-TR-AhmetNeural',
  'agnieszka': 'pl-PL-AgnieszkaNeural', 'marek': 'pl-PL-MarekNeural',
  'colette': 'nl-NL-ColetteNeural', 'daan': 'nl-NL-MaartenNeural',
  'sofie': 'sv-SE-SofieNeural',
  'athina': 'el-GR-AthinaNeural',
  'gadis': 'id-ID-GadisNeural',
  'eliska': 'cs-CZ-VlastaNeural',
  'premw': 'th-TH-PremwadeeNeural',
  'hoai': 'vi-VN-HoaiMyNeural', 'tuan': 'vi-VN-NamMinhNeural',
  'swara': 'hi-IN-SwaraNeural', 'madhur': 'hi-IN-MadhurNeural',
  'mikko': 'fi-FI-HarriNeural',
  'lars': 'da-DK-JeppeNeural',
  'zoltan': 'hu-HU-TamasNeural',
  'radu': 'ro-RO-EmilNeural', 'alina': 'ro-RO-AlinaNeural',
  'taras': 'uk-UA-BorysNeural', 'polina': 'uk-UA-PolinaNeural',
  'yusof': 'ms-MY-OsmanNeural',
  'rafael': 'tl-PH-BlessicaNeural',
};

// ElevenLabs voice mapping
const EL_VOICE_MAP: Record<string, string> = {
  'ava': '21m00Tcm4TlvDq8ikWAM', 'andrew': '29vD33N1CtxCmqQRPOHJ',
  'brian': 'nPczCjzI2devNBz1zQrb', 'emma': 'g5CIjZEefAph4nQFvHAz',
  'jenny': 'EXAVITQu4vr4xnSDxMaL', 'guy': 'CwhRBWXzGAHq8TQ4Fs17',
  'aria': '9BWtsMINqrJLrRacOk9x', 'davis': 'CYw3kZ02Hs0563khs1Fj',
  'sonia': 'FGY2WhTYpPnrIDTdsKH5', 'ryan': 'IKne3meq5aSn9XLyUdCD',
  'tony': 'ErXwobaYiN019PkySvjV',
  'nanami': '2BJmEhMFGbEOh8F7dOLz',
  'xiaoxiao': 'zrHiDhphv9ZnVXBqCLjz',
};

export interface TTSConfig {
  edgeTtsUrl?: string;
  elevenLabsKey?: string;
  googleKey?: string;
}

class TTSEngine {
  edgeTtsUrl = "";
  elevenLabsKey = "";
  googleKey = "";
  lastAudioUrl = "";
  lastAudioBlob: Blob | null = null;

  configure(config: TTSConfig) {
    if (config.edgeTtsUrl) this.edgeTtsUrl = config.edgeTtsUrl;
    if (config.elevenLabsKey) this.elevenLabsKey = config.elevenLabsKey;
    if (config.googleKey) this.googleKey = config.googleKey;
    // Load from localStorage
    if (!config.edgeTtsUrl) this.edgeTtsUrl = localStorage.getItem("iknbite_tts_api") || "";
    if (!config.elevenLabsKey) this.elevenLabsKey = localStorage.getItem("iknbite_el_key") || "";
    if (!config.googleKey) this.googleKey = localStorage.getItem("iknbite_gt_key") || "";
  }

  getEdgeVoice(voiceId: string): string {
    return EDGE_VOICE_MAP[voiceId] || `${voiceId}`;
  }

  getElevenVoice(voiceId: string): string {
    return EL_VOICE_MAP[voiceId] || "21m00Tcm4TlvDq8ikWAM";
  }

  async speak(text: string, voiceId: string, langCode: string, gender: string, rate = 1.0): Promise<void> {
    // Try Edge TTS first
    if (this.edgeTtsUrl) {
      try { return await this._speakEdge(text, voiceId); } catch {}
    }
    // Try ElevenLabs
    if (this.elevenLabsKey) {
      try { return await this._speakEleven(text, voiceId, rate); } catch {}
    }
    // Fallback: Web Speech API
    return this._speakBrowser(text, langCode, gender, rate);
  }

  private async _speakEdge(text: string, voiceId: string): Promise<void> {
    const voice = this.getEdgeVoice(voiceId);
    const url = `${this.edgeTtsUrl}/tts`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, rate: "+0%", volume: "+0%" }),
    });
    if (!resp.ok) throw new Error("Edge TTS failed");
    const blob = await resp.blob();
    this.lastAudioBlob = blob;
    this.lastAudioUrl = URL.createObjectURL(blob);
    await this._playBlob(blob);
  }

  private async _speakEleven(text: string, voiceId: string, rate: number): Promise<void> {
    const voice = this.getElevenVoice(voiceId);
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": this.elevenLabsKey,
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: rate } }),
    });
    if (!resp.ok) throw new Error("ElevenLabs failed");
    const blob = await resp.blob();
    this.lastAudioBlob = blob;
    this.lastAudioUrl = URL.createObjectURL(blob);
    await this._playBlob(blob);
  }

  private _speakBrowser(text: string, langCode: string, gender: string, rate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const synth = window.speechSynthesis;
      if (!synth) return reject(new Error("Speech not supported"));
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      const voices = synth.getVoices().filter(v => v.lang.startsWith(langCode));
      if (voices.length > 0) utterance.voice = voices[0];
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(e.error));
      synth.speak(utterance);
    });
  }

  private _playBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Playback failed")); };
      audio.play().catch(reject);
    });
  }

  canDownload(): boolean {
    return !!this.lastAudioBlob;
  }

  download() {
    if (!this.lastAudioBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(this.lastAudioBlob);
    a.download = `voice-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.mp3`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  async share() {
    if (!this.lastAudioBlob || !navigator.share) return;
    const file = new File([this.lastAudioBlob], "voice.mp3", { type: "audio/mpeg" });
    await navigator.share({ files: [file] });
  }
}

export const tts = new TTSEngine();
