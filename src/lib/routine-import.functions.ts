// Server-FN: nimmt eine JSON-Export-Struktur und legt einen Nutzer-Workflow an.
// Validierung passiert nochmal serverseitig — Client-Validierung ist nur UX.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  materialToStrings,
  normalizeCategory,
  pickImportSteps,
  routineExportSchema,
} from "@/lib/routine-export";

export const importRoutineJson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => routineExportSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const wf = data.workflow;

    const picked = pickImportSteps(wf);
    const steps = picked.steps.map((s) => ({
      emoji: "✨",
      text: s.title,
      hint: s.hint ? s.hint : null,
      duration: 0,
    }));

    const material = materialToStrings(wf.material);

    const insertPayload = {
      user_id: userId,
      name: wf.name,
      category: normalizeCategory(wf.category),
      icon: wf.icon || null,
      steps,
      material,
      adhs_tips: wf.adhs_tips ? wf.adhs_tips : null,
    };

    const { data: created, error } = await supabase
      .from("workflows")
      .insert(insertPayload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: created.id as string, name: wf.name, grade: picked.grade };
  });
