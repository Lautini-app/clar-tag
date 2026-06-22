import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  saveUserWorkflow,
  deleteUserWorkflow,
  type UserWorkflowCategory,
  type UserWorkflowStep,
} from "@/lib/user-workflows.functions";
import { categoryMeta } from "@/lib/workflows";
import { stepLibrary, stepGroupLabels, type StepCategory } from "@/lib/step-library";

type EditorInitial = {
  id?: string;
  name: string;
  category: UserWorkflowCategory;
  icon: string;
  steps: UserWorkflowStep[];
};

const DEFAULTS: EditorInitial = {
  name: "",
  category: "eigene",
  icon: "✏️",
  steps: [{ emoji: "✅", text: "Erster Schritt", duration: 5 }],
};

const CATEGORIES: UserWorkflowCategory[] = [
  "morgen",
  "abend",
  "vorbereitung",
  "lernen",
  "gesundheit",
  "eigene",
];

export function WorkflowEditor({
  title,
  initial,
  showLibrary = false,
  onSaved,
  onCancel,
}: {
  title: string;
  initial?: EditorInitial;
  showLibrary?: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<EditorInitial>(initial ?? DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libGroup, setLibGroup] = useState<StepCategory>("morgen");

  const save = useServerFn(saveUserWorkflow);
  const remove = useServerFn(deleteUserWorkflow);
  const qc = useQueryClient();

  const updateStep = (idx: number, patch: Partial<UserWorkflowStep>) => {
    setState((s) => ({
      ...s,
      steps: s.steps.map((step, i) => (i === idx ? { ...step, ...patch } : step)),
    }));
  };
  const removeStep = (idx: number) => {
    setState((s) => ({ ...s, steps: s.steps.filter((_, i) => i !== idx) }));
  };
  const addStep = (preset?: UserWorkflowStep) => {
    const next: UserWorkflowStep = preset ?? { emoji: "✅", text: "Neuer Schritt", duration: 5 };
    setState((s) => ({ ...s, steps: [...s.steps, { ...next }] }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await save({
        data: {
          id: state.id,
          name: state.name.trim(),
          category: state.category,
          icon: state.icon || null,
          steps: state.steps,
        },
      });
      qc.invalidateQueries({ queryKey: ["user-workflows"] });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!state.id) return;
    if (!confirm("Diese Routine wirklich löschen?")) return;
    setSaving(true);
    try {
      await remove({ data: { id: state.id } });
      qc.invalidateQueries({ queryKey: ["user-workflows"] });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
      setSaving(false);
    }
  };

  const libraryForGroup = stepLibrary.filter((s) => s.group === libGroup);

  return (
    <form onSubmit={submit} className="px-5 pb-10 pt-6">
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 -ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </button>

      <h1 className="mb-6 text-2xl font-semibold text-foreground">{title}</h1>

      <div className="grid gap-4">
        <div className="grid grid-cols-[5rem_1fr] gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Icon
            </span>
            <input
              type="text"
              value={state.icon}
              onChange={(e) => setState((s) => ({ ...s, icon: e.target.value }))}
              maxLength={4}
              className="rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-center text-2xl outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Name
            </span>
            <input
              type="text"
              required
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              placeholder="z. B. Abendroutine"
              className="rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-base outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Kategorie
          </span>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const active = state.category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, category: c }))}
                  className={`rounded-[var(--radius-md)] border px-2 py-2 text-xs transition ${
                    active
                      ? "border-primary bg-primary-soft text-primary-deep"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <span className="mr-1">{categoryMeta[c].icon}</span>
                  {categoryMeta[c].label}
                </button>
              );
            })}
          </div>
        </label>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Schritte
        </h2>
        <ul className="grid gap-2">
          {state.steps.map((step, i) => (
            <li
              key={i}
              className="rounded-[var(--radius-lg)] border border-border bg-card p-3"
            >
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={step.emoji}
                  onChange={(e) => updateStep(i, { emoji: e.target.value })}
                  maxLength={4}
                  className="w-12 rounded-[var(--radius-sm)] border border-border bg-background px-2 py-2 text-center text-xl outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => updateStep(i, { text: e.target.value })}
                  placeholder="Schritt-Beschreibung"
                  className="flex-1 rounded-[var(--radius-sm)] border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  disabled={state.steps.length <= 1}
                  className="rounded-[var(--radius-sm)] p-2 text-muted-foreground disabled:opacity-30"
                  aria-label="Schritt entfernen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={step.hint ?? ""}
                onChange={(e) => updateStep(i, { hint: e.target.value || null })}
                placeholder="Hinweis (optional)"
                className="mt-2 w-full rounded-[var(--radius-sm)] border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Dauer</span>
                <input
                  type="number"
                  min={0}
                  max={180}
                  value={step.duration}
                  onChange={(e) => updateStep(i, { duration: Number(e.target.value) || 0 })}
                  className="w-16 rounded-[var(--radius-sm)] border border-border bg-background px-2 py-1 text-sm tabular-nums outline-none focus:border-primary"
                />
                <span>min</span>
                <span className="ml-2">Datum</span>
                <input
                  type="date"
                  value={step.date ?? ""}
                  onChange={(e) => updateStep(i, { date: e.target.value || null })}
                  className="rounded-[var(--radius-sm)] border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                />
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => addStep()}
          className="mt-3 inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
        >
          <Plus className="h-4 w-4" /> Leeren Schritt hinzufügen
        </button>
      </section>

      {showLibrary && (
        <section className="mt-8">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Schritt-Bibliothek
          </h2>
          <div className="mb-3 flex flex-wrap gap-1">
            {(Object.keys(stepGroupLabels) as StepCategory[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setLibGroup(g)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  libGroup === g
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {stepGroupLabels[g].icon} {stepGroupLabels[g].label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {libraryForGroup.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  addStep({ emoji: s.emoji, text: s.text, hint: s.hint, duration: s.duration })
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary"
              >
                <span>{s.emoji}</span>
                <span>{s.text}</span>
                <Plus className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Speichert …" : "Speichern"}
        </button>
        {state.id && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="rounded-[var(--radius-md)] border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
          >
            Routine löschen
          </button>
        )}
      </div>
    </form>
  );
}
