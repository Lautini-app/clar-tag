/**
 * Geführte Routine — ohne KI.
 *
 * Vier Fragen führen zu einem Vorschlag: Wo klemmt es, wie viel Kraft ist da,
 * wie viel Zeit, was gehört dazu. Alles hier sind feste Regeln und reine
 * Funktionen: kein Netzwerk, keine Datenbank, nichts wird gespeichert oder
 * verschickt. Gespeichert wird erst, wenn die Person den Vorschlag im
 * gewohnten Editor selbst sichert.
 */
import type { UserWorkflowCategory, UserWorkflowStep } from "./user-workflows.functions";

export type ProblemId = "morgen" | "abend" | "anfangen" | "vergessen" | "wechsel";
export type Kraft = "wenig" | "mittel" | "viel";

/**
 * Ab welcher Kraft ein Baustein vorausgewählt ist:
 * kern = immer, mittel = ab «mittel», viel = nur bei «viel», nie = nur von Hand.
 */
export type Vorwahl = "kern" | "mittel" | "viel" | "nie";

export type Baustein = {
  id: string;
  emoji: string;
  text: string;
  hint?: string;
  /** Minuten */
  duration: number;
  vorwahl: Vorwahl;
};

export type Problem = {
  id: ProblemId;
  /** Das Problem in den Worten der Person. */
  satz: string;
  /** Name der vorgeschlagenen Routine. */
  name: string;
  category: UserWorkflowCategory;
  icon: string;
  /** In der Reihenfolge, in der die Schritte ablaufen. */
  bausteine: Baustein[];
};

export const KRAFT: { id: Kraft; label: string; hinweis: string }[] = [
  { id: "wenig", label: "Wenig", hinweis: "Nur das Nötigste." },
  { id: "mittel", label: "Mittel", hinweis: "Das Nötige und etwas mehr." },
  { id: "viel", label: "Viel", hinweis: "Die ganze Routine." },
];

/** Zeitrahmen in Minuten; null = egal. */
export const ZEIT: { minuten: number | null; label: string }[] = [
  { minuten: 10, label: "10 Minuten" },
  { minuten: 20, label: "20 Minuten" },
  { minuten: 30, label: "30 Minuten" },
  { minuten: null, label: "Zeit ist egal" },
];

