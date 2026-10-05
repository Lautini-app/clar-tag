import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import {
  KRAFT,
  PROBLEME,
  ZEIT,
  baueVorschlag,
  gesamtMinuten,
  kuerzeAufZeit,
  minutenText,
  problemVon,
  vorauswahl,
  type Kraft,
  type ProblemId,
  type Vorschlag,
} from "@/lib/gefuehrte-routine";

type Schritt = "problem" | "kraft" | "zeit" | "bausteine" | "vorschlag";
const REIHE: Schritt[] = ["problem", "kraft", "zeit", "bausteine", "vorschlag"];

/**
 * Führt in vier Fragen zu einem Routine-Vorschlag — ohne KI.
 * Immer nur eine Frage sichtbar. Die Antworten leben nur in diesem Bildschirm:
 * nichts wird gespeichert oder verschickt, bis die Person den Vorschlag im
 * Editor selbst sichert.
 */
export function GefuehrteRoutine({
  onFertig,
  onAbbrechen,
}: {
  onFertig: (vorschlag: Vorschlag) => void;
  onAbbrechen: () => void;
}) {
  const [schritt, setSchritt] = useState<Schritt>("problem");
  const [problemId, setProblemId] = useState<ProblemId | null>(null);
  const [kraft, setKraft] = useState<Kraft | null>(null);
  const [minuten, setMinuten] = useState<number | null>(null);
  const [wahl, setWahl] = useState<string[]>([]);

  const problem = problemId ? problemVon(problemId) : null;
  const nummer = REIHE.indexOf(schritt) + 1;

  const zurueck = () => {
    const i = REIHE.indexOf(schritt);
    if (i <= 0) onAbbrechen();
    else setSchritt(REIHE[i - 1]);
  };

  const kopf = (titel: string, unterzeile?: string) => (
    <>
      <button
        type="button"
        onClick={zurueck}
        className="-ml-2 mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>
      {schritt !== "vorschlag" && (
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Frage {nummer} von 4
        </div>
      )}
      <h1 className="mt-1 text-2xl font-semibold text-foreground">{titel}</h1>
      {unterzeile && <p className="mt-2 text-sm text-muted-foreground">{unterzeile}</p>}
    </>
  );

  const option =
    "w-full rounded-[var(--radius-lg)] bg-card p-4 text-left shadow-sm transition active:scale-[0.99]";

  if (schritt === "problem") {
    return (
      <div className="px-5 pb-10 pt-6">
        {kopf("Wo klemmt es?", "Wähle den Satz, der am ehesten passt.")}
        <ul className="mt-6 grid gap-3">
          {PROBLEME.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={option}
                onClick={() => {
                  setProblemId(p.id);
                  setSchritt("kraft");
                }}
              >
                <span className="font-medium text-foreground">{p.satz}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted-foreground">
          Deine Antworten bleiben in diesem Bildschirm und werden nirgends hingeschickt.
        </p>
      </div>
    );
  }

  if (!problem) return null;

  if (schritt === "kraft") {
    return (
      <div className="px-5 pb-10 pt-6">
        {kopf(
          "Wie viel Kraft ist dann meistens da?",
          "Danach richtet sich, wie viel vorgeschlagen wird.",
        )}
        <ul className="mt-6 grid gap-3">
          {KRAFT.map((k) => (
            <li key={k.id}>
              <button
                type="button"
                className={option}
                onClick={() => {
                  setKraft(k.id);
                  setWahl(vorauswahl(problem, k.id));
                  setSchritt("zeit");
                }}
              >
                <span className="block font-medium text-foreground">{k.label}</span>
                <span className="block text-xs text-muted-foreground">{k.hinweis}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (schritt === "zeit") {
    return (
      <div className="px-5 pb-10 pt-6">
        {kopf("Wie viel Zeit hast du dafür?")}
        <ul className="mt-6 grid gap-3">
          {ZEIT.map((z) => (
            <li key={z.label}>
              <button
                type="button"
                className={option}
                onClick={() => {
                  setMinuten(z.minuten);
                  setSchritt("bausteine");
                }}
              >
                <span className="font-medium text-foreground">{z.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const summe = gesamtMinuten(problem, wahl);
  const zuLang = minuten !== null && summe > minuten;
  const gekuerzt = minuten !== null ? kuerzeAufZeit(problem, wahl, minuten) : wahl;
  const kuerzenHilft = zuLang && gekuerzt.length < wahl.length;

  if (schritt === "bausteine") {
    const umschalten = (id: string) =>
      setWahl((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
    return (
      <div className="px-5 pb-10 pt-6">
        {kopf(
          "Was gehört dazu?",
          "Vorgeschlagen nach deiner Kraft. Tippe an, was du ändern willst.",
        )}
        <ul className="mt-6 grid gap-2">
          {problem.bausteine.map((b) => {
            const an = wahl.includes(b.id);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={an}
                  onClick={() => umschalten(b.id)}
                  className={
                    "flex w-full items-center gap-3 rounded-[var(--radius-md)] border p-3 text-left transition " +
                    (an ? "border-primary bg-primary-soft" : "border-border bg-card")
                  }
                >
                  <span
                    className={
                      "grid h-6 w-6 shrink-0 place-items-center rounded-md border " +
                      (an
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background")
                    }
                  >
                    {an && <Check className="h-4 w-4" />}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{b.text}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {b.duration} Min
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 rounded-[var(--radius-lg)] bg-card p-4">
          <p className="text-sm font-medium text-foreground">Zusammen {minutenText(summe)}.</p>
          {zuLang && minuten !== null && (
            <p className="mt-1 text-sm text-muted-foreground">
              Du hast {minutenText(minuten)} gesagt.
              {!kuerzenHilft && " Kürzer geht es nur, wenn du selbst etwas streichst."}
            </p>
          )}
          {kuerzenHilft && minuten !== null && (
            <button
              type="button"
              onClick={() => setWahl(gekuerzt)}
              className="mt-3 inline-flex min-h-9 items-center rounded-full border border-border bg-background px-3.5 text-[13px] font-medium text-foreground"
            >
              Auf {minutenText(minuten)} kürzen
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={wahl.length === 0}
          onClick={() => setSchritt("vorschlag")}
          className="mt-6 h-12 w-full rounded-[var(--radius-lg)] bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Vorschlag ansehen
        </button>
      </div>
    );
  }

  const vorschlag = baueVorschlag(problem, wahl);

  return (
    <div className="px-5 pb-10 pt-6">
      {kopf(
        `Dein Vorschlag: ${vorschlag.name}`,
        `${vorschlag.steps.length} Schritte, zusammen ${minutenText(summe)}.`,
      )}
      <ol className="mt-6 grid gap-2">
        {vorschlag.steps.map((s, i) => (
          <li
            key={`${i}-${s.text}`}
            className="flex items-start gap-3 rounded-[var(--radius-md)] bg-card p-3"
          >
            <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">{s.text}</span>
              {s.hint && <span className="block text-xs text-muted-foreground">{s.hint}</span>}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {s.duration} Min
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-muted-foreground">
        Gespeichert wird erst, wenn du im nächsten Schritt auf Speichern tippst.
      </p>
      <button
        type="button"
        onClick={() => onFertig(vorschlag)}
        className="mt-6 h-12 w-full rounded-[var(--radius-lg)] bg-primary text-sm font-medium text-primary-foreground"
      >
        Übernehmen und anpassen
      </button>
    </div>
  );
}
