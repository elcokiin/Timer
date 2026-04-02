import type { AppState, HistoryApi, Phase } from "./types.js";
import type { RingApi } from "./ring.js";

interface TimerDeps {
  state: AppState;
  ring: RingApi;
  render: () => void;
  renderButtons: () => void;
  savePrefs: () => void;
  addHistoryRaw: (secs: number, phase: Phase) => void;
  getHistoryApi: () => HistoryApi | null;
  playAlarmLazy: () => Promise<void>;
}

export interface TimerApi {
  tick: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
}

export function createTimerCore(deps: TimerDeps): TimerApi {
  const { state, ring } = deps;

  function onEnd(): void {
    void deps.playAlarmLazy();
    state.status = "idle";
    if (state.phase === "focus") {
      state.phase = "break";
      state.totalSeconds = state.lastBreak;
      state.remaining = state.lastBreak;
    } else {
      state.phase = "focus";
      state.totalSeconds = state.lastFocus;
      state.remaining = state.lastFocus;
    }
    deps.render();
    ring.setRingImmediate(1);
    deps.renderButtons();
  }

  function tick(): void {
    const fromFrac = ring.ringFrac();
    state.remaining -= 1;
    deps.render();
    if (state.remaining <= 0) {
      if (state.interval) clearInterval(state.interval);
      state.interval = null;
      onEnd();
      return;
    }
    ring.startRingEpoch(fromFrac, ring.ringFrac());
  }

  function startTimer(): void {
    if (state.remaining <= 0) return;
    if (state.phase === "focus") state.lastFocus = state.totalSeconds;
    else state.lastBreak = state.totalSeconds;
    deps.addHistoryRaw(state.totalSeconds, state.phase);
    deps.getHistoryApi()?.render();
    deps.savePrefs();
    state.status = "running";
    deps.renderButtons();
    deps.render();
    ring.startRingEpoch(ring.ringFrac(), ring.ringFrac());
    state.interval = setInterval(tick, 1000);
  }

  function pauseTimer(): void {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.status = "paused";
    deps.renderButtons();
    deps.render();
  }

  function resumeTimer(): void {
    state.status = "running";
    deps.renderButtons();
    deps.render();
    const nextFrac = state.totalSeconds > 0 ? (state.remaining - 1) / state.totalSeconds : 0;
    ring.startRingEpoch(ring.ringFrac(), nextFrac);
    state.interval = setInterval(tick, 1000);
  }

  function stopTimer(): void {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.status = "idle";
    if (state.phase === "break") {
      state.phase = "focus";
      state.totalSeconds = state.lastFocus;
    }
    state.remaining = state.totalSeconds;
    deps.render();
    ring.setRingImmediate(1);
    deps.renderButtons();
  }

  return {
    tick,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  };
}
