import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  STAGE_META,
  TOGGLE_META,
  effectiveToggles,
  memberStage,
  type FamilyMember,
  type MemberToggles,
  type Stage,
} from "@/lib/storage";
import { STAGE_DEFAULTS } from "@/hooks/use-family";

const STAGES: Stage[] = ["begleitet", "unterstuetzt", "selbststaendig"];
const TOGGLE_KEYS: (keyof MemberToggles)[] = [
  "adminPlans",
  "libraryPick",
  "freeCreate",
  "adminApproval",
  "decide",
  "at",
  "readySignal",
  "settingsVisible",
];

type Props = {
  open: boolean;
  member: FamilyMember | null; // null = create new
  familyExists: boolean;
  onClose: () => void;
  onSave: (m: FamilyMember & { familyName?: string }) => Promise<{ id: string } | void>;
  onDelete?: (id: string) => void | Promise<void>;
};

export function MemberDialog({
  open,
  member,
  familyExists,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [stage, setStage] = useState<Stage>("selbststaendig");
  const [overrides, setOverrides] = useState<Partial<MemberToggles>>({});
  const [familyName, setFamilyName] = useState("Meine Familie");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? "");
    setEmoji(member?.emoji ?? "🙂");
    setStage(member ? memberStage(member) : "selbststaendig");
    setOverrides(member?.toggles ?? {});
    setFamilyName("Meine Familie");
    setSaving(false);
  }, [open, member]);

  const effective: MemberToggles = effectiveToggles({
    id: "_",
    name,
    emoji,
    stage,
    toggles: overrides,
  });

  function toggle(key: keyof MemberToggles) {
    setOverrides((prev) => {
      const stageDefault = STAGE_DEFAULTS[stage][key];
      const currentEffective = key in prev ? prev[key]! : stageDefault;
      const nextValue = !currentEffective;
      if (nextValue === stageDefault) {
        const { [key]: _drop, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: nextValue };
    });
  }

  async function handleSave() {
    const n = name.trim();
    if (!n || saving) return;
    setSaving(true);
    try {
      await onSave({
        id: member?.id ?? "",
        name: n,
        emoji: emoji || "🙂",
        stage,
        toggles: Object.keys(overrides).length ? overrides : undefined,
        familyName: !familyExists && !member ? familyName.trim() || "Meine Familie" : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
    } finally {
      setSaving(false);
    }
  }

  const isCreate = !member;
  const showFamilyName = isCreate && !familyExists;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {member ? "Mitglied bearbeiten" : "Mitglied hinzufügen"}
          </DialogTitle>
        </DialogHeader>

        <FormView
          showFamilyName={showFamilyName}
          familyName={familyName}
          setFamilyName={setFamilyName}
          name={name}
          setName={setName}
          emoji={emoji}
          setEmoji={setEmoji}
          stage={stage}
          setStage={(s) => {
            setStage(s);
            setOverrides({});
          }}
          overrides={overrides}
          effective={effective}
          toggle={toggle}
        />

        <DialogFooter className="flex-row justify-between gap-2 pt-2 sm:justify-between">
          {member && onDelete ? (
            <button
              type="button"
              onClick={async () => {
                await onDelete(member.id);
                onClose();
              }}
              className="rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-sm text-destructive"
            >
              Löschen
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Speichert …" : "Speichern"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormView(props: {
  showFamilyName: boolean;
  familyName: string;
  setFamilyName: (s: string) => void;
  name: string;
  setName: (s: string) => void;
  emoji: string;
  setEmoji: (s: string) => void;
  stage: Stage;
  setStage: (s: Stage) => void;
  overrides: Partial<MemberToggles>;
  effective: MemberToggles;
  toggle: (k: keyof MemberToggles) => void;
}) {
  const {
    showFamilyName,
    familyName,
    setFamilyName,
    name,
    setName,
    emoji,
    setEmoji,
    stage,
    setStage,
    overrides,
    effective,
    toggle,
  } = props;
  return (
    <div className="grid gap-5 pt-2">
      {showFamilyName && (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Familienname
          </h3>
          <input
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="z.B. Familie Meier"
            className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Nur intern sichtbar. Kannst du später ändern.
          </p>
        </section>
      )}

      <div className="flex items-center gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          maxLength={4}
          className="w-14 rounded-[var(--radius-md)] border border-border bg-card px-2 py-3 text-center text-2xl outline-none focus:border-primary"
          aria-label="Emoji"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="flex-1 rounded-[var(--radius-md)] border border-border bg-card px-3 py-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Entwicklungsstufe
        </h3>
        <div className="grid gap-2">
          {STAGES.map((s) => {
            const meta = STAGE_META[s];
            const active = stage === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`rounded-[var(--radius-md)] border px-4 py-3 text-left transition ${
                  active ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{meta.label}</span>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {meta.ageHint}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{meta.description}</div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs italic text-muted-foreground">
          Richtwert: {STAGE_META[stage].ageHint}. Bei ADHS entscheidet die Reife, nicht das Alter.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Erlaubnisse
        </h3>
        <ul className="grid gap-1">
          {TOGGLE_KEYS.map((k) => {
            const checked = effective[k];
            const overridden = k in overrides;
            return (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => toggle(k)}
                  className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-left text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    {TOGGLE_META[k]}
                    {overridden && (
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                        angepasst
                      </span>
                    )}
                  </span>
                  <span
                    className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                      checked ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                      style={{ left: checked ? "1.125rem" : "0.125rem" }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
