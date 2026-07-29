import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { VOICES, LANGUAGES } from "~/data/voices";
import { WaveformBars } from "~/components/WaveformBars";
import { tts } from "~/lib/tts/engine";

export default function StudioPage() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("ava");
  const [speed, setSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");

  const voice = VOICES.find((v) => v.id === voiceId) || VOICES[0];
  const charCount = text.length;

  // Configure TTS engine on mount
  useEffect(() => {
    tts.configure({});
  }, []);

  async function handleGenerate() {
    if (!text.trim() || playing) return;
    setPlaying(true);
    setStatus("Generating...");
    try {
      await tts.speak(text, voiceId, voice.langCode, voice.gender, speed);
      setStatus("✅ Done! Use Download or Share");
    } catch (e: any) {
      setStatus("❌ Error: " + (e.message || "Generation failed"));
    }
    setPlaying(false);
  }

  function handleStop() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setStatus("");
  }

  function handleDownload() {
    if (!tts.canDownload()) {
      setStatus("⚠️ Generate speech first");
      return;
    }
    tts.download();
    setStatus("✅ Downloaded!");
  }

  async function handleShare() {
    if (!tts.canDownload()) return;
    try {
      await tts.share();
      setStatus("✅ Shared!");
    } catch {
      setStatus("❌ Share failed");
    }
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
            <span className="mono text-[var(--color-text-muted)]">{charCount} chars</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={playing ? handleStop : handleGenerate}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-md)] transition-colors disabled:opacity-50"
            >
              {playing ? "⏹ Stop" : "▶ Generate"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!tts.canDownload()}
              className="px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] rounded-[var(--radius-md)] transition-colors disabled:opacity-30"
            >
              📥 Download
            </button>
            {tts.isMobile() && (
              <button
                onClick={handleShare}
                disabled={!tts.canDownload()}
                className="px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] rounded-[var(--radius-md)] transition-colors disabled:opacity-30"
              >
                📤 Share
              </button>
            )}
          </div>

          {status && (
            <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{status}</div>
          )}

          {/* Waveform */}
          <div className="mt-6">
            <WaveformBars playing={playing} />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Voice Selector */}
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
            <h3 className="font-heading text-sm font-semibold mb-3">Selected Voice</h3>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-gradient-to-br from-gray-100 to-gray-200"
              >
                <img
                  src={`/img/avatars/${voice.id}.jpg`}
                  alt={voice.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    target.parentElement!.style.background = `linear-gradient(135deg, ${voice.avatarColor[0]}, ${voice.avatarColor[1]})`;
                    target.parentElement!.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:16px;font-weight:600">${voice.name[0]}</span>`;
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{voice.name}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{voice.language} · {voice.gender}</div>
              </div>
            </div>

            {/* Voice quick selector */}
            <div className="mb-3">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Voice</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.language} ({v.gender})
                  </option>
                ))}
              </select>
            </div>

            <Link to="/voices" className="block text-center text-xs text-[var(--color-coral)] hover:underline py-1">
              Browse All Voices →
            </Link>
          </div>

          {/* Speed */}
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mt-4">
            <h3 className="font-heading text-sm font-semibold mb-3">Speed: {speed.toFixed(1)}x</h3>
            <input
              type="range" min="0.5" max="2" step="0.1" value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-coral)]"
            />
          </div>

          {/* Settings */}
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mt-4">
            <h3 className="font-heading text-sm font-semibold mb-2">⚙️ Engine Settings</h3>
            <Link to="/settings" className="text-xs text-[var(--color-coral)] hover:underline">
              Configure API keys →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
