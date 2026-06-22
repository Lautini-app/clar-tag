import { lsGet, lsSet } from "./storage";

const KEY = "clartag.rewards";

export type RewardKind = "routine" | "pomodoro" | "bodyDoubling" | "fidget";

export type DayRewards = {
  day: string;
  routine: number;
  pomodoro: number;
  bodyDoubling: number;
  fidget: number;
};

type Listener = () => void;
const listeners = new Set<Listener>();

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function load(): DayRewards {
  const stored = lsGet<DayRewards | null>(KEY, null);
  if (stored && stored.day === todayKey()) {
    return {
      day: stored.day,
      routine: stored.routine ?? 0,
      pomodoro: stored.pomodoro ?? 0,
      bodyDoubling: stored.bodyDoubling ?? 0,
      fidget: stored.fidget ?? 0,
    };
  }
  return { day: todayKey(), routine: 0, pomodoro: 0, bodyDoubling: 0, fidget: 0 };
}

let snapshot: DayRewards = load();

function save(r: DayRewards) {
  lsSet(KEY, r);
}

function notify() {
  snapshot = load();
  listeners.forEach((fn) => fn());
}

export function rewardGet(): DayRewards {
  return snapshot;
}

export function rewardSubscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function rewardAdd(kind: RewardKind) {
  const r = load();
  r[kind] += 1;
  save(r);
  notify();
}
