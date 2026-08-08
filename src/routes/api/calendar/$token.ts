import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateIcal } from "@/lib/ical";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/calendar/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        // Accept both /api/calendar/[token] and /api/calendar/[token].ics
        const token = (params.token ?? "").replace(/\.ics$/i, "").trim();

        if (!token || !UUID_RE.test(token)) {
          return new Response("Invalid token", { status: 400 });
        }

        const sb = supabaseAdmin as any;

        const { data: tokenRow, error: tokErr } = await sb
          .from("calendar_tokens")
          .select("user_id")
          .eq("token", token)
          .maybeSingle();

        if (tokErr || !tokenRow) {
          return new Response("Unauthorized", { status: 401 });
        }

        const userId = tokenRow.user_id as string;

        const from = new Date();
        from.setDate(from.getDate() - 14);
        const to = new Date();
        to.setDate(to.getDate() + 56);

        const [schedulesRes, recurrencesRes, workflowsRes] = await Promise.all([
          sb
            .from("workflow_schedules")
            .select(
              "id,workflow_id,workflow_key,scheduled_at,status,parent_recurrence_id",
            )
            .eq("user_id", userId)
            .gte("scheduled_at", from.toISOString())
            .lt("scheduled_at", to.toISOString())
            .order("scheduled_at", { ascending: true }),
          sb
            .from("workflow_recurrences")
            .select(
              "id,workflow_id,workflow_key,recurrence_type,recurrence_days,recurrence_time,recurrence_start,recurrence_end",
            )
            .eq("user_id", userId),
          sb.from("workflows").select("id,name").eq("user_id", userId),
        ]);

        const ical = generateIcal(
          schedulesRes.data ?? [],
          recurrencesRes.data ?? [],
          [],
          workflowsRes.data ?? [],
        );

        return new Response(ical, {
          status: 200,
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": "inline; filename=clartag-routinen.ics",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      },
    },
  },
});
