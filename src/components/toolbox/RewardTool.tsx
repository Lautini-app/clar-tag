import { useMemo, useSyncExternalStore } from "react";
import { rewardGet, rewardSubscribe, type RewardKind } from "@/lib/rewards";

const MILESTONES = [5, 10, 20, 50];
const MILESTONE_EMOJI = ["⭐", "🌟", "🏆", "💎"];

const LABELS: Record<RewardKind, { emoji: string; label: string }> = {
  routine: { emoji: "✅", label: "Routinen-Schritte" },
  pomodoro: { emoji: "🍅", label: "Pomodoro-Runden" },
  bodyDoubling: { emoji: "🤝", label: "Body-Doubling" },
  fidget: { emoji: "💃", label: "Fidget-Pausen" },
};

export function RewardTool() {
  const rewards = useSyncExternalStore(rewardSubscribe, rewardGet, rewardGet);

  const { total, milestone, next } = useMemo(() => {
    const t = rewards.routine + rewards.pomodoro + rewards.bodyDoubling + rewards.fidget;
    let ms: { emoji: string; count: number } | null = null;
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (t >= MILESTONES[i]) {
        ms = { emoji: MILESTONE_EMOJI[i], count: MILESTONES[i] };
        break;
      }
    }
    let nx = MILESTONES[MILESTONES.length - 1];
    for (const m of MILESTONES) {
      if (t < m) { nx = m; break; }
    }
    return { total: t, milestone: ms, next: nx };
  }, [rewards]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">Punkte heute</p>
        </div>
        {milestone && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <span className="text-lg">{milestone.emoji}</span>
            <span className="text-xs font-medium text-primary">{milestone.count}er Meilenstein!</span>
          </div>
        )}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(100, (total / next) * 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Nächster Meilenstein: {next}</p>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(LABELS) as RewardKind[]).map((kind) => (
          <div key={kind} className="rounded-[var(--radius-lg)] border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{LABELS[kind].emoji}</span>
              <span className="text-xl font-bold tabular-nums text-foreground">{rewards[kind]}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{LABELS[kind].label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
