import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ChevronLeft, Flame } from "lucide-react";
import { listCompletions, type Completion } from "@/lib/completions.functions";
import { listUserWorkflows } from "@/lib/user-workflows.functions";
import { getWorkflow } from "@/lib/workflows";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/statistiken")({
  component: Statistiken,
});

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const PERIOD_DAYS = 28;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function Statistiken() {
  const fetchCompletions = useServerFn(listCompletions);
  const fetchUserWorkflows = useServerFn(listUserWorkflows);
  const { user } = useAuth();

  const range = useMemo(() => {
    const end = startOfDay(new Date());
    end.setDate(end.getDate() + 1);
    const start = new Date(end);
    start.setDate(start.getDate() - PERIOD_DAYS);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);

  const { data: completions = [] } = useQuery({
    queryKey: ["completions", range.from],
    queryFn: () => fetchCompletions({ data: range }),
    enabled: !!user,
  });
  const { data: userWorkflows = [] } = useQuery({
    queryKey: ["user-workflows"],
    queryFn: () => fetchUserWorkflows(),
    enabled: !!user,
  });

  // group by day key (last 7 days)
  const today = startOfDay(new Date());
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const countsPerDay = last7.map(
    (d) =>
      completions.filter(
        (c) => startOfDay(new Date(c.completed_at)).getTime() === d.getTime(),
      ).length,
  );
  const maxCount = Math.max(1, ...countsPerDay);

  // streak: consecutive days ending today with ≥1 completion. Today counts even if 0.
  const completionDays = new Set(
    completions.map((c) => startOfDay(new Date(c.completed_at)).getTime()),
  );
  let streak = 0;
  {
    const d = new Date(today);
    // if today is empty, start streak from yesterday
    if (!completionDays.has(d.getTime())) d.setDate(d.getDate() - 1);
    while (completionDays.has(d.getTime())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
  }

  // per-routine counts (period)
  const perRoutine = aggregateByRoutine(completions, userWorkflows);

  const totalWeek = countsPerDay.reduce((a, b) => a + b, 0);

  return (
    <div className="px-5 pb-10 pt-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Heute
      </Link>
      <header className="mt-4 mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Statistik</div>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Dein Verlauf</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-lg)] bg-card p-4">
          <div className="text-xs text-muted-foreground">Diese Woche</div>
          <div className="mt-1 text-3xl font-semibold text-foreground">{totalWeek}</div>
          <div className="text-xs text-muted-foreground">Routinen</div>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-card p-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3 w-3" /> Streak
          </div>
          <div className="mt-1 text-3xl font-semibold text-foreground">{streak}</div>
          <div className="text-xs text-muted-foreground">
            {streak === 1 ? "Tag" : "Tage"} in Folge
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-[var(--radius-lg)] bg-card p-4">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Letzte 7 Tage
        </h2>
        <div className="flex items-end gap-2" style={{ height: 120 }}>
          {countsPerDay.map((c, i) => {
            const h = (c / maxCount) * 100;
            const isToday = i === 6;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="text-[10px] tabular-nums text-muted-foreground">
                  {c > 0 ? c : ""}
                </div>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      c === 0
                        ? "bg-secondary"
                        : isToday
                          ? "bg-primary"
                          : "bg-primary/60"
                    }`}
                    style={{ height: `${Math.max(c === 0 ? 4 : 8, h)}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground">{DAYS[(last7[i].getDay() + 6) % 7]}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Letzte 4 Wochen pro Routine
        </h2>
        {perRoutine.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] bg-card p-6 text-center text-sm text-muted-foreground">
            Noch keine abgeschlossenen Routinen.
          </div>
        ) : (
          <ul className="grid gap-2">
            {perRoutine.map((r) => (
              <li
                key={r.key}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-3"
              >
                <span className="text-xl">{r.icon}</span>
                <div className="flex-1 text-sm font-medium text-foreground">{r.name}</div>
                <div className="text-sm font-mono tabular-nums text-muted-foreground">
                  {r.count}×
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type RoutineAgg = { key: string; name: string; icon: string; count: number };

function aggregateByRoutine(
  completions: Completion[],
  userWorkflows: Array<{ id: string; name: string; icon: string | null }>,
): RoutineAgg[] {
  const map = new Map<string, RoutineAgg>();
  for (const c of completions) {
    const key = c.workflow_id ?? `key:${c.workflow_key ?? "unknown"}`;
    let agg = map.get(key);
    if (!agg) {
      if (c.workflow_id) {
        const u = userWorkflows.find((w) => w.id === c.workflow_id);
        agg = {
          key,
          name: u?.name ?? "Eigene Routine",
          icon: u?.icon || "✏️",
          count: 0,
        };
      } else {
        const w = getWorkflow(c.workflow_key ?? "");
        agg = {
          key,
          name: w?.name ?? "Routine",
          icon: w?.icon ?? "📋",
          count: 0,
        };
      }
      map.set(key, agg);
    }
    agg.count++;
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}
