import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { VOICES } from "~/data/voices";
import { VoiceCard } from "~/components/VoiceCard";
import { WaveformBars } from "~/components/WaveformBars";
import { speak } from "~/lib/tts/browser";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const featured = VOICES.filter((v) => ["ava", "andrew", "nanami", "denise", "elvira", "sunhi"].includes(v.id));

  async function handlePreview(voice: typeof VOICES[0]) {
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(null); return; }
    setPlaying(voice.id);
    try { await speak(voice.sampleText, voice.langCode, voice.gender); }
    catch {}
    setPlaying(null);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-coral-light)] to-transparent opacity-40" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-alt)] text-xs font-medium text-[var(--color-text-secondary)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              Free forever · No API keys · 76+ voices
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight mb-4">
              AI Voice Studio
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8">
              Generate natural speech in <strong className="text-[var(--color-text)]">29 languages</strong> with <strong className="text-[var(--color-text)]">76+ AI voices</strong>. Free, open-source, runs in your browser.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/studio" className="px-6 py-3 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-md)] transition-colors shadow-lg shadow-[var(--color-coral)]/20">
                Start Creating →
              </Link>
              <Link to="/voices" className="px-6 py-3 text-sm font-semibold text-[var(--color-text)] bg-white border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] rounded-[var(--radius-md)] transition-colors">
                Browse Voices
              </Link>
            </div>
          </div>

          {/* Waveform decoration */}
          <div className="mt-12 flex justify-center">
            <WaveformBars playing={!!playing} barCount={24} />
          </div>
        </div>
      </section>

      {/* Featured Voices */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-heading text-2xl font-bold text-center mb-2">Featured Voices</h2>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">Try a sample — click any card to hear it</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featured.map((voice) => (
            <VoiceCard key={voice.id} voice={voice} onPlay={handlePreview} isActive={playing === voice.id} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[var(--color-surface-alt)] py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Choose a Voice", desc: "Browse 76+ voices across 29 languages. Filter by language, gender, or tone." },
              { step: "02", title: "Write Your Text", desc: "Type or paste any text. Adjust speed and pitch to get the perfect delivery." },
              { step: "03", title: "Generate & Download", desc: "Click generate and download your audio as MP3 or WAV. Free forever." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex w-10 h-10 rounded-full bg-[var(--color-coral)] text-white text-sm font-bold items-center justify-center mb-3">{item.step}</div>
                <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-heading text-2xl font-bold text-center mb-2">Pricing</h2>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">Simple. Free. No catches.</p>
        <div className="max-w-md mx-auto bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 text-center">
          <div className="text-3xl font-heading font-bold mb-1">$0</div>
          <div className="text-sm text-[var(--color-text-secondary)] mb-4">Free forever</div>
          <ul className="text-sm text-left space-y-2 mb-6">
            {["76+ AI voices", "29 languages", "MP3 & WAV download", "No account required", "No API keys", "Open source"].map((f) => (
              <li key={f} className="flex items-center gap-2"><span className="text-[var(--color-success)]">✓</span>{f}</li>
            ))}
          </ul>
          <Link to="/studio" className="block px-4 py-2.5 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-sm)] transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--color-surface-alt)] py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Is it really free?", a: "Yes. No accounts, no API keys, no limits. The core product is free forever." },
              { q: "How are the voices generated?", a: "We use neural TTS models (Kokoro, Edge TTS) that run either locally or via free APIs. No paid services." },
              { q: "Can I use the audio commercially?", a: "The audio is generated by open-source models. Check each model's license for commercial use terms." },
              { q: "Does it work on mobile?", a: "Yes. The studio is fully responsive and works on iOS and Android browsers." },
            ].map((item) => (
              <details key={item.q} className="bg-white rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 group">
                <summary className="font-heading font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-[var(--color-text-muted)] group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-3xl font-bold mb-3">Ready to create?</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">Start generating natural AI speech in seconds.</p>
        <Link to="/studio" className="inline-flex px-8 py-3 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-md)] transition-colors shadow-lg shadow-[var(--color-coral)]/20">
          Open Studio →
        </Link>
      </section>
    </div>
  );
}
