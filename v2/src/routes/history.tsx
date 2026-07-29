import { useState } from "react";

interface HistoryItem {
  id: string;
  text: string;
  voiceName: string;
  timestamp: number;
  engine: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("iknbite_history") || "[]");
    } catch { return []; }
  });

  function clearHistory() {
    localStorage.removeItem("iknbite_history");
    setItems([]);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-1">History</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Recent voice generations</p>
        </div>
        {items.length > 0 && (
          <button onClick={clearHistory} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <div className="text-3xl mb-3">📜</div>
          <p className="text-sm text-[var(--color-text-muted)]">No history yet. Generate some voices in the Studio!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm line-clamp-2 mb-1">{item.text}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span>🎙️ {item.voiceName}</span>
                    <span>·</span>
                    <span>⚙️ {item.engine}</span>
                    <span>·</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
