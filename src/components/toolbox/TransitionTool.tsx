import { useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { transGet, transSubscribe, transStart, transToggle, transReset, type TransitionState } from "@/lib/transition-timer";
import { RingViz } from "./RingViz";

export function useTrans(): TransitionState {
  return useSyncExternalStore(transSubscribe, transGet, transGet);
}

const QUICK_MINUTES = [5, 10, 15, 20, 30];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function fmtNudge(s: number) {
  return s >= 60 ? `${Math.floor(s / 60)} Min` : `${s} Sek`;
}

function timerColor(pct: number): string {
  if (pct >= 0.6) return "var(--color-primary)";
  if (pct >= 0.35) return "var(--color-amber)";
  if (pct >= 0.15) return "var(--color-orange)";
  return "var(--color-red)";
}

export function TransitionTool({ onClose }: { onClose: () => void }) {
  const trans = useTrans();
  return trans.active ? <ActiveView trans={trans} onClose={onClose} /> : <SetupView />;
}

function SetupView() {
  const [label, setLabel] = useState("");
  const [mins, setMins] = useState(15);

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Was kommt als nächstes? Der Timer erinnert dich sanft, wenn es soweit ist.
      </p>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Was kommt?</span>
        <input
          type="text"
          placeholder="z.B. Abendessen, Termin, Losgehen …"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">In wie vielen Minuten?</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMins(m)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mins === m ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => transStart(label || "Nächste Aktivität", mins)}
        className="rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
      >
        Timer starten
      </button>
    </div>
  );
}

function ActiveView({ trans, onClose }: { trans: TransitionState; onClose: () => void }) {
  const pct = trans.totalDuration > 0 ? trans.totalLeft / trans.totalDuration : 0;
  const color = timerColor(pct);
  const done = trans.totalLeft === 0;

  const upcomingNudges = trans.nudges
    .filter((n) => n < trans.totalLeft)
    .sort((a, b) => b - a);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Noch</p>
        <p className="text-base font-semibold text-foreground">{trans.label}</p>
      </div>

      <RingViz pct={pct} color={color} size={160} onClick={() => !done && transToggle()} label={trans.running ? "Pause" : "Fortsetzen"}>
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">{fmt(trans.totalLeft)}</span>
        {!done && (trans.running ? <Pause className="mt-1 h-5 w-5 text-muted-foreground" /> : <Play className="mt-1 h-5 w-5 text-muted-foreground" />)}
        {done && <span className="mt-1 text-2xl">✅</span>}
      </RingViz>

      {upcomingNudges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {upcomingNudges.map((n) => (
            <span key={n} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {fmtNudge(n)}
            </span>
          ))}
        </div>
      )}

      {done && (
        <div className="animate-in fade-in text-center">
          <p className="text-sm font-medium text-foreground">Zeit für: {trans.label}</p>
        </div>
      )}

      <div className="flex w-full gap-2">
        {!done && (
          <button type="button" onClick={transToggle} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
            {trans.running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Fortsetzen</>}
          </button>
        )}
        <button type="button" onClick={() => { transReset(); onClose(); }} className={`rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm text-muted-foreground ${done ? "flex-1" : ""}`}>
          {done ? "Fertig" : "Abbrechen"}
        </button>
      </div>
    </div>
  );
}
