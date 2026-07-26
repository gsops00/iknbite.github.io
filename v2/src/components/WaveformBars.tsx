interface WaveformBarsProps {
  playing?: boolean;
  barCount?: number;
}

export function WaveformBars({ playing = false, barCount = 8 }: WaveformBarsProps) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`waveform-bar ${playing ? "" : "animate-none"}`}
          style={{
            height: playing ? undefined : `${4 + Math.random() * 12}px`,
            animationPlayState: playing ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}
