import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { atExercises } from "@/lib/at-exercises";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/ruhe")({
  component: Ruhe,
});

function Ruhe() {
  const location = useLocation();

  if (location.pathname !== "/ruhe") {
    return <Outlet />;
  }

  return (
    <div className="px-5 pb-10 pt-10">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest" style={{ color: "var(--color-violet)" }}>
          Ruhe · AT
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Autogenes Training</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kurze Übungen, um zur Ruhe zu kommen oder zwischen Aktivitäten zu wechseln.
        </p>
      </header>

      <ul className="grid gap-2">
        {atExercises.map((e) => (
          <li key={e.id}>
            <Link
              to="/ruhe/$exerciseId"
              params={{ exerciseId: e.id }}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] p-4 transition active:scale-[0.99]"
              style={{ backgroundColor: "var(--color-violet-soft)" }}
            >
              <div className="flex-1">
                <div className="font-medium" style={{ color: "var(--color-violet)" }}>
                  {e.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {e.duration} min · {e.category === "standard" ? "Standard" : "ADHS"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
              </div>
              <ChevronRight className="h-5 w-5" style={{ color: "var(--color-violet)" }} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
