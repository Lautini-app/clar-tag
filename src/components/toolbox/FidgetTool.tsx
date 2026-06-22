import { useEffect, useRef, useState } from "react";
import { RefreshCw, SkipForward } from "lucide-react";
import { randomExercise, type FidgetExercise } from "@/lib/fidget";
import { rewardAdd } from "@/lib/rewards";
import { sfx } from "@/lib/audio";
import { RingViz } from "./RingViz";

export function FidgetTool({ onClose }: { onClose: () => void }) {
  const [exercise, setExercise] = useState<FidgetExercise>(() => randomExercise());
  const [phase, setPhase] = useState<"pick" | "running" | "done">("pick");
  const [left, setLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExercise = () => {
    setLeft(exercise.duration);
    setPhase("running");
  };

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          sfx.stepDone();
          rewardAdd("fidget");
          setPhase("done");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const reroll = () => {
    setExercise(randomExercise());
    setPhase("pick");
  };

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="text-5xl">💪</div>
        <p className="text-sm font-medium text-foreground">Geschafft! Kurz bewegt, gut gemacht.</p>
        <div className="flex w-full gap-2">
          <button type="button" onClick={reroll} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
            <RefreshCw className="h-4 w-4" /> Nochmal
          </button>
          <button type="button" onClick={onClose} className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Fertig
          </button>
        </div>
      </div>
    );
  }

  if (phase === "running") {
    const pct = exercise.duration > 0 ? left / exercise.duration : 0;
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <span className="text-4xl">{exercise.emoji}</span>
          <h3 className="mt-2 text-base font-semibold text-foreground">{exercise.name}</h3>
        </div>

        <RingViz pct={pct} color="var(--color-primary)" size={120}>
          <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{left}</span>
          <span className="text-xs text-muted-foreground">Sek</span>
        </RingViz>

        <p className="max-w-xs text-center text-sm text-muted-foreground">{exercise.instruction}</p>

        <button type="button" onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); reroll(); }} className="text-sm text-muted-foreground underline">
          Überspringen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="text-center">
        <span className="text-5xl">{exercise.emoji}</span>
        <h3 className="mt-3 text-lg font-semibold text-foreground">{exercise.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{exercise.duration} Sekunden</p>
      </div>

      <p className="max-w-xs text-center text-sm text-muted-foreground">{exercise.instruction}</p>

      <div className="flex w-full gap-2">
        <button type="button" onClick={startExercise} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
          Los geht's
        </button>
        <button type="button" onClick={reroll} className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-border bg-card text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-border bg-card text-muted-foreground">
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
