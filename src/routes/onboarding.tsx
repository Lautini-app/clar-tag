import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { KEYS, lsSet, defaultSettings, type Settings } from "@/lib/storage";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Settings>(defaultSettings);

  const finish = () => {
    lsSet(KEYS.settings, data);
    lsSet(KEYS.onboarding, true);
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-12">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">clar · zeit</div>
        <div className="mt-1 text-sm text-muted-foreground">Schritt {step + 1} von 3</div>
      </div>

      {step === 0 && (
        <Section title="Willkommen." subtitle="Wie möchtest du clar · zeit nutzen?">
          <div className="grid gap-3">
            <Choice
              selected={data.mode === "solo"}
              onClick={() => setData({ ...data, mode: "solo" })}
              title="Für mich allein"
              desc="Deine eigenen Routinen, dein Tempo."
            />
            <Choice
              selected={data.mode === "family"}
              onClick={() => setData({ ...data, mode: "family" })}
              title="Familie"
              desc="Bis zu 5 weitere Mitglieder (kommt bald)."
            />
          </div>
        </Section>
      )}

      {step === 1 && (
        <Section title="Wie heisst du?" subtitle="Wir nennen dich beim Namen.">
          <input
            autoFocus
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Vorname"
            className="w-full rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-base outline-none focus:border-primary"
          />
        </Section>
      )}

      {step === 2 && (
        <Section title="Countdown-Stil" subtitle="So visualisierst du verbleibende Zeit.">
          <div className="grid gap-3">
            <Choice
              selected={data.countdownStyle === "bar"}
              onClick={() => setData({ ...data, countdownStyle: "bar" })}
              title="Balken"
              desc="Ein Balken, der von links nach rechts verrinnt."
            />
            <Choice
              selected={data.countdownStyle === "blocks"}
              onClick={() => setData({ ...data, countdownStyle: "blocks" })}
              title="Blöcke"
              desc="Quadrate verschwinden Minute für Minute."
            />
          </div>
        </Section>
      )}

      <div className="mt-auto flex gap-3 pt-8">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm font-medium"
          >
            Zurück
          </button>
        )}
        {step < 2 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !data.name.trim()}
            className="flex-[2] rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Weiter
          </button>
        ) : (
          <button
            onClick={finish}
            className="flex-[2] rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            Los geht's
          </button>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--radius-lg)] border bg-card p-4 text-left transition ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      <div className="font-medium text-foreground">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </button>
  );
}
