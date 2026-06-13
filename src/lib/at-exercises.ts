export type BreathPattern = {
  in: number;
  hold: number; // 0 = kein Halten
  out: number;
};

export type AtExercise = {
  id: string;
  category: "standard" | "adhs";
  name: string;
  duration: number; // minutes
  description: string;
  breath: BreathPattern;
  formulas: string[];
};

export const atExercises: AtExercise[] = [
  // --- Standard ---------------------------------------------------------
  {
    id: "schwere",
    category: "standard",
    name: "Schwereübung",
    duration: 5,
    description: "Arme und Beine werden schwer.",
    breath: { in: 4, hold: 0, out: 6 },
    formulas: [
      "Ich bin ganz ruhig.",
      "Mein rechter Arm ist ganz schwer.",
      "Mein linker Arm ist ganz schwer.",
      "Beide Arme sind schwer und warm.",
      "Meine Beine sind schwer.",
      "Mein ganzer Körper ist schwer.",
      "Ich bin vollkommen ruhig.",
    ],
  },
  {
    id: "waerme",
    category: "standard",
    name: "Wärmeübung",
    duration: 5,
    description: "Angenehme Wärme breitet sich im Körper aus.",
    breath: { in: 4, hold: 2, out: 6 },
    formulas: [
      "Ich bin ganz ruhig.",
      "Mein rechter Arm ist angenehm warm.",
      "Mein linker Arm ist angenehm warm.",
      "Die Wärme breitet sich aus.",
      "Meine Beine werden warm.",
      "Mein ganzer Körper ist warm.",
      "Ich bin vollkommen ruhig.",
    ],
  },
  {
    id: "ruhe",
    category: "standard",
    name: "Ruheübung",
    duration: 3,
    description: "Tiefe innere Ruhe.",
    breath: { in: 4, hold: 0, out: 8 },
    formulas: [
      "Ich bin ruhig und entspannt.",
      "Mein Atem fliesst ruhig.",
      "Mein Körper wird ruhig und schwer.",
      "Stille und Frieden.",
      "Ich bin ganz ruhig.",
    ],
  },
  {
    id: "einschlafen",
    category: "standard",
    name: "Einschlafen",
    duration: 10,
    description: "Zum Loslassen am Abend.",
    breath: { in: 4, hold: 2, out: 8 },
    formulas: [
      "Der Tag ist vorbei.",
      "Ich lasse alles los.",
      "Mein Körper wird schwer.",
      "Eine angenehme Wärme breitet sich aus.",
      "Mein Atem fliesst ruhig.",
      "Ruhe… Wärme… Frieden.",
      "Ich darf einschlafen.",
    ],
  },
  // --- ADHS -------------------------------------------------------------
  {
    id: "fokus",
    category: "adhs",
    name: "Fokus-Anker",
    duration: 3,
    description: "Vor einer wichtigen Aufgabe.",
    breath: { in: 4, hold: 4, out: 4 }, // Box-Breathing (Halten auch nach dem Ausatmen — Player nimmt in/hold/out)
    formulas: [
      "Ich bin hier. Ich bin jetzt.",
      "Mein Geist kommt zur Ruhe.",
      "Eine Aufgabe. Ein Moment.",
      "Ich atme ein — ich atme aus.",
      "Ich bin bereit zu beginnen.",
    ],
  },
  {
    id: "erdung",
    category: "adhs",
    name: "Erdungsübung",
    duration: 2,
    description: "Bei Reizüberflutung.",
    breath: { in: 4, hold: 0, out: 6 },
    formulas: [
      "Ich spüre meine Füsse auf dem Boden.",
      "Ich bin sicher. Ich bin hier.",
      "Der Atem trägt mich.",
      "Langsam. Schritt für Schritt.",
    ],
  },
  {
    id: "uebergang",
    category: "adhs",
    name: "Übergangsritual",
    duration: 2,
    description: "Zwischen zwei Aktivitäten.",
    breath: { in: 3, hold: 0, out: 5 },
    formulas: [
      "Das Alte lasse ich los.",
      "Ich mache Platz für Neues.",
      "Ein Atemzug. Ein Neustart.",
      "Ich bin bereit.",
    ],
  },
  {
    id: "morgen_aktivierung",
    category: "adhs",
    name: "Morgen-Aktivierung",
    duration: 3,
    description: "Starten in den Tag.",
    breath: { in: 5, hold: 0, out: 3 },
    formulas: [
      "Ich atme tief ein.",
      "Energie fliesst in meinen Körper.",
      "Ich bin wach und bereit.",
      "Dieser Tag gehört mir.",
    ],
  },
];

export function getAtExercise(id: string) {
  return atExercises.find((e) => e.id === id);
}
