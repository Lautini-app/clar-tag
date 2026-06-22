import { useFamily } from "@/hooks/use-family";
import { useSettings } from "@/hooks/use-settings";

/**
 * Horizontal chip row to switch the active person.
 * Only shown when Familienmodus is active and at least one member exists.
 * "Admin" chip = no member selected (full overview / control view).
 */
export function MemberSwitcher() {
  const { settings, loaded } = useSettings();
  const { members, activeId, setActive, role } = useFamily();
  if (!loaded) return null;
  if (settings.mode !== "family") return null;
  if (role !== "admin") return null; // child devices don't switch
  if (members.length === 0) return null;

  return (
    <div className="-mx-5 mb-4 overflow-x-auto px-5">
      <div className="flex items-center gap-2">
        <Chip
          active={activeId === null}
          onClick={() => setActive(null)}
          emoji="👤"
          label="Admin"
        />
        {members.map((m) => (
          <Chip
            key={m.id}
            active={activeId === m.id}
            onClick={() => setActive(m.id)}
            emoji={m.emoji}
            label={m.name}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      <span className="text-sm leading-none">{emoji}</span>
      <span className={active ? "font-medium" : ""}>{label}</span>
    </button>
  );
}
