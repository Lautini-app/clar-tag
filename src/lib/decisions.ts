import type { WeatherSnapshot } from "./weather";
import { tempBand } from "./weather";

export type DecisionOption = { id: string; label: string; emoji?: string };
export type DecisionQuestion = {
  id: string;
  text: string;
  options: DecisionOption[];
};

export type DecisionAnswerMap = Record<string, string>;

export type DecisionResult = {
  title: string;
  detail: string;
  reasoning: string;
};

export type DecisionHelper = {
  id: string;
  name: string;
  icon: string;
  intro: string;
  needsWeather?: boolean;
  questions: DecisionQuestion[];
  resolve: (
    answers: DecisionAnswerMap,
    ctx: { weather?: WeatherSnapshot | null; variant: number },
  ) => DecisionResult;
};

// --- Outfit ---------------------------------------------------------------
const outfitTops = {
  cold: ["Pullover + Thermo-Shirt", "Rollkragen + Fleece", "Hoodie + Longsleeve"],
  cool: ["Pullover", "Sweatshirt", "Langarm-Shirt + Cardigan"],
  mild: ["Langarm-Shirt", "Leichter Pullover", "T-Shirt + dünne Jacke"],
  warm: ["T-Shirt", "Leinen-Hemd", "Polo"],
  hot: ["T-Shirt (locker)", "Leinen-Shirt", "Tank-Top"],
};
const outfitBottoms = {
  cold: ["Jeans + Thermo", "Cordhose", "Warme Hose"],
  cool: ["Jeans", "Cordhose", "Chinos"],
  mild: ["Jeans", "Chinos", "Leichte Hose"],
  warm: ["Chinos", "Leichte Hose", "Leinen-Hose"],
  hot: ["Shorts", "Leinen-Hose", "Leichte Shorts"],
};
const outfitShoes = {
  cold: ["Boots", "Warme Sneakers"],
  cool: ["Sneakers", "Boots"],
  mild: ["Sneakers"],
  warm: ["Sneakers", "Loafers"],
  hot: ["Sneakers (luftig)", "Sandalen"],
};

// --- Food -----------------------------------------------------------------
const foodPool: Record<string, Record<string, string[]>> = {
  schnell: {
    herzhaft: ["Spiegelei mit Brot", "Käse-Sandwich", "Wraps mit Hummus"],
    suess: ["Joghurt mit Beeren", "Porridge mit Banane", "Toast mit Erdnussbutter"],
    egal: ["Müesli", "Brot mit Käse", "Rührei"],
  },
  mittel: {
    herzhaft: ["Pasta mit Tomatensauce", "Reis mit Gemüse", "Suppe mit Brot"],
    suess: ["Pancakes", "French Toast", "Grosse Smoothie-Bowl"],
    egal: ["Pasta Aglio Olio", "Risotto", "Gemüsepfanne"],
  },
  viel: {
    herzhaft: ["Ofengemüse mit Kartoffeln", "Curry mit Reis", "Pasta-Auflauf"],
    suess: ["Ofen-Pancakes mit Obst", "Beerencrumble", "Apfelstrudel"],
    egal: ["Lasagne", "Ramen", "Bolognese"],
  },
};

// --- Activity -------------------------------------------------------------
const activityPool: Record<string, Record<string, Record<string, string[]>>> = {
  kurz: {
    drinnen: {
      allein: ["10 Minuten lesen", "Atemübung", "Aufräumen einer Schublade"],
      mit: ["Kurzes Gespräch führen", "Gemeinsam Tee trinken", "Karten spielen"],
    },
    draussen: {
      allein: ["Kurzer Spaziergang um den Block", "Frische Luft auf dem Balkon"],
      mit: ["Spaziergang zu zweit", "Kaffee draussen trinken"],
    },
  },
  mittel: {
    drinnen: {
      allein: ["Lesen", "Podcast hören & dehnen", "Kreatives Projekt (30 min)"],
      mit: ["Brettspiel", "Film schauen", "Zusammen kochen"],
    },
    draussen: {
      allein: ["Spaziergang in den Park", "Velo-Runde", "Joggen"],
      mit: ["Picknick", "Spaziergang am Wasser", "Velo-Tour zu zweit"],
    },
  },
  lang: {
    drinnen: {
      allein: ["Film + Snack-Setup", "Neues Rezept ausprobieren", "Projekt starten"],
      mit: ["Brunch zubereiten", "Spieleabend", "Gemeinsam basteln"],
    },
    draussen: {
      allein: ["Wanderung", "Tagestrip mit Zug", "Foto-Spaziergang"],
      mit: ["Ausflug planen", "Wanderung zu zweit", "Picknick + Spiele im Park"],
    },
  },
};

