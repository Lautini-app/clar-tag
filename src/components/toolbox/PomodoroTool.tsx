import { useState, useSyncExternalStore } from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import {
  PRESETS,
  pomGet,
  pomSubscribe,
  pomStart,
  pomToggle,
  pomAdvance,
  pomReset,
  type PomState,
  type PomPhase,
  type PomodoroPreset,
} from "@/lib/pomodoro";
import { RingViz } from "./RingViz";

export function usePom(): PomState {
  return useSyncExternalStore(pomSubscribe, pomGet, pomGet);
}

const PHASE_LABEL: Record<PomPhase, string> = {
  focus: "Fokus",
  short: "Pause",
  long: "Lange Pause",
};

export const PHASE_COLOR: Record<PomPhase, string> = {
  focus: "var(--color-primary)",
  short: "var(--color-amber)",
  long: "var(--color-violet, var(--color-primary-deep))",
};

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

const ROUNDS_TOTAL = 4;

export function PomodoroTool({ onClose }: { onClose: () => void }) {
  const pom = usePom();
  return pom.active ? <ActiveView pom={pom} onClose={onClose} /> : <PresetView />;
}

function PresetView() {
  const [custom, setCustom] = useState(false);
  const [focus, setFocus] = useState(20);
  const [short, setShort] = useState(4);
  const [long, setLong] = useState(10);

  if (custom) {
    return (
      <div className="grid gap-3">
        <h3 className="text-sm font-medium text-foreground">Eigene Zeiten</h3>
        <NumberInput label="Fokus (Min)" value={focus} onChange={setFocus} min={1} max={120} />
        <NumberInput label="Kurze Pause (Min)" value={short} onChange={setShort} min={1} max={30} />
        <NumberInput label="Lange Pause (Min)" value={long} onChange={setLong} min={1} max={60} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => pomStart({ label: "Custom", focus, short, long })}
            className="flex-1 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            Starten
          </button>
          <button
            type="button"
            onClick={() => setCustom(false)}
            className="rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm text-muted-foreground"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => pomStart(p)}
          className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-background p-4 text-left transition hover:border-primary"
        >
          <div>
            <span className="font-medium text-foreground">{p.label}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {p.focus}/{p.short}/{p.long} min
            </span>
          </div>
          <Play className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => setCustom(true)}
        className="flex items-center justify-between rounded-[var(--radius-lg)] border border-dashed border-border bg-background p-4 text-left transition hover:border-primary"
      >
        <span className="font-medium text-foreground">Custom</span>
        <span className="text-xs text-muted-foreground">eigene Zeiten</span>
      </button>
    </div>
  );
}

function ActiveView({ pom, onClose }: { pom: PomState; onClose: () => void }) {
  const pct = pom.totalDuration > 0 ? pom.totalLeft / pom.totalDuration : 0;
  const color = PHASE_COLOR[pom.phase];
  const done = pom.totalLeft === 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full px-3 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: color }}>
          {PHASE_LABEL[pom.phase]}
        </span>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          Runde {pom.round} von {ROUNDS_TOTAL}
        </span>
      </div>

      <RingViz pct={pct} color={color} size={160} onClick={() => !done && pomToggle()} label={pom.running ? "Pause" : "Fortsetzen"}>
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">{fmt(pom.totalLeft)}</span>
        {!done && (pom.running ? <Pause className="mt-1 h-5 w-5 text-muted-foreground" /> : <Play className="mt-1 h-5 w-5 text-muted-foreground" />)}
      </RingViz>

      <div className="flex items-center gap-2">
        {Array.from({ length: ROUNDS_TOTAL }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i < pom.round - 1
                ? "bg-primary"
                : i === pom.round - 1 && pom.phase === "focus"
                  ? "ring-2 ring-primary bg-primary/30"
                  : "bg-secondary"
            }`}
          />
        ))}
      </div>

      {pom.phase === "long" && done && (
        <div className="animate-in fade-in zoom-in text-center">
          <div className="text-4xl">🎉</div>
          <p className="mt-1 text-sm font-medium text-foreground">4 Runden geschafft!</p>
        </div>
      )}

      <div className="flex w-full gap-2">
        {done ? (
          <button type="button" onClick={pomAdvance} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
            <SkipForward className="h-4 w-4" />
            {pom.phase === "focus" ? "Pause starten" : "Nächste Fokus-Runde"}
          </button>
        ) : (
          <button type="button" onClick={pomToggle} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
            {pom.running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Fortsetzen</>}
          </button>
        )}
        <button type="button" onClick={() => { pomReset(); onClose(); }} className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Beenden
        </button>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
        }}
        className="w-16 rounded-[var(--radius-md)] border border-border bg-background px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-primary"
      />
    </label>
  );
}
