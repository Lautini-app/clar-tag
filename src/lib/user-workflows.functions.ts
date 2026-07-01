import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const stepSchema = z.object({
  emoji: z.string().min(1).max(8),
  text: z.string().min(1).max(120),
  hint: z.string().max(200).optional().nullable(),
  duration: z.number().int().min(0).max(180),
  date: z.string().max(40).optional().nullable(),
});

const categorySchema = z.enum([
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
]);

export type UserWorkflowStep = z.infer<typeof stepSchema>;
export type UserWorkflowCategory = z.infer<typeof categorySchema>;

export type UserWorkflow = {
  id: string;
  name: string;
  category: UserWorkflowCategory;
  icon: string | null;
  steps: UserWorkflowStep[];
  material: string[];
  adhs_tips: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

const USER_WORKFLOW_COLUMNS =
  "id,name,category,icon,steps,material,adhs_tips,is_archived,created_at,updated_at";

export const listUserWorkflows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("workflows")
      .select(USER_WORKFLOW_COLUMNS)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as UserWorkflow[];
  });

export const getUserWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("workflows")
      .select(USER_WORKFLOW_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as UserWorkflow | null;
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  category: categorySchema,
  icon: z.string().max(8).optional().nullable(),
  steps: z.array(stepSchema).min(1).max(40),
  material: z.array(z.string().max(200)).max(60).optional(),
  adhs_tips: z.string().max(2000).optional().nullable(),
});

export const saveUserWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.id) {
      const { data: row, error } = await supabase
        .from("workflows")
        .update({
          name: data.name,
          category: data.category,
          icon: data.icon ?? null,
          steps: data.steps,
          material: data.material ?? [],
          adhs_tips: data.adhs_tips ?? null,
        })
        .eq("id", data.id)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { id: row?.id ?? data.id };
    }
    const { data: row, error } = await supabase
      .from("workflows")
      .insert({
        user_id: userId,
        name: data.name,
        category: data.category,
        icon: data.icon ?? null,
        steps: data.steps,
        material: data.material ?? [],
        adhs_tips: data.adhs_tips ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteUserWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("workflows").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
