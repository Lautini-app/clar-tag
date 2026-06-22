import { sfx } from "./audio";
import { rewardAdd } from "./rewards";

export type BodyDoublingState = {
  active: boolean;
  running: boolean;
  goal: string;
  elapsed: number;
  checkinDue: boolean;
  checkinCount: number;
  confirmedCount: number;
  lastCheckinAt: number;
};

const CHECKIN_INTERVAL = 12 * 60;

type Listener = () => void;
const listeners = new Set<Listener>();

let state: BodyDoublingState = {
  active: false,
  running: false,
  goal: "",
  elapsed: 0,
  checkinDue: false,
  checkinCount: 0,
  confirmedCount: 0,
  lastCheckinAt: 0,
};

let tickId: ReturnType<typeof setInterval> | null = null;

function notify() {
  listeners.forEach((fn) => fn());
}

function vibrate() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([100, 60, 100]);
  }
}

function startTick() {
  stopTick();
  tickId = setInterval(() => {
    if (!state.running) return;
    const elapsed = state.elapsed + 1;
    const sinceLastCheckin = elapsed - state.lastCheckinAt;
    let checkinDue = state.checkinDue;
    let checkinCount = state.checkinCount;
    if (!checkinDue && sinceLastCheckin >= CHECKIN_INTERVAL) {
      checkinDue = true;
      checkinCount += 1;
      sfx.stepDone();
      vibrate();
    }
    state = { ...state, elapsed, checkinDue, checkinCount };
    notify();
  }, 1000);
}

function stopTick() {
  if (tickId !== null) {
    clearInterval(tickId);
    tickId = null;
  }
}

export function bdGet(): BodyDoublingState {
  return state;
}

export function bdSubscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function bdStart(goal: string) {
  state = {
    active: true,
    running: true,
    goal,
    elapsed: 0,
    checkinDue: false,
    checkinCount: 0,
    confirmedCount: 0,
    lastCheckinAt: 0,
  };
  startTick();
  notify();
}

export function bdToggle() {
  state = { ...state, running: !state.running };
  if (state.running) startTick();
  notify();
}

export function bdConfirmCheckin() {
  state = {
    ...state,
    checkinDue: false,
    confirmedCount: state.confirmedCount + 1,
    lastCheckinAt: state.elapsed,
  };
  notify();
}

export function bdDismissCheckin() {
  state = {
    ...state,
    checkinDue: false,
    lastCheckinAt: state.elapsed,
  };
  notify();
}

export function bdFinish(): { minutes: number; checkins: number } {
  stopTick();
  const minutes = Math.round(state.elapsed / 60);
  const checkins = state.confirmedCount;
  rewardAdd("bodyDoubling");
  state = {
    active: false,
    running: false,
    goal: "",
    elapsed: 0,
    checkinDue: false,
    checkinCount: 0,
    confirmedCount: 0,
    lastCheckinAt: 0,
  };
  notify();
  return { minutes, checkins };
}