export const PROBLEME: Problem[] = [
  {
    id: "morgen",
    satz: "Morgens komme ich nicht aus dem Haus.",
    name: "Mein Morgen",
    category: "morgen",
    icon: "🌅",
    bausteine: [
      { id: "aufstehen", emoji: "🛏️", text: "Aufstehen", duration: 2, vorwahl: "kern" },
      { id: "wasser", emoji: "💧", text: "Glas Wasser trinken", duration: 1, vorwahl: "mittel" },
      { id: "medi", emoji: "💊", text: "Medikament nehmen", duration: 1, vorwahl: "nie" },
      { id: "duschen", emoji: "🚿", text: "Duschen", duration: 8, vorwahl: "viel" },
      { id: "anziehen", emoji: "👕", text: "Anziehen", duration: 5, vorwahl: "kern" },
      { id: "zaehne", emoji: "🪥", text: "Zähne putzen", duration: 3, vorwahl: "kern" },
      { id: "fruehstueck", emoji: "🍞", text: "Frühstücken", duration: 12, vorwahl: "mittel" },
      { id: "tasche", emoji: "🎒", text: "Tasche packen", duration: 5, vorwahl: "mittel" },
      { id: "jacke", emoji: "🧥", text: "Jacke und Schuhe", duration: 2, vorwahl: "kern" },
      {
        id: "dabei",
        emoji: "✅",
        text: "Alles dabei?",
        hint: "Schlüssel · Handy · Portemonnaie",
        duration: 1,
        vorwahl: "kern",
      },
    ],
  },
  {
    id: "abend",
    satz: "Abends finde ich kein Ende.",
    name: "Mein Abend",
    category: "abend",
    icon: "🌙",
    bausteine: [
      { id: "handy", emoji: "📱", text: "Handy weglegen", duration: 1, vorwahl: "kern" },
      { id: "kueche", emoji: "🍽️", text: "Küche aufräumen", duration: 10, vorwahl: "viel" },
      { id: "kleider", emoji: "👕", text: "Kleider bereitlegen", duration: 3, vorwahl: "mittel" },
      {
        id: "tasche",
        emoji: "🎒",
        text: "Tasche für morgen packen",
        duration: 5,
        vorwahl: "mittel",
      },
      { id: "zaehne", emoji: "🪥", text: "Zähne putzen", duration: 3, vorwahl: "kern" },
      { id: "pflege", emoji: "🧴", text: "Pflege", duration: 3, vorwahl: "viel" },
      { id: "wecker", emoji: "⏰", text: "Wecker stellen", duration: 1, vorwahl: "kern" },
      { id: "lesen", emoji: "📖", text: "Lesen", duration: 15, vorwahl: "viel" },
      { id: "licht", emoji: "💡", text: "Licht aus", duration: 1, vorwahl: "kern" },
    ],
  },
  {
    id: "anfangen",
    satz: "Ich fange mit Lernen oder Arbeiten nicht an.",
    name: "Anfangen",
    category: "lernen",
    icon: "📚",
    bausteine: [
      { id: "platz", emoji: "🧹", text: "Platz freiräumen", duration: 2, vorwahl: "kern" },
      { id: "wasser", emoji: "💧", text: "Wasser hinstellen", duration: 1, vorwahl: "mittel" },
      { id: "handy", emoji: "📱", text: "Handy weglegen", duration: 1, vorwahl: "kern" },
      {
        id: "ziel",
        emoji: "🎯",
        text: "Ziel festlegen",
        hint: "Ein Satz: Was ist danach fertig?",
        duration: 3,
        vorwahl: "kern",
      },
      {
        id: "fuenf",
        emoji: "▶️",
        text: "Nur 5 Minuten anfangen",
        hint: "Danach darfst du aufhören.",
        duration: 5,
        vorwahl: "kern",
      },
      { id: "block", emoji: "📖", text: "Arbeitsblock", duration: 25, vorwahl: "mittel" },
      { id: "pause", emoji: "🚶", text: "Kurze Pause", duration: 5, vorwahl: "mittel" },
      {
        id: "stand",
        emoji: "📝",
        text: "Stand notieren",
        hint: "Wo mache ich weiter?",
        duration: 2,
        vorwahl: "viel",
      },
    ],
  },
  {
    id: "vergessen",
    satz: "Ich vergesse Dinge für den nächsten Tag.",
    name: "Vorabend",
    category: "vorbereitung",
    icon: "⭐",
    bausteine: [
      {
        id: "plan",
        emoji: "📋",
        text: "Plan für morgen",
        hint: "Was steht an? Was brauche ich dafür?",
        duration: 3,
        vorwahl: "kern",
      },
      { id: "tasche", emoji: "🎒", text: "Tasche packen", duration: 5, vorwahl: "kern" },
      { id: "kleider", emoji: "👕", text: "Kleider bereitlegen", duration: 3, vorwahl: "mittel" },
      { id: "znueni", emoji: "🍱", text: "Znüni vorbereiten", duration: 5, vorwahl: "viel" },
      { id: "laden", emoji: "🔌", text: "Geräte laden", duration: 1, vorwahl: "mittel" },
      {
        id: "schluessel",
        emoji: "🔑",
        text: "Schlüssel an den Platz",
        duration: 1,
        vorwahl: "kern",
      },
      { id: "wecker", emoji: "⏰", text: "Wecker stellen", duration: 1, vorwahl: "kern" },
    ],
  },
  {
    id: "wechsel",
    satz: "Der Wechsel von einer Sache zur nächsten fällt mir schwer.",
    name: "Übergang",
    category: "eigene",
    icon: "🚪",
    bausteine: [
      {
        id: "stand",
        emoji: "📝",
        text: "Stand festhalten",
        hint: "Ein Satz: Wo bin ich stehen geblieben?",
        duration: 2,
        vorwahl: "kern",
      },
      { id: "wegraeumen", emoji: "🧹", text: "Wegräumen", duration: 3, vorwahl: "mittel" },
      { id: "strecken", emoji: "🤸", text: "Aufstehen und strecken", duration: 1, vorwahl: "kern" },
      { id: "wasser", emoji: "💧", text: "Glas Wasser trinken", duration: 1, vorwahl: "mittel" },
      { id: "toilette", emoji: "🚻", text: "Toilette", duration: 2, vorwahl: "viel" },
      {
        id: "bereit",
        emoji: "📦",
        text: "Nächste Sache bereitlegen",
        duration: 2,
        vorwahl: "kern",
      },
      {
        id: "erster",
        emoji: "▶️",
        text: "Ersten kleinen Schritt machen",
        duration: 2,
        vorwahl: "kern",
      },
    ],
  },
];