// --- Priority -------------------------------------------------------------
const priorityPool: Record<string, Record<string, Record<string, { task: string; why: string }[]>>> =
  {
    deadline: {
      klein: {
        hoch: [
          { task: "Die Deadline-Aufgabe", why: "Klein + dringend + Konzentration hoch = jetzt erledigen, kostet wenig." },
        ],
        mittel: [
          { task: "Die Deadline-Aufgabe", why: "Klein + dringend. Konzentration reicht, danach belohnen." },
        ],
        niedrig: [
          { task: "Nur den ersten Schritt der Deadline-Aufgabe", why: "Dringend, aber Konzentration tief. Erster Schritt: 5 Minuten, danach Pause." },
        ],
      },
      gross: {
        hoch: [
          { task: "Die Deadline-Aufgabe in 25-Min-Block", why: "Gross + dringend + Konzentration da. Pomodoro starten." },
        ],
        mittel: [
          { task: "Die Deadline-Aufgabe in zwei 20-Min-Blöcken", why: "Gross + dringend. Aufteilen reduziert Widerstand." },
        ],
        niedrig: [
          { task: "Aufgabe in Mini-Schritte zerlegen", why: "Gross + dringend, aber Konzentration tief. Heute nur planen, dann ersten Mini-Schritt." },
        ],
      },
    },
    wichtig: {
      klein: {
        hoch: [
          { task: "Die wichtige Aufgabe sofort", why: "Klein + Konzentration hoch — schnell weg, gibt Schub." },
        ],
        mittel: [{ task: "Die wichtige Aufgabe", why: "Klein, also überschaubar. Direkt anfangen." }],
        niedrig: [
          { task: "Aufgabe in 5-Min-Block starten", why: "Konzentration tief. Klein anfangen, Momentum aufbauen." },
        ],
      },
      gross: {
        hoch: [
          { task: "Wichtige Aufgabe, Pomodoro 25 Min", why: "Gross aber Konzentration da. Block nutzen." },
        ],
        mittel: [
          { task: "Wichtige Aufgabe in zwei kleinen Blöcken", why: "Gross + Konzentration mittel. Pausen einplanen." },
        ],
        niedrig: [
          { task: "Nur planen + ersten Mini-Schritt", why: "Gross + Konzentration tief — heute nicht erzwingen." },
        ],
      },
    },
    leicht: {
      klein: {
        hoch: [{ task: "Die leichte Aufgabe", why: "Schneller Win, danach grössere angehen." }],
        mittel: [{ task: "Die leichte Aufgabe", why: "Klein + leicht = sofort erledigen." }],
        niedrig: [
          { task: "Die leichte Aufgabe", why: "Konzentration tief, aber leicht — perfekt, um in Gang zu kommen." },
        ],
      },
      gross: {
        hoch: [{ task: "Leichte grosse Aufgabe in einem Block", why: "Konzentration da, also einfach durchziehen." }],
        mittel: [{ task: "Leichte Aufgabe in 20-Min-Block", why: "Keine Eile, Block reicht." }],
        niedrig: [
          { task: "Mit dem allereinfachsten Teil starten", why: "Konzentration tief — die leichteste Stelle macht den Einstieg." },
        ],
      },
    },
  };

function pick<T>(arr: T[], variant: number): T {
  return arr[variant % arr.length];
}

