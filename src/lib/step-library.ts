// Curated step library — quick chips users can drop into routines.
import type { UserWorkflowStep } from "./user-workflows.functions";

export type StepCategory = "morgen" | "abend" | "vorbereitung" | "lernen" | "gesundheit" | "allgemein";

export type LibraryStep = UserWorkflowStep & { id: string; group: StepCategory };

export const stepLibrary: LibraryStep[] = [
  // Morgen
  { id: "m-aufstehen", group: "morgen", emoji: "🛏️", text: "Aufstehen", duration: 2 },
  { id: "m-wasser", group: "morgen", emoji: "💧", text: "Glas Wasser trinken", duration: 1 },
  { id: "m-duschen", group: "morgen", emoji: "🚿", text: "Duschen", duration: 8 },
  { id: "m-anziehen", group: "morgen", emoji: "👕", text: "Anziehen", duration: 5 },
  { id: "m-zaehne", group: "morgen", emoji: "🪥", text: "Zähne putzen", duration: 3 },
  { id: "m-haare", group: "morgen", emoji: "💇", text: "Haare", duration: 3 },
  { id: "m-fruehstueck", group: "morgen", emoji: "🍞", text: "Frühstücken", duration: 12 },
  { id: "m-kaffee", group: "morgen", emoji: "☕", text: "Kaffee", duration: 5 },
  { id: "m-tasche", group: "morgen", emoji: "🎒", text: "Tasche packen", duration: 5 },
  { id: "m-jacke", group: "morgen", emoji: "🧥", text: "Jacke & Schuhe", duration: 2 },
  { id: "m-busCheck", group: "morgen", emoji: "✅", text: "Alles dabei?", hint: "Schlüssel · Ticket · Airpods · Hausaufgaben · Handy", duration: 1 },

  // Abend
  { id: "a-kueche", group: "abend", emoji: "🍽️", text: "Küche aufräumen", duration: 10 },
  { id: "a-pflege", group: "abend", emoji: "🧴", text: "Pflege", duration: 3 },
  { id: "a-lesen", group: "abend", emoji: "📖", text: "Lesen", duration: 20 },
  { id: "a-licht", group: "abend", emoji: "💡", text: "Licht aus", duration: 1 },
  { id: "a-handy", group: "abend", emoji: "📱", text: "Handy weglegen", duration: 1 },

  // Vorbereitung
  { id: "v-kleider", group: "vorbereitung", emoji: "👕", text: "Kleider bereitlegen", duration: 3 },
  { id: "v-znueni", group: "vorbereitung", emoji: "🍱", text: "Znüni vorbereiten", duration: 5 },
  { id: "v-plan", group: "vorbereitung", emoji: "📋", text: "Plan für morgen", duration: 3 },

  // Lernen
  { id: "l-pomodoro", group: "lernen", emoji: "📖", text: "Pomodoro 25 Min", duration: 25 },
  { id: "l-pause", group: "lernen", emoji: "🚶", text: "Kurze Pause", duration: 5 },
  { id: "l-ziel", group: "lernen", emoji: "🎯", text: "Ziel festlegen", duration: 3 },
  { id: "l-zusammen", group: "lernen", emoji: "📝", text: "Zusammenfassen", duration: 10 },

  // Gesundheit
  { id: "g-medi", group: "gesundheit", emoji: "💊", text: "Medikament nehmen", duration: 1 },
  { id: "g-atem", group: "gesundheit", emoji: "🧘", text: "Atemübung", duration: 3 },
  { id: "g-dehnen", group: "gesundheit", emoji: "🤸", text: "Kurz dehnen", duration: 5 },

  // Allgemein
  { id: "x-todo", group: "allgemein", emoji: "✏️", text: "Aufgabe erledigen", duration: 15 },
  { id: "x-check", group: "allgemein", emoji: "✅", text: "Check & abhaken", duration: 2 },
  { id: "x-pause", group: "allgemein", emoji: "🚻", text: "Toilette", duration: 2 },
];

export const stepGroupLabels: Record<StepCategory, { label: string; icon: string }> = {
  morgen: { label: "Morgen", icon: "🌅" },
  abend: { label: "Abend", icon: "🌙" },
  vorbereitung: { label: "Vorbereitung", icon: "⭐" },
  lernen: { label: "Lernen", icon: "📚" },
  gesundheit: { label: "Gesundheit", icon: "💊" },
  allgemein: { label: "Allgemein", icon: "✨" },
};
