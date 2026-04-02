import type { AppState, DomRefs, HistoryApi } from "./types.js";
import { EDITABLE_TIME_POS, fmt, parseT } from "./state.js";
import type { RingApi } from "./ring.js";

interface UiDeps {
  state: AppState;
  dom: DomRefs;
  ring: RingApi;
  ensureHistoryModule: () => Promise<HistoryApi>;
  preloadHistory: () => Promise<void>;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
  onSavePrefs: () => void;
  onBackgroundPick: (file: File) => Promise<void>;
  onBackgroundReset: () => Promise<void>;
  onAlarmPick: (file: File) => Promise<void>;
  onApplyDefaults: (focusMinutes: number, breakMinutes: number) => void;
}

export interface UiApi {
  render: () => void;
  renderButtons: () => void;
  openTimeEdit: (cursorPos?: number | null) => void;
  closeHistory: () => void;
  closeSettings: () => void;
  toggleHistory: () => Promise<void>;
  toggleSettings: () => void;
  hasTypingFocus: (target: EventTarget | null) => boolean;
  hasInteractiveFocus: (target: EventTarget | null) => boolean;
  markSettingsMenuItems: () => void;
  syncPrefsInputs: () => void;
  bindUiEvents: () => void;
}

export function createUiBindings(deps: UiDeps): UiApi {
  const { state, dom, ring } = deps;

  function updateRunningClass() {
    dom.timerWrap.classList.toggle("ring-running", state.status === "running");
  }

  function updateArrow() {
    const open = dom.histWrap.classList.contains("open");
    dom.histToggle.innerHTML = open
      ? '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>'
      : '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
  }

  function render() {
    dom.timeDisplay.textContent = fmt(state.remaining);
    dom.phaseLabel.textContent = state.phase === "focus" ? "FOCUS" : "BREAK";
    dom.phaseLabel.style.color = state.phase === "focus" ? "rgba(255,255,255,.55)" : "#52b4e0";
    document.title = `${fmt(state.remaining)} - ${state.phase === "focus" ? "Focus" : "Break"} · FocusFlow`;
    updateRunningClass();
  }

  function renderButtons() {
    dom.btnRow.innerHTML = "";
    if (state.status === "idle") {
      const lbl = state.phase === "focus" ? "Start to Focus" : "Start Break";
      dom.btnRow.innerHTML = `<button class="btn btn-primary" id="main-btn"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>${lbl}</button>`;
      const btn = document.getElementById("main-btn") as HTMLButtonElement | null;
      btn?.addEventListener("click", deps.onStartTimer);
    } else if (state.status === "running") {
      dom.btnRow.innerHTML = `<button class="btn btn-ghost" id="pause-btn">Pause</button>`;
      const btn = document.getElementById("pause-btn") as HTMLButtonElement | null;
      btn?.addEventListener("click", deps.onPauseTimer);
    } else {
      dom.btnRow.innerHTML = `<button class="btn btn-primary" id="cont-btn"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>Continue</button><button class="btn btn-danger" id="stop-btn">Stop</button>`;
      const cont = document.getElementById("cont-btn") as HTMLButtonElement | null;
      const stop = document.getElementById("stop-btn") as HTMLButtonElement | null;
      cont?.addEventListener("click", deps.onResumeTimer);
      stop?.addEventListener("click", deps.onStopTimer);
    }
  }

  function openTimeEdit(cursorPos: number | null = null) {
    if (state.status !== "idle") return;
    dom.timeDisplay.style.display = "none";
    dom.timeEdit.style.display = "block";
    dom.timeEdit.value = fmt(state.remaining);
    dom.timeEdit.focus();
    if (typeof cursorPos === "number") dom.timeEdit.setSelectionRange(cursorPos, cursorPos);
    else dom.timeEdit.select();
  }

  function normalizeEditValue() {
    const secs = Math.max(0, Math.min(parseT(dom.timeEdit.value), 99 * 60 + 59));
    dom.timeEdit.value = fmt(secs);
  }

  function getEditableCursorPos(): number {
    let pos = dom.timeEdit.selectionStart ?? 0;
    if (pos === 2) pos = 1;
    if (pos < 2) return Math.max(0, Math.min(1, pos));
    if (pos > 2) return Math.max(3, Math.min(4, pos));
    return 1;
  }

  function moveEditCursor(dir: -1 | 1) {
    let pos = dom.timeEdit.selectionStart ?? 0;
    if ((dom.timeEdit.selectionStart ?? 0) !== (dom.timeEdit.selectionEnd ?? 0)) {
      pos = dir < 0 ? (dom.timeEdit.selectionStart ?? 0) : (dom.timeEdit.selectionEnd ?? 0);
    }
    do {
      pos += dir;
    } while (pos === 2);

    if (pos < 0) pos = 0;
    if (pos > 4) pos = 4;
    if (!EDITABLE_TIME_POS.includes(pos as (typeof EDITABLE_TIME_POS)[number])) pos = pos < 2 ? 1 : 3;
    dom.timeEdit.setSelectionRange(pos, pos);
  }

  function nudgeCurrentDigit(delta: -1 | 1) {
    normalizeEditValue();
    const pos = getEditableCursorPos();
    const chars = dom.timeEdit.value.split("");
    const max = pos === 3 ? 5 : 9;
    let digit = parseInt(chars[pos] ?? "0", 10);
    if (Number.isNaN(digit)) digit = 0;
    digit += delta;
    if (digit > max) digit = 0;
    if (digit < 0) digit = max;
    chars[pos] = String(digit);
    dom.timeEdit.value = chars.join("");
    dom.timeEdit.setSelectionRange(pos, pos);
  }

  function commitEdit() {
    const s = parseT(dom.timeEdit.value);
    if (s > 0 && s <= 99 * 60) {
      state.totalSeconds = s;
      state.remaining = s;
    }
    dom.timeDisplay.style.display = "";
    dom.timeEdit.style.display = "none";
    render();
    ring.setRingImmediate(ring.ringFrac());
  }

  function closeHistory() {
    if (!dom.histWrap.classList.contains("open")) return;
    dom.histWrap.classList.remove("open");
    updateArrow();
  }

  function closeSettings() {
    dom.settingsPanel.classList.remove("open");
  }

  async function toggleHistory() {
    const nextOpen = !dom.histWrap.classList.contains("open");
    if (nextOpen) {
      closeSettings();
      dom.histWrap.classList.add("open");
      updateArrow();
      const api = await deps.ensureHistoryModule();
      api.render();
      const first = api.focusItems()[0];
      first?.focus();
      return;
    }
    closeHistory();
  }

  function toggleSettings() {
    const nextOpen = !dom.settingsPanel.classList.contains("open");
    if (nextOpen) {
      closeHistory();
      dom.settingsPanel.classList.add("open");
      const first = dom.settingsPanel.querySelector('[data-menu-item="true"]');
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    dom.settingsPanel.classList.remove("open");
  }

  function hasTypingFocus(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
    );
  }

  function hasInteractiveFocus(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest("button, a, [role='button']");
  }

  function markSettingsMenuItems() {
    const sel = [
      "#bg-btn",
      "#bg-reset",
      "#alarm-grid .alarm-chip",
      "#alarm-btn",
      "#def-focus",
      "#def-break",
      "#apply-defaults",
    ].join(",");

    dom.settingsPanel.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      el.dataset.menuItem = "true";
      if (el.matches(".alarm-chip")) {
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
      }
    });
  }

  function syncPrefsInputs() {
    dom.defFocus.value = String(Math.round(state.lastFocus / 60));
    dom.defBreak.value = String(Math.round(state.lastBreak / 60));
    document
      .querySelectorAll<HTMLElement>(".alarm-chip")
      .forEach((c) => c.classList.toggle("active", c.dataset.alarm === state.alarmChoice));
  }

  function bindUiEvents() {
    dom.timeDisplay.addEventListener("click", () => openTimeEdit());
    dom.timeEdit.addEventListener("blur", commitEdit);
    dom.timeEdit.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (key === "h") {
        e.preventDefault();
        moveEditCursor(-1);
        return;
      }
      if (key === "l") {
        e.preventDefault();
        moveEditCursor(1);
        return;
      }
      if (key === "j") {
        e.preventDefault();
        nudgeCurrentDigit(-1);
        return;
      }
      if (key === "k") {
        e.preventDefault();
        nudgeCurrentDigit(1);
        return;
      }
      if (e.key === "Enter") dom.timeEdit.blur();
      if (e.key === "Escape") {
        dom.timeEdit.value = fmt(state.remaining);
        dom.timeEdit.blur();
      }
    });

    dom.settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSettings();
    });

    dom.histToggle.addEventListener("click", () => {
      void toggleHistory();
    });

    document.addEventListener("click", (e) => {
      if (!dom.settingsPanel.contains(e.target as Node) && e.target !== dom.settingsBtn) {
        dom.settingsPanel.classList.remove("open");
      }
      if (!dom.histWrap.contains(e.target as Node) && dom.histWrap.classList.contains("open")) {
        closeHistory();
      }
    });

    dom.bgBtn.addEventListener("click", () => dom.bgInput.click());
    dom.bgInput.addEventListener("change", async () => {
      const file = dom.bgInput.files?.[0];
      if (!file) return;
      await deps.onBackgroundPick(file);
    });

    dom.bgReset.addEventListener("click", async () => {
      await deps.onBackgroundReset();
    });

    dom.alarmBtn.addEventListener("click", () => dom.alarmInput.click());
    dom.alarmInput.addEventListener("change", async () => {
      const file = dom.alarmInput.files?.[0];
      if (!file) return;
      await deps.onAlarmPick(file);
    });

    dom.alarmGrid.addEventListener("click", (e) => {
      const chip = (e.target as Element | null)?.closest(".alarm-chip") as HTMLElement | null;
      if (!chip) return;
      document.querySelectorAll<HTMLElement>(".alarm-chip").forEach((x) => x.classList.remove("active"));
      chip.classList.add("active");
      state.alarmChoice = chip.dataset.alarm ?? "bell";
      state.customAlarmBlob = null;
      deps.onSavePrefs();
    });

    dom.alarmGrid.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const chip = (e.target as Element | null)?.closest(".alarm-chip") as HTMLElement | null;
      if (!chip) return;
      e.preventDefault();
      chip.click();
    });

    dom.applyDefaults.addEventListener("click", () => {
      const fm = parseInt(dom.defFocus.value, 10) || 25;
      const bm = parseInt(dom.defBreak.value, 10) || 5;
      deps.onApplyDefaults(fm, bm);
    });

    dom.histToggle.addEventListener("mouseenter", () => {
      void deps.preloadHistory();
    });
    dom.histToggle.addEventListener("focus", () => {
      void deps.preloadHistory();
    });
  }

  return {
    render,
    renderButtons,
    openTimeEdit,
    closeHistory,
    closeSettings,
    toggleHistory,
    toggleSettings,
    hasTypingFocus,
    hasInteractiveFocus,
    markSettingsMenuItems,
    syncPrefsInputs,
    bindUiEvents,
  };
}
