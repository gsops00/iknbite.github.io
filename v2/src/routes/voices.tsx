import { useState } from "react";
import { Link } from "react-router-dom";
import { VOICES, LANGUAGES } from "~/data/voices";
import { VoiceCard } from "~/components/VoiceCard";
import { tts } from "~/lib/tts/browser";

// Style categories
const STYLES = [
  "All", "Conversational", "Narration", "Audiobook", "Podcast",
  "News", "Documentary", "Education", "Customer Support"
];

const GENDERS = ["All", "male", "female"];
const QUALITIES = ["All", "Studio", "HD", "Expressive"];

export default function VoicesPage() {
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");
  const [style, setStyle] = useState("All");
  const [gender, setGender] = useState("All");
  const [quality, setQuality] = useState("All");
  const [playing, setPlaying] = useState<string | null>(null);

  const filtered = VOICES.filter((v) => {
    if (lang !== "all" && v.langCode !== lang) return false;
    if (style !== "All" && v.style !== style) return false;
    if (gender !== "All" && v.gender !== gender) return false;
    if (quality !== "All" && v.quality !== quality) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!v.name.toLowerCase().includes(q) && !v.description.toLowerCase().includes(q) && !v.style.toLowerCase().includes(q)) return false;
    }
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
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {VOICES.length} voices · {Object.keys(LANGUAGES).length} languages · {filtered.length} shown
      </p>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, style, or description..."
        className="w-full px-4 py-2.5 mb-4 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]" />

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Language */}
        <select value={lang} onChange={(e) => setLang(e.target.value)}
          className="px-3 py-1.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-xs bg-white">
          <option value="all">🌐 All Languages</option>
          {Object.entries(LANGUAGES).sort(([,a],[,b]) => a.localeCompare(b)).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>

        {/* Style/Category */}
        <select value={style} onChange={(e) => setStyle(e.target.value)}
          className="px-3 py-1.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-xs bg-white">
          {STYLES.map((s) => (
            <option key={s} value={s}>{s === "All" ? "🎭 All Styles" : s}</option>
          ))}
        </select>

        {/* Gender */}
        <select value={gender} onChange={(e) => setGender(e.target.value)}
          className="px-3 py-1.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-xs bg-white">
          <option value="All">👤 All Genders</option>
          <option value="female">♀ Female</option>
          <option value="male">♂ Male</option>
        </select>

        {/* Quality */}
        <select value={quality} onChange={(e) => setQuality(e.target.value)}
          className="px-3 py-1.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-xs bg-white">
          <option value="All">✨ All Quality</option>
          <option value="Studio">🎙️ Studio</option>
          <option value="HD">📀 HD</option>
          <option value="Expressive">🎭 Expressive</option>
        </select>
      </div>

      {/* Quick filter chips - Language */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <button onClick={() => setLang("all")}
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${lang === "all" ? "bg-[var(--color-coral)] text-white border-transparent" : "bg-white border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-coral)]"}`}>
          🌐 All
        </button>
        {Object.entries(LANGUAGES).slice(0, 12).map(([code, name]) => (
          <button key={code} onClick={() => setLang(code)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${lang === code ? "bg-[var(--color-coral)] text-white border-transparent" : "bg-white border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-coral)]"}`}>
            {name}
          </button>
        ))}
      </div>

      {/* Quick filter chips - Style */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {STYLES.map((s) => (
          <button key={s} onClick={() => setStyle(s)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${style === s ? "bg-[var(--color-coral)] text-white border-transparent" : "bg-white border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-coral)]"}`}>
            {s === "All" ? "🎭 All" : s}
          </button>
        ))}
      </div>

      {/* Voice Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <div className="text-3xl mb-3">🔇</div>
          <p className="text-sm text-[var(--color-text-muted)]">No voices match your filters.</p>
          <button onClick={() => { setLang("all"); setStyle("All"); setGender("All"); setQuality("All"); setSearch(""); }}
            className="mt-3 text-xs text-[var(--color-coral)] hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((voice) => (
            <VoiceCard key={voice.id} voice={voice} onPlay={handlePreview} isActive={playing === voice.id} />
          ))}
        </div>
      )}
    </div>
  );
}
