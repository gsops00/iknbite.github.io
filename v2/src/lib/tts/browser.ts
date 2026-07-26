export interface BrowserVoice {
  name: string;
  lang: string;
  localService: boolean;
}

export function getBrowserVoices(): BrowserVoice[] {
  if (typeof window === "undefined") return [];
  const synth = window.speechSynthesis;
  if (!synth) return [];
  return synth.getVoices().map((v) => ({
    name: v.name,
    lang: v.lang,
    localService: v.localService,
  }));
}

export function findBrowserVoice(langCode: string, gender: "male" | "female"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  const candidates = voices.filter((v) => v.lang.startsWith(langCode));
  if (candidates.length === 0) return voices[0] || null;
  const genderHint = gender === "male" ? ["Male", "David", "Daniel"] : ["Female", "Zira", "Samantha"];
  for (const hint of genderHint) {
    const found = candidates.find((v) => v.name.includes(hint));
    if (found) return found;
  }
  return candidates[0];
}

export function speak(text: string, langCode: string, gender: "male" | "female", rate = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    const synth = window.speechSynthesis;
    if (!synth) return reject(new Error("Speech synthesis not supported"));
    const voice = findBrowserVoice(langCode, gender);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(e.error));
    synth.speak(utterance);
  });
}
