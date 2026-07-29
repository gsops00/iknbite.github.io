import { useState } from "react";
import { Link } from "react-router-dom";
import { VOICES } from "~/data/voices";
import { VoiceCard } from "~/components/VoiceCard";
import { WaveformBars } from "~/components/WaveformBars";
import { tts } from "~/lib/tts/browser";

export default function IndexPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const featured = VOICES.filter((v) => ["ava", "andrew", "nanami", "denise", "elvira", "sunhi"].includes(v.id));

  async function handlePreview(voice: typeof VOICES[0]) {
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(null); return; }
    setPlaying(voice.id);
    try {
      await tts.speak(voice.sampleText, voice.id, voice.langCode, voice.gender, 1.0);
    } catch {}
    setPlaying(null);
  }

  return (
    <div>
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
          <div className="mt-12 flex justify-center">
            <WaveformBars playing={!!playing} barCount={24} />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-heading text-2xl font-bold text-center mb-2">Featured Voices</h2>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">Try a sample — click any card to hear it</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featured.map((voice) => (
            <VoiceCard key={voice.id} voice={voice} onPlay={handlePreview} isActive={playing === voice.id} />
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-surface-alt)] py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{step:"01",title:"Choose a Voice",desc:"Browse 76+ voices across 29 languages."},{step:"02",title:"Write Your Text",desc:"Type or paste any text. Adjust speed and pitch."},{step:"03",title:"Generate & Download",desc:"Click generate and download as MP3 or WAV."}].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex w-10 h-10 rounded-full bg-[var(--color-coral)] text-white text-sm font-bold items-center justify-center mb-3">{item.step}</div>
                <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
