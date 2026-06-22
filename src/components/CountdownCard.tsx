import { useEffect, useMemo, useState } from "react";
import { sfx } from "@/lib/audio";

type Props = {
  totalMinutes: number;
  label: string;
  style: "bar" | "blocks" | "ring";
  audioOn: boolean;
};

function colorFor(pct: number) {
  if (pct >= 0.6) return "var(--color-primary)";
  if (pct >= 0.35) return "var(--color-amber)";
  if (pct >= 0.15) return "var(--color-orange)";
  return "var(--color-red)";
}

export function CountdownCard({ totalMinutes, label, style, audioOn }: Props) {
  const initialSec = totalMinutes * 60;
  const [secLeft, setSecLeft] = useState(initialSec);
  const [snoozes, setSnoozes] = useState(0);
  const [bonusSec, setBonusSec] = useState(0);

  useEffect(() => {
    if (secLeft <= 0) return;
    const id = setInterval(() => setSecLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secLeft]);

  const total = initialSec + bonusSec;
  const pct = total > 0 ? secLeft / total : 0;
  const color = colorFor(pct);
  const mm = Math.floor(secLeft / 60).toString().padStart(2, "0");
  const ss = (secLeft % 60).toString().padStart(2, "0");

  const blocks = useMemo(() => {
    const n = Math.max(1, Math.ceil(total / 60));
    const remaining = Math.ceil(secLeft / 60);
    return Array.from({ length: n }, (_, i) => i < remaining);
  }, [total, secLeft]);

  const onSnooze = () => {
    setSnoozes((s) => s + 1);
    setBonusSec((b) => b + 5 * 60);
    setSecLeft((s) => s + 5 * 60);
    if (audioOn) sfx.snooze();
  };

  return (
    <div className="rounded-[var(--radius-lg)] bg-card p-5 shadow-sm">
      <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>

      {style === "ring" ? (
        <div className="flex items-center gap-5">
          <RingProgress pct={pct} color={color} />
          <div className="flex-1">
            <div className="font-mono text-4xl font-semibold tabular-nums" style={{ color }}>
              {mm}:{ss}
            </div>
            <button
              onClick={onSnooze}
              className="mt-2 rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              +5 min
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-5xl font-semibold tabular-nums" style={{ color }}>
              {mm}:{ss}
            </div>
            <button
              onClick={onSnooze}
              className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              +5 min
            </button>
          </div>

          <div className="mt-4">
            {style === "bar" ? (
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct * 100}%`, backgroundColor: color }}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {blocks.map((on, i) => (
                  <div
                    key={i}
                    className="h-3 w-3 rounded-sm transition-colors"
                    style={{ backgroundColor: on ? color : "var(--color-secondary)" }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {snoozes > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          {snoozes}× verschoben
        </div>
      )}
    </div>
  );
}

function RingProgress({ pct, color }: { pct: number; color: string }) {
  const size = 96;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 700ms ease, stroke 700ms ease" }}
      />
    </svg>
  );
}
