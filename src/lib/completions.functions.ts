import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Completion = {
  id: string;
  workflow_id: string | null;
  workflow_key: string | null;
  completed_at: string;
};

const recordSchema = z
  .object({ workflowRef: z.string().min(1).max(80) })
  .transform((v) => {
    const isUuid = UUID_RE.test(v.workflowRef);
    return {
      workflow_id: isUuid ? v.workflowRef : null,
      workflow_key: isUuid ? null : v.workflowRef,
    };
  });

export const recordCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => recordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("workflow_completions").insert({
      user_id: userId,
      workflow_id: data.workflow_id,
      workflow_key: data.workflow_key,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCompletions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ from: z.string().datetime(), to: z.string().datetime() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("workflow_completions")
      .select("id,workflow_id,workflow_key,completed_at")
      .gte("completed_at", data.from)
      .lt("completed_at", data.to)
      .order("completed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Completion[];
  });
