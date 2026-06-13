import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CopyPlus, Pencil, Play } from "lucide-react";
import { type Grade } from "@/lib/workflows";
import { useResolvedWorkflow } from "@/lib/workflow-resolver";
import { Button } from "@/components/ui/button";
import { SchedulePlanner } from "@/components/SchedulePlanner";

export const Route = createFileRoute("/routinen/$workflowId")({
  component: Detail,
});

const GRADES: { id: Grade; label: string; desc: string }[] = [
  { id: "grob", label: "Grob", desc: "Wenige grosse Schritte" },
  { id: "mittel", label: "Mittel", desc: "Ausgewogen" },
  { id: "fein", label: "Fein", desc: "Viele kleine Schritte" },
];

function Detail() {
  const { workflowId } = Route.useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { workflow: w, isUser, isLoading } = useResolvedWorkflow(workflowId);
  const [grade, setGrade] = useState<Grade>("mittel");

  if (location.pathname.endsWith("/bearbeiten")) {
    return <Outlet />;
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Lädt …</div>;
  }
  if (!w) {
    return (
      <div className="px-5 pt-10">
        <p>Routine nicht gefunden.</p>
        <Link to="/routinen" className="mt-4 inline-block text-primary underline">
          Zurück
        </Link>
      </div>
    );
  }

  const steps = w.steps[grade];
  const total = steps.reduce((s, x) => s + x.duration, 0);

  return (
    <div className="px-5 pb-10 pt-6">
      <button
        onClick={() => navigate({ to: "/routinen" })}
        className="mb-4 -ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Routinen
      </button>

      <header className="mb-6 flex items-start gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] bg-accent text-3xl">
          {w.icon}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{w.name}</h1>
          <p className="text-sm text-muted-foreground">
            {steps.length} Schritte · ca. {total} min
          </p>
        </div>
      </header>

      {!isUser && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Feinheitsgrad
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGrade(g.id)}
                className={`rounded-[var(--radius-md)] border p-3 text-left transition ${
                  grade === g.id ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <div className="text-sm font-medium text-foreground">{g.label}</div>
                <div className="text-[11px] text-muted-foreground">{g.desc}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6 rounded-[var(--radius-lg)] bg-card p-4">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Schritte
        </h2>
        <ul className="grid gap-1">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-3 py-1.5 text-sm">
              <span className="w-5 text-right font-mono text-xs text-muted-foreground">
                {i + 1}.
              </span>
              <span className="text-lg">{s.emoji}</span>
              <span className="flex-1 text-foreground">{s.text}</span>
              {s.duration > 0 && (
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {s.duration} min
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-2">
        {!isUser && (
          <Button
            variant="outline"
            onClick={() =>
              navigate({
                to: "/routinen/neu",
                search: { basis: w.id, grad: grade },
              })
            }
            className="h-11"
          >
            <CopyPlus className="h-4 w-4" />
            Als eigene Routine speichern
          </Button>
        )}
        <Button
          size="lg"
          onClick={() =>
            navigate({
              to: "/run/$workflowId",
              params: { workflowId: w.id },
            })
          }
          className="h-12"
        >
          <Play className="h-4 w-4" />
          Starten
        </Button>
        {isUser ? (
          <Button
            variant="outline"
            onClick={() =>
              navigate({
                to: "/routinen/$workflowId/bearbeiten",
                params: { workflowId: w.id },
              })
            }
            className="h-11"
          >
            <Pencil className="h-4 w-4" />
            Bearbeiten
          </Button>
        ) : (
          <Button variant="outline" disabled className="h-11">
            <Pencil className="h-4 w-4" />
            Bearbeiten
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
              Vorlage
            </span>
          </Button>
        )}
        <SchedulePlanner workflowRef={w.id} workflowName={w.name} />
      </div>
    </div>
  );
}
