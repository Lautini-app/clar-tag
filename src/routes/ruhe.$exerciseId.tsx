import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Pause, Play, RotateCcw } from "lucide-react";
import { getAtExercise } from "@/lib/at-exercises";
import { useSettings } from "@/hooks/use-settings";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/ruhe/$exerciseId")({
  component: RuheSession,
});

function RuheSession() {
  const { exerciseId } = useParams({ from: "/ruhe/$exerciseId" });
  const exercise = getAtExercise(exerciseId);
  const { settings } = useSettings();
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const cycleLen = exercise ? exercise.breath.in + exercise.breath.hold + exercise.breath.out : 10;
  const perStep = exercise
    ? Math.max(cycleLen, Math.round((exercise.duration * 60) / exercise.formulas.length))
    : 10;
  const [tick, setTick] = useState(perStep);

  useEffect(() => {
    if (!running || done) return;
    if (tick <= 0) {
      if (!exercise) return;
      if (idx + 1 >= exercise.formulas.length) {
        setDone(true);
        setRunning(false);
        if (settings.audioOn) sfx.workflowDone();
        return;
      }
      setIdx((i) => i + 1);
      setTick(perStep);
      return;
    }
    const id = setTimeout(() => setTick((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [running, tick, idx, done, exercise, perStep, settings.audioOn]);

  if (!exercise) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Übung nicht gefunden.</p>
        <Link to="/ruhe" className="mt-4 inline-block text-primary underline">
          Zurück
        </Link>
      </div>
    );
  }

  const pct = (idx + (perStep - tick) / perStep) / exercise.formulas.length;
  // Atemphase aus persönlichem Muster der Übung
  const inCycle = (perStep - tick) % cycleLen;
  let breathPhase: 0 | 1 | 2 = 0;
  if (inCycle < exercise.breath.in) breathPhase = 0;
  else if (inCycle < exercise.breath.in + exercise.breath.hold) breathPhase = 1;
  else breathPhase = 2;
  const breathLabel = ["Einatmen", "Halten", "Ausatmen"][breathPhase];

  const reset = () => {
    setIdx(0);
    setTick(perStep);
    setDone(false);
    setRunning(false);
  };

  return (
    <div
      className="min-h-screen px-5 pb-10 pt-6"
      style={{ backgroundColor: "var(--color-violet-soft)" }}
    >
      <Link
        to="/ruhe"
        className="inline-flex items-center gap-1 text-sm"
        style={{ color: "var(--color-violet)" }}
      >
        <ChevronLeft className="h-4 w-4" /> Übungen
      </Link>

      <header className="mt-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-violet)" }}>
          {exercise.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{exercise.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Atem: ein {exercise.breath.in}s
          {exercise.breath.hold > 0 ? ` · halten ${exercise.breath.hold}s` : ""}
          {` · aus ${exercise.breath.out}s`}
        </p>
      </header>

      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/50">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, backgroundColor: "var(--color-violet)" }}
        />
      </div>

      <div className="mt-10 grid place-items-center">
        <div
          className="grid h-48 w-48 place-items-center rounded-full transition-all duration-1000"
          style={{
            backgroundColor: "white",
            transform: running
              ? breathPhase === 0
                ? "scale(1.1)"
                : breathPhase === 2
                  ? "scale(0.85)"
                  : "scale(1)"
              : "scale(1)",
            boxShadow: "0 10px 40px -20px rgba(83,74,183,0.4)",
          }}
        >
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {running ? breathLabel : done ? "Geschafft" : "Bereit"}
            </div>
            <div
              className="mt-1 font-mono text-2xl tabular-nums"
              style={{ color: "var(--color-violet)" }}
            >
              {tick}s
            </div>
          </div>
        </div>
      </div>

      <p className="mt-10 min-h-[3rem] text-center text-lg leading-relaxed text-foreground">
        {done ? "Bleibe noch einen Moment ruhig sitzen." : exercise.formulas[idx]}
      </p>

      <div className="mt-8 flex justify-center gap-3">
        {!done ? (
          <button
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--color-violet)" }}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Start"}
          </button>
        ) : (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--color-violet)" }}
          >
            <RotateCcw className="h-4 w-4" /> Nochmal
          </button>
        )}
      </div>
    </div>
  );
}
