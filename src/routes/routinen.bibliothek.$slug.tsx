import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Download, Info, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryMeta } from "@/lib/workflows";
import {
  getLibraryRoutine,
  importLibraryRoutine,
  type LibraryGrade,
  type LibraryRoutine,
  type LibraryStep,
} from "@/lib/library.functions";

export const Route = createFileRoute("/routinen/bibliothek/$slug")({
  component: LibraryDetail,
});

const GRADES: { id: LibraryGrade; label: string; desc: string }[] = [
  { id: "grob", label: "Grob", desc: "Wenige grosse Schritte" },
  { id: "mittel", label: "Mittel", desc: "Ausgewogen" },
  { id: "fein", label: "Fein", desc: "Viele kleine Schritte" },
];

function libraryCategoryMeta(cat: string): { label: string; icon: string } {
  const known = (categoryMeta as Record<string, { label: string; icon: string } | undefined>)[cat];
  return known ?? { label: cat, icon: "✨" };
}

function stepsForGrade(r: LibraryRoutine, g: LibraryGrade): LibraryStep[] {
  return g === "grob" ? r.steps_grob : g === "fein" ? r.steps_fein : r.steps_mittel;
}

function LibraryDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchOne = useServerFn(getLibraryRoutine);
  const doImport = useServerFn(importLibraryRoutine);

  const { data: routine, isLoading } = useQuery({
    queryKey: ["library-routine", slug],
    queryFn: () => fetchOne({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });

  const [grade, setGrade] = useState<LibraryGrade>("mittel");
  const [variantId, setVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (!routine) return;
    setGrade(routine.default_grade);
    if (routine.variants?.[0]) setVariantId(routine.variants[0].id);
  }, [routine?.id]);

  const importMutation = useMutation({
    mutationFn: (input: { slug: string; grade: LibraryGrade; variant_id: string | null }) =>
      doImport({ data: input }),
    onSuccess: ({ id, name }) => {
      qc.invalidateQueries({ queryKey: ["user-workflows"] });
      toast.success(`„${name}" importiert — jetzt in Meine Routinen bearbeitbar`);
      navigate({ to: "/routinen/$workflowId", params: { workflowId: id } });
    },
    onError: (err: Error) => {
      toast.error(`Import fehlgeschlagen: ${err.message}`);
    },
  });

  const steps = useMemo(() => (routine ? stepsForGrade(routine, grade) : []), [routine, grade]);
  const total = steps.reduce((s, x) => s + (x.duration ?? 0), 0);
  const activeVariant = routine?.variants?.find((v) => v.id === variantId) ?? routine?.variants?.[0];
  const material = activeVariant?.material ?? routine?.material ?? [];

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Lädt …</div>;
  }
  if (!routine) {
    return (
      <div className="px-5 pt-10">
        <p>Bibliotheks-Routine nicht gefunden.</p>
        <Link to="/routinen" className="mt-4 inline-block text-primary underline">
          Zurück
        </Link>
      </div>
    );
  }

  const meta = libraryCategoryMeta(routine.category);

  return (
    <div className="px-5 pb-10 pt-6">
      <button
        onClick={() => navigate({ to: "/routinen" })}
        className="mb-4 -ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Bibliothek
      </button>

      <header className="mb-4 flex items-start gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] bg-accent text-3xl">
          {routine.icon}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{routine.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
              {meta.icon} {meta.label}
            </span>
            <span className="text-muted-foreground">
              {steps.length} Schritte · ca. {total} min
            </span>
          </div>
        </div>
      </header>

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
              <div className="text-sm font-medium text-foreground">
                {g.label}
                {routine.default_grade === g.id && (
                  <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                    Default
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">{g.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {routine.variants && routine.variants.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Variante
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {routine.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-[var(--radius-md)] border p-3 text-left transition ${
                  (activeVariant?.id ?? routine.variants?.[0]?.id) === v.id
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

      {material.length > 0 && (
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

      {routine.adhs_tips && (
        <section className="mb-6 rounded-[var(--radius-lg)] border border-amber-300/60 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-950/20">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-amber-900 dark:text-amber-200">
            <Info className="h-3.5 w-3.5" />
            ADHS-Stolperfalle
          </h2>
          <p className="whitespace-pre-line text-xs leading-relaxed text-amber-900/90 dark:text-amber-100/90">
            {routine.adhs_tips}
          </p>
        </section>
      )}

      <Button
        size="lg"
        onClick={() =>
          importMutation.mutate({
            slug: routine.slug,
            grade,
            variant_id: activeVariant?.id ?? null,
          })
        }
        disabled={importMutation.isPending}
        className="h-12 w-full"
      >
        {importMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        In meine Routinen importieren
      </Button>
    </div>
  );
}
