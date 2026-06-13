import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { decisionHelpers, type DecisionLog } from "@/lib/decisions";
import { KEYS, lsGet } from "@/lib/storage";

export const Route = createFileRoute("/entscheiden")({
  component: EntscheidenIndex,
});

function EntscheidenIndex() {
  const location = useLocation();
  const [log, setLog] = useState<DecisionLog[]>([]);
  useEffect(() => {
    setLog(lsGet<DecisionLog[]>(KEYS.decisions, []).slice(-5).reverse());
  }, []);

  if (location.pathname !== "/entscheiden") {
    return <Outlet />;
  }

  return (
    <div className="px-5 pb-10 pt-10">
      <header className="mb-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Entscheiden</div>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">3 Fragen → 1 Vorschlag</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kein Grübeln. Wähle eine Hilfe und beantworte drei kurze Fragen.
        </p>
      </header>

      <ul className="grid gap-2">
        {decisionHelpers.map((h) => (
          <li key={h.id}>
            <Link
              to="/entscheiden/$helperId"
              params={{ helperId: h.id }}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-card p-4 shadow-sm transition active:scale-[0.99]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-accent text-2xl">
                {h.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{h.name}</div>
                <div className="text-xs text-muted-foreground">{h.intro}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      {log.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Letzte Entscheidungen
          </h2>
          <ul className="grid gap-1 rounded-[var(--radius-lg)] bg-card p-3">
            {log.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-[11px] text-muted-foreground">
                  {new Date(d.at).toLocaleTimeString("de-CH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-xs text-muted-foreground">{d.helperName}:</span>
                <span className="flex-1 truncate text-foreground">{d.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
