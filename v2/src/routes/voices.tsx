import { useState } from "react";
import { VOICES, LANGUAGES } from "~/data/voices";
import { VoiceCard } from "~/components/VoiceCard";
import { tts } from "~/lib/tts/browser";

export default function VoicesPage() {
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");
  const [playing, setPlaying] = useState<string | null>(null);

  const filtered = VOICES.filter((v) => {
    if (lang !== "all" && v.langCode !== lang) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handlePreview(voice: typeof VOICES[0]) {
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(null); return; }
    setPlaying(voice.id);
    try { await tts.speak(voice.sampleText, voice.id, voice.langCode, voice.gender, 1.0); }
    catch {}
    setPlaying(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl font-bold mb-1">Voices</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">{VOICES.length} voices across {Object.keys(LANGUAGES).length} languages</p>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search voices..."
          className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]" />
        <select value={lang} onChange={(e) => setLang(e.target.value)}
          className="px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm">
          <option value="all">All Languages</option>
          {Object.entries(LANGUAGES).map(([code, name]) => (<option key={code} value={code}>{name}</option>))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((voice) => (
          <VoiceCard key={voice.id} voice={voice} onPlay={handlePreview} isActive={playing === voice.id} />
        ))}
      </div>
    </div>
  );
}
