import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSchedule } from "@/lib/schedules.functions";
import { createRecurrence } from "@/lib/recurrence.functions";
import {
  type RecurrenceType,
  todayDateStr,
  formatRecurrenceSummary,
} from "@/lib/recurrence";

const DAY_CHIPS: { day: number; label: string }[] = [
  { day: 0, label: "Mo" },
  { day: 1, label: "Di" },
  { day: 2, label: "Mi" },
  { day: 3, label: "Do" },
  { day: 4, label: "Fr" },
  { day: 5, label: "Sa" },
  { day: 6, label: "So" },
];

const FREQ_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "once", label: "Einmalig" },
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "custom", label: "Bestimmte Tage" },
];

export function SchedulePlanner({
  workflowRef,
  workflowName,
  trigger,
}: {
  workflowRef: string;
  workflowName: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [recType, setRecType] = useState<RecurrenceType>("once");
  const [date, setDate] = useState(todayDateStr);
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(todayDateStr);
  const [endDate, setEndDate] = useState("");
  const [hasEnd, setHasEnd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const createSingle = useServerFn(createSchedule);
  const createRec = useServerFn(createRecurrence);
  const qc = useQueryClient();

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  function handleRecTypeChange(t: RecurrenceType) {
    setRecType(t);
    if (t === "weekly" && days.length === 0) {
      const todayIso = (new Date().getDay() + 6) % 7;
      setDays([todayIso]);
    }
  }

  function resetForm() {
    setRecType("once");
    setDate(todayDateStr());
    setTime("08:00");
    setDays([]);
    setStartDate(todayDateStr());
    setEndDate("");
    setHasEnd(false);
    setErr(null);
  }

  async function onSave() {
    setErr(null);
    setSaving(true);
    try {
      if (recType === "once") {
        const local = new Date(`${date}T${time}:00`);
        if (isNaN(local.getTime())) throw new Error("Ungültiges Datum/Zeit");
        await createSingle({
          data: { workflowRef, scheduled_at: local.toISOString() },
        });
      } else {
        if (
          (recType === "weekly" || recType === "custom") &&
          days.length === 0
        ) {
          throw new Error("Wähle mindestens einen Wochentag.");
        }
        await createRec({
          data: {
            workflowRef,
            recurrence_type: recType,
            recurrence_days: recType === "daily" ? [] : days,
            recurrence_time: time,
            recurrence_start: startDate,
            recurrence_end: hasEnd && endDate ? endDate : null,
          },
        });
      }
      await qc.invalidateQueries({ queryKey: ["schedules"] });
      await qc.invalidateQueries({ queryKey: ["recurrences"] });
      resetForm();
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  const isRepeating = recType !== "once";

  const preview = isRepeating
    ? formatRecurrenceSummary(
        {
          recurrence_type: recType,
          recurrence_days: recType === "daily" ? [] : days,
          recurrence_time: time,
          recurrence_start: startDate,
          recurrence_end: hasEnd && endDate ? endDate : null,
        },
        workflowName,
      )
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-11">
            <CalendarIcon className="h-4 w-4" />
            Planen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>{workflowName} planen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Frequency selector */}
          <div className="grid gap-1.5">
            <Label>Wiederholung</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {FREQ_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleRecTypeChange(o.value)}
                  className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm font-medium transition ${
                    recType === o.value
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day chips for weekly/custom */}
          {(recType === "weekly" || recType === "custom") && (
            <div className="grid gap-1.5">
              <Label>Wochentage</Label>
              <div className="flex gap-1.5">
                {DAY_CHIPS.map((c) => (
                  <button
                    key={c.day}
                    type="button"
                    onClick={() => toggleDay(c.day)}
                    className={`flex-1 rounded-[var(--radius-sm)] border py-2 text-xs font-medium transition ${
                      days.includes(c.day)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date (only for once) */}
          {!isRepeating && (
            <div className="grid gap-1.5">
              <Label htmlFor="sched-date">Datum</Label>
              <Input
                id="sched-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

          {/* Time */}
          <div className="grid gap-1.5">
            <Label htmlFor="sched-time">Uhrzeit</Label>
            <Input
              id="sched-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Date range for recurring */}
          {isRepeating && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="sched-start">Ab</Label>
                <Input
                  id="sched-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sched-has-end"
                  checked={hasEnd}
                  onChange={(e) => setHasEnd(e.target.checked)}
                  className="size-4 rounded border-border accent-primary"
                />
                <Label htmlFor="sched-has-end" className="text-sm font-normal">
                  Enddatum festlegen
                </Label>
              </div>
              {hasEnd && (
                <div className="grid gap-1.5">
                  <Label htmlFor="sched-end">Bis</Label>
                  <Input
                    id="sched-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {/* Preview */}
          {preview && (
            <div className="rounded-[var(--radius-md)] bg-secondary px-3 py-2 text-xs text-muted-foreground">
              {preview}
            </div>
          )}

          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
          >
            Abbrechen
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Speichert …" : "Planen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
