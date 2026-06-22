import { useState, useSyncExternalStore } from "react";
import { Pause, Play, CheckCircle } from "lucide-react";
import { bdGet, bdSubscribe, bdStart, bdToggle, bdConfirmCheckin, bdDismissCheckin, bdFinish, type BodyDoublingState } from "@/lib/body-doubling";
import { RingViz } from "./RingViz";

export function useBd(): BodyDoublingState {
  return useSyncExternalStore(bdSubscribe, bdGet, bdGet);
}

function fmtElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = (m % 60).toString().padStart(2, "0");
    return `${h}:${rm}:${sec}`;
  }
  return `${m}:${sec}`;
}

export function BodyDoublingTool({ onClose }: { onClose: () => void }) {
  const bd = useBd();
  return bd.active ? <ActiveView bd={bd} onClose={onClose} /> : <SetupView />;
}

function SetupView() {
  const [goal, setGoal] = useState("");

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Jemand arbeitet mit dir. Schreib auf woran du arbeitest — der Timer läuft und checkt sanft bei dir ein.
        </p>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Was arbeitest du gerade?</span>
        <input
          type="text"
          placeholder="z.B. Mathe-Aufgaben, Aufräumen, E-Mails …"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      <button
        type="button"
        onClick={() => bdStart(goal || "Fokus-Session")}
        className="rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
      >
        Session starten
      </button>
    </div>
  );
}

function ActiveView({ bd, onClose }: { bd: BodyDoublingState; onClose: () => void }) {
  const [summary, setSummary] = useState<{ minutes: number; checkins: number } | null>(null);

  if (summary) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="text-5xl">🏅</div>
        <h3 className="text-lg font-semibold text-foreground">Gut gemacht!</h3>
        <p className="text-sm text-muted-foreground">
          {summary.minutes} Minuten fokussiert gearbeitet
          {summary.checkins > 0 && <> — {summary.checkins}× bestätigt</>}.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          Zurück
        </button>
      </div>
    );
  }

  if (bd.checkinDue) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="text-5xl">👋</div>
        <h3 className="text-lg font-semibold text-foreground">Noch dabei?</h3>
        <p className="text-sm text-muted-foreground">{bd.goal}</p>
        <p className="font-mono text-sm tabular-nums text-muted-foreground">{fmtElapsed(bd.elapsed)}</p>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={bdConfirmCheckin}
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            <CheckCircle className="h-4 w-4" /> Ja, dabei! 👍
          </button>
          <button
            type="button"
            onClick={bdDismissCheckin}
            className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  const cycleProgress = (bd.elapsed % (12 * 60)) / (12 * 60);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-foreground">{bd.goal}</p>

      <RingViz pct={cycleProgress} color="var(--color-primary)" size={140} onClick={bdToggle} label={bd.running ? "Pause" : "Fortsetzen"}>
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{fmtElapsed(bd.elapsed)}</span>
        {bd.running ? <Pause className="mt-1 h-4 w-4 text-muted-foreground" /> : <Play className="mt-1 h-4 w-4 text-muted-foreground" />}
      </RingViz>

      {bd.confirmedCount > 0 && (
        <p className="text-xs text-muted-foreground">{bd.confirmedCount}× check-in bestätigt</p>
      )}

      <div className="flex w-full gap-2">
        <button type="button" onClick={bdToggle} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
          {bd.running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Fortsetzen</>}
        </button>
        <button type="button" onClick={() => setSummary(bdFinish())} className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Fertig
        </button>
      </div>
    </div>
  );
}
