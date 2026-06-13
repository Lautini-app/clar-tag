import { Link, useLocation } from "@tanstack/react-router";
import { Calendar, Compass, Home, Settings, Sparkles } from "lucide-react";
import { useFamily } from "@/hooks/use-family";

const items = [
  { to: "/", label: "Heute", icon: Home, key: "home" as const },
  { to: "/routinen", label: "Routinen", icon: Calendar, key: "routines" as const },
  { to: "/entscheiden", label: "Entscheiden", icon: Compass, key: "decide" as const },
  { to: "/ruhe", label: "Ruhe", icon: Sparkles, key: "at" as const },
  { to: "/einstellungen", label: "Einstellungen", icon: Settings, key: "settings" as const },
];

export function BottomNav() {
  const loc = useLocation();
  const { toggles, isAdminView } = useFamily();

  // Admin = full nav. Active member = filter by toggles.
  const visible = items.filter((it) => {
    if (isAdminView) return true;
    if (!toggles) return true;
    if (it.key === "decide") return toggles.decide;
    if (it.key === "at") return toggles.at;
    if (it.key === "settings") return toggles.settingsVisible;
    return true;
  });

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur"
    >
      <ul className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {visible.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className={active ? "font-medium" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
