import type { AppState, HistoryApi } from "./types.js";

interface KeyboardDeps {
  state: AppState;
  hasTypingFocus: (target: EventTarget | null) => boolean;
  hasInteractiveFocus: (target: EventTarget | null) => boolean;
  isHistoryOpen: () => boolean;
  isSettingsOpen: () => boolean;
  toggleHistory: () => Promise<void>;
  toggleSettings: () => void;
  closeHistory: () => void;
  closeSettings: () => void;
  getHistoryApi: () => HistoryApi | null;
  getSettingsItems: () => HTMLElement[];
  onStartPauseResume: () => void;
  onStop: () => void;
  onInsertEdit: () => void;
}

export function setupKeyboard(deps: KeyboardDeps): void {
  let gPendingUntil = 0;
  const ALARM_CHIP_SELECTOR = "#alarm-grid .alarm-chip";

  function activeMenu(): "history" | "settings" | null {
    if (deps.isHistoryOpen()) return "history";
    if (deps.isSettingsOpen()) return "settings";
    return null;
  }

  function menuItems(kind: "history" | "settings"): HTMLElement[] {
    if (kind === "history") {
      return deps.getHistoryApi()?.focusItems() ?? [];
    }
    return deps.getSettingsItems();
  }

  function isAlarmChip(el: HTMLElement | null): el is HTMLElement {
    return !!el?.matches(ALARM_CHIP_SELECTOR);
  }

  function activeAlarmChip(items: HTMLElement[]): HTMLElement | null {
    return items.find((el) => isAlarmChip(el) && el.classList.contains("active")) ?? null;
  }

  function firstAlarmChip(items: HTMLElement[]): HTMLElement | null {
    return items.find((el) => isAlarmChip(el)) ?? null;
  }

  function preferredAlarmChip(items: HTMLElement[]): HTMLElement | null {
    return activeAlarmChip(items) ?? firstAlarmChip(items);
  }

  function moveAlarmChipHorizontal(items: HTMLElement[], dir: -1 | 1): boolean {
    const chips = items.filter(isAlarmChip);
    if (!chips.length) return false;
    const active = document.activeElement as HTMLElement | null;
    if (!isAlarmChip(active)) return false;
    const index = active ? chips.indexOf(active) : -1;
    const next = index < 0 ? (dir > 0 ? 0 : chips.length - 1) : (index + dir + chips.length) % chips.length;
    chips[next]?.focus();
    return true;
  }

  function groupedSettingsItems(items: HTMLElement[]): HTMLElement[] {
    const grouped: HTMLElement[] = [];
    let alarmGroupAdded = false;
    for (const item of items) {
      if (isAlarmChip(item)) {
        if (!alarmGroupAdded) {
          grouped.push(item);
          alarmGroupAdded = true;
        }
        continue;
      }
      grouped.push(item);
    }
    return grouped;
  }

  function moveMenuFocus(kind: "history" | "settings", dir: -1 | 1): void {
    const allItems = menuItems(kind).filter((el) => !el.hasAttribute("disabled"));
    if (!allItems.length) return;

    if (kind === "settings") {
      const items = groupedSettingsItems(allItems);
      const active = document.activeElement as HTMLElement | null;
      let index = active ? items.indexOf(active) : -1;
      if (index < 0 && isAlarmChip(active)) {
        const alarmAnchor = firstAlarmChip(items);
        index = alarmAnchor ? items.indexOf(alarmAnchor) : -1;
      }
      const next = index < 0 ? (dir > 0 ? 0 : items.length - 1) : (index + dir + items.length) % items.length;
      const target = items[next] ?? null;
      if (target && target.matches(ALARM_CHIP_SELECTOR)) {
        preferredAlarmChip(allItems)?.focus();
        return;
      }
      target?.focus();
      return;
    }

    const active = document.activeElement as HTMLElement | null;
    const index = active ? allItems.indexOf(active) : -1;
    const next = index < 0 ? (dir > 0 ? 0 : allItems.length - 1) : (index + dir + allItems.length) % allItems.length;
    allItems[next]?.focus();
  }

  function focusMenuTop(kind: "history" | "settings"): void {
    menuItems(kind)[0]?.focus();
  }

  function focusMenuBottom(kind: "history" | "settings"): void {
    const items = menuItems(kind);
    items[items.length - 1]?.focus();
  }

  function handleMenuKeys(event: KeyboardEvent, kind: "history" | "settings"): boolean {
    const key = event.key;
    const lower = key.toLowerCase();
    const active = document.activeElement as HTMLElement | null;
    const activeKind = active?.dataset?.kind ?? "";
    const historyApi = deps.getHistoryApi();

    if (lower === "h" && !event.shiftKey) {
      event.preventDefault();
      if (kind === "history" && historyApi) {
        if (activeKind === "day-tab") {
          historyApi.selectPrevDay();
          return true;
        }
        if (activeKind === "period-toggle") {
          historyApi.toggleFocusedPeriod(-1);
          return true;
        }
      }
      if (kind === "settings") {
        const settingsItems = menuItems("settings").filter((el) => !el.hasAttribute("disabled"));
        if (moveAlarmChipHorizontal(settingsItems, -1)) return true;
      }
      moveMenuFocus(kind, -1);
      return true;
    }

    if (lower === "l" && !event.shiftKey) {
      event.preventDefault();
      if (kind === "history" && historyApi) {
        if (activeKind === "day-tab") {
          historyApi.selectNextDay();
          return true;
        }
        if (activeKind === "period-toggle") {
          historyApi.toggleFocusedPeriod(1);
          return true;
        }
      }
      if (kind === "settings") {
        const settingsItems = menuItems("settings").filter((el) => !el.hasAttribute("disabled"));
        if (moveAlarmChipHorizontal(settingsItems, 1)) return true;
      }
      moveMenuFocus(kind, 1);
      return true;
    }

    if (lower === "j") {
      event.preventDefault();
      moveMenuFocus(kind, 1);
      return true;
    }
    if (lower === "k") {
      event.preventDefault();
      moveMenuFocus(kind, -1);
      return true;
    }

    if (key === "G" || (lower === "g" && event.shiftKey)) {
      event.preventDefault();
      focusMenuBottom(kind);
      return true;
    }

    if (lower === "g" && !event.shiftKey) {
      const now = performance.now();
      if (gPendingUntil > now) {
        event.preventDefault();
        gPendingUntil = 0;
        focusMenuTop(kind);
        return true;
      }
      gPendingUntil = now + 420;
      return true;
    }

    if (key === "Enter" && active?.matches('[data-menu-item="true"]')) {
      event.preventDefault();
      active.click();
      return true;
    }

    return false;
  }

  document.addEventListener("keydown", async (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;

    const menu = activeMenu();
    const lowerKey = e.key.toLowerCase();
    const isMenuNavKey =
      lowerKey === "h" ||
      lowerKey === "j" ||
      lowerKey === "k" ||
      lowerKey === "l" ||
      lowerKey === "g" ||
      e.key === "G" ||
      e.key === "Enter";

    if (deps.hasTypingFocus(e.target) && !(menu && !e.repeat && isMenuNavKey)) return;

    if (menu && !e.repeat) {
      if (e.key === "Escape") {
        e.preventDefault();
        deps.closeHistory();
        deps.closeSettings();
        return;
      }
      if (handleMenuKeys(e, menu)) return;
    }

    const key = lowerKey;
    const isStartPauseResume =
      e.code === "Space" ||
      e.key === " " ||
      e.key === "Spacebar" ||
      e.key === "Enter" ||
      e.code === "Enter" ||
      e.code === "NumpadEnter";

    if (isStartPauseResume && !deps.hasInteractiveFocus(e.target) && !menu && !e.repeat) {
      e.preventDefault();
      deps.onStartPauseResume();
      return;
    }

    if (key === "s" && deps.state.status !== "idle" && !menu && !e.repeat) {
      e.preventDefault();
      deps.onStop();
      return;
    }

    if (key === "i" && deps.state.status === "idle" && !menu && !e.repeat) {
      e.preventDefault();
      deps.onInsertEdit();
      return;
    }

    if (e.key === "H") {
      e.preventDefault();
      await deps.toggleHistory();
      return;
    }

    if ((e.key === "," || key === "p") && !e.repeat) {
      e.preventDefault();
      deps.toggleSettings();
      return;
    }

    if (e.key === "Escape") {
      deps.closeSettings();
      deps.closeHistory();
    }
  });
}
