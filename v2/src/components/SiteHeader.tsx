import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/studio", label: "Studio", icon: "✨" },
  { to: "/voices", label: "Voices", icon: "🎭" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export function SiteHeader() {
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem("iknbite_dark") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("iknbite_dark", String(dark));
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-lg no-underline text-[var(--color-text)]">
          <span>🎙️</span>
          <span>iknbite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}
              className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors no-underline ${
                location.pathname === item.to
                  ? 'bg-[var(--color-coral-light)] text-[var(--color-coral)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
              }`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <button
            onClick={() => setDark(!dark)}
            className="ml-2 w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-text-muted)]"
            aria-label="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </nav>

        {/* Mobile nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-border)] flex justify-around py-2 px-1 z-50">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-[var(--radius-sm)] no-underline transition-colors ${
                location.pathname === item.to ? 'text-[var(--color-coral)]' : 'text-[var(--color-text-muted)]'
              }`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setDark(!dark)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-[var(--color-text-muted)] transition-colors"
          >
            <span className="text-lg">{dark ? "☀️" : "🌙"}</span>
            <span className="text-[10px] font-medium">{dark ? "Light" : "Dark"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
