import { Link } from "@tanstack/react-router";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/studio", label: "Studio" },
  { to: "/voices", label: "Voices" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-surface)]/80 border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-heading font-semibold text-lg tracking-tight">
          <span className="text-xl">🎙️</span>
          <span>iknbite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-coral)] animate-pulse" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-alt)] transition-all duration-200"
              activeProps={{ className: "text-[var(--color-coral)] bg-[var(--color-coral-light)]" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/studio"
            className="hidden md:inline-flex px-4 py-1.5 text-sm font-semibold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] rounded-[var(--radius-sm)] transition-colors"
          >
            Start Creating
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[var(--color-text-secondary)]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M5 5l10 10M5 15L15 5" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/studio"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block text-center px-4 py-2 text-sm font-semibold text-white bg-[var(--color-coral)] rounded-[var(--radius-sm)]"
          >
            Start Creating
          </Link>
        </div>
      )}
    </header>
  );
}
