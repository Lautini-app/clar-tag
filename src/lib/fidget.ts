export type FidgetExercise = {
  emoji: string;
  name: string;
  duration: number;
  instruction: string;
};

export const EXERCISES: FidgetExercise[] = [
  { emoji: "🙌", name: "Arme schütteln", duration: 30, instruction: "Schüttle beide Arme locker aus — Hände, Handgelenke, Schultern." },
  { emoji: "🦘", name: "Auf der Stelle hüpfen", duration: 30, instruction: "Leicht auf den Fussballen hüpfen. Locker bleiben!" },
  { emoji: "⭐", name: "Hampelmann", duration: 45, instruction: "Arme hoch, Beine auseinander — und zurück. Im eigenen Tempo." },
  { emoji: "🧘", name: "Schultern kreisen", duration: 30, instruction: "Schultern nach hinten kreisen — langsam, gross, bewusst." },
  { emoji: "🙆", name: "Arme strecken", duration: 30, instruction: "Arme über den Kopf strecken, tief einatmen, loslassen." },
  { emoji: "🦵", name: "Kniebeugen", duration: 45, instruction: "Langsam runter, langsam hoch. So tief wie angenehm." },
  { emoji: "👀", name: "Augen rollen", duration: 30, instruction: "Augen langsam im Kreis bewegen — erst rechts, dann links." },
  { emoji: "🤸", name: "Seitliche Dehnung", duration: 30, instruction: "Arm über den Kopf, zur Seite neigen. Beide Seiten." },
  { emoji: "💃", name: "Auf der Stelle tanzen", duration: 45, instruction: "Beweg dich wie du willst. Kein Urteil, einfach bewegen." },
  { emoji: "🧍", name: "Balance halten", duration: 30, instruction: "Auf einem Bein stehen. Wechseln wenn du wackelst." },
  { emoji: "✊", name: "Hände öffnen/schliessen", duration: 30, instruction: "Fäuste ballen, Finger spreizen — schnell abwechseln." },
  { emoji: "🚶", name: "Auf der Stelle gehen", duration: 45, instruction: "Knie hoch, Arme mitschwingen. Schön übertrieben!" },
  { emoji: "😮‍💨", name: "Tiefes Atmen", duration: 45, instruction: "4 Sekunden einatmen, 4 halten, 6 ausatmen. Dreimal." },
  { emoji: "🙇", name: "Nacken lockern", duration: 30, instruction: "Kopf langsam zur Seite neigen, halten, andere Seite." },
  { emoji: "🤲", name: "Finger tippen", duration: 30, instruction: "Jeden Finger einzeln auf den Daumen tippen — erst langsam, dann schnell." },
];

export function randomExercise(): FidgetExercise {
  return EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
}
