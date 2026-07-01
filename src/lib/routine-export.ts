// JSON-Export / -Import einer Routine — DSGVO Art. 20 (Datenportabilität).
//
// Schema-Version 1.0. Enthält nur inhaltliche Felder — keine internen IDs,
// keine user_id, keine family_id. Emoji und Duration am Step sind nicht Teil
// des Schemas; beim Import werden Defaults gesetzt.

import { z } from "zod";

export const EXPORT_SCHEMA_VERSION = "1.0" as const;
export const EXPORT_TYPE = "clar_tag_workflow_export" as const;

// Categories, die im Schema erlaubt sind — Superset aus workflows.ts.
// Nicht bekannte Kategorien werden beim Import auf "eigene" gemappt.
const KNOWN_CATEGORIES = [
  "morgen",
  "abend",
  "vorbereitung",
  "lernen",
  "gesundheit",
  "soziales",
  "reisen",
  "uebergang",
  "pflichten",
  "saisonal",
  "hobby_outdoor",
  "eigene",
] as const;

export type ExportCategory = (typeof KNOWN_CATEGORIES)[number];

export const gradeSchema = z.enum(["grob", "mittel", "fein"]);
export type ExportGrade = z.infer<typeof gradeSchema>;

const stepSchema = z.object({
  title: z.string().min(1, "Schritt-Titel fehlt").max(200),
  hint: z.string().max(400).optional().default(""),
});
export type ExportStep = z.infer<typeof stepSchema>;

const materialSchema = z.object({
  name: z.string().min(1, "Material-Name fehlt").max(200),
  note: z.string().max(400).optional().default(""),
});
export type ExportMaterial = z.infer<typeof materialSchema>;

const workflowSchema = z
  .object({
    name: z.string().min(1, "workflow.name fehlt").max(120),
    icon: z.string().max(8).optional().default("✨"),
    category: z.string().min(1).max(60),
    grade: gradeSchema,
    steps_grob: z.array(stepSchema).max(60).optional().default([]),
    steps_mittel: z.array(stepSchema).max(60).optional().default([]),
    steps_fein: z.array(stepSchema).max(60).optional().default([]),
    material: z.array(materialSchema).max(80).optional().default([]),
    adhs_tips: z.string().max(4000).optional().default(""),
  })
  .superRefine((wf, ctx) => {
    if (
      wf.steps_grob.length === 0 &&
      wf.steps_mittel.length === 0 &&
      wf.steps_fein.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mindestens ein Feinheitsgrad (steps_grob/mittel/fein) muss Schritte enthalten",
      });
    }
  });

export const routineExportSchema = z.object({
  schema_version: z.literal(EXPORT_SCHEMA_VERSION, {
    errorMap: () => ({ message: `schema_version muss "${EXPORT_SCHEMA_VERSION}" sein` }),
  }),
  type: z.literal(EXPORT_TYPE, {
    errorMap: () => ({ message: "Diese Datei ist kein clar·tag Routinen-Export" }),
  }),
  exported_at: z.string().max(60),
  workflow: workflowSchema,
});

export type RoutineExport = z.infer<typeof routineExportSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Konverter
// ─────────────────────────────────────────────────────────────────────────────

export type InternalStep = {
  emoji: string;
  text: string;
  hint?: string | null;
  duration: number;
};

export type ExportInput = {
  name: string;
  icon: string | null;
  category: string;
  grade: ExportGrade;
  steps: InternalStep[];
  material?: string[] | null;
  adhs_tips?: string | null;
};

/** Baut das Export-Objekt aus einem User-Workflow. */
export function buildExport(input: ExportInput): RoutineExport {
  const stepsOut = input.steps.map((s) => ({
    title: s.text,
    hint: s.hint ?? "",
  }));

  // Die anderen Grade sind im User-Workflow nicht persistiert — leer lassen.
  const workflow: RoutineExport["workflow"] = {
    name: input.name,
    icon: input.icon ?? "✨",
    category: input.category,
    grade: input.grade,
    steps_grob: input.grade === "grob" ? stepsOut : [],
    steps_mittel: input.grade === "mittel" ? stepsOut : [],
    steps_fein: input.grade === "fein" ? stepsOut : [],
    material: (input.material ?? []).map((m) => ({ name: m, note: "" })),
    adhs_tips: input.adhs_tips ?? "",
  };

  return {
    schema_version: EXPORT_SCHEMA_VERSION,
    type: EXPORT_TYPE,
    exported_at: new Date().toISOString(),
    workflow,
  };
}

/** Wandelt Materialobjekte in strings (unser DB-Format) zurück. */
export function materialToStrings(material: ExportMaterial[]): string[] {
  return material.map((m) => (m.note ? `${m.name} — ${m.note}` : m.name));
}

/** Aus einer validierten RoutineExport die tatsächlich zu importierenden Steps rausholen. */
export function pickImportSteps(
  wf: RoutineExport["workflow"],
): { grade: ExportGrade; steps: ExportStep[] } {
  const requested =
    wf.grade === "grob" ? wf.steps_grob : wf.grade === "fein" ? wf.steps_fein : wf.steps_mittel;
  if (requested.length > 0) return { grade: wf.grade, steps: requested };
  // Fallback: nimm den ersten nichtleeren Grad.
  if (wf.steps_mittel.length > 0) return { grade: "mittel", steps: wf.steps_mittel };
  if (wf.steps_grob.length > 0) return { grade: "grob", steps: wf.steps_grob };
  return { grade: "fein", steps: wf.steps_fein };
}

/** Category auf bekannte Werte mappen; Unbekannte → "eigene". */
export function normalizeCategory(cat: string): ExportCategory {
  return (KNOWN_CATEGORIES as readonly string[]).includes(cat) ? (cat as ExportCategory) : "eigene";
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-Helpers (Download / File-Read)
// ─────────────────────────────────────────────────────────────────────────────

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "routine"
  );
}

/** Löst einen Datei-Download im Browser aus. */
export function downloadRoutineExport(exportObj: RoutineExport): void {
  if (typeof window === "undefined") return;
  const filename = `${slugify(exportObj.workflow.name)}.json`;
  const json = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const MAX_IMPORT_FILE_BYTES = 500 * 1024;

export type ParseResult =
  | { ok: true; data: RoutineExport }
  | { ok: false; error: string };

/**
 * Liest eine File aus dem Import-Picker, prüft Größe und Zod-Schema und
 * gibt entweder die geparste Export-Struktur oder eine klare Fehlermeldung
 * zurück.
 */
export async function parseImportFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return { ok: false, error: `Datei zu gross — max. ${Math.round(MAX_IMPORT_FILE_BYTES / 1024)} KB` };
  }
  const text = await file.text();

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "Ungültige Datei — bitte eine JSON-Datei auswählen" };
  }

  const parsed = routineExportSchema.safeParse(json);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const path = firstIssue?.path?.join(".");
    const msg = firstIssue?.message ?? "Schema-Fehler";
    return {
      ok: false,
      error: path ? `${msg} (Feld: ${path})` : msg,
    };
  }

  return { ok: true, data: parsed.data };
}
