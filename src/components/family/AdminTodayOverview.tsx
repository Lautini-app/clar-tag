import { useFamily } from "@/hooks/use-family";
import { useMemberStatus } from "@/hooks/use-member-status";
import { memberStage, type Stage } from "@/lib/storage";
import type { MemberStatus } from "@/lib/member-status";

/**
 * Admin-Übersicht auf Heute-Screen.
 * Zeigt pro Mitglied den aktuellen Stand — je nach Stufe unterschiedlich detailliert.
 */
export function AdminTodayOverview() {
  const { members, isAdminView } = useFamily();
  const status = useMemberStatus();

  if (!isAdminView) return null;
  if (members.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Familie heute
      </h2>
      <ul className="grid gap-2">
        {members.map((m) => {
          const s = status[m.id] ?? null;
          const stage = memberStage(m);
          const ready = s?.readyAt != null;
          return (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-3"
            >
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {m.name}
                  </span>
                  {ready && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: "var(--color-violet)" }}
                    >
                      Bereit
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {renderStatus(stage, s)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function renderStatus(stage: Stage, s: MemberStatus | null): string {
  if (!s) return "noch nichts gestartet";

  if (stage === "begleitet") {
    if (s.doneAt) return `${s.workflowName} · fertig`;
    return `${s.workflowName} · Schritt ${s.stepIdx + 1} von ${s.stepCount}${
      s.currentStepText ? ` · ${s.currentStepText}` : ""
    }`;
  }

  if (stage === "unterstuetzt") {
    if (s.doneAt) return `${s.workflowName} · fertig um ${fmt(s.doneAt)}`;
    if (s.stepIdx > 0) return `${s.workflowName} · in Bearbeitung`;
    return `${s.workflowName} · gestartet um ${fmt(s.startedAt)}`;
  }

  // selbststaendig
  if (s.doneAt) return "Routine abgeschlossen";
  return "Routine gestartet";
}

function fmt(ms: number) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
