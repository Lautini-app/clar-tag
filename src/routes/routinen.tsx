import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronRight, Plus, Repeat, Trash2 } from "lucide-react";
import { categoryMeta, workflowsByCategory, type Category } from "@/lib/workflows";
import { listUserWorkflows } from "@/lib/user-workflows.functions";
import { deleteSchedule, listSchedules } from "@/lib/schedules.functions";
import { dayBounds, fmtTime, useScheduleViews, weekBounds } from "@/lib/schedule-views";
import { useAuth } from "@/hooks/use-auth";
import { listRecurrences, deleteRecurrence } from "@/lib/recurrence.functions";
import { formatRecurrenceSummary } from "@/lib/recurrence";

export const Route = createFileRoute("/routinen")({
  component: Routinen,
});

type ListItem = {
  id: string;
  name: string;
  icon: string;
  isUser: boolean;
};

function Routinen() {
  const location = useLocation();
  const [tab, setTab] = useState<"liste" | "kalender">("liste");
  const byCat = workflowsByCategory();
  const order: Category[] = [
    "morgen",
    "abend",
    "vorbereitung",
    "lernen",
    "gesundheit",
    "soziales",
    "reisen",
    "uebergang",
    "pflichten",
    "saisonal",
    "hobby_outdoor",
    "eigene",
  ];

  const fetchUserWorkflows = useServerFn(listUserWorkflows);
  const { user } = useAuth();
  const { data: userWorkflows = [] } = useQuery({
    queryKey: ["user-workflows"],
    queryFn: () => fetchUserWorkflows(),
    enabled: !!user,
  });

  if (location.pathname !== "/routinen") {
    return <Outlet />;
  }

  const combined: Record<Category, ListItem[]> = {
    morgen: [],
    abend: [],
    vorbereitung: [],
    lernen: [],
    gesundheit: [],
    soziales: [],
    reisen: [],
    uebergang: [],
    pflichten: [],
    saisonal: [],
    hobby_outdoor: [],
    eigene: [],
  };
  for (const c of order) {
    combined[c] = byCat[c].map((w) => ({ id: w.id, name: w.name, icon: w.icon, isUser: false }));
  }
  for (const w of userWorkflows) {
    combined[w.category].push({
      id: w.id,
      name: w.name,
      icon: w.icon || "✏️",
      isUser: true,
    });
  }

  return (
    <div className="px-5 pb-10 pt-10">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Routinen</div>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">Deine Abläufe</h1>
        </div>
        <Link
          to="/routinen/neu"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Neu
        </Link>
      </header>

      <div className="mb-6 inline-flex rounded-[var(--radius-md)] bg-secondary p-1">
        {(["liste", "kalender"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium capitalize transition ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t === "liste" ? "Routinen" : "Kalender"}
          </button>
        ))}
      </div>

      {tab === "liste" ? (
        <div className="space-y-4">
          {order.map((cat) => {
            const meta = categoryMeta[cat];
            const items = combined[cat];
            return (
              <section key={cat}>
                <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span className="text-base">{meta.icon}</span>
                  {meta.label}
                  <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
                </h2>
                {items.length === 0 ? (
                  <p className="rounded-[var(--radius-md)] bg-card px-4 py-3 text-sm text-muted-foreground">
                    Noch keine Routinen.
                  </p>
                ) : (
                  <ul className="grid gap-1 rounded-[var(--radius-lg)] bg-card p-2">
                    {items.map((w) => (
                      <li key={w.id}>
                        <Link
                          to="/routinen/$workflowId"
                          params={{ workflowId: w.id }}
                          className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 transition active:scale-[0.99]"
                        >
                          <span className="text-xl">{w.icon}</span>
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {w.name}
                          </span>
                          {w.isUser && (
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              eigene
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <CalendarView />
      )}
    </div>
  );
}

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function CalendarView() {
  const [view, setView] = useState<"heute" | "woche">("heute");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchSchedules = useServerFn(listSchedules);
  const removeSchedule = useServerFn(deleteSchedule);
  const fetchRecurrences = useServerFn(listRecurrences);
  const removeRecurrence = useServerFn(deleteRecurrence);
  const { user } = useAuth();

  const now = useMemo(() => new Date(), []);
  const range = view === "heute" ? dayBounds(now) : weekBounds(now);

  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules", view, range.from],
    queryFn: () => fetchSchedules({ data: range }),
    enabled: !!user,
  });
  const { views } = useScheduleViews(schedules);
  const { data: recurrences = [] } = useQuery({
    queryKey: ["recurrences"],
    queryFn: () => fetchRecurrences({}),
    enabled: !!user,
  });

  async function onDelete(id: string) {
    await removeSchedule({ data: { id } });
    qc.invalidateQueries({ queryKey: ["schedules"] });
  }

  async function onDeleteRecurrence(id: string) {
    await removeRecurrence({ data: { id } });
    qc.invalidateQueries({ queryKey: ["recurrences"] });
    qc.invalidateQueries({ queryKey: ["schedules"] });
  }

  const recurrenceSection = recurrences.length > 0 && (
    <section className="mt-6">
      <h2 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Repeat className="h-3.5 w-3.5" />
        Wiederholungen
      </h2>
      <ul className="grid gap-2">
        {recurrences.filter((r) => r.recurrence_type !== "once").map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-3"
          >
            <div className="flex-1 text-sm text-foreground">
              {formatRecurrenceSummary(r, r.workflow_key ?? "Routine")}
            </div>
            <button
              onClick={() => onDeleteRecurrence(r.id)}
              className="rounded-md p-1 text-muted-foreground hover:text-destructive"
              aria-label="Wiederholung löschen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

  if (view === "heute") {
    return (
      <div>
        <ViewToggle view={view} setView={setView} />
        {views.length === 0 ? (
          <EmptyState text="Heute ist nichts geplant." />
        ) : (
          <ul className="grid gap-2">
            {views.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-3"
              >
                <div className="w-12 font-mono text-xs tabular-nums text-muted-foreground">
                  {fmtTime(s.scheduled_at)}
                </div>
                <span className="text-xl">{s.icon}</span>
                <button
                  onClick={() =>
                    navigate({
                      to: "/routinen/$workflowId",
                      params: { workflowId: s.ref },
                    })
                  }
                  className="flex-1 text-left text-sm font-medium text-foreground"
                >
                  {s.name}
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Termin löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {recurrenceSection}
      </div>
    );
  }

  // week
  const start = new Date(range.from);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const byDay = days.map((d) => {
    const key = d.toDateString();
    return {
      date: d,
      items: views.filter((v) => new Date(v.scheduled_at).toDateString() === key),
    };
  });

  return (
    <div>
      <ViewToggle view={view} setView={setView} />
      <div className="grid gap-2">
        {byDay.map((col, i) => (
          <div key={i} className="rounded-[var(--radius-lg)] bg-card p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                {DAYS[i]} · {col.date.getDate()}.{col.date.getMonth() + 1}.
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {col.items.length === 0 ? "frei" : `${col.items.length}`}
              </div>
            </div>
            {col.items.length > 0 && (
              <ul className="grid gap-1">
                {col.items.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="w-10 font-mono text-xs tabular-nums text-muted-foreground">
                      {fmtTime(s.scheduled_at)}
                    </span>
                    <span>{s.icon}</span>
                    <button
                      onClick={() =>
                        navigate({
                          to: "/routinen/$workflowId",
                          params: { workflowId: s.ref },
                        })
                      }
                      className="flex-1 truncate text-left text-foreground"
                    >
                      {s.name}
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Termin löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {recurrenceSection}
    </div>
  );
}

function ViewToggle({
  view,
  setView,
}: {
  view: "heute" | "woche";
  setView: (v: "heute" | "woche") => void;
}) {
  return (
    <div className="mb-4 inline-flex rounded-[var(--radius-md)] bg-secondary p-1">
      {(["heute", "woche"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setView(t)}
          className={`rounded-[var(--radius-sm)] px-3 py-1 text-xs font-medium capitalize transition ${
            view === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-card p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
