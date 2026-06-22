import { useEffect, useRef, useState } from "react";
import { Pause, Pencil, Play } from "lucide-react";
import { sfx } from "@/lib/audio";

type Props = {
  minutes: number;
  audioOn: boolean;
  style: "bar" | "blocks" | "ring";
  onChangeMinutes: (m: number) => void;
};

export function RingTimer({ minutes, audioOn, style, onChangeMinutes }: Props) {
  const total = Math.max(1, minutes) * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(true);
  const firedRef = useRef(false);

  useEffect(() => {
    setLeft(total);
    setRunning(true);
    firedRef.current = false;
  }, [total]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          if (!firedRef.current) {
            firedRef.current = true;
            if (audioOn) sfx.timerEnd();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, audioOn]);

  const pct = left / total;
  const color =
    pct >= 0.6
      ? "var(--color-primary)"
      : pct >= 0.35
        ? "var(--color-amber)"
        : pct >= 0.15
          ? "var(--color-orange)"
          : "var(--color-red)";

  const mm = Math.floor(left / 60);
  const ss = (left % 60).toString().padStart(2, "0");

  const onEdit = () => {
    const v = prompt("Dauer in Minuten:", String(minutes));
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) onChangeMinutes(Math.min(120, Math.round(n)));
  };

  const toggleRun = () => setRunning((r) => !r);

  // Ring (compact)
  if (style === "ring") {
    const r = 28;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct);
    return (
      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={toggleRun}
          className="relative grid h-20 w-20 place-items-center"
          aria-label={running ? "Pause" : "Start"}
        >
          <svg className="absolute inset-0" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-secondary)" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              transform="rotate(-90 32 32)"
              style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s" }}
            />
          </svg>
          <div className="relative flex flex-col items-center leading-none">
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {mm}:{ss}
            </span>
            {running ? (
              <Pause className="mt-0.5 h-3 w-3 text-muted-foreground" />
            ) : (
              <Play className="mt-0.5 h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </button>
        <EditButton onEdit={onEdit} />
      </div>
    );
  }

  // Bar / Blocks (prominent, full-width)
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={toggleRun}
          className="inline-flex items-center gap-2"
          aria-label={running ? "Pause" : "Start"}
        >
          <span
            className="font-mono text-3xl font-semibold tabular-nums transition-colors"
            style={{ color }}
          >
            {mm}:{ss}
          </span>
          {running ? (
            <Pause className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Play className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        <EditButton onEdit={onEdit} />
      </div>

      {style === "bar" ? (
        <button
          type="button"
          onClick={toggleRun}
          aria-label={running ? "Pause" : "Start"}
          className="block h-6 w-full overflow-hidden rounded-full bg-secondary"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct * 100}%`, backgroundColor: color }}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleRun}
          aria-label={running ? "Pause" : "Start"}
          className="flex w-full gap-1.5"
        >
          {Array.from({ length: 12 }, (_, i) => i < Math.ceil(pct * 12)).map((on, i) => (
            <span
              key={i}
              className="h-8 flex-1 rounded-md transition-colors duration-300"
              style={{ backgroundColor: on ? color : "var(--color-secondary)" }}
            />
          ))}
        </button>
      )}
    </div>
  );
}

function EditButton({ onEdit }: { onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Dauer anpassen"
      className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:bg-secondary"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}
