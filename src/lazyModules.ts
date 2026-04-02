import type { AppState, DomRefs, HistoryApi } from "./types.js";

interface LazyContext {
  state: AppState;
  dom: DomRefs;
  onApplyDuration: (secs: number) => void;
}

let historyApi: HistoryApi | null = null;
let historyPromise: Promise<HistoryApi> | null = null;
let audioPromise: Promise<{ playPresetAlarm: (choice: string) => void }> | null = null;

export function getHistoryApi(): HistoryApi | null {
  return historyApi;
}

export async function ensureHistoryModule(ctx: LazyContext): Promise<HistoryApi> {
  if (historyApi) return historyApi;
  if (!historyPromise) {
    historyPromise = import("./historyMenu.js").then((mod) => {
      historyApi = mod.initHistoryMenu({
        daysEl: ctx.dom.histDays,
        detailEl: ctx.dom.histDetail,
        clearEl: ctx.dom.histClear,
        onApplyDuration: ctx.onApplyDuration,
      });
      return historyApi;
    });
  }
  return historyPromise;
}

export async function preloadHistory(ctx: LazyContext): Promise<void> {
  try {
    await ensureHistoryModule(ctx);
  } catch {
    // retry on demand
  }
}

export async function playAlarmLazy(state: AppState): Promise<void> {
  if (state.customAlarmBlob) {
    void new Audio(state.customAlarmBlob).play().catch(() => {});
    return;
  }

  if (!audioPromise) {
    audioPromise = import("./audioEngine.js");
  }
  const module = await audioPromise;
  module.playPresetAlarm(state.alarmChoice);
}
