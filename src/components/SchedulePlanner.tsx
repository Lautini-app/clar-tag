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

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = useServerFn(createSchedule);
  const qc = useQueryClient();

  async function onSave() {
    setErr(null);
    setSaving(true);
    try {
      const local = new Date(`${date}T${time}:00`);
      if (isNaN(local.getTime())) {
        throw new Error("Ungültiges Datum/Zeit");
      }
      await create({
        data: {
          workflowRef,
          scheduled_at: local.toISOString(),
        },
      });
      await qc.invalidateQueries({ queryKey: ["schedules"] });
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-11">
            <CalendarIcon className="h-4 w-4" />
            Planen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>{workflowName} planen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sched-date">Datum</Label>
            <Input
              id="sched-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sched-time">Uhrzeit</Label>
            <Input
              id="sched-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
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