export function problemVon(id: ProblemId): Problem {
  const p = PROBLEME.find((x) => x.id === id);
  if (!p) throw new Error(`Unbekanntes Problem: ${id}`);
  return p;
}

const STUFE: Record<Kraft, Vorwahl[]> = {
  wenig: ["kern"],
  mittel: ["kern", "mittel"],
  viel: ["kern", "mittel", "viel"],
};

/** Welche Bausteine sind bei dieser Kraft vorausgewählt? */
export function vorauswahl(problem: Problem, kraft: Kraft): string[] {
  const erlaubt = STUFE[kraft];
  return problem.bausteine.filter((b) => erlaubt.includes(b.vorwahl)).map((b) => b.id);
}

/** Summe der Minuten der gewählten Bausteine. */
export function gesamtMinuten(problem: Problem, ids: Iterable<string>): number {
  const wahl = new Set(ids);
  return problem.bausteine.filter((b) => wahl.has(b.id)).reduce((s, b) => s + b.duration, 0);
}

/**
 * Kürzt auf den Zeitrahmen, mit so wenig Verlust wie möglich. Gestrichen wird
 * stufenweise: zuerst «viel», dann «nie», dann «mittel». Reicht ein einzelner
 * Baustein der Stufe, fällt der kleinste weg, der genügt; sonst der hinterste.
 * Zum Schluss wird wieder aufgefüllt, was doch noch Platz hat.
 * Kern-Bausteine bleiben immer stehen — reicht es dann noch nicht,
 * entscheidet die Person selbst.
 */
export function kuerzeAufZeit(problem: Problem, ids: Iterable<string>, minuten: number): string[] {
  const wahl = new Set(ids);
  const gestrichen: string[] = [];
  const reihenfolge: Vorwahl[] = ["viel", "nie", "mittel"];
  for (const stufe of reihenfolge) {
    for (;;) {
      const zuViel = gesamtMinuten(problem, wahl) - minuten;
      if (zuViel <= 0) break;
      const kandidaten = problem.bausteine.filter((b) => b.vorwahl === stufe && wahl.has(b.id));
      if (kandidaten.length === 0) break;
      const genuegt = kandidaten
        .filter((b) => b.duration >= zuViel)
        .sort((x, y) => x.duration - y.duration)[0];
      const weg = genuegt ?? kandidaten[kandidaten.length - 1];
      wahl.delete(weg.id);
      gestrichen.push(weg.id);
    }
  }
  // Zuletzt Gestrichenes zuerst zurückholen (das ist das Wichtigere).
  for (const id of gestrichen.reverse()) {
    wahl.add(id);
    if (gesamtMinuten(problem, wahl) > minuten) wahl.delete(id);
  }
  return problem.bausteine.filter((b) => wahl.has(b.id)).map((b) => b.id);
}

export type Vorschlag = {
  name: string;
  category: UserWorkflowCategory;
  icon: string;
  steps: UserWorkflowStep[];
};

/** Baut den Vorschlag in der festen Reihenfolge der Bausteine. */
export function baueVorschlag(problem: Problem, ids: Iterable<string>): Vorschlag {
  const wahl = new Set(ids);
  const steps: UserWorkflowStep[] = problem.bausteine
    .filter((b) => wahl.has(b.id))
    .map((b) => ({
      emoji: b.emoji,
      text: b.text,
      hint: b.hint ?? null,
      duration: b.duration,
    }));
  return { name: problem.name, category: problem.category, icon: problem.icon, steps };
}

export function minutenText(minuten: number): string {
  return minuten === 1 ? "1 Minute" : `${minuten} Minuten`;
}
