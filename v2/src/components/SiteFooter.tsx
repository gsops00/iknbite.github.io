export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-3">
        <p className="text-sm text-[var(--color-text-muted)]">
          iknbite — Free AI Voice Studio. Built with open-source models.
        </p>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <a href="https://github.com/gsops00" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-coral)] transition-colors no-underline">GitHub</a>
          <span>·</span>
          <span>Powered by Edge TTS + Web Speech API</span>
          <span>·</span>
          <span>76+ Voices · 29 Languages</span>
        </div>
      </div>
    </footer>
  );
}
