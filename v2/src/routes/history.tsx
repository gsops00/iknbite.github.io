import { useState, useEffect } from "react";

export default function HistoryPage() {
  const [items, setItems] = useState<Array<{id:string;text:string;voiceName:string;createdAt:number}>>([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("iknbite_history") || "[]")); }
    catch { setItems([]); }
  }, []);

  function timeAgo(ts: number) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-1">History</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Your recent generations</p>
        </div>
        {items.length > 0 && <button onClick={() => { localStorage.removeItem("iknbite_history"); setItems([]); }} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)]">Clear all</button>}
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <div className="text-3xl mb-3">📜</div>
          <p className="text-sm text-[var(--color-text-muted)]">No generations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
              <p className="text-sm font-medium truncate">{item.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="mono text-[10px] text-[var(--color-text-muted)]">{item.voiceName}</span>
                <span className="text-[var(--color-border)]">·</span>
                <span className="mono text-[10px] text-[var(--color-text-muted)]">{timeAgo(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
