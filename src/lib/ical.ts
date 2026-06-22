const ICAL_DAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

type ScheduleRow = {
  id: string;
  workflow_id: string | null;
  workflow_key: string | null;
  scheduled_at: string;
  status: string;
  parent_recurrence_id: string | null;
};

type RecurrenceRow = {
  id: string;
  workflow_id: string | null;
  workflow_key: string | null;
  recurrence_type: string;
  recurrence_days: number[];
  recurrence_time: string;
  recurrence_start: string;
  recurrence_end: string | null;
};

type WorkflowInfo = {
  id: string;
  name: string;
};

export function generateIcal(
  schedules: ScheduleRow[],
  recurrences: RecurrenceRow[],
  workflows: WorkflowInfo[],
  userWorkflows: WorkflowInfo[],
): string {
  const wfMap = new Map<string, string>();
  for (const w of workflows) wfMap.set(w.id, w.name);
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
    ...VTIMEZONE_ZURICH,
  ];

  // Recurrences → VEVENT with RRULE
  const recurrenceIds = new Set(recurrences.map((r) => r.id));
  for (const rec of recurrences) {
    if (rec.recurrence_type === "once") continue;
    const name = resolveName(rec.workflow_id, rec.workflow_key);
    const [hh, mm] = rec.recurrence_time.split(":").map(Number);
    const start = parseLocalDate(rec.recurrence_start);
    start.setHours(hh, mm, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    const rrule = buildRrule(rec);
    lines.push(
      "BEGIN:VEVENT",
      `UID:rec-${rec.id}@clartag.lautini.ch`,
      `DTSTART;TZID=Europe/Zurich:${fmtLocal(start)}`,
      `DTEND;TZID=Europe/Zurich:${fmtLocal(end)}`,
      `SUMMARY:${escIcal(name)}`,
      `DESCRIPTION:clar·tag Routine`,
      rrule,
      "END:VEVENT",
    );
  }

  // Single schedules (not tied to a recurrence)
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
      `SUMMARY:${escIcal(name)}`,
      `DESCRIPTION:clar·tag Routine`,
      `STATUS:${s.status === "done" ? "COMPLETED" : s.status === "skipped" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function buildRrule(rec: RecurrenceRow): string {
  let rule = "";
  if (rec.recurrence_type === "daily") {
    rule = "RRULE:FREQ=DAILY";
  } else if (rec.recurrence_type === "weekly" || rec.recurrence_type === "custom") {
    const byDay = rec.recurrence_days
      .map((d) => ICAL_DAY[d])
      .join(",");
    rule = `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`;
  }
  if (rec.recurrence_end) {
    const end = parseLocalDate(rec.recurrence_end);
    end.setHours(23, 59, 59, 0);
    rule += `;UNTIL=${fmtUtc(end)}`;
  }
  return rule;
}

function fmtLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function fmtUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function escIcal(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

const VTIMEZONE_ZURICH = [
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