// --- Built-in helpers ----------------------------------------------------
export const decisionHelpers: DecisionHelper[] = [
  {
    id: "outfit",
    name: "Was ziehe ich an?",
    icon: "👕",
    intro: "Drei Fragen, dann ein Outfit-Vorschlag.",
    needsWeather: true,
    questions: [
      {
        id: "tag",
        text: "Wie ist dein Tag?",
        options: [
          { id: "buero", label: "Büro / Termin", emoji: "💼" },
          { id: "casual", label: "Casual / Schule", emoji: "🎒" },
          { id: "sport", label: "Aktiv / Sport", emoji: "🏃" },
        ],
      },
      {
        id: "fuehlst",
        text: "Wie fühlst du dich?",
        options: [
          { id: "wach", label: "Wach + bereit", emoji: "✨" },
          { id: "neutral", label: "Geht so", emoji: "🙂" },
          { id: "muede", label: "Müde / overwhelmed", emoji: "🌫️" },
        ],
      },
      {
        id: "komfort",
        text: "Wie bequem brauchst du es?",
        options: [
          { id: "comf", label: "Maximal bequem", emoji: "🛋️" },
          { id: "mid", label: "Mittel", emoji: "👕" },
          { id: "schick", label: "Eher schick", emoji: "👔" },
        ],
      },
    ],
    resolve: (answers, { weather, variant }) => {
      const band = weather ? tempBand(weather.temperature) : "mild";
      const tag = answers.tag;
      const komfort = answers.komfort;

      let top = pick(outfitTops[band], variant);
      let bottom = pick(outfitBottoms[band], variant);
      let shoes = pick(outfitShoes[band], variant);

      if (tag === "sport") {
        top = band === "cold" || band === "cool" ? "Funktions-Longsleeve + leichte Jacke" : "Sport-Shirt";
        bottom = band === "hot" || band === "warm" ? "Sport-Shorts" : "Sport-Hose";
        shoes = "Sportschuhe";
      } else if (tag === "buero" && komfort === "schick") {
        top = band === "hot" ? "Hemd kurzarm" : "Hemd";
        bottom = "Chinos";
        shoes = "Loafers oder Lederschuhe";
      } else if (komfort === "comf") {
        top = band === "cold" || band === "cool" ? "Weicher Hoodie" : "Locker geschnittenes T-Shirt";
        bottom = band === "hot" ? "Lockere Shorts" : "Jogger oder weiche Hose";
      }

      const wetter = weather
        ? `${weather.temperature}°C, ${weather.description}.`
        : "Wetter unbekannt — Annahme: mild.";
      const reasoning = `${wetter} Tag: ${tag === "buero" ? "Büro" : tag === "casual" ? "Casual" : "Sport"}, Komfort: ${komfort === "comf" ? "max. bequem" : komfort === "mid" ? "mittel" : "schick"}.`;

      const layer =
        band === "cold"
          ? " + warme Jacke + Schal"
          : band === "cool"
            ? " + Übergangsjacke"
            : band === "mild"
              ? " + leichte Jacke"
              : "";

      return {
        title: `${top} + ${bottom} + ${shoes}${layer}`,
        detail: weather ? `Wetter jetzt: ${weather.temperature}°C, ${weather.description}` : "",
        reasoning,
      };
    },
  },
  {
    id: "essen",
    name: "Was esse ich?",
    icon: "🍽",
    intro: "Drei Fragen, dann ein konkreter Essens-Vorschlag.",
    questions: [
      {
        id: "zeit",
        text: "Wie viel Zeit hast du?",
        options: [
          { id: "schnell", label: "Unter 10 min", emoji: "⚡" },
          { id: "mittel", label: "15–30 min", emoji: "⏱️" },
          { id: "viel", label: "Über 30 min", emoji: "🍳" },
        ],
      },
      {
        id: "appetit",
        text: "Worauf hast du Lust?",
        options: [
          { id: "herzhaft", label: "Herzhaft", emoji: "🧀" },
          { id: "suess", label: "Süss", emoji: "🍯" },
          { id: "egal", label: "Egal", emoji: "🤷" },
        ],
      },
      {
        id: "energie",
        text: "Wie viel Energie zum Kochen?",
        options: [
          { id: "tief", label: "Wenig", emoji: "🛋️" },
          { id: "mittel", label: "Geht", emoji: "🙂" },
          { id: "hoch", label: "Voll dabei", emoji: "💪" },
        ],
      },
    ],
    resolve: (answers, { variant }) => {
      const zeit = answers.zeit;
      const appetit = answers.appetit;
      const energie = answers.energie;
      let pool = foodPool[zeit][appetit];
      if (energie === "tief") {
        pool = foodPool.schnell[appetit];
      }
      const choice = pick(pool, variant);
      return {
        title: choice,
        detail: "",
        reasoning: `Zeit: ${zeit}, Lust: ${appetit}, Energie: ${energie}. Bei wenig Energie wurde auf etwas Schnelles reduziert.`,
      };
    },
  },
  {
    id: "aktivitaet",
    name: "Was mache ich jetzt?",
    icon: "🎮",
    intro: "Drei Fragen, dann eine konkrete Aktivität.",
    questions: [
      {
        id: "zeit",
        text: "Wie viel Zeit hast du?",
        options: [
          { id: "kurz", label: "15 min", emoji: "⏳" },
          { id: "mittel", label: "1 Stunde", emoji: "🕐" },
          { id: "lang", label: "Halber Tag+", emoji: "🌞" },
        ],
      },
      {
        id: "ort",
        text: "Drinnen oder draussen?",
        options: [
          { id: "drinnen", label: "Drinnen", emoji: "🏠" },
          { id: "draussen", label: "Draussen", emoji: "🌳" },
        ],
      },
      {
        id: "social",
        text: "Allein oder mit anderen?",
        options: [
          { id: "allein", label: "Allein", emoji: "🧘" },
          { id: "mit", label: "Mit jemandem", emoji: "👥" },
        ],
      },
    ],
    resolve: (answers, { variant }) => {
      const pool = activityPool[answers.zeit][answers.ort][answers.social];
      const choice = pick(pool, variant);
      return {
        title: choice,
        detail: "",
        reasoning: `${answers.zeit === "kurz" ? "Kurze Zeit" : answers.zeit === "mittel" ? "Mittlere Zeit" : "Viel Zeit"} · ${answers.ort === "drinnen" ? "drinnen" : "draussen"} · ${answers.social === "allein" ? "allein" : "mit anderen"}.`,
      };
    },
  },
  {
    id: "prioritaet",
    name: "Womit fange ich an?",
    icon: "📚",
    intro: "Drei Fragen, dann eine priorisierte erste Aufgabe.",
    questions: [
      {
        id: "dringend",
        text: "Was ist dringender?",
        options: [
          { id: "deadline", label: "Hat Deadline", emoji: "⏰" },
          { id: "wichtig", label: "Wichtig, keine Deadline", emoji: "⭐" },
          { id: "leicht", label: "Eher leicht / nice to have", emoji: "🪶" },
        ],
      },
      {
        id: "groesse",
        text: "Wie gross ist die Aufgabe?",
        options: [
          { id: "klein", label: "Klein (<30 min)", emoji: "🐾" },
          { id: "gross", label: "Gross (>30 min)", emoji: "🐘" },
        ],
      },
      {
        id: "konzentration",
        text: "Wie ist deine Konzentration?",
        options: [
          { id: "hoch", label: "Hoch", emoji: "🔆" },
          { id: "mittel", label: "Mittel", emoji: "🌤️" },
          { id: "niedrig", label: "Niedrig", emoji: "🌫️" },
        ],
      },
    ],
    resolve: (answers, { variant }) => {
      const pool = priorityPool[answers.dringend][answers.groesse][answers.konzentration];
      const choice = pick(pool, variant);
      return {
        title: choice.task,
        detail: "",
        reasoning: choice.why,
      };
    },
  },
];

export function getHelper(id: string) {
  return decisionHelpers.find((h) => h.id === id);
}

// --- Decision log (localStorage) -----------------------------------------
export type DecisionLog = {
  id: string;
  helperId: string;
  helperName: string;
  title: string;
  at: string; // ISO timestamp
};
