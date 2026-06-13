import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getWorkflow } from "@/lib/workflows";
import { listUserWorkflows } from "@/lib/user-workflows.functions";
import { useAuth } from "@/hooks/use-auth";
import type { Schedule } from "@/lib/schedules.functions";

export type ScheduleView = Schedule & {
  ref: string;
  name: string;
  icon: string;
};

export function useScheduleViews(schedules: Schedule[]): {
  views: ScheduleView[];
  isLoading: boolean;
} {
  const fetchUser = useServerFn(listUserWorkflows);
  const { user } = useAuth();
  const { data: userList = [], isLoading } = useQuery({
    queryKey: ["user-workflows"],
    queryFn: () => fetchUser(),
    enabled: !!user,
  });

  const views = useMemo<ScheduleView[]>(() => {
    return schedules.map((s) => {
      if (s.workflow_id) {
        const u = userList.find((w) => w.id === s.workflow_id);
        return {
          ...s,
          ref: s.workflow_id,
          name: u?.name ?? "Eigene Routine",
          icon: u?.icon || "✏️",
        };
      }
      const key = s.workflow_key ?? "";
      const w = getWorkflow(key);
      return {
        ...s,
        ref: key,
        name: w?.name ?? "Routine",
        icon: w?.icon ?? "📋",
      };
    });
  }, [schedules, userList]);

  return { views, isLoading };
}

export function dayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function weekBounds(date: Date) {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7; // mon=0
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
