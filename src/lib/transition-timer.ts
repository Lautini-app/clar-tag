import { sfx } from "./audio";

export type TransitionState = {
  active: boolean;
  running: boolean;
  label: string;
  totalLeft: number;
  totalDuration: number;
  nudges: number[];
  nudgedAt: number[];
};

const NUDGE_POINTS = [10 * 60, 5 * 60, 2 * 60, 60];

type Listener = () => void;
const listeners = new Set<Listener>();

let state: TransitionState = {
  active: false,
  running: false,
  label: "",
  totalLeft: 0,
  totalDuration: 0,
  nudges: [],
  nudgedAt: [],
};

let tickId: ReturnType<typeof setInterval> | null = null;

function notify() {
  listeners.forEach((fn) => fn());
}

function vibrate() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([150, 80, 150]);
  }
}

function startTick() {
  stopTick();
  tickId = setInterval(() => {
    if (!state.running) return;
    if (state.totalLeft <= 1) {
      state = { ...state, totalLeft: 0, running: false };
      sfx.workflowDone();
      vibrate();
      notify();
      return;
    }
    const next = state.totalLeft - 1;
    const nudges = state.nudges;
    const nudgedAt = [...state.nudgedAt];
    for (const n of nudges) {
      if (next === n && !nudgedAt.includes(n)) {
        nudgedAt.push(n);
        sfx.stepDone();
        vibrate();
      }
    }
    state = { ...state, totalLeft: next, nudgedAt };
    notify();
  }, 1000);
}

function stopTick() {
  if (tickId !== null) {
    clearInterval(tickId);
    tickId = null;
  }
}

export function transGet(): TransitionState {
  return state;
}

export function transSubscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function transStart(label: string, minutes: number) {
  const dur = minutes * 60;
  const nudges = NUDGE_POINTS.filter((n) => n < dur);
  state = {
    active: true,
    running: true,
    label,
    totalLeft: dur,
    totalDuration: dur,
    nudges,
    nudgedAt: [],
  };
  startTick();
  notify();
}

export function transToggle() {
  state = { ...state, running: !state.running };
  if (state.running) startTick();
  notify();
}

export function transReset() {
  stopTick();
  state = {
    active: false,
    running: false,
    label: "",
    totalLeft: 0,
    totalDuration: 0,
    nudges: [],
    nudgedAt: [],
  };
  notify();
}
