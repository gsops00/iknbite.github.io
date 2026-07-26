import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 font-heading font-semibold mb-3">
              <span>🎙️</span><span>iknbite</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Free, open-source AI voice studio. Generate natural speech in 76+ voices.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/studio" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">Studio</Link></li>
              <li><Link to="/voices" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">Voices</Link></li>
              <li><Link to="/history" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com/gsops00/iknbite.github.io" target="_blank" rel="noopener" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">GitHub</a></li>
              <li><a href="https://easyvoice.ae" target="_blank" rel="noopener" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">EasyVoice</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-[var(--color-text-secondary)]">Privacy Policy</span></li>
              <li><span className="text-sm text-[var(--color-text-secondary)]">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[var(--color-text-muted)]">© 2026 iknbite. Free forever.</p>
          <p className="text-xs text-[var(--color-text-muted)] mono">Built with ❤️ and open-source AI</p>
        </div>
      </div>
    </footer>
  );
}
