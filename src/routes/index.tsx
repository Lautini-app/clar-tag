import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CountdownCard } from "@/components/CountdownCard";
import { useSettings } from "@/hooks/use-settings";
import { useFamily } from "@/hooks/use-family";
import { MemberSwitcher } from "@/components/family/MemberSwitcher";
import { AdminTodayOverview } from "@/components/family/AdminTodayOverview";
import { Calendar, ChevronRight, Compass, ListChecks, Play, Sparkles } from "lucide-react";
import { listSchedules } from "@/lib/schedules.functions";
import { dayBounds, fmtTime, useScheduleViews, type ScheduleView } from "@/lib/schedule-views";
import { getWorkflow } from "@/lib/workflows";
import { listUserWorkflows } from "@/lib/user-workflows.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Today,
});

function Today() {
  const { settings, loaded } = useSettings();
  const { activeMember, stage, toggles } = useFamily();
  const navigate = useNavigate();
  const fetchSchedules = useServerFn(listSchedules);
  const fetchUser = useServerFn(listUserWorkflows);
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
          <div className="clarzeit-big-emoji">{activeMember?.emoji ?? "🌅"}</div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            Hallo {personName}.
          </h1>
        </div>
        {next ? (
          <button
            onClick={() =>
              navigate({ to: "/run/$workflowId", params: { workflowId: next.ref } })
            }
            className="clarzeit-big-button"
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
    <div className="px-5 pb-10 pt-10">
      <MemberSwitcher />
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Heute</div>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">{greeting}</h1>
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
      ) : (
        <div className="rounded-[var(--radius-lg)] bg-card p-5 text-sm text-muted-foreground">
          Heute ist nichts geplant. Starte eine Routine, wenn du magst.
        </div>
      )}

      {views.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Heute geplant
            </h2>
            <Link to="/routinen" className="text-xs text-muted-foreground">
              <Calendar className="inline h-3 w-3" /> Kalender
            </Link>
          </div>
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
                <div className="flex-1 text-sm font-medium text-foreground">{s.name}</div>
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
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 grid gap-2">
        <Link
          to="/routinen"
          className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-4 shadow-sm transition active:scale-[0.99]"
        >
          <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-accent text-accent-foreground">
            <ListChecks className="h-5 w-5" />
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
            className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-4 shadow-sm transition active:scale-[0.99]"
          >
            <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-primary-soft text-primary-deep">
              <Compass className="h-5 w-5" />
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
            className="flex items-center gap-3 rounded-[var(--radius-lg)] p-4 transition active:scale-[0.99]"
            style={{ backgroundColor: "var(--color-violet-soft)" }}
          >
            <div
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] text-white"
              style={{ backgroundColor: "var(--color-violet)" }}
            >
              <Sparkles className="h-5 w-5" />
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
      className="flex w-full items-center gap-4 rounded-[var(--radius-lg)] bg-card p-5 text-left shadow-sm transition active:scale-[0.99]"
    >
      <span className="text-3xl">{next.icon}</span>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Als nächstes</div>
        <div className="text-base font-medium text-foreground">{next.name}</div>
        <div className="text-xs text-muted-foreground">{inLabel}</div>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
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
