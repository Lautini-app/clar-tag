import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getHelper,
  type DecisionAnswerMap,
  type DecisionLog,
  type DecisionResult,
} from "@/lib/decisions";
import { fetchWeather, type WeatherSnapshot } from "@/lib/weather";
import { KEYS, lsGet, lsSet } from "@/lib/storage";

export const Route = createFileRoute("/entscheiden/$helperId")({
  component: Session,
});

type Phase = "ask" | "result" | "saved";

function Session() {
  const { helperId } = Route.useParams();
  const navigate = useNavigate();
  const helper = getHelper(helperId);

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<DecisionAnswerMap>({});
  const [phase, setPhase] = useState<Phase>("ask");
  const [variant, setVariant] = useState(0);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [result, setResult] = useState<DecisionResult | null>(null);

  useEffect(() => {
    if (helper?.needsWeather) {
      fetchWeather().then(setWeather);
    }
  }, [helper]);

  if (!helper) {
    return (
      <div className="px-5 pt-10">
        <p>Entscheidungshilfe nicht gefunden.</p>
        <button
          onClick={() => navigate({ to: "/entscheiden" })}
          className="mt-4 text-primary underline"
        >
          Zurück
        </button>
      </div>
    );
  }

  const total = helper.questions.length;
  const currentQ = helper.questions[stepIdx];

  function choose(optId: string) {
    const next = { ...answers, [currentQ.id]: optId };
    setAnswers(next);
    if (stepIdx + 1 < total) {
      setStepIdx(stepIdx + 1);
    } else {
      const r = helper!.resolve(next, { weather, variant: 0 });
      setResult(r);
      setPhase("result");
    }
  }

  function otherOption() {
    const v = variant + 1;
    setVariant(v);
    setResult(helper!.resolve(answers, { weather, variant: v }));
  }

  function confirm() {
    if (!result) return;
    const entry: DecisionLog = {
      id: crypto.randomUUID(),
      helperId: helper!.id,
      helperName: helper!.name,
      title: result.title,
      at: new Date().toISOString(),
    };
    const prev = lsGet<DecisionLog[]>(KEYS.decisions, []);
    lsSet(KEYS.decisions, [...prev, entry].slice(-50));
    setPhase("saved");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pb-10 pt-6">
      <button
        onClick={() => navigate({ to: "/entscheiden" })}
        className="-ml-2 mb-2 inline-flex items-center gap-1 self-start rounded-md px-2 py-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Abbrechen
      </button>

      <header className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{helper.icon}</span>
          <h1 className="text-lg font-semibold text-foreground">{helper.name}</h1>
        </div>
        {phase === "ask" && (
          <div className="mt-3 flex items-center gap-1.5">
            {helper.questions.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i <= stepIdx ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}
      </header>

      {phase === "ask" && currentQ && (
        <div className="flex-1">
          <h2 className="mb-5 text-xl font-medium text-foreground">{currentQ.text}</h2>
          <div className="grid gap-2">
            {currentQ.options.map((o) => (
              <button
                key={o.id}
                onClick={() => choose(o.id)}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 text-left transition hover:border-primary active:scale-[0.99]"
              >
                {o.emoji && <span className="text-2xl">{o.emoji}</span>}
                <span className="flex-1 text-base font-medium text-foreground">{o.label}</span>
              </button>
            ))}
          </div>
          {helper.needsWeather && (
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              {weather
                ? `Wetter jetzt: ${weather.temperature}°C, ${weather.description}`
                : "Wetter wird geladen…"}
            </p>
          )}
        </div>
      )}

      {phase === "result" && result && (
        <div className="flex flex-1 flex-col">
          <div className="flex-1 rounded-[var(--radius-xl)] bg-card p-6 shadow-sm">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Vorschlag
            </div>
            <div className="mt-2 text-2xl font-semibold leading-tight text-foreground">
              {result.title}
            </div>
            {result.detail && (
              <div className="mt-2 text-sm text-muted-foreground">{result.detail}</div>
            )}
            <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
              {result.reasoning}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <Button size="lg" className="h-12" onClick={confirm}>
              <Check className="h-4 w-4" />
              Bestätigen
            </Button>
            <Button variant="outline" className="h-11" onClick={otherOption}>
              <RotateCcw className="h-4 w-4" />
              Andere Option
            </Button>
          </div>
        </div>
      )}

      {phase === "saved" && result && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary-soft">
            <Check className="h-8 w-8 text-primary-deep" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Entschieden.</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Gespeichert um{" "}
            {new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}:
          </p>
          <div className="mt-3 rounded-[var(--radius-md)] bg-card px-4 py-3 text-base font-medium text-foreground">
            {result.title}
          </div>
          <div className="mt-8 grid w-full gap-2">
            <Button size="lg" onClick={() => navigate({ to: "/entscheiden" })}>
              Fertig
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStepIdx(0);
                setAnswers({});
                setResult(null);
                setVariant(0);
                setPhase("ask");
              }}
            >
              <X className="h-4 w-4" />
              Nochmal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
