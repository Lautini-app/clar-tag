import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, Layers, PencilLine, Sparkles } from "lucide-react";
import { WorkflowEditor } from "@/components/WorkflowEditor";
import { useFamily } from "@/hooks/use-family";
import {
  workflows,
  categoryMeta,
  getWorkflow,
  type Category,
  type Grade,
  type Workflow,
} from "@/lib/workflows";

export const Route = createFileRoute("/routinen/neu")({
  validateSearch: (search): { basis?: string; grad?: Grade } => ({
    basis: typeof search.basis === "string" ? search.basis : undefined,
    grad:
      search.grad === "grob" || search.grad === "mittel" || search.grad === "fein"
        ? search.grad
        : undefined,
  }),
  component: NeueRoutine,
});

type Mode = "chooser" | "library" | "chips" | "blank";

function NeueRoutine() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { activeMember, toggles, isAdminView } = useFamily();
  // Wenn ein Mitglied aktiv ist: Toggles bestimmen, was sichtbar ist.
  // Admin-Ansicht: alles erlaubt.
  const canLibrary = isAdminView || !!toggles?.libraryPick;
  const canFreeCreate = isAdminView || !!toggles?.freeCreate;
  const [mode, setMode] = useState<Mode>(() => (search.basis ? "blank" : "chooser"));
  const [base, setBase] = useState<Workflow | null>(() =>
    search.basis ? (getWorkflow(search.basis) ?? null) : null,
  );
  const [copyGrade, setCopyGrade] = useState<Grade>(search.grad ?? "mittel");
  // Sport-Session: Variantenwahl. Default "studio" damit es kein Blocker ist.
  const [variantId, setVariantId] = useState<string | null>(null);

  // Person darf gar nichts → sanfter Hinweis
  if (!isAdminView && !canLibrary && !canFreeCreate) {
    return (
      <div className="px-5 pb-10 pt-6">
        <button
          onClick={() => navigate({ to: "/routinen" })}
          className="-ml-2 mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Routinen
        </button>
        <div className="rounded-[var(--radius-lg)] bg-card p-6 text-center">
          <div className="text-3xl">🔒</div>
          <h1 className="mt-3 text-lg font-medium text-foreground">
            Nur Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeMember?.name} kann momentan keine eigenen Routinen anlegen.
            Frag Admin, oder ändere die Einstellungen in der Familienverwaltung.
          </p>
        </div>
      </div>
    );
  }

  if (mode === "chooser") {
    return (
      <div className="px-5 pb-10 pt-6">
        <button
          onClick={() => navigate({ to: "/routinen" })}
          className="-ml-2 mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Routinen
        </button>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Neue Routine</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Drei Wege — alle bringen dich zum gleichen Editor.
        </p>

        <ul className="grid gap-3">
          {canLibrary && (
            <Card
              icon={<BookOpen className="h-5 w-5" />}
              title="Bibliotheks-Routine anpassen"
              text="Wähle eine vorhandene Routine als Basis und passe Schritte an."
              onClick={() => setMode("library")}
            />
          )}
          {canFreeCreate && (
            <Card
              icon={<Layers className="h-5 w-5" />}
              title="Aus Schritt-Bibliothek zusammenstellen"
              text="Chips aus vorgeschlagenen Schritten wählen und kombinieren."
              onClick={() => setMode("chips")}
            />
          )}
          {canFreeCreate && (
            <Card
              icon={<PencilLine className="h-5 w-5" />}
              title="Von Grund auf neu"
              text="Leere Routine — alles selbst eingeben."
              onClick={() => setMode("blank")}
            />
          )}
        </ul>
        {!isAdminView && !canFreeCreate && (
          <p className="mt-4 text-xs text-muted-foreground">
            {activeMember?.name} kann nur Routinen aus der Bibliothek wählen.
          </p>
        )}
      </div>
    );
  }

  if (mode === "library") {
    return (
      <LibraryPicker
        onCancel={() => setMode("chooser")}
        onPick={(w) => {
          setBase(w);
          setCopyGrade(w.defaultGrade ?? "mittel");
          // Beim Importieren: Default-Variant ist die erste (für Sport: "Studio").
          setVariantId(w.variants?.[0]?.id ?? null);
          setMode("blank");
        }}
      />
    );
  }

  // editor (blank | from-base | chips)
  const variantLabel = base?.variants?.find((v) => v.id === variantId)?.label;
  const initial = base
    ? {
        name: variantLabel
          ? `${base.name} · ${variantLabel} (eigene)`
          : `${base.name} (eigene)`,
        category: base.category,
        icon: base.icon,
        steps: base.steps[copyGrade].map((s) => ({
          emoji: s.emoji,
          text: s.text,
          hint: s.hint ?? null,
          duration: s.duration,
        })),
      }
    : undefined;

  return (
    <WorkflowEditor
      title={
        base
          ? `${base.name} anpassen`
          : mode === "chips"
            ? "Aus Schritten zusammenstellen"
            : "Neue Routine"
      }
      initial={initial}
      showLibrary={mode === "chips" || mode === "blank" || mode === "library"}
      onSaved={() => navigate({ to: "/routinen" })}
      onCancel={() => {
        setBase(null);
        setMode("chooser");
      }}
    />
  );
}

function Card({
  icon,
  title,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="flex w-full items-start gap-3 rounded-[var(--radius-lg)] bg-card p-4 text-left shadow-sm transition active:scale-[0.99]"
      >
        <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-primary-soft text-primary-deep">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{text}</div>
        </div>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </button>
    </li>
  );
}

function LibraryPicker({
  onPick,
  onCancel,
}: {
  onPick: (w: Workflow) => void;
  onCancel: () => void;
}) {
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
  ];
  return (
    <div className="px-5 pb-10 pt-6">
      <button
        onClick={onCancel}
        className="-ml-2 mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Basis wählen</h1>
      {order.map((cat) => {
        const list = workflows.filter((w) => w.category === cat);
        if (list.length === 0) return null;
        return (
          <section key={cat} className="mb-5">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {categoryMeta[cat].icon} {categoryMeta[cat].label}
            </h2>
            <ul className="grid gap-1">
              {list.map((w) => (
                <li key={w.id}>
                  <button
                    onClick={() => onPick(w)}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-md)] bg-card p-3 text-left transition active:scale-[0.99]"
                  >
                    <span className="text-xl">{w.icon}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{w.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {w.steps.mittel.length} Schritte
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
