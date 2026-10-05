import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Plus, Repeat, Trash2 } from "lucide-react";
import { categoryMeta, workflows } from "@/lib/workflows";
import {
  benutzteSchluessel,
  grundRoutinen,
  meineListe,
  type MeineZeile,
} from "@/lib/meine-routinen";
import { listCompletions } from "@/lib/completions.functions";
import { listUserWorkflows } from "@/lib/user-workflows.functions";
import { listLibraryRoutines, type LibraryRoutine } from "@/lib/library.functions";
import { ImportRoutineButton } from "@/components/ImportRoutineDialog";
import { deleteSchedule, listSchedules } from "@/lib/schedules.functions";
import { dayBounds, fmtTime, useScheduleViews, weekBounds } from "@/lib/schedule-views";
import { useAuth } from "@/hooks/use-auth";
import { listRecurrences, deleteRecurrence } from "@/lib/recurrence.functions";
import { formatRecurrenceSummary } from "@/lib/recurrence";

export const Route = createFileRoute("/routinen")({
  component: Routinen,
});

function Routinen() {
  const location = useLocation();
  const [tab, setTab] = useState<"meine" | "bibliothek" | "kalender">("meine");
  const fetchUserWorkflows = useServerFn(listUserWorkflows);
  const { user } = useAuth();
  const { data: userWorkflows = [] } = useQuery({
    queryKey: ["user-workflows"],
    queryFn: () => fetchUserWorkflows(),
    enabled: !!user,
  });

  // Was ist in Gebrauch? Wiederholungen, Termine der nächsten 14 Tage und
  // Durchgänge der letzten 30 Tage. Schlägt eine Abfrage fehl, fehlt nur
  // diese Quelle — die Routine steht dann weiterhin in der Bibliothek.
  const fetchRecurrences = useServerFn(listRecurrences);
  const fetchSchedules = useServerFn(listSchedules);
  const fetchCompletions = useServerFn(listCompletions);
  const zeitraum = useMemo(() => {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const tage = (n: number) => {
      const d = new Date(heute);
      d.setDate(d.getDate() + n);
      return d.toISOString();
    };
    return { heute: tage(0), in14: tage(14), vor30: tage(-30), morgen: tage(1) };
  }, []);
  const { data: recurrences } = useQuery({
    queryKey: ["recurrences"],
    queryFn: () => fetchRecurrences({}),
    enabled: !!user,
  });
  const { data: geplant } = useQuery({
    queryKey: ["schedules", "naechste14", zeitraum.heute],
    queryFn: () => fetchSchedules({ data: { from: zeitraum.heute, to: zeitraum.in14 } }),
    enabled: !!user,
  });
  const { data: gemacht } = useQuery({
    queryKey: ["completions", "letzte30", zeitraum.vor30],
    queryFn: () => fetchCompletions({ data: { from: zeitraum.vor30, to: zeitraum.morgen } }),
    enabled: !!user,
  });

  if (location.pathname !== "/routinen") {
    return <Outlet />;
  }

  // «Meine Routinen»: eigene plus mitgelieferte, die in Gebrauch sind.
  const rubriken = meineListe(
    workflows,
    userWorkflows,
    benutzteSchluessel(recurrences, geplant, gemacht),
  );

  return (
    <div className="px-5 pb-10 pt-10">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Routinen</div>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">Deine Abläufe</h1>
        </div>
        <div className="flex items-center gap-2">
          <ImportRoutineButton />
          <Link
            to="/routinen/neu"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Neu
          </Link>
        </div>
      </header>

      <div className="mb-6 inline-flex rounded-[var(--radius-md)] bg-secondary p-1">
        {(
          [
            ["meine", "Meine Routinen"],
            ["bibliothek", "Bibliothek"],
            ["kalender", "Kalender"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "meine" ? (
        rubriken.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] bg-card p-6 text-sm text-muted-foreground">
            <p>
              Hier stehen deine eigenen Routinen und alle, die du eingeplant oder kürzlich gemacht
              hast.
            </p>
            <button
              type="button"
              onClick={() => setTab("bibliothek")}
              className="mt-4 inline-flex min-h-9 items-center rounded-full border border-border bg-background px-3.5 text-[13px] font-medium text-foreground"
            >
              Zur Bibliothek
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rubriken.map(({ cat, items }) => (
              <RubrikListe key={cat} cat={cat} items={items} />
            ))}
            <button
              type="button"
              onClick={() => setTab("bibliothek")}
              className="px-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Weitere Vorlagen in der Bibliothek
            </button>
          </div>
        )
      ) : tab === "bibliothek" ? (
        <div className="space-y-5">
          <div className="space-y-4">
            {grundRoutinen(workflows).map(({ cat, items }) => (
              <RubrikListe key={cat} cat={cat} items={items} />
            ))}
          </div>
          <LibraryList />
        </div>
      ) : (
        <CalendarView />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bibliothek — Karten, gruppiert nach Kategorie
// ─────────────────────────────────────────────────────────────────────────────

/** Eine Rubrik mit ihren Routinen — für «Meine Routinen» und die Bibliothek. */
function RubrikListe({ cat, items }: { cat: keyof typeof categoryMeta; items: MeineZeile[] }) {
  const meta = categoryMeta[cat];
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="text-base">{meta.icon}</span>
        {meta.label}
        <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
      </h2>
      <ul className="grid gap-1 rounded-[var(--radius-lg)] bg-card p-2">
        {items.map((w) => (
          <li key={w.id}>
            <Link
              to="/routinen/$workflowId"
              params={{ workflowId: w.id }}
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 transition active:scale-[0.99]"
            >
              <span className="text-xl">{w.icon}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{w.name}</span>
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
    </section>
  );
}

const LIBRARY_CATEGORY_ORDER: string[] = [
  "gesundheit",
  "soziales",
  "vorbereitung",
  "reisen",
  "uebergang",
  "pflichten",
  "saisonal",
  "hobby_outdoor",
];

function libraryCategoryMeta(cat: string): { label: string; icon: string } {
  const known = (categoryMeta as Record<string, { label: string; icon: string } | undefined>)[cat];
  if (known) return known;
  return { label: cat, icon: "✨" };
}

function gradeLabel(g: LibraryRoutine["default_grade"]): string {
  return g === "grob" ? "Grob" : g === "fein" ? "Fein" : "Mittel";
}

function LibraryList() {
  const { user } = useAuth();
  const fetchLibrary = useServerFn(listLibraryRoutines);
  const {
    data: routines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["library-routines"],
    queryFn: () => fetchLibrary(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <p className="rounded-[var(--radius-lg)] bg-card p-6 text-sm text-muted-foreground">
        Bibliothek wird geladen …
      </p>
    );
  }
  if (error) {
    return (
      <p className="rounded-[var(--radius-lg)] bg-card p-6 text-sm text-destructive">
        Bibliothek konnte nicht geladen werden.
      </p>
    );
  }
  if (routines.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] bg-card p-6 text-center text-sm text-muted-foreground">
        <BookOpen className="mx-auto mb-2 h-6 w-6" />
        Noch keine Bibliotheks-Routinen.
      </div>
    );
  }

  const byCat = new Map<string, LibraryRoutine[]>();
  for (const r of routines) {
    const arr = byCat.get(r.category) ?? [];
    arr.push(r);
    byCat.set(r.category, arr);
  }
  const cats = [
    ...LIBRARY_CATEGORY_ORDER.filter((c) => byCat.has(c)),
    ...[...byCat.keys()].filter((c) => !LIBRARY_CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="space-y-5">
      {cats.map((cat) => {
        const meta = libraryCategoryMeta(cat);
        const items = byCat.get(cat) ?? [];
        return (
          <section key={cat}>
            <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="text-base">{meta.icon}</span>
              {meta.label}
              <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((r) => {
                const stepCount =
                  r.default_grade === "grob"
                    ? r.steps_grob.length
                    : r.default_grade === "fein"
                      ? r.steps_fein.length
                      : r.steps_mittel.length;
                return (
                  <li key={r.id}>
                    <Link
                      to="/routinen/bibliothek/$slug"
                      params={{ slug: r.slug }}
                      className="flex h-full items-start gap-3 rounded-[var(--radius-lg)] bg-card p-3 shadow-sm transition active:scale-[0.99]"
                    >
                      <span className="text-3xl">{r.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                            {meta.label}
                          </span>
                          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-deep">
                            {gradeLabel(r.default_grade)}
                          </span>
                          <span className="text-muted-foreground/70">{stepCount} Schritte</span>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
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
        {recurrences
          .filter((r) => r.recurrence_type !== "once")
          .map((r) => (
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
