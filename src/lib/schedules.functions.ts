import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Schedule = {
  id: string;
  workflow_id: string | null;
  workflow_key: string | null;
  scheduled_at: string;
  status: "planned" | "done" | "skipped";
};

const rangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export const listSchedules = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("workflow_schedules")
      .select("id,workflow_id,workflow_key,scheduled_at,status")
      .gte("scheduled_at", data.from)
      .lt("scheduled_at", data.to)
      .order("scheduled_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Schedule[];
  });

const createSchema = z
  .object({
    workflowRef: z.string().min(1).max(80),
    scheduled_at: z.string().datetime(),
  })
  .transform((v) => {
    const isUuid = UUID_RE.test(v.workflowRef);
    return {
      workflow_id: isUuid ? v.workflowRef : null,
      workflow_key: isUuid ? null : v.workflowRef,
      scheduled_at: v.scheduled_at,
    };
  });

export const createSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("workflow_schedules")
      .insert({
        user_id: userId,
        workflow_id: data.workflow_id,
        workflow_key: data.workflow_key,
        scheduled_at: data.scheduled_at,
        status: "planned",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("workflow_schedules")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["planned", "done", "skipped"]),
});

export const updateScheduleStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => statusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("workflow_schedules")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const markDoneSchema = z
  .object({ workflowRef: z.string().min(1).max(80) })
  .transform((v) => {
    const isUuid = UUID_RE.test(v.workflowRef);
    return {
      workflow_id: isUuid ? v.workflowRef : null,
      workflow_key: isUuid ? null : v.workflowRef,
    };
  });

export const markTodayScheduleDone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => markDoneSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    let query = supabase
      .from("workflow_schedules")
      .update({ status: "done" })
      .eq("status", "planned")
      .gte("scheduled_at", startOfDay.toISOString())
      .lt("scheduled_at", endOfDay.toISOString());

    if (data.workflow_id) {
      query = query.eq("workflow_id", data.workflow_id);
    } else if (data.workflow_key) {
      query = query.eq("workflow_key", data.workflow_key);
    } else {
      return { ok: false };
    }

    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });
