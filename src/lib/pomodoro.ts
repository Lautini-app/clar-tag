import { sfx } from "./audio";
import { rewardAdd } from "./rewards";

export type PomodoroPreset = { label: string; focus: number; short: number; long: number };

export const PRESETS: PomodoroPreset[] = [
  { label: "Klassisch", focus: 25, short: 5, long: 15 },
  { label: "Kurz", focus: 15, short: 3, long: 10 },
  { label: "Mini", focus: 10, short: 2, long: 5 },
];

export type PomPhase = "focus" | "short" | "long";

export type PomState = {
  active: boolean;
  running: boolean;
  phase: PomPhase;
  preset: PomodoroPreset;
  round: number;
  totalLeft: number;
  totalDuration: number;
  completedRounds: number;
};

const ROUNDS_BEFORE_LONG = 4;

type Listener = () => void;
const listeners = new Set<Listener>();

let state: PomState = {
  active: false,
  running: false,
  phase: "focus",
  preset: PRESETS[0],
  round: 1,
  totalLeft: PRESETS[0].focus * 60,
  totalDuration: PRESETS[0].focus * 60,
  completedRounds: 0,
};

let tickId: ReturnType<typeof setInterval> | null = null;

function notify() {
  listeners.forEach((fn) => fn());
}

function vibrate() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

function startTick() {
  stopTick();
  tickId = setInterval(() => {
    if (!state.running) return;
    if (state.totalLeft <= 1) {
      state = { ...state, totalLeft: 0, running: false };
      sfx.timerEnd();
      vibrate();
      if (state.phase === "focus") {
        state = { ...state, completedRounds: state.completedRounds + 1 };
        rewardAdd("pomodoro");
      }
      notify();
      return;
    }
    state = { ...state, totalLeft: state.totalLeft - 1 };
    notify();
  }, 1000);
}

function stopTick() {
  if (tickId !== null) {
    clearInterval(tickId);
    tickId = null;
  }
}

function phaseDuration(phase: PomPhase, preset: PomodoroPreset): number {
  if (phase === "focus") return preset.focus * 60;
  if (phase === "short") return preset.short * 60;
  return preset.long * 60;
}

export function pomGet(): PomState {
  return state;
}

export function pomSubscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function pomStart(preset: PomodoroPreset) {
  const dur = preset.focus * 60;
  state = {
    active: true,
    running: true,
    phase: "focus",
    preset,
    round: 1,
    totalLeft: dur,
    totalDuration: dur,
    completedRounds: 0,
  };
  startTick();
  notify();
}

export function pomToggle() {
  state = { ...state, running: !state.running };
  if (state.running) startTick();
  notify();
}

export function pomAdvance() {
  let nextPhase: PomPhase;
  let nextRound = state.round;

  if (state.phase === "focus") {
    nextPhase = state.round >= ROUNDS_BEFORE_LONG ? "long" : "short";
  } else {
    nextRound = state.phase === "long" ? 1 : state.round + 1;
    nextPhase = "focus";
  }

  const dur = phaseDuration(nextPhase, state.preset);
  state = {
    ...state,
    phase: nextPhase,
    round: nextRound,
    totalLeft: dur,
    totalDuration: dur,
    running: true,
  };
  startTick();
  notify();
}

export function pomReset() {
  stopTick();
  state = {
    active: false,
    running: false,
    phase: "focus",
    preset: state.preset,
    round: 1,
    totalLeft: state.preset.focus * 60,
    totalDuration: state.preset.focus * 60,
    completedRounds: 0,
  };
  notify();
}
