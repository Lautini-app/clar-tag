export type Grade = "grob" | "mittel" | "fein";
export type Category = "morgen" | "abend" | "vorbereitung" | "lernen" | "gesundheit" | "eigene";

export type Step = {
  emoji: string;
  text: string;
  hint?: string;
  duration: number; // minutes, 0 = no timer
};

export type Workflow = {
  id: string;
  name: string;
  icon: string;
  category: Category;
  steps: Record<Grade, Step[]>;
};

export const categoryMeta: Record<Category, { label: string; icon: string }> = {
  morgen: { label: "Morgen", icon: "🌅" },
  abend: { label: "Abend", icon: "🌙" },
  vorbereitung: { label: "Vorbereitung", icon: "⭐" },
  lernen: { label: "Lernen", icon: "📚" },
  gesundheit: { label: "Gesundheit", icon: "💊" },
  eigene: { label: "Eigene", icon: "✏️" },
};

const trio = (a: Step[], b: Step[], c: Step[]): Record<Grade, Step[]> => ({
  grob: a,
  mittel: b,
  fein: c,
});

export const workflows: Workflow[] = [
  {
    id: "morgen_bus",
    name: "Morgenroutine · Bus",
    icon: "🌅",
    category: "morgen",
    steps: {
      grob: [
        { emoji: "🛏️", text: "Aufstehen", duration: 2 },
        { emoji: "🪥", text: "Fertig machen", duration: 15 },
        { emoji: "🍞", text: "Frühstücken", duration: 10 },
        { emoji: "🎒", text: "Tasche & los", duration: 5 },
        { emoji: "✅", text: "Alles dabei?", hint: "Schlüssel · Ticket · Airpods", duration: 1 },
      ],
      mittel: [
        { emoji: "🛏️", text: "Aufstehen", duration: 2 },
        { emoji: "🚿", text: "Duschen", duration: 8 },
        { emoji: "👕", text: "Anziehen", duration: 5 },
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "🍞", text: "Frühstücken", duration: 12 },
        { emoji: "🎒", text: "Tasche packen", duration: 5 },
        { emoji: "🧥", text: "Jacke & Schuhe", duration: 2 },
        { emoji: "✅", text: "Alles dabei?", hint: "Schlüssel · Ticket · Airpods · Hausaufgaben · Handy", duration: 1 },
      ],
      fein: [
        { emoji: "🛏️", text: "Aufstehen", hint: "Erst hinsetzen, dann aufstehen", duration: 2 },
        { emoji: "💧", text: "Glas Wasser trinken", duration: 1 },
        { emoji: "🚿", text: "Duschen", duration: 8 },
        { emoji: "🧴", text: "Eincremen", duration: 2 },
        { emoji: "👕", text: "Anziehen", duration: 5 },
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "💇", text: "Haare", duration: 3 },
        { emoji: "🍞", text: "Frühstücken", duration: 12 },
        { emoji: "💊", text: "Medikamente", duration: 1 },
        { emoji: "🎒", text: "Tasche packen", hint: "Schlüssel · Ticket · Hausaufgaben", duration: 5 },
        { emoji: "🧥", text: "Jacke & Schuhe", duration: 2 },
        { emoji: "✅", text: "Alles dabei?", hint: "Schlüssel · Ticket · Airpods · Hausaufgaben · Handy", duration: 1 },
        { emoji: "🚪", text: "Tür abschliessen", duration: 1 },
      ],
    },
  },
  {
    id: "morgen_homeoffice",
    name: "Morgenroutine · Homeoffice",
    icon: "💻",
    category: "morgen",
    steps: {
      grob: [
        { emoji: "🛏️", text: "Aufstehen", duration: 2 },
        { emoji: "🪥", text: "Fertig machen", duration: 15 },
        { emoji: "☕", text: "Kaffee & Start", duration: 10 },
      ],
      mittel: [
        { emoji: "🛏️", text: "Aufstehen", duration: 2 },
        { emoji: "💧", text: "Wasser trinken", duration: 1 },
        { emoji: "🚿", text: "Duschen", duration: 8 },
        { emoji: "👕", text: "Anziehen", duration: 4 },
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "☕", text: "Kaffee", duration: 5 },
        { emoji: "🖥️", text: "Arbeitsplatz einrichten", duration: 3 },
      ],
      fein: [
        { emoji: "🛏️", text: "Aufstehen", duration: 2 },
        { emoji: "💧", text: "Wasser trinken", duration: 1 },
        { emoji: "🪟", text: "Lüften", duration: 2 },
        { emoji: "🚿", text: "Duschen", duration: 8 },
        { emoji: "👕", text: "Anziehen", hint: "Nicht im Pyjama bleiben", duration: 4 },
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "🍞", text: "Frühstück", duration: 10 },
        { emoji: "☕", text: "Kaffee zubereiten", duration: 5 },
        { emoji: "📋", text: "Tagesplan notieren", duration: 5 },
        { emoji: "🖥️", text: "Arbeitsplatz einrichten", duration: 3 },
      ],
    },
  },
  {
    id: "morgen_wochenende",
    name: "Morgenroutine · Wochenende",
    icon: "🌿",
    category: "morgen",
    steps: trio(
      [
        { emoji: "🛏️", text: "Langsam aufstehen", duration: 5 },
        { emoji: "☕", text: "Kaffee & Ruhe", duration: 15 },
        { emoji: "🪥", text: "Bad", duration: 15 },
      ],
      [
        { emoji: "🛏️", text: "Aufstehen", duration: 5 },
        { emoji: "💧", text: "Wasser trinken", duration: 1 },
        { emoji: "☕", text: "Kaffee", duration: 10 },
        { emoji: "🍳", text: "In Ruhe frühstücken", duration: 20 },
        { emoji: "🚿", text: "Duschen", duration: 10 },
        { emoji: "👕", text: "Anziehen", duration: 5 },
      ],
      [
        { emoji: "🛏️", text: "Aufstehen", duration: 5 },
        { emoji: "🪟", text: "Lüften", duration: 2 },
        { emoji: "💧", text: "Wasser trinken", duration: 1 },
        { emoji: "🧘", text: "Kurz dehnen", duration: 5 },
        { emoji: "☕", text: "Kaffee zubereiten", duration: 10 },
        { emoji: "🍳", text: "Frühstück", duration: 25 },
        { emoji: "📖", text: "Lesen oder Musik", duration: 15 },
        { emoji: "🚿", text: "Duschen", duration: 10 },
        { emoji: "👕", text: "Anziehen", duration: 5 },
      ],
    ),
  },
  {
    id: "abend",
    name: "Abendroutine",
    icon: "🌙",
    category: "abend",
    steps: {
      grob: [
        { emoji: "🍽️", text: "Küche aufräumen", duration: 10 },
        { emoji: "🛁", text: "Bad", duration: 10 },
        { emoji: "📖", text: "Runterkommen", duration: 15 },
      ],
      mittel: [
        { emoji: "🍽️", text: "Küche aufräumen", duration: 10 },
        { emoji: "🎒", text: "Sachen für morgen bereitlegen", duration: 5 },
        { emoji: "🛁", text: "Duschen / Bad", duration: 10 },
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "📖", text: "Lesen / runterkommen", duration: 20 },
        { emoji: "💡", text: "Licht aus", duration: 1 },
      ],
      fein: [
        { emoji: "🍽️", text: "Küche aufräumen", duration: 10 },
        { emoji: "🧺", text: "Wäsche / Ordnung", duration: 5 },
        { emoji: "🎒", text: "Sachen für morgen", hint: "Tasche, Kleider", duration: 5 },
        { emoji: "📱", text: "Handy weglegen", duration: 1 },
        { emoji: "🛁", text: "Duschen", duration: 8 },
        { emoji: "🧴", text: "Pflege", duration: 3 },
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "💊", text: "Medikamente", duration: 1 },
        { emoji: "📖", text: "Lesen", duration: 20 },
        { emoji: "🧘", text: "Atemübung", duration: 3 },
        { emoji: "💡", text: "Licht aus", duration: 1 },
      ],
    },
  },
  {
    id: "ins_bett",
    name: "Ins Bett",
    icon: "🛌",
    category: "abend",
    steps: trio(
      [
        { emoji: "🪥", text: "Zähne", duration: 3 },
        { emoji: "💡", text: "Licht aus", duration: 1 },
      ],
      [
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "💊", text: "Medikamente", duration: 1 },
        { emoji: "📱", text: "Handy weglegen", duration: 1 },
        { emoji: "💡", text: "Licht aus", duration: 1 },
      ],
      [
        { emoji: "🪥", text: "Zähne putzen", duration: 3 },
        { emoji: "💊", text: "Medikamente", duration: 1 },
        { emoji: "🚻", text: "Toilette", duration: 2 },
        { emoji: "📱", text: "Handy weglegen", duration: 1 },
        { emoji: "🧘", text: "Atemübung", duration: 3 },
        { emoji: "💡", text: "Licht aus", duration: 1 },
      ],
    ),
  },
  {
    id: "vorabend",
    name: "Vorabend vorbereiten",
    icon: "🌆",
    category: "vorbereitung",
    steps: trio(
      [
        { emoji: "👕", text: "Kleider bereitlegen", duration: 3 },
        { emoji: "🎒", text: "Tasche packen", duration: 5 },
      ],
      [
        { emoji: "👕", text: "Kleider bereitlegen", duration: 3 },
        { emoji: "🎒", text: "Tasche packen", duration: 5 },
        { emoji: "🍱", text: "Znüni vorbereiten", duration: 5 },
        { emoji: "📋", text: "Plan für morgen", duration: 3 },
      ],
      [
        { emoji: "👕", text: "Kleider bereitlegen", hint: "Wetter checken", duration: 5 },
        { emoji: "🎒", text: "Tasche packen", hint: "Bus-Check Items", duration: 5 },
        { emoji: "🍱", text: "Znüni & Wasser", duration: 5 },
        { emoji: "📋", text: "Top 3 für morgen notieren", duration: 5 },
        { emoji: "💊", text: "Medi-Box füllen", duration: 2 },
        { emoji: "🔑", text: "Schlüssel & Ticket bereit", duration: 1 },
      ],
    ),
  },
  {
    id: "woche_vorbereiten",
    name: "Woche vorbereiten",
    icon: "🗓️",
    category: "vorbereitung",
    steps: trio(
      [
        { emoji: "🗓️", text: "Kalender durchgehen", duration: 10 },
        { emoji: "🛒", text: "Einkauf", duration: 30 },
      ],
      [
        { emoji: "🗓️", text: "Termine ansehen", duration: 10 },
        { emoji: "🍽️", text: "Essensplan", duration: 15 },
        { emoji: "🛒", text: "Einkaufsliste", duration: 10 },
        { emoji: "🧺", text: "Wäsche planen", duration: 5 },
      ],
      [
        { emoji: "🗓️", text: "Termine + Konflikte prüfen", duration: 10 },
        { emoji: "🎯", text: "Top 3 Wochenziele", duration: 10 },
        { emoji: "🍽️", text: "Essensplan", duration: 15 },
        { emoji: "🛒", text: "Einkaufsliste", duration: 10 },
        { emoji: "🧺", text: "Wäsche & Haushalt planen", duration: 5 },
        { emoji: "💰", text: "Finanzen kurz prüfen", duration: 10 },
      ],
    ),
  },
  {
    id: "hausaufgaben",
    name: "Hausaufgaben",
    icon: "✏️",
    category: "lernen",
    steps: trio(
      [
        { emoji: "📚", text: "Material rausholen", duration: 3 },
        { emoji: "✏️", text: "Aufgaben machen", duration: 30 },
      ],
      [
        { emoji: "🥤", text: "Wasser + Snack", duration: 3 },
        { emoji: "📚", text: "Material bereit", duration: 3 },
        { emoji: "✏️", text: "Aufgabe 1", duration: 20 },
        { emoji: "🚶", text: "Kurze Pause", duration: 5 },
        { emoji: "✏️", text: "Aufgabe 2", duration: 20 },
        { emoji: "🎒", text: "Einpacken", duration: 3 },
      ],
      [
        { emoji: "🚻", text: "Toilette", duration: 2 },
        { emoji: "🥤", text: "Wasser + Snack", duration: 3 },
        { emoji: "📚", text: "Material bereit", duration: 3 },
        { emoji: "📋", text: "Aufgaben auflisten", duration: 3 },
        { emoji: "✏️", text: "Aufgabe 1", duration: 20 },
        { emoji: "🚶", text: "Kurze Pause", duration: 5 },
        { emoji: "✏️", text: "Aufgabe 2", duration: 20 },
        { emoji: "🚶", text: "Kurze Pause", duration: 5 },
        { emoji: "✏️", text: "Aufgabe 3", duration: 20 },
        { emoji: "✅", text: "Checken & einpacken", duration: 5 },
      ],
    ),
  },
  {
    id: "lernblock",
    name: "Lernblock",
    icon: "📖",
    category: "lernen",
    steps: trio(
      [
        { emoji: "📖", text: "Lernen", duration: 25 },
        { emoji: "🚶", text: "Pause", duration: 5 },
      ],
      [
        { emoji: "📖", text: "Pomodoro 1", duration: 25 },
        { emoji: "🚶", text: "Pause", duration: 5 },
        { emoji: "📖", text: "Pomodoro 2", duration: 25 },
        { emoji: "🚶", text: "Pause", duration: 5 },
      ],
      [
        { emoji: "🎯", text: "Ziel festlegen", duration: 3 },
        { emoji: "📖", text: "Pomodoro 1", duration: 25 },
        { emoji: "🚶", text: "Pause", duration: 5 },
        { emoji: "📖", text: "Pomodoro 2", duration: 25 },
        { emoji: "🚶", text: "Längere Pause", duration: 15 },
        { emoji: "📖", text: "Pomodoro 3", duration: 25 },
        { emoji: "📝", text: "Zusammenfassen", duration: 10 },
      ],
    ),
  },
  {
    id: "medi_morgens",
    name: "Medikament morgens",
    icon: "💊",
    category: "gesundheit",
    steps: trio(
      [{ emoji: "💊", text: "Medikament nehmen", duration: 1 }],
      [
        { emoji: "💧", text: "Wasser bereit", duration: 1 },
        { emoji: "💊", text: "Medikament nehmen", duration: 1 },
        { emoji: "✅", text: "Eingenommen markieren", duration: 1 },
      ],
      [
        { emoji: "💧", text: "Glas Wasser", duration: 1 },
        { emoji: "📦", text: "Box prüfen", duration: 1 },
        { emoji: "💊", text: "Medikament nehmen", duration: 1 },
        { emoji: "✅", text: "Eingenommen markieren", duration: 1 },
      ],
    ),
  },
  {
    id: "medi_mittags",
    name: "Medikament mittags",
    icon: "💊",
    category: "gesundheit",
    steps: trio(
      [{ emoji: "💊", text: "Medikament nehmen", duration: 1 }],
      [
        { emoji: "💧", text: "Wasser bereit", duration: 1 },
        { emoji: "💊", text: "Medikament nehmen", duration: 1 },
        { emoji: "✅", text: "Eingenommen markieren", duration: 1 },
      ],
      [
        { emoji: "💧", text: "Glas Wasser", duration: 1 },
        { emoji: "📦", text: "Box prüfen", duration: 1 },
        { emoji: "💊", text: "Medikament nehmen", duration: 1 },
        { emoji: "✅", text: "Eingenommen markieren", duration: 1 },
      ],
    ),
  },
];

export function getWorkflow(id: string) {
  return workflows.find((w) => w.id === id);
}

export function workflowsByCategory(): Record<Category, Workflow[]> {
  const out: Record<Category, Workflow[]> = {
    morgen: [],
    abend: [],
    vorbereitung: [],
    lernen: [],
    gesundheit: [],
    eigene: [],
  };
  for (const w of workflows) out[w.category].push(w);
  return out;
}
