import { useState } from "react";
import { Link } from "react-router-dom";
import { VOICES, LANGUAGES } from "~/data/voices";
import { WaveformBars } from "~/components/WaveformBars";
import { speak } from "~/lib/tts/browser";

export default function StudioPage() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("ava");
  const [speed, setSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(false);

  const voice = VOICES.find((v) => v.id === voiceId) || VOICES[0];
  const charCount = text.length;

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
        <div className="lg:col-span-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-48 p-4 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="mono text-[var(--color-text-muted)]">{charCount} chars</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={playing ? handleStop : handleGenerate}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-md)] transition-colors">
              {playing ? "⏹ Stop" : "▶ Generate"}
            </button>
          </div>
          <div className="mt-4"><WaveformBars playing={playing} /></div>
        </div>
        <div>
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
            <h3 className="font-heading text-sm font-semibold mb-3">Selected Voice</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-coral-hover)] flex items-center justify-center text-white text-lg">{voice.name[0]}</div>
              <div>
                <div className="text-sm font-semibold">{voice.name}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{voice.language} · {voice.gender}</div>
              </div>
            </div>
            <Link to="/voices" className="block text-center text-xs text-[var(--color-coral)] hover:underline py-2">Change Voice →</Link>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mt-4">
            <h3 className="font-heading text-sm font-semibold mb-3">Speed</h3>
            <input type="range" min="0.5" max="2" step="0.1" value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-coral)]" />
            <div className="text-xs text-[var(--color-text-muted)] text-center mt-1">{speed.toFixed(1)}x</div>
          </div>
        </div>
      </div>
    </div>
  );
}
