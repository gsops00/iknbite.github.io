import React, { useState } from "react";
import type { Voice } from "~/data/voices";

interface VoiceCardProps {
  voice: Voice;
  onPlay?: (voice: Voice) => void;
  isActive?: boolean;
}

export function VoiceCard({ voice, onPlay, isActive }: VoiceCardProps) {
  const avatarSrc = `/img/avatars/${voice.id}.jpg`;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group relative bg-white rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 hover:shadow-[var(--shadow-lift)] hover:border-[var(--color-border-strong)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${isActive ? "ring-2 ring-[var(--color-coral)] border-[var(--color-coral)]" : ""}`}
      onClick={() => onPlay?.(voice)}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
          {!imgError ? (
            <img
              src={avatarSrc}
              alt={voice.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${voice.avatarColor[0]}, ${voice.avatarColor[1]})` }}
            >
              {voice.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-heading font-semibold text-sm truncate">{voice.name}</h3>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
              {voice.gender === "male" ? "♂" : "♀"}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{voice.description}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="mono text-[10px] text-[var(--color-text-muted)]">{voice.language}</span>
            {voice.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          className="w-8 h-8 rounded-full bg-[var(--color-surface-alt)] hover:bg-[var(--color-coral)] hover:text-white flex items-center justify-center transition-colors shrink-0 opacity-0 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); onPlay?.(voice); }}
          aria-label="Preview voice"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 1.5v9l7.5-4.5L3 1.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
