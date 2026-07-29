import { useState, useEffect } from "react";
import { tts } from "~/lib/tts/engine";

export default function SettingsPage() {
  const [elKey, setElKey] = useState(localStorage.getItem("iknbite_el_key") || "");
  const [edgeUrl, setEdgeUrl] = useState(localStorage.getItem("iknbite_tts_api") || "");
  const [saved, setSaved] = useState("");

  function saveAll() {
    localStorage.setItem("iknbite_el_key", elKey);
    localStorage.setItem("iknbite_tts_api", edgeUrl);
    tts.configure({ elevenLabsKey: elKey, edgeTtsUrl: edgeUrl });
    setSaved("✅ Settings saved!");
    setTimeout(() => setSaved(""), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">Configure API keys and TTS backends</p>

      <div className="space-y-4">
        {/* ElevenLabs */}
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
          <h2 className="font-heading text-sm font-semibold mb-3">🎤 ElevenLabs API</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">Premium AI voices. Get a free API key at elevenlabs.io</p>
          <div className="flex gap-2">
            <input
              value={elKey}
              onChange={(e) => setElKey(e.target.value)}
              placeholder="sk_..."
              className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] font-mono"
            />
          </div>
        </div>

        {/* Edge TTS */}
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
          <h2 className="font-heading text-sm font-semibold mb-3">🔊 Edge TTS (Cloudflare)</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">Free neural voices via Edge TTS. Run your own Cloudflare Worker.</p>
          <div className="flex gap-2">
            <input
              value={edgeUrl}
              onChange={(e) => setEdgeUrl(e.target.value)}
              placeholder="https://edge-tts.your-domain.workers.dev"
              className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] font-mono"
            />
          </div>
        </div>

        <button
          onClick={saveAll}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-md)] transition-colors"
        >
          Save Settings
        </button>
        {saved && <span className="text-sm text-[var(--color-success)] ml-3">{saved}</span>}

        {/* Voice Status */}
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mt-4">
          <h2 className="font-heading text-sm font-semibold mb-3">🔌 Voice Engines</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>🎤 ElevenLabs</span>
              <span className={elKey ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}>
                {elKey ? "✅ Connected" : "⚠️ Not configured"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🔊 Edge TTS</span>
              <span className={edgeUrl ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}>
                {edgeUrl ? "✅ Connected" : "⚠️ Not configured"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🌐 Web Speech API</span>
              <span className="text-[var(--color-success)]">✅ Always available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
