import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { VOICES } from "~/data/voices";
import { WaveformBars } from "~/components/WaveformBars";
import { tts } from "~/lib/tts/engine";

export default function StudioPage() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("ava");
  const [speed, setSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");
  const [hasAudio, setHasAudio] = useState(false);

  const voice = VOICES.find((v) => v.id === voiceId) || VOICES[0];
  const charCount = text.length;
  const hasKeys = !!(tts.edgeTtsUrl || tts.elevenLabsKey);

  useEffect(() => {
    tts.configure({});
  }, []);

  async function handleGenerate() {
    if (!text.trim() || playing) return;
    setPlaying(true);
    setStatus("🔊 Generating speech...");
    setHasAudio(false);
    try {
      await tts.speak(text, voiceId, voice.langCode, voice.gender, speed);
      if (tts.canDownload()) {
        setHasAudio(true);
        setStatus("✅ Speech ready! Tap Download to save or Play to hear again.");
      } else {
        setStatus("✅ Playback complete");
      }
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
    if (!hasAudio || !tts.canDownload()) {
      setStatus("⚠️ Generate speech first");
      return;
    }
    setStatus("📥 Starting download...");
    tts.download();
    setStatus("✅ Downloaded! Check your downloads folder.");
    setTimeout(() => {
      if (hasAudio) setStatus("✅ Speech ready! Tap Download to save or Play to hear again.");
    }, 3000);
  }

  async function handleShare() {
    if (!hasAudio) return;
    try {
      setStatus("📤 Sharing...");
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
        <p className="text-sm text-[var(--color-text-secondary)]">
          Type or paste any text, pick a voice, and generate natural speech.
          {!hasKeys && (
            <span className="block mt-1">
              ⚠️ No TTS backend configured. Go to{" "}
              <Link to="/settings" className="text-[var(--color-coral)] hover:underline">Settings</Link>{" "}
              to connect Cloudflare Edge TTS or ElevenLabs, or use Web Speech (basic).
            </span>
          )}
        </p>
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
              disabled={!text.trim()}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-md)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {playing ? "⏹ Stop" : "▶ Generate"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!hasAudio}
              className="px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] rounded-[var(--radius-md)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
            {tts.isMobile() && (
              <button
                onClick={handleShare}
                disabled={!hasAudio}
                className="px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] rounded-[var(--radius-md)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                📤 Share
              </button>
            )}
          </div>

          {status && (
            <div className="mt-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] p-3 rounded-[var(--radius-sm)]">
              {status}
            </div>
          )}

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
              <div className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
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
                <div className="text-xs text-[var(--color-text-muted)]">{voice.language} · {voice.gender} · {voice.style}</div>
              </div>
            </div>

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
              Browse All 76+ Voices →
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

          {/* Engine Status */}
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mt-4">
            <h3 className="font-heading text-sm font-semibold mb-2">🔌 Engine Status</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>🔊 Edge TTS</span>
                <span className={tts.edgeTtsUrl ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}>
                  {tts.edgeTtsUrl ? "✅ On" : "⚪ Off"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>🎤 ElevenLabs</span>
                <span className={tts.elevenLabsKey ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}>
                  {tts.elevenLabsKey ? "✅ On" : "⚪ Off"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>🌐 Web Speech</span>
                <span className="text-[var(--color-success)]">✅ Always</span>
              </div>
            </div>
            <Link to="/settings" className="block text-center text-xs text-[var(--color-coral)] hover:underline mt-3 pt-2 border-t border-[var(--color-border)]">
              ⚙️ Configure API keys
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
