import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LANGUAGES } from "~/data/voices";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("iknbite:settings") || "{}"); }
    catch { return {}; }
  });

  function update(key: string, value: unknown) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("iknbite:settings", JSON.stringify(next));
  }

  function clearAll() {
    localStorage.clear();
    setSettings({});
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Defaults</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Default Language</label>
              <select value={settings.defaultLang || "en"} onChange={(e) => update("defaultLang", e.target.value)}
                className="w-full p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm">
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 flex justify-between"><span>Default Speed</span><span className="mono">{settings.defaultSpeed || 1.0}x</span></label>
              <input type="range" min="0.5" max="2.0" step="0.1" value={settings.defaultSpeed || 1.0}
                onChange={(e) => update("defaultSpeed", parseFloat(e.target.value))}
                className="w-full accent-[var(--color-coral)]" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Data</h3>
          <button onClick={clearAll} className="text-xs text-[var(--color-error)] hover:underline">
            Clear all local data
          </button>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
          <h3 className="font-heading font-semibold text-sm mb-2">About</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">iknbite v2.0 · Open source · Free forever</p>
          <a href="https://github.com/gsops00/iknbite.github.io" target="_blank" rel="noopener" className="text-xs text-[var(--color-coral)] hover:underline mt-1 inline-block">
            View on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}
