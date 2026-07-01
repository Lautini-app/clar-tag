import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, Info, Package, Pencil, Play } from "lucide-react";
import { type Grade } from "@/lib/workflows";
import { useResolvedWorkflow } from "@/lib/workflow-resolver";
import { Button } from "@/components/ui/button";
import { SchedulePlanner } from "@/components/SchedulePlanner";
import { buildExport, downloadRoutineExport } from "@/lib/routine-export";

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
  const [variantId, setVariantId] = useState<string | null>(null);

  // Default-Feinheitsgrad + Default-Variante übernehmen, sobald die Routine geladen ist.
  useEffect(() => {
    if (!w) return;
    if (w.defaultGrade) setGrade(w.defaultGrade);
    if (w.variants?.[0]) setVariantId(w.variants[0].id);
  }, [w?.id]);

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
  const activeVariant = w.variants?.find((v) => v.id === variantId) ?? w.variants?.[0];
  const material = activeVariant?.material ?? w.material;

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

      {!isUser && w.variants && w.variants.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Variante
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {w.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-[var(--radius-md)] border p-3 text-left transition ${
                  (activeVariant?.id ?? w.variants?.[0]?.id) === v.id
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-card"
                }`}
              >
                <div className="text-sm font-medium text-foreground">{v.label}</div>
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
            <li key={i} className="flex items-start gap-3 py-1.5 text-sm">
              <span className="w-5 pt-0.5 text-right font-mono text-xs text-muted-foreground">
                {i + 1}.
              </span>
              <span className="pt-0.5 text-lg">{s.emoji}</span>
              <span className="flex-1 text-foreground">
                {s.text}
                {s.hint && (
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{s.hint}</span>
                )}
              </span>
              {s.duration > 0 && (
                <span className="pt-1 font-mono text-xs tabular-nums text-muted-foreground">
                  {s.duration} min
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {material && material.length > 0 && (
        <section className="mb-6 rounded-[var(--radius-lg)] bg-card p-4">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            Material{activeVariant ? ` · ${activeVariant.label}` : ""}
          </h2>
          <ul className="grid gap-1 pl-1 text-sm text-foreground">
            {material.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="pt-1.5 text-muted-foreground">·</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {w.adhsTips && (
        <section className="mb-6 rounded-[var(--radius-lg)] border border-border bg-secondary/40 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            ADHS-Stolperfallen
          </h2>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {w.adhsTips}
          </p>
        </section>
      )}

      <div className="grid gap-2">
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
        <Button
          variant="outline"
          onClick={() =>
            isUser
              ? navigate({
                  to: "/routinen/$workflowId/bearbeiten",
                  params: { workflowId: w.id },
                })
              : navigate({
                  to: "/routinen/neu",
                  search: { basis: w.id, grad: grade },
                })
          }
          className="h-11"
        >
          <Pencil className="h-4 w-4" />
          {isUser ? "Bearbeiten" : "Anpassen"}
        </Button>
        {isUser && (
          <Button
            variant="ghost"
            onClick={() => {
              try {
                const exportObj = buildExport({
                  name: w.name,
                  icon: w.icon,
                  category: w.category,
                  grade,
                  steps: steps.map((s) => ({
                    emoji: s.emoji,
                    text: s.text,
                    hint: s.hint ?? null,
                    duration: s.duration,
                  })),
                  material: w.material ?? null,
                  adhs_tips: w.adhsTips ?? null,
                });
                downloadRoutineExport(exportObj);
                toast.success("Routine als JSON exportiert");
              } catch (err) {
                toast.error(`Export fehlgeschlagen: ${(err as Error).message}`);
              }
            }}
            className="h-11"
            aria-label="Als JSON exportieren"
          >
            <Download className="h-4 w-4" />
            Als JSON exportieren
          </Button>
        )}
        <SchedulePlanner workflowRef={w.id} workflowName={w.name} />
      </div>
    </div>
  );
}
