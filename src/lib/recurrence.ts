export type RecurrenceType = "once" | "daily" | "weekly" | "custom";

export type Recurrence = {
  id: string;
  workflow_id: string | null;
  workflow_key: string | null;
  recurrence_type: RecurrenceType;
  recurrence_days: number[];
  recurrence_time: string;
  recurrence_start: string;
  recurrence_end: string | null;
  created_at: string;
};

export function generateDates(
  rec: Pick<Recurrence, "recurrence_type" | "recurrence_days" | "recurrence_time" | "recurrence_start" | "recurrence_end">,
  weeks: number,
): Date[] {
  const start = parseLocalDate(rec.recurrence_start);
  const endLimit = new Date(start);
  endLimit.setDate(endLimit.getDate() + weeks * 7);

  const hardEnd = rec.recurrence_end ? parseLocalDate(rec.recurrence_end) : null;
  if (hardEnd && hardEnd < endLimit) {
    endLimit.setTime(hardEnd.getTime());
    endLimit.setDate(endLimit.getDate() + 1);
  }

  const [hh, mm] = rec.recurrence_time.split(":").map(Number);
  const dates: Date[] = [];
  const cursor = new Date(start);

  if (rec.recurrence_type === "once") {
    const d = new Date(start);
    d.setHours(hh, mm, 0, 0);
    if (d >= new Date()) dates.push(d);
    return dates;
  }

  while (cursor < endLimit) {
    const jsDay = cursor.getDay();
    const isoDay = jsDay === 0 ? 6 : jsDay - 1; // 0=Mo..6=So

    let include = false;
    if (rec.recurrence_type === "daily") {
      include = true;
    } else if (rec.recurrence_type === "weekly" || rec.recurrence_type === "custom") {
      include = rec.recurrence_days.includes(isoDay);
    }

    if (include) {
      const d = new Date(cursor);
      d.setHours(hh, mm, 0, 0);
      if (d >= new Date()) dates.push(d);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export function formatRecurrenceSummary(
  rec: Pick<Recurrence, "recurrence_type" | "recurrence_days" | "recurrence_time" | "recurrence_start" | "recurrence_end">,
  workflowName: string,
): string {
  const time = rec.recurrence_time.slice(0, 5);
  const start = formatDateDE(rec.recurrence_start);

  if (rec.recurrence_type === "once") {
    return `${workflowName} · ${start} · ${time}`;
  }

  let freq = "";
  if (rec.recurrence_type === "daily") {
    freq = "Täglich";
  } else {
    const days = [...rec.recurrence_days].sort().map((d) => DAY_LABELS[d]).join(", ");
    freq = days || "Keine Tage";
  }

  const end = rec.recurrence_end ? ` · bis ${formatDateDE(rec.recurrence_end)}` : "";
  return `${workflowName} · ${freq} · ${time} · ab ${start}${end}`;
}

function formatDateDE(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
