import { useState, useSyncExternalStore } from "react";
import { Briefcase, Clock, Timer, Users, Trophy, Zap, X, ChevronLeft } from "lucide-react";
import { pomGet, pomSubscribe, type PomState } from "@/lib/pomodoro";
import { transGet, transSubscribe, type TransitionState } from "@/lib/transition-timer";
import { bdGet, bdSubscribe, type BodyDoublingState } from "@/lib/body-doubling";
import { PomodoroTool, PHASE_COLOR, usePom } from "./toolbox/PomodoroTool";
import { TransitionTool, useTrans } from "./toolbox/TransitionTool";
import { BodyDoublingTool, useBd } from "./toolbox/BodyDoublingTool";
import { RewardTool } from "./toolbox/RewardTool";
import { FidgetTool } from "./toolbox/FidgetTool";

type ToolId = "pomodoro" | "transition" | "bodyDoubling" | "rewards" | "fidget";

type ActiveTimerInfo = {
  label: string;
  timeLeft: number;
  totalDuration: number;
  color: string;
} | null;

function useActiveTimer(): ActiveTimerInfo {
  const pom = usePom();
  const trans = useTrans();
  const bd = useBd();

  if (pom.active) {
    return {
      label: "Pomodoro",
      timeLeft: pom.totalLeft,
      totalDuration: pom.totalDuration,
      color: PHASE_COLOR[pom.phase],
    };
  }
  if (trans.active) {
    const pct = trans.totalDuration > 0 ? trans.totalLeft / trans.totalDuration : 0;
    const color = pct >= 0.6 ? "var(--color-primary)" : pct >= 0.35 ? "var(--color-amber)" : pct >= 0.15 ? "var(--color-orange)" : "var(--color-red)";
    return { label: trans.label, timeLeft: trans.totalLeft, totalDuration: trans.totalDuration, color };
  }
  if (bd.active) {
    return { label: "Body Doubling", timeLeft: bd.elapsed, totalDuration: 0, color: "var(--color-primary)" };
  }
  return null;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

const TOOLS: { id: ToolId; icon: React.ElementType; label: string; desc: string }[] = [
  { id: "pomodoro", icon: Timer, label: "Pomodoro", desc: "Fokus-Runden mit Pausen" },
  { id: "transition", icon: Clock, label: "Übergang", desc: "\"Noch X Min bevor...\"" },
  { id: "bodyDoubling", icon: Users, label: "Body Doubling", desc: "Gemeinsam fokussieren" },
  { id: "rewards", icon: Trophy, label: "Belohnungen", desc: "Dein Tages-Score" },
  { id: "fidget", icon: Zap, label: "Fidget-Pause", desc: "Kurze Bewegung zwischendurch" },
];

export function ToolboxFab() {
  const [open, setOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const activeTimer = useActiveTimer();
  const pom = usePom();
  const trans = useTrans();
  const bd = useBd();

  const hasActiveTimer = pom.active || trans.active || bd.active;

  const closeFull = () => {
    setOpen(false);
    setActiveTool(null);
  };

  const openTool = (id: ToolId) => {
    if (id === "pomodoro" && (trans.active || bd.active)) return;
    if (id === "transition" && (pom.active || bd.active)) return;
    if (id === "bodyDoubling" && (pom.active || trans.active)) return;
    setActiveTool(id);
  };

  // FAB — idle
  if (!open && !activeTimer) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ADHS-Toolbox"
        className="fixed bottom-20 right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <Briefcase className="h-5 w-5" />
      </button>
    );
  }

  // FAB — timer running (mini ring)
  if (!open && activeTimer) {
    const isCountdown = activeTimer.totalDuration > 0;
    const pct = isCountdown ? activeTimer.timeLeft / activeTimer.totalDuration : 0;
    const r = 20;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct);

    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (pom.active) setActiveTool("pomodoro");
          else if (trans.active) setActiveTool("transition");
          else if (bd.active) setActiveTool("bodyDoubling");
        }}
        aria-label="Timer öffnen"
        className="fixed bottom-20 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-card shadow-lg ring-1 ring-border transition-transform active:scale-95"
      >
        {isCountdown ? (
          <>
            <svg className="absolute inset-0" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-secondary)" strokeWidth="4" />
              <circle
                cx="28" cy="28" r={r} fill="none"
                stroke={activeTimer.color} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={offset}
                transform="rotate(-90 28 28)"
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
            </svg>
            <span className="relative font-mono text-[10px] font-semibold tabular-nums text-foreground">
              {fmt(activeTimer.timeLeft)}
            </span>
          </>
        ) : (
          <span className="relative font-mono text-[10px] font-semibold tabular-nums text-foreground">
            {fmt(activeTimer.timeLeft)}
          </span>
        )}
      </button>
    );
  }

  // Sheet open
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={closeFull} />
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 animate-in slide-in-from-bottom">
        <div className="max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
          <div className="mb-3 flex items-center justify-between">
            {activeTool ? (
              <button type="button" onClick={() => setActiveTool(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <ChevronLeft className="h-4 w-4" />
                Toolbox
              </button>
            ) : (
              <h2 className="text-sm font-semibold text-foreground">ADHS-Toolbox</h2>
            )}
            <button type="button" onClick={closeFull} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>

          {activeTool === "pomodoro" && <PomodoroTool onClose={closeFull} />}
          {activeTool === "transition" && <TransitionTool onClose={closeFull} />}
          {activeTool === "bodyDoubling" && <BodyDoublingTool onClose={closeFull} />}
          {activeTool === "rewards" && <RewardTool />}
          {activeTool === "fidget" && <FidgetTool onClose={closeFull} />}

          {!activeTool && (
            <div className="grid gap-2">
              {TOOLS.map(({ id, icon: Icon, label, desc }) => {
                const timerConflict =
                  (id === "pomodoro" && (trans.active || bd.active)) ||
                  (id === "transition" && (pom.active || bd.active)) ||
                  (id === "bodyDoubling" && (pom.active || trans.active));
                const isActive =
                  (id === "pomodoro" && pom.active) ||
                  (id === "transition" && trans.active) ||
                  (id === "bodyDoubling" && bd.active);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openTool(id)}
                    disabled={timerConflict}
                    className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : timerConflict
                          ? "border-border bg-secondary/30 opacity-50"
                          : "border-border bg-background hover:border-primary"
                    }`}
                  >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {label}
                        {isActive && <span className="ml-1.5 text-xs text-primary">● aktiv</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
