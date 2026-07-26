import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { VOICES, LANGUAGES } from "~/data/voices";
import { VoiceCard } from "~/components/VoiceCard";
import { speak } from "~/lib/tts/browser";

export const Route = createFileRoute("/voices")({
  component: VoicesPage,
});

function VoicesPage() {
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [playing, setPlaying] = useState<string | null>(null);

  const filtered = VOICES.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (langFilter !== "all" && v.langCode !== langFilter) return false;
    if (genderFilter !== "all" && v.gender !== genderFilter) return false;
    return true;
  });

  const usedLangs = [...new Set(VOICES.map((v) => v.langCode))];

  async function handlePlay(voice: typeof VOICES[0]) {
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(null); return; }
    setPlaying(voice.id);
    try { await speak(voice.sampleText, voice.langCode, voice.gender); }
    catch {}
    setPlaying(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-1">Voices</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{VOICES.length} voices · {usedLangs.length} languages</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text" placeholder="Search voices..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]"
        />
        <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className="px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm">
          <option value="all">All Languages</option>
          {usedLangs.sort().map((code) => (
            <option key={code} value={code}>{LANGUAGES[code] || code}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {(["all", "male", "female"] as const).map((g) => (
            <button key={g} onClick={() => setGenderFilter(g)}
              className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-colors ${genderFilter === g ? "bg-[var(--color-coral)] text-white" : "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"}`}
            >
              {g === "all" ? "All" : g === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>
      </div>

      {/* Voice grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((voice) => (
          <VoiceCard key={voice.id} voice={voice} onPlay={handlePlay} isActive={playing === voice.id} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[var(--color-text-muted)]">No voices match your filters.</p>
        </div>
      )}
    </div>
  );
}
