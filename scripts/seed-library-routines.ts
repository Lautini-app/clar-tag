/**
 * Seed-Skript: 10 Routinen in `clar_tag.library_routines` einspielen.
 *
 * Aufruf:
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   bun run scripts/seed-library-routines.ts
 *
 * Oder per npm-Skript:
 *   npm run seed:routines
 *
 * Voraussetzung: die Migration `20260630162913_library_routines.sql`
 * muss vorher ausgeführt sein.
 *
 * Idempotent: nutzt `upsert` auf `slug`, sodass mehrfaches Ausführen
 * dieselben Einträge aktualisiert statt zu duplizieren.
 *
 * Der Service-Role-Key bleibt lokal — niemals in CI oder im Frontend.
 */

import { createClient } from "@supabase/supabase-js";
import { bibliothekRoutinen } from "../src/lib/library/bibliothek-routinen";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Bitte SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY als Env-Variablen setzen.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "clar_tag" },
  auth: { persistSession: false, autoRefreshToken: false },
});

type Row = {
  slug: string;
  name: string;
  icon: string;
  category: string;
  default_grade: "grob" | "mittel" | "fein";
  steps_grob: unknown;
  steps_mittel: unknown;
  steps_fein: unknown;
  material: unknown;
  adhs_tips: string | null;
  variants: unknown | null;
  is_published: boolean;
  sort_order: number;
};

const rows: Row[] = bibliothekRoutinen.map((w, idx) => ({
  slug: w.id,
  name: w.name,
  icon: w.icon,
  category: w.category,
  default_grade: w.defaultGrade ?? "mittel",
  steps_grob: w.steps.grob,
  steps_mittel: w.steps.mittel,
  steps_fein: w.steps.fein,
  material: w.material ?? [],
  adhs_tips: w.adhsTips ?? null,
  variants: w.variants ?? null,
  is_published: true,
  sort_order: idx,
}));

async function main() {
  console.log(`Seede ${rows.length} Library-Routinen…`);
  const { data, error } = await supabase
    .from("library_routines")
    .upsert(rows, { onConflict: "slug" })
    .select("slug,name");

  if (error) {
    console.error("Fehler beim Seeden:", error.message);
    process.exit(1);
  }

  console.log("Erfolgreich eingespielt:");
  for (const r of data ?? []) console.log(`  · ${r.slug}  —  ${r.name}`);
}

main();
