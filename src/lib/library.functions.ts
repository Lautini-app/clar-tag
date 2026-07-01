// Server-Funktionen für die Bibliothek (`clar_tag.library_routines`).
// Die Tabelle ist read-only für authenticated Users (RLS); der Import
// legt einen neuen Eintrag in `workflows` an.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LibraryStep = {
  emoji: string;
  text: string;
  hint?: string | null;
  duration: number;
};

export type LibraryVariant = {
  id: string;
  label: string;
  material?: string[];
};

export type LibraryGrade = "grob" | "mittel" | "fein";

export type LibraryRoutine = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  category: string;
  default_grade: LibraryGrade;
  steps_grob: LibraryStep[];
  steps_mittel: LibraryStep[];
  steps_fein: LibraryStep[];
  material: string[];
  adhs_tips: string | null;
  variants: LibraryVariant[] | null;
  sort_order: number;
};

const LIBRARY_COLUMNS =
  "id,slug,name,icon,category,default_grade,steps_grob,steps_mittel,steps_fein,material,adhs_tips,variants,sort_order";

export const listLibraryRoutines = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("library_routines")
      .select(LIBRARY_COLUMNS)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as LibraryRoutine[];
  });

export const getLibraryRoutine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("library_routines")
      .select(LIBRARY_COLUMNS)
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as LibraryRoutine | null;
  });

const importInput = z.object({
  slug: z.string().min(1).max(80),
  grade: z.enum(["grob", "mittel", "fein"]),
  variant_id: z.string().min(1).max(60).optional().nullable(),
});

export const importLibraryRoutine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => importInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Library-Routine holen
    const { data: routine, error: getErr } = await supabase
      .from("library_routines")
      .select(LIBRARY_COLUMNS)
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (getErr) throw new Error(getErr.message);
    if (!routine) throw new Error(`Library-Routine „${data.slug}" nicht gefunden`);

    const r = routine as LibraryRoutine;
    const steps =
      data.grade === "grob"
        ? r.steps_grob
        : data.grade === "fein"
          ? r.steps_fein
          : r.steps_mittel;

    // Variante auflösen (nur wenn vorhanden)
    let variant: LibraryVariant | null = null;
    if (r.variants?.length) {
      variant =
        r.variants.find((v) => v.id === (data.variant_id ?? r.variants?.[0]?.id)) ??
        r.variants[0];
    }
    const material = variant?.material ?? r.material ?? [];
    const name = variant ? `${r.name} · ${variant.label}` : r.name;

    // In die Nutzer-Workflows einsetzen
    const insertPayload = {
      user_id: userId,
      name,
      category: r.category,
      icon: r.icon,
      steps: steps.map((s) => ({
        emoji: s.emoji,
        text: s.text,
        hint: s.hint ?? null,
        duration: s.duration,
      })),
      material,
      adhs_tips: r.adhs_tips,
    };

    const { data: created, error: insErr } = await supabase
      .from("workflows")
      .insert(insertPayload)
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    return { id: created.id as string, name };
  });
