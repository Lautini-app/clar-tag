import { defineEventHandler, getRouterParam } from "vinxi/http";
import { createClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ICAL_DAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.CLAR_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, {
    db: { schema: "clar_tag" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token")?.replace(/\.ics$/, "");

  if (!token || !UUID_RE.test(token)) {
    return new Response("Invalid token", { status: 400 });
  }

  const sb = getSupabase() as any;

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
      .select("id,workflow_id,workflow_key,scheduled_at,status,parent_recurrence_id")
      .eq("user_id", userId)
      .gte("scheduled_at", from.toISOString())
      .lt("scheduled_at", to.toISOString())
      .order("scheduled_at", { ascending: true }),
    sb
      .from("workflow_recurrences")
      .select("id,workflow_id,workflow_key,recurrence_type,recurrence_days,recurrence_time,recurrence_start,recurrence_end")
      .eq("user_id", userId),
    sb
      .from("workflows")
      .select("id,name")
      .eq("user_id", userId),
  ]);

  const schedules: any[] = schedulesRes.data ?? [];
  const recurrences: any[] = recurrencesRes.data ?? [];
  const userWorkflows: any[] = workflowsRes.data ?? [];

  const wfMap = new Map<string, string>();
  for (const w of userWorkflows) wfMap.set(w.id, w.name);

  function resolveName(wfId: string | null, wfKey: string | null): string {
    if (wfId && wfMap.has(wfId)) return wfMap.get(wfId)!;
    if (wfKey) return wfKey;
    return "Routine";
  }

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lautini//clar·tag//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:clar·tag Routinen",
    "X-WR-TIMEZONE:Europe/Zurich",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Zurich",
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];

  // Recurrences → VEVENT with RRULE
  const recurrenceIds = new Set(recurrences.map((r: any) => r.id));
  for (const rec of recurrences) {
    if (rec.recurrence_type === "once") continue;
    const name = resolveName(rec.workflow_id, rec.workflow_key);
    const [hh, mm] = rec.recurrence_time.split(":").map(Number);
    const start = parseLocalDate(rec.recurrence_start);
    start.setHours(hh, mm, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    let rrule = "";
    if (rec.recurrence_type === "daily") {
      rrule = "RRULE:FREQ=DAILY";
    } else {
      const byDay = (rec.recurrence_days as number[]).map((d: number) => ICAL_DAY[d]).join(",");
      rrule = `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`;
    }
    if (rec.recurrence_end) {
      const rEnd = parseLocalDate(rec.recurrence_end);
      rEnd.setHours(23, 59, 59, 0);
      rrule += `;UNTIL=${fmtUtc(rEnd)}`;
    }

    lines.push(
      "BEGIN:VEVENT",
      `UID:rec-${rec.id}@clartag.lautini.ch`,
      `DTSTART;TZID=Europe/Zurich:${fmtLocal(start)}`,
      `DTEND;TZID=Europe/Zurich:${fmtLocal(end)}`,
      `SUMMARY:${esc(name)}`,
      `DESCRIPTION:clar·tag Routine`,
      rrule,
      "END:VEVENT",
    );
  }

  // Single schedules
  for (const s of schedules) {
    if (s.parent_recurrence_id && recurrenceIds.has(s.parent_recurrence_id)) continue;
    const name = resolveName(s.workflow_id, s.workflow_key);
    const start = new Date(s.scheduled_at);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    lines.push(
      "BEGIN:VEVENT",
      `UID:sched-${s.id}@clartag.lautini.ch`,
      `DTSTART;TZID=Europe/Zurich:${fmtLocal(start)}`,
      `DTEND;TZID=Europe/Zurich:${fmtLocal(end)}`,
      `SUMMARY:${esc(name)}`,
      `DESCRIPTION:clar·tag Routine`,
      `STATUS:${s.status === "done" ? "COMPLETED" : s.status === "skipped" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  const ical = lines.join("\r\n");

  return new Response(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=clartag-routinen.ics",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function fmtUtc(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
