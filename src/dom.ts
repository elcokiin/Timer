import type { DomRefs } from "./types.js";

function byId<T extends HTMLElement | SVGElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing required element: #${id}`);
  return el as T;
}

export function getDomRefs(): DomRefs {
  return {
    bgEl: byId<HTMLElement>("bg"),
    ringBg: byId<SVGCircleElement>("ring-bg"),
    ringProg: byId<SVGCircleElement>("ring-progress"),
    ringSvg: byId<SVGSVGElement>("ring-svg"),
    ticksSvg: byId<SVGSVGElement>("ticks-svg"),
    timerWrap: byId<HTMLElement>("timer-wrap"),
    timeDisplay: byId<HTMLElement>("time-display"),
    timeEdit: byId<HTMLInputElement>("time-edit"),
    btnRow: byId<HTMLElement>("btn-row"),
    phaseLabel: byId<HTMLElement>("phase-label"),
    settingsBtn: byId<HTMLButtonElement>("settings-btn"),
    settingsPanel: byId<HTMLElement>("settings-panel"),
    advancedBtn: byId<HTMLButtonElement>("advanced-btn"),
    advancedOverlay: byId<HTMLElement>("advanced-overlay"),
    advancedDialog: byId<HTMLElement>("advanced-dialog"),
    advancedClose: byId<HTMLButtonElement>("advanced-close"),
    histToggle: byId<HTMLButtonElement>("history-toggle"),
    histWrap: byId<HTMLElement>("history-wrap"),
    histDays: byId<HTMLElement>("hist-days"),
    histDetail: byId<HTMLElement>("hist-detail"),
    histClear: byId<HTMLButtonElement>("hist-clear"),
    bgBtn: byId<HTMLButtonElement>("bg-btn"),
    bgInput: byId<HTMLInputElement>("bg-input"),
    bgReset: byId<HTMLButtonElement>("bg-reset"),
    alarmBtn: byId<HTMLButtonElement>("alarm-btn"),
    alarmInput: byId<HTMLInputElement>("alarm-input"),
    alarmGrid: byId<HTMLElement>("alarm-grid"),
    defFocus: byId<HTMLInputElement>("def-focus"),
    defBreak: byId<HTMLInputElement>("def-break"),
    applyDefaults: byId<HTMLButtonElement>("apply-defaults"),
    advancedThemeCards: byId<HTMLElement>("advanced-theme-cards"),
    advancedShowRing: byId<HTMLInputElement>("advanced-show-ring"),
    bgArt: byId<HTMLElement>("bg-art"),
  };
}
