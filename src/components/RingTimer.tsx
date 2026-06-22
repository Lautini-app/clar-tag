import { useEffect, useRef, useState } from "react";
import { Pause, Pencil, Play, X } from "lucide-react";
import { sfx } from "@/lib/audio";

const DURATION_PRESETS = [1, 2, 5, 10, 15, 30];

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

  const [editing, setEditing] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const applyDuration = (n: number) => {
    if (Number.isFinite(n) && n > 0) onChangeMinutes(Math.min(120, Math.round(n)));
    setEditing(false);
    setCustomVal("");
  };

  const toggleRun = () => setRunning((r) => !r);

  // Ring (compact)
  if (style === "ring") {
    const r = 28;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct);
    return (
      <div className="w-full">
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
          <EditButton onEdit={() => setEditing((e) => !e)} />
        </div>
        {editing && <DurationPicker current={minutes} customVal={customVal} setCustomVal={setCustomVal} onPick={applyDuration} onClose={() => setEditing(false)} />}
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
        <EditButton onEdit={() => setEditing((e) => !e)} />
      </div>
      {editing && <DurationPicker current={minutes} customVal={customVal} setCustomVal={setCustomVal} onPick={applyDuration} onClose={() => setEditing(false)} />}

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

function DurationPicker({
  current,
  customVal,
  setCustomVal,
  onPick,
  onClose,
}: {
  current: number;
  customVal: string;
  setCustomVal: (v: string) => void;
  onPick: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-2 rounded-[var(--radius-md)] border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Dauer anpassen
        </span>
        <button type="button" onClick={onClose} className="text-muted-foreground" aria-label="Schliessen">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DURATION_PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onPick(m)}
            className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-sm transition ${
              m === current
                ? "border-primary bg-primary-soft text-primary-deep"
                : "border-border bg-background text-foreground hover:border-primary"
            }`}
          >
            {m} min
          </button>
        ))}
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(customVal);
          if (n > 0) onPick(n);
        }}
      >
        <input
          type="number"
          min={1}
          max={120}
          placeholder="Andere"
          value={customVal}
          onChange={(e) => setCustomVal(e.target.value)}
          className="w-20 rounded-[var(--radius-sm)] border border-border bg-background px-2 py-1.5 text-sm tabular-nums outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!customVal || Number(customVal) <= 0}
          className="rounded-[var(--radius-sm)] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          OK
        </button>
      </form>
    </div>
  );
}
