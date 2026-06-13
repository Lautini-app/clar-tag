// Web Audio API tones. No external assets.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

function tone(freq: number, duration = 0.25, type: OscillatorType = "sine", delay = 0) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.15, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sfx = {
  stepDone: () => tone(523, 0.25),
  workflowDone: () => {
    tone(523, 0.2, "sine", 0);
    tone(659, 0.2, "sine", 0.18);
    tone(784, 0.35, "sine", 0.36);
  },
  ready: () => {
    tone(659, 0.18, "sine", 0);
    tone(784, 0.18, "sine", 0.16);
    tone(1047, 0.32, "sine", 0.32);
  },
  snooze: () => tone(330, 0.3, "sine"),
  timerEnd: () => tone(880, 0.35, "triangle"),
};
