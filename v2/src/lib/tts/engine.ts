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
  lastAudioMime = "audio/mpeg";

  configure(config: TTSConfig) {
    if (config.edgeTtsUrl) this.edgeTtsUrl = config.edgeTtsUrl;
    if (config.elevenLabsKey) this.elevenLabsKey = config.elevenLabsKey;
    if (config.googleKey) this.googleKey = config.googleKey;
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
    if (this.edgeTtsUrl) {
      try { return await this._speakEdge(text, voiceId); } catch (e) { console.warn("Edge TTS failed, trying ElevenLabs", e); }
    }
    if (this.elevenLabsKey) {
      try { return await this._speakEleven(text, voiceId, rate); } catch (e) { console.warn("ElevenLabs failed, trying browser speech", e); }
    }
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
    if (!resp.ok) throw new Error(`Edge TTS failed: ${resp.status}`);
    const contentType = resp.headers.get("content-type") || "audio/mpeg";
    this.lastAudioMime = contentType;
    const blob = await resp.blob();
    this.lastAudioBlob = blob;
    if (this.lastAudioUrl) URL.revokeObjectURL(this.lastAudioUrl);
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
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: rate },
      }),
    });
    if (!resp.ok) throw new Error(`ElevenLabs failed: ${resp.status}`);
    const contentType = resp.headers.get("content-type") || "audio/mpeg";
    this.lastAudioMime = contentType;
    const blob = await resp.blob();
    this.lastAudioBlob = blob;
    if (this.lastAudioUrl) URL.revokeObjectURL(this.lastAudioUrl);
    this.lastAudioUrl = URL.createObjectURL(blob);
    await this._playBlob(blob);
  }

  private _speakBrowser(text: string, langCode: string, gender: string, rate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const synth = window.speechSynthesis;
      if (!synth) return reject(new Error("Speech not supported"));
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.lang = langCode;
      resolve();
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

  private _getFileExtension(): string {
    if (this.lastAudioMime.includes("wav")) return ".wav";
    if (this.lastAudioMime.includes("ogg")) return ".ogg";
    if (this.lastAudioMime.includes("flac")) return ".flac";
    return ".mp3";
  }

  private _getFilename(): string {
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}${String(now.getSeconds()).padStart(2,"0")}`;
    return `voice-${ts}${this._getFileExtension()}`;
  }

  private _getMimeForDownload(): string {
    if (this.lastAudioMime.includes("wav")) return "audio/wav";
    if (this.lastAudioMime.includes("ogg")) return "audio/ogg";
    if (this.lastAudioMime.includes("flac")) return "audio/flac";
    if (this.lastAudioMime.includes("mp4")) return "audio/mp4";
    return "audio/mpeg";
  }

  download() {
    if (!this.lastAudioBlob) return;
    const blob = this.lastAudioBlob;
    const filename = this._getFilename();
    const mime = this._getMimeForDownload();

    // Strategy 1: navigator.share (best for mobile)
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        const file = new File([blob], filename, { type: mime });
        navigator.share({ files: [file], title: "iknbite Voice" }).catch(() => {});
        return;
      } catch {}
    }

    // Strategy 2: File System Access API (desktop Chrome)
    if ((window as any).showSaveFilePicker) {
      try {
        (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "Audio File", accept: { [mime]: [this._getFileExtension()] } }]
        }).then(async (handle: any) => {
          try {
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
          } catch(e: any) {
            if (e.name !== "AbortError") console.warn("Save file error", e);
          }
        }).catch(() => {});
        return;
      } catch {}
    }

    // Strategy 3: fetch + download via Service Worker (best for mobile Chrome)
    try {
      // Convert blob to a cached response that we can download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.cssText = "display:none!important";
      document.body.appendChild(a);
      a.click();
      // On Chrome mobile this might silently fail, but we keep going
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 3000);
      // Check if download actually started by seeing if blob URL was used
      // Chrome mobile silently ignores blob: download, so we also try fallback
    } catch {}

    // Strategy 4: Data URL (works on most mobile browsers)
    if (blob.size < 50 * 1024 * 1024) { // < 50MB
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const a = document.createElement("a");
          a.href = reader.result as string;
          a.download = filename;
          a.style.cssText = "display:none!important";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => document.body.removeChild(a), 3000);
        };
        reader.readAsDataURL(blob);
        return;
      } catch {}
    }

    // Strategy 5: Open in new tab (user can long-press > save as)
    try {
      const url = URL.createObjectURL(new Blob([blob], { type: mime }));
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {}
  }

  isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  async share() {
    if (!this.lastAudioBlob || !navigator.share) return;
    const mime = this._getMimeForDownload();
    const ext = this._getFileExtension();
    const filename = `voice${ext}`;
    try {
      const file = new File([this.lastAudioBlob], filename, { type: mime });
      await navigator.share({ files: [file], title: "iknbite Voice" });
    } catch (e: any) {
      if (e.name !== "AbortError") throw e;
    }
  }
}

export const tts = new TTSEngine();
