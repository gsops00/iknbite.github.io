import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { VOICES, LANGUAGES } from "~/data/voices";
import { WaveformBars } from "~/components/WaveformBars";
import { speak } from "~/lib/tts/browser";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
});

function StudioPage() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("ava");
  const [speed, setSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(false);

  const voice = VOICES.find((v) => v.id === voiceId) || VOICES[0];
  const charCount = text.length;
  const estimatedDuration = text.length > 0 ? Math.round((text.length / 5) / speed) : 0;

  async function handleGenerate() {
    if (!text.trim() || playing) return;
    setPlaying(true);
    try { await speak(text, voice.langCode, voice.gender, speed); }
    catch (e) { console.error(e); }
    setPlaying(false);
  }

  function handleStop() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-1">Studio</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Write your text, pick a voice, generate speech.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-48 p-4 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:border-transparent placeholder:text-[var(--color-text-muted)]"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="mono text-[var(--color-text-muted)]">{charCount} chars</span>
              <span className="mono text-[var(--color-text-muted)]">~{estimatedDuration}s</span>
            </div>
            <span className="mono text-[var(--color-text-muted)]">Max 5000</span>
          </div>

          {/* Transport bar */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={playing ? handleStop : handleGenerate}
              disabled={!text.trim()}
              className={`px-5 py-2.5 text-sm font-semibold rounded-[var(--radius-sm)] transition-all ${
                playing
                  ? "bg-[var(--color-error)] text-white hover:bg-red-600"
                  : "bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-hover)] disabled:opacity-40"
              }`}
            >
              {playing ? "■ Stop" : "▶ Generate"}
            </button>
            {playing && <WaveformBars playing barCount={12} />}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Voice picker */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Voice</label>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full p-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm"
            >
              {Object.entries(LANGUAGES).map(([code, name]) => {
                const langVoices = VOICES.filter((v) => v.langCode === code);
                if (langVoices.length === 0) return null;
                return (
                  <optgroup key={code} label={name}>
                    {langVoices.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Speed */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 flex justify-between">
              <span>Speed</span>
              <span className="mono">{speed.toFixed(1)}x</span>
            </label>
            <input
              type="range" min="0.5" max="2.0" step="0.1" value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-coral)]"
            />
          </div>

          {/* Current voice preview */}
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-white text-xs font-semibold"
                style={{ background: `linear-gradient(135deg, ${voice.avatarColor[0]}, ${voice.avatarColor[1]})` }}
              >
                {voice.name.slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-semibold">{voice.name}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">{voice.description}</div>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">"{voice.sampleText}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
