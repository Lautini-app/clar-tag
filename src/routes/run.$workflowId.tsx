import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { type Grade, type Step } from "@/lib/workflows";
import { useResolvedWorkflow } from "@/lib/workflow-resolver";
import { useSettings } from "@/hooks/use-settings";
import { sfx } from "@/lib/audio";
import { RingTimer } from "@/components/RingTimer";
import { recordCompletion } from "@/lib/completions.functions";
import { markTodayScheduleDone } from "@/lib/schedules.functions";
import { useFamily } from "@/hooks/use-family";
import { setStatus, clearStatus } from "@/lib/member-status";

export const Route = createFileRoute("/run/$workflowId")({
  component: Runner,
});

type Phase = "intro" | "step" | "done";

function Runner() {
  const { workflowId } = useParams({ from: "/run/$workflowId" });
  const { workflow, isUser, isLoading } = useResolvedWorkflow(workflowId);
  const { settings } = useSettings();
  const { activeMember, toggles } = useFamily();
  const navigate = useNavigate();

  const [grade, setGrade] = useState<Grade>("mittel");
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [pauseUntil, setPauseUntil] = useState(0);
  
  const [overrides, setOverrides] = useState<Record<number, number>>({});

  const recordedRef = useRef<string | null>(null);
  const recordFn = useServerFn(recordCompletion);
  const markDoneFn = useServerFn(markTodayScheduleDone);
  const qc = useQueryClient();
  useEffect(() => {
    if (phase !== "done") return;
    const stamp = `${workflowId}-${Date.now()}`;
    if (recordedRef.current === stamp) return;
    recordedRef.current = stamp;
    recordFn({ data: { workflowRef: workflowId } })
      .then(() => qc.invalidateQueries({ queryKey: ["completions"] }))
      .catch((e) => console.error("recordCompletion failed", e));
    markDoneFn({ data: { workflowRef: workflowId } })
      .then(() => qc.invalidateQueries({ queryKey: ["schedules"] }))
      .catch((e) => console.error("markTodayScheduleDone failed", e));
  }, [phase, workflowId, recordFn, markDoneFn, qc]);
  useEffect(() => {
    if (phase === "intro") recordedRef.current = null;
  }, [phase]);

  // Member status tracking (Familienmodus)
  useEffect(() => {
    if (!activeMember || !workflow) return;
    if (phase === "step") {
      const s = workflow.steps[grade];
      setStatus(activeMember.id, {
        workflowRef: workflowId,
        workflowName: workflow.name,
        workflowIcon: workflow.icon,
        stepIdx: idx,
        stepCount: s.length,
        currentStepText: s[idx]?.text ?? "",
      });
    } else if (phase === "done") {
      const s = workflow.steps[grade];
      setStatus(activeMember.id, {
        workflowRef: workflowId,
        workflowName: workflow.name,
        workflowIcon: workflow.icon,
        stepIdx: s.length - 1,
        stepCount: s.length,
        currentStepText: "",
        doneAt: Date.now(),
      });
    }
  }, [phase, idx, grade, activeMember, workflow, workflowId]);

  const sendReady = () => {
    if (!activeMember) return;
    setStatus(activeMember.id, {
      workflowRef: workflowId,
      workflowName: workflow?.name ?? "",
      workflowIcon: workflow?.icon ?? "",
      stepCount: workflow ? workflow.steps[grade].length : 0,
      readyAt: Date.now(),
    });
  };


  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Lädt …</div>;
  }
  if (!workflow) {
    return (
      <div className="p-6">
        <p>Workflow nicht gefunden.</p>
        <Link to="/" className="text-primary underline">
          Zurück
        </Link>
      </div>
    );
  }

  const steps: Step[] = workflow.steps[grade];
  const step = steps[idx];
  const now = Date.now();
  const isPaused = pauseUntil > now;

  const completeStep = () => {
    if (settings.audioOn) sfx.stepDone();
    if (idx + 1 >= steps.length) {
      if (settings.audioOn) sfx.workflowDone();
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
  };

  const briefPause = () => {
    setPauseUntil(Date.now() + 2 * 60 * 1000);
    if (settings.audioOn) sfx.snooze();
  };

  // ───────── INTRO ─────────
  if (phase === "intro") {
    return (
      <div className="px-5 pb-10 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Heute
        </Link>
        <div className="mt-8 text-center">
          <div className="text-5xl">{workflow.icon}</div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">{workflow.name}</h1>
        </div>

        {!isUser && (
          <>
            <h2 className="mt-10 mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Wie detailliert?
            </h2>
            <div className="grid gap-2">
              {(["grob", "mittel", "fein"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`flex items-center justify-between rounded-[var(--radius-lg)] border bg-card p-4 text-left transition ${
                    grade === g ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                >
                  <span className="font-medium capitalize text-foreground">{g}</span>
                  <span className="text-xs text-muted-foreground">
                    {workflow.steps[g].length} Schritte
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => setPhase("step")}
          className="mt-8 w-full rounded-[var(--radius-md)] bg-primary px-4 py-4 text-base font-medium text-primary-foreground"
        >
          Routine starten
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-2 w-full rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm text-foreground"
        >
          Später
        </button>
      </div>
    );
  }

  // (Bus-Check entfernt — ist jetzt ein normaler Schritt innerhalb der Routine)

  // ───────── DONE ─────────
  if (phase === "done") {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <div className="text-6xl">🎉</div>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Geschafft!</h1>
          <p className="mt-2 text-sm text-muted-foreground">{workflow.name}</p>
          <div className="mt-8 flex flex-col gap-2">
            {activeMember && toggles?.readySignal && (
              <button
                onClick={sendReady}
                className="rounded-[var(--radius-md)] px-6 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--color-violet)" }}
              >
                Bereit-Signal an Admin senden
              </button>
            )}
            <button
              onClick={() => {
                if (activeMember) clearStatus(activeMember.id);
                setIdx(0);
                setPhase("intro");
              }}
              className="rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Nochmal
            </button>
            <Link
              to="/"
              className="rounded-[var(--radius-md)] border border-border bg-card px-6 py-3 text-sm text-foreground"
            >
              Zurück zu Heute
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ───────── STEP ─────────
  const stepDuration = overrides[idx] ?? step.duration;
  const pct = (idx + 1) / steps.length;

  return (
    <div className="flex min-h-screen flex-col px-5 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Abbrechen
        </Link>
      </div>

      {stepDuration > 0 && (
        <div className="mt-4">
          <RingTimer
            minutes={stepDuration}
            audioOn={settings.audioOn}
            style={settings.countdownStyle}
            onChangeMinutes={(m) => setOverrides((o) => ({ ...o, [idx]: m }))}
          />
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((idx + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
          {idx + 1} von {steps.length}
        </span>
      </div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-7xl">{step.emoji}</div>
        <h1 className="mt-6 text-3xl font-semibold leading-tight text-foreground">
          {step.text}
        </h1>
        {step.hint && (
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{step.hint}</p>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all ${
              i === idx
                ? "h-2 w-6 bg-primary"
                : i < idx
                  ? "h-2 w-2 bg-primary"
                  : "h-2 w-2 bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {isPaused ? (
          <>
            <button
              disabled
              className="rounded-[var(--radius-md)] bg-primary px-4 py-4 text-base font-medium text-primary-foreground opacity-50"
            >
              Kurze Pause läuft …
            </button>
            <button
              onClick={() => setPauseUntil(0)}
              className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
            >
              Weiter
            </button>
          </>
        ) : (
          <>
            <button
              onClick={completeStep}
              className="rounded-[var(--radius-md)] bg-primary px-4 py-4 text-base font-medium text-primary-foreground"
            >
              Erledigt
            </button>
            <button
              onClick={briefPause}
              className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              Kurze Pause · 2 min
            </button>
          </>
        )}
      </div>
    </div>
  );
}
