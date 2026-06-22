import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateDates, type Recurrence } from "./recurrence";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createSchema = z
  .object({
    workflowRef: z.string().min(1).max(80),
    recurrence_type: z.enum(["once", "daily", "weekly", "custom"]),
    recurrence_days: z.array(z.number().int().min(0).max(6)),
    recurrence_time: z.string().regex(/^\d{2}:\d{2}$/),
    recurrence_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    recurrence_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  })
  .transform((v) => {
    const isUuid = UUID_RE.test(v.workflowRef);
    return {
      ...v,
      workflow_id: isUuid ? v.workflowRef : null,
      workflow_key: isUuid ? null : v.workflowRef,
    };
  });

export const createRecurrence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sb = supabase as any;

    const { data: rec, error: recErr } = await sb
      .from("workflow_recurrences")
      .insert({
        user_id: userId,
        workflow_id: data.workflow_id,
        workflow_key: data.workflow_key,
        recurrence_type: data.recurrence_type,
        recurrence_days: data.recurrence_days,
        recurrence_time: data.recurrence_time,
        recurrence_start: data.recurrence_start,
        recurrence_end: data.recurrence_end,
      })
      .select("id,recurrence_type,recurrence_days,recurrence_time,recurrence_start,recurrence_end")
      .single();
    if (recErr) throw new Error(recErr.message);

    const dates = generateDates(rec as Recurrence, 4);
    if (dates.length > 0) {
      const rows = dates.map((d) => ({
        user_id: userId,
        workflow_id: data.workflow_id,
        workflow_key: data.workflow_key,
        scheduled_at: d.toISOString(),
        status: "planned",
        parent_recurrence_id: rec.id,
      }));
      const { error: insErr } = await sb
        .from("workflow_schedules")
        .insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    return { id: rec.id as string, generatedCount: dates.length };
  });

export const listRecurrences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const { data: rows, error } = await sb
      .from("workflow_recurrences")
      .select("id,workflow_id,workflow_key,recurrence_type,recurrence_days,recurrence_time,recurrence_start,recurrence_end,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Recurrence[];
  });

export const deleteRecurrence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    // Delete future schedules tied to this recurrence
    const { error: schedErr } = await sb
      .from("workflow_schedules")
      .delete()
      .eq("parent_recurrence_id", data.id)
      .gte("scheduled_at", new Date().toISOString());
    if (schedErr) throw new Error(schedErr.message);

    const { error } = await sb
      .from("workflow_recurrences")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const extendRecurrenceSchedules = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const sb = context.supabase as any;

    const { data: recs, error: recErr } = await sb
      .from("workflow_recurrences")
      .select("id,workflow_id,workflow_key,recurrence_type,recurrence_days,recurrence_time,recurrence_start,recurrence_end")
      .neq("recurrence_type", "once");
    if (recErr) throw new Error(recErr.message);
    if (!recs || recs.length === 0) return { extended: 0 };

    let totalInserted = 0;

    for (const rec of recs as Recurrence[]) {
      const { data: latest } = await sb
        .from("workflow_schedules")
        .select("scheduled_at")
        .eq("parent_recurrence_id", rec.id)
        .order("scheduled_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const latestDate = latest?.scheduled_at ? new Date(latest.scheduled_at) : new Date();
      const fourWeeksOut = new Date();
      fourWeeksOut.setDate(fourWeeksOut.getDate() + 28);

      if (latestDate >= fourWeeksOut) continue;

      const extendStart = new Date(latestDate);
      extendStart.setDate(extendStart.getDate() + 1);

      const extendRec = {
        ...rec,
        recurrence_start: `${extendStart.getFullYear()}-${String(extendStart.getMonth() + 1).padStart(2, "0")}-${String(extendStart.getDate()).padStart(2, "0")}`,
      };
      const dates = generateDates(extendRec, 4);
      const newDates = dates.filter((d) => d > latestDate);

      if (newDates.length > 0) {
        const rows = newDates.map((d) => ({
          user_id: userId,
          workflow_id: rec.workflow_id,
          workflow_key: rec.workflow_key,
          scheduled_at: d.toISOString(),
          status: "planned",
          parent_recurrence_id: rec.id,
        }));
        const { error: insErr } = await sb
          .from("workflow_schedules")
          .insert(rows);
        if (insErr) console.error(`extend recurrence ${rec.id} failed`, insErr);
        else totalInserted += newDates.length;
      }
    }

    return { extended: totalInserted };
  });
