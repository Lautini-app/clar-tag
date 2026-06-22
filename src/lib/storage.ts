// Tiny localStorage wrapper with SSR safety.
const isBrowser = typeof window !== "undefined";

export function lsGet<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet<T>(key: string, value: T) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const KEYS = {
  settings: "clartag.settings",
  progress: "clartag.progress",
  decisions: "clartag.decisions",
  family: "clartag.family",
  activeMember: "clartag.activeMember",
} as const;

export type Settings = {
  name: string;
  mode: "solo" | "family";
  countdownStyle: "bar" | "blocks" | "ring";
  audioOn: boolean;
};

export const defaultSettings: Settings = {
  name: "",
  mode: "solo",
  countdownStyle: "bar",
  audioOn: true,
};

// ---------- Familienmodus ----------

export type Stage = "begleitet" | "unterstuetzt" | "selbststaendig";

export const STAGE_META: Record<
  Stage,
  { label: string; ageHint: string; description: string }
> = {
  begleitet: {
    label: "Begleitet",
    ageHint: "6–10 Jahre",
    description: "Admin plant alles. Vereinfachte Ansicht, ein grosser Button.",
  },
  unterstuetzt: {
    label: "Unterstützt",
    ageHint: "11–15 Jahre",
    description: "Normale Ansicht. Routinen aus Bibliothek mit Admin-OK.",
  },
  selbststaendig: {
    label: "Selbständig",
    ageHint: "16+ Jahre",
    description: "Volle App, alles erlaubt, kein Eingriff.",
  },
};

export type MemberToggles = {
  adminPlans: boolean; // Admin plant Routinen für diese Person
  libraryPick: boolean; // Person darf Routinen aus Bibliothek wählen
  freeCreate: boolean; // Person darf eigene Routinen frei erstellen
  adminApproval: boolean; // Neue Routinen brauchen Admin-OK
  decide: boolean; // Entscheiden-Feature
  at: boolean; // Autogenes Training
  readySignal: boolean; // Ready-Signal senden
  settingsVisible: boolean; // Einstellungen sichtbar
};

export const STAGE_DEFAULTS: Record<Stage, MemberToggles> = {
  begleitet: {
    adminPlans: true,
    libraryPick: false,
    freeCreate: false,
    adminApproval: true,
    decide: false,
    at: false,
    readySignal: true,
    settingsVisible: false,
  },
  unterstuetzt: {
    adminPlans: false,
    libraryPick: true,
    freeCreate: false,
    adminApproval: true,
    decide: true,
    at: true,
    readySignal: true,
    settingsVisible: false,
  },
  selbststaendig: {
    adminPlans: false,
    libraryPick: true,
    freeCreate: true,
    adminApproval: false,
    decide: true,
    at: true,
    readySignal: true,
    settingsVisible: true,
  },
};

export const TOGGLE_META: Record<keyof MemberToggles, string> = {
  adminPlans: "Admin plant Routinen",
  libraryPick: "Routinen aus Bibliothek wählen",
  freeCreate: "Routinen frei erstellen",
  adminApproval: "Admin-Genehmigung nötig",
  decide: "Entscheiden-Feature",
  at: "Autogenes Training",
  readySignal: "Ready-Signal senden",
  settingsVisible: "Einstellungen sichtbar",
};

export type FamilyMember = {
  id: string;
  name: string;
  emoji: string;
  stage?: Stage; // optional for backward compat
  toggles?: Partial<MemberToggles>; // overrides on top of stage defaults
};

export function memberStage(m: FamilyMember): Stage {
  return m.stage ?? "selbststaendig";
}

export function effectiveToggles(m: FamilyMember): MemberToggles {
  return { ...STAGE_DEFAULTS[memberStage(m)], ...(m.toggles ?? {}) };
}
