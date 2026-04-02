import { getDomRefs } from "./dom.js";
import { renderAppShell } from "./appShell.js";
import { setupKeyboard } from "./keyboard.js";
import { ensureHistoryModule as ensureHistoryModuleLazy, getHistoryApi, playAlarmLazy, preloadHistory } from "./lazyModules.js";
import { createRing } from "./ring.js";
import { EDITABLE_TIME_POS, state } from "./state.js";
import { stripFileExtension, trimAlarmToAudibleThreeSeconds } from "./audioTrim.js";
import {
  addHistoryRaw,
  fileToDataURL,
  idbDel,
  idbGet,
  idbSet,
  loadAlarmLibraryRaw,
  loadPrefs,
  saveAlarmLibraryRaw,
  savePrefs,
} from "./storage.js";
import { createTimerCore } from "./timerCore.js";
import { createUiBindings } from "./uiBindings.js";
import type { UiApi } from "./uiBindings.js";

renderAppShell();
const dom = getDomRefs();
const ring = createRing(state, dom);

let ui: UiApi;

function createAlarmId(): string {
  if ("randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const onApplyDuration = (secs: number): void => {
  if (state.status !== "idle" || secs <= 0) return;
  state.phase = "focus";
  state.totalSeconds = secs;
  state.remaining = secs;
  ui.render();
  ring.setRingImmediate(1);
  ui.renderButtons();
};

ui = createUiBindings({
  state,
  dom,
  ring,
  ensureHistoryModule: () =>
    ensureHistoryModuleLazy({
      state,
      dom,
      onApplyDuration,
    }),
  preloadHistory: () => preloadHistory({ state, dom, onApplyDuration }),
  onStartTimer: () => timer.startTimer(),
  onPauseTimer: () => timer.pauseTimer(),
  onResumeTimer: () => timer.resumeTimer(),
  onStopTimer: () => timer.stopTimer(),
  onSavePrefs: () => savePrefs(state),
  onBackgroundPick: async (file) => {
    const url = await fileToDataURL(file);
    dom.bgEl.style.backgroundImage = `url("${url}")`;
    dom.bgEl.style.backgroundSize = "cover";
    dom.bgArt.style.display = "none";
    await idbSet("ff_bg", url);
  },
  onBackgroundReset: async () => {
    dom.bgEl.style.backgroundImage = "none";
    dom.bgEl.style.background = "";
    dom.bgArt.style.display = "";
    await idbDel("ff_bg");
  },
  onAlarmPick: async (file) => {
    const url = await trimAlarmToAudibleThreeSeconds(file);
    const id = createAlarmId();
    const name = stripFileExtension(file.name);
    state.customAlarms.push({ id, name, blob: url });
    state.alarmChoice = `custom:${id}`;
    await saveAlarmLibraryRaw(state.customAlarms);
    savePrefs(state);
  },
  onDeleteCustomAlarm: async () => {
    await saveAlarmLibraryRaw(state.customAlarms);
    savePrefs(state);
  },
  onApplyDefaults: (focusMinutes, breakMinutes) => {
    if (state.status !== "idle") return;
    state.lastFocus = focusMinutes * 60;
    state.lastBreak = breakMinutes * 60;
    if (state.phase === "focus") {
      state.totalSeconds = state.lastFocus;
      state.remaining = state.lastFocus;
    } else {
      state.totalSeconds = state.lastBreak;
      state.remaining = state.lastBreak;
    }
    ui.render();
    ring.setRingImmediate(ring.ringFrac());
    savePrefs(state);
  },
});

const timer = createTimerCore({
  state,
  ring,
  render: () => ui.render(),
  renderButtons: () => ui.renderButtons(),
  savePrefs: () => savePrefs(state),
  addHistoryRaw,
  getHistoryApi,
  playAlarmLazy: () => playAlarmLazy(state),
});

const onStartPauseResume = (): void => {
  if (state.status === "idle") timer.startTimer();
  else if (state.status === "running") timer.pauseTimer();
  else timer.resumeTimer();
};

function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

async function init(): Promise<void> {
  ring.setupRing();
  loadPrefs(state);
  ui.markSettingsMenuItems();
  ui.syncPrefsInputs();
  ui.render();
  ring.setRingImmediate(ring.ringFrac());
  ui.renderButtons();
  ui.bindUiEvents();

  setupKeyboard({
    state,
    hasTypingFocus: ui.hasTypingFocus,
    hasInteractiveFocus: ui.hasInteractiveFocus,
    isHistoryOpen: () => dom.histWrap.classList.contains("open"),
    isSettingsOpen: () => dom.settingsPanel.classList.contains("open"),
    isAdvancedOpen: () => dom.advancedOverlay.classList.contains("open"),
    toggleHistory: ui.toggleHistory,
    toggleSettings: ui.toggleSettings,
    closeHistory: ui.closeHistory,
    closeSettings: ui.closeSettings,
    closeAdvanced: ui.closeAdvanced,
    getHistoryApi,
    getSettingsItems: () => Array.from(dom.settingsPanel.querySelectorAll<HTMLElement>('[data-menu-item="true"]')),
    onStartPauseResume,
    onStop: () => timer.stopTimer(),
    onToggleTimeEdit: () => ui.toggleTimeEdit(),
    onToggleShowRing: () => ui.toggleShowRing(),
    onOpenAdvanced: () => ui.openAdvanced(),
    onDeleteFocusedCustomAlarm: () => ui.deleteFocusedCustomAlarm(),
  });

  try {
    const bg = await idbGet("ff_bg");
    if (bg) {
      dom.bgEl.style.backgroundImage = `url("${bg}")`;
      dom.bgEl.style.backgroundSize = "cover";
      dom.bgArt.style.display = "none";
    }
  } catch {
    // ignore missing background
  }

  try {
    state.customAlarms = await loadAlarmLibraryRaw();
  } catch {
    state.customAlarms = [];
  }

  const selectedCustomId = state.alarmChoice.startsWith("custom:") ? state.alarmChoice.slice("custom:".length) : "";
  if (selectedCustomId && !state.customAlarms.some((item) => item.id === selectedCustomId)) {
    state.alarmChoice = "bell";
  }
  ui.syncPrefsInputs();

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(
      () => {
        void preloadHistory({ state, dom, onApplyDuration });
      },
      { timeout: 2000 }
    );
  } else {
    setTimeout(() => {
      void preloadHistory({ state, dom, onApplyDuration });
    }, 1200);
  }

  registerServiceWorker();
}

void init();
