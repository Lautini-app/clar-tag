import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { CountdownCard } from "@/components/CountdownCard";
import { useSettings } from "@/hooks/use-settings";
import { useFamily } from "@/hooks/use-family";
import { MemberSwitcher } from "@/components/family/MemberSwitcher";
import { AdminTodayOverview } from "@/components/family/AdminTodayOverview";
import { Calendar, ChevronRight, Compass, ListChecks, Play, SkipForward, Sparkles } from "lucide-react";
import { listSchedules, updateScheduleStatus } from "@/lib/schedules.functions";
import { dayBounds, fmtTime, useScheduleViews, type ScheduleView } from "@/lib/schedule-views";
import { getWorkflow } from "@/lib/workflows";
import { listUserWorkflows } from "@/lib/user-workflows.functions";
import { useAuth } from "@/hooks/use-auth";
import { extendRecurrenceSchedules } from "@/lib/recurrence.functions";

export const Route = createFileRoute("/")({
  component: Today,
});

function Today() {
  const { settings, loaded } = useSettings();
  const { activeMember, stage, toggles } = useFamily();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchSchedules = useServerFn(listSchedules);
  const fetchUser = useServerFn(listUserWorkflows);
  const extendRec = useServerFn(extendRecurrenceSchedules);
  const skipFn = useServerFn(updateScheduleStatus);
  const { user } = useAuth();
  const range = useMemo(() => dayBounds(new Date()), []);
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules", "heute", range.from],
    queryFn: () => fetchSchedules({ data: range }),
    enabled: !!user,
  });
  const { data: userList = [] } = useQuery({
    queryKey: ["user-workflows"],
    queryFn: () => fetchUser(),
    enabled: !!user,
  });
  const { views } = useScheduleViews(schedules);

  useEffect(() => {
    if (!user) return;
    extendRec({}).catch((e) => console.error("extendRecurrenceSchedules failed", e));
  }, [user, extendRec]);

  if (!loaded) return null;

  const personName = activeMember?.name ?? settings.name;
  const greeting = greetingFor(new Date(), personName);

  // Upcoming = scheduled in the future today, sorted ascending
  const upcoming = views
    .filter((s) => new Date(s.scheduled_at).getTime() > Date.now())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const next = upcoming[0];

  const busInfo = next ? findBusContext(next, userList) : null;

  // Stufe 1: extrem vereinfachte Ansicht – ein grosses Emoji, ein grosser Button
  if (stage === "begleitet") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10 text-center">
        <div>
          <div className="clartag-big-emoji">{activeMember?.emoji ?? "🌅"}</div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            Hallo {personName}.
          </h1>
        </div>
        {next ? (
          <button
            onClick={() =>
              navigate({ to: "/run/$workflowId", params: { workflowId: next.ref } })
            }
            className="clartag-big-button"
          >
            <span className="text-3xl">{next.icon}</span>
            <span>{next.name} starten</span>
          </button>
        ) : (
          <p className="text-base text-muted-foreground">Heute steht nichts an.</p>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 pt-5">
      <MemberSwitcher />
      <header className="mb-4">
        <div className="text-[13px] font-medium tracking-[0.02em] text-primary">clar·tag</div>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">Mein Tag</h1>
        <p className="mt-1 text-sm text-muted-foreground">{greeting}</p>
      </header>

      <AdminTodayOverview />


      {busInfo ? (
        <CountdownCard
          totalMinutes={Math.max(1, busInfo.minutesUntil)}
          label={`Bis ${busInfo.label}`}
          style={settings.countdownStyle}
          audioOn={settings.audioOn}
        />
      ) : next ? (
        <NextRoutineCard next={next} onStart={() =>
          navigate({ to: "/run/$workflowId", params: { workflowId: next.ref } })
        } />
      ) : views.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] bg-card px-3.5 py-3 text-sm text-muted-foreground shadow-xs">
          Heute ist nichts geplant. Starte eine Routine, wenn du magst.
        </div>
      ) : null}

      {views.length > 0 && (
        <section className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <h2 className="text-[11px] font-medium text-muted-foreground">
              Heute geplant
            </h2>
            <Link to="/routinen" className="text-[11px] text-muted-foreground">
              <Calendar className="inline h-3 w-3" /> Kalender
            </Link>
          </div>
          <ul className="grid gap-1.5">
            {views.map((s) => (
              <li
                key={s.id}
                className={`flex items-center gap-2.5 rounded-[var(--radius-lg)] bg-card px-2.5 py-2 shadow-xs ${
                  s.status !== "planned" ? "opacity-50" : ""
                }`}
              >
                <div className="w-11 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {fmtTime(s.scheduled_at)}
                </div>
                <span className="text-base leading-none">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{s.name}</div>
                  {s.status === "done" && (
                    <div className="text-[11px] text-primary">Erledigt ✓</div>
                  )}
                  {s.status === "skipped" && (
                    <div className="text-[11px] text-muted-foreground">Übersprungen</div>
                  )}
                </div>
                {s.status === "planned" && (
                  <>
                    <button
                      onClick={async () => {
                        await skipFn({ data: { id: s.id, status: "skipped" } });
                        qc.invalidateQueries({ queryKey: ["schedules"] });
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground"
                      aria-label="Überspringen"
                      title="Überspringen"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        navigate({
                          to: "/run/$workflowId",
                          params: { workflowId: s.ref },
                        })
                      }
                      className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"
                      aria-label="Starten"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-5 grid gap-1.5">
        <Link
          to="/routinen"
          className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-3 shadow-sm transition active:scale-[0.99]"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary-soft text-primary-deep">
            <ListChecks className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-foreground">Routine starten</div>
            <div className="text-xs text-muted-foreground">Morgen · Abend · Lernen …</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>

        {(!toggles || toggles.decide) && (
          <Link
            to="/entscheiden"
            className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-3 shadow-sm transition active:scale-[0.99]"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary-soft text-primary-deep">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">Entscheiden</div>
              <div className="text-xs text-muted-foreground">3 Fragen → 1 Vorschlag</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        {(!toggles || toggles.at) && (
          <Link
            to="/ruhe"
            className="flex items-center gap-3 rounded-[var(--radius-lg)] p-3 shadow-sm transition active:scale-[0.99]"
            style={{ backgroundColor: "var(--color-violet-soft)" }}
          >
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] text-white"
              style={{ backgroundColor: "var(--color-violet)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium" style={{ color: "var(--color-violet)" }}>
                Ruhe · AT
              </div>
              <div className="text-xs text-muted-foreground">Kurz zur Ruhe kommen</div>
            </div>
            <ChevronRight className="h-5 w-5" style={{ color: "var(--color-violet)" }} />
          </Link>
        )}
      </section>
    </div>
  );
}

function NextRoutineCard({ next, onStart }: { next: ScheduleView; onStart: () => void }) {
  const ms = new Date(next.scheduled_at).getTime() - Date.now();
  const minutes = Math.round(ms / 60000);
  const inLabel =
    minutes < 60
      ? `in ${minutes} min`
      : `um ${fmtTime(next.scheduled_at)}`;
  return (
    <button
      onClick={onStart}
      className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-card p-3 text-left shadow-sm transition active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-primary-soft text-lg leading-none">
        {next.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-muted-foreground">Als nächstes</div>
        <div className="truncate text-sm font-medium text-foreground">{next.name}</div>
        <div className="text-[11px] text-muted-foreground">{inLabel}</div>
      </div>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Play className="h-4 w-4" />
      </div>
    </button>
  );
}

// Detect if next routine contains a "bus"-like step → show countdown to departure
function findBusContext(
  next: ScheduleView,
  userList: Array<{ id: string; name: string; steps: { mittel: { text: string }[] } | unknown }>
): { minutesUntil: number; label: string } | null {
  const startMs = new Date(next.scheduled_at).getTime();
  const now = Date.now();
  if (startMs <= now) return null;

  // Get steps
  let steps: { text: string; duration: number }[] | null = null;
  if (next.workflow_id) {
    const u = userList.find((w) => w.id === next.workflow_id) as
      | { steps?: { text: string; duration: number }[] }
      | undefined;
    if (u && Array.isArray(u.steps)) steps = u.steps;
  } else if (next.workflow_key) {
    const w = getWorkflow(next.workflow_key);
    if (w) steps = w.steps.mittel;
  }
  if (!steps) return null;

  const busIdx = steps.findIndex((s) => /bus|tram|zug|abfahrt|haltestelle/i.test(s.text));
  if (busIdx === -1) return null;

  // Departure ≈ start + sum of durations up to and including the bus step
  const minutesIntoRoutine = steps
    .slice(0, busIdx + 1)
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  const departureMs = startMs + minutesIntoRoutine * 60_000;
  const minutesUntil = Math.round((departureMs - now) / 60_000);
  if (minutesUntil <= 0 || minutesUntil > 180) return null;
  return { minutesUntil, label: "Abfahrt" };
}

function greetingFor(d: Date, name: string) {
  const h = d.getHours();
  const who = name ? `, ${name}` : "";
  if (h < 11) return `Guten Morgen${who}.`;
  if (h < 17) return `Hallo${who}.`;
  if (h < 22) return `Guten Abend${who}.`;
  return `Gute Nacht${who}.`;
}
