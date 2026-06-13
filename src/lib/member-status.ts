// Per-Mitglied Routine-Status (lokal). Wird vom Runner geschrieben und
// vom Admin-Heute-Screen gelesen. Verschwindet beim nächsten Tag.

import { lsGet, lsSet } from "./storage";

const KEY = "clarzeit.memberStatus";

export type MemberStatus = {
  workflowRef: string;
  workflowName: string;
  workflowIcon: string;
  stepIdx: number; // 0-based
  stepCount: number;
  currentStepText: string;
  startedAt: number;
  doneAt: number | null;
  readyAt: number | null;
};

export type StatusMap = Record<string, MemberStatus>;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

type Stored = { day: string; data: StatusMap };

let cachedSnapshot: StatusMap = {};
let cachedSerialized: string = "{}";

function read(): StatusMap {
  const s = lsGet<Stored | null>(KEY, null);
  const data = !s || s.day !== todayKey() ? {} : s.data;
  const serialized = JSON.stringify(data);
  if (serialized !== cachedSerialized) {
    cachedSerialized = serialized;
    cachedSnapshot = data;
  }
  return cachedSnapshot;
}

function write(data: StatusMap) {
  lsSet<Stored>(KEY, { day: todayKey(), data });
  cachedSerialized = JSON.stringify(data);
  cachedSnapshot = data;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("clarzeit:member-status"));
  }
}

export function getAllStatus(): StatusMap {
  return read();
}

export function getStatus(memberId: string): MemberStatus | null {
  return read()[memberId] ?? null;
}

export function setStatus(memberId: string, patch: Partial<MemberStatus> & {
  workflowRef: string;
  workflowName: string;
  workflowIcon: string;
  stepCount: number;
}) {
  const all = read();
  const prev = all[memberId];
  const next = {
    ...all,
    [memberId]: {
    workflowRef: patch.workflowRef,
    workflowName: patch.workflowName,
    workflowIcon: patch.workflowIcon,
    stepIdx: patch.stepIdx ?? prev?.stepIdx ?? 0,
    stepCount: patch.stepCount,
    currentStepText: patch.currentStepText ?? prev?.currentStepText ?? "",
    startedAt: patch.startedAt ?? prev?.startedAt ?? Date.now(),
    doneAt: patch.doneAt ?? prev?.doneAt ?? null,
    readyAt: patch.readyAt ?? prev?.readyAt ?? null,
    },
  };
  write(next);
}

export function clearStatus(memberId: string) {
  const { [memberId]: _removed, ...next } = read();
  write(next);
}

export function subscribeStatus(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("clarzeit:member-status", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("clarzeit:member-status", handler);
    window.removeEventListener("storage", handler);
  };
}
