export type Phase = "focus" | "break";
export type TimerStatus = "idle" | "running" | "paused";

export interface AppState {
  phase: Phase;
  status: TimerStatus;
  totalSeconds: number;
  remaining: number;
  lastFocus: number;
  lastBreak: number;
  alarmChoice: string;
  customAlarmBlob: string | null;
  interval: ReturnType<typeof setInterval> | null;
}

export interface HistoryEntry {
  secs: number;
  phase: Phase;
  ts: number;
}

export interface HistoryApi {
  render: () => void;
  focusItems: () => HTMLElement[];
  selectPrevDay: () => void;
  selectNextDay: () => void;
  toggleFocusedPeriod: (direction: -1 | 1) => void;
}

export interface DomRefs {
  bgEl: HTMLElement;
  ringBg: SVGCircleElement;
  ringProg: SVGCircleElement;
  ringSvg: SVGSVGElement;
  ticksSvg: SVGSVGElement;
  timerWrap: HTMLElement;
  timeDisplay: HTMLElement;
  timeEdit: HTMLInputElement;
  btnRow: HTMLElement;
  phaseLabel: HTMLElement;
  settingsBtn: HTMLButtonElement;
  settingsPanel: HTMLElement;
  histToggle: HTMLButtonElement;
  histWrap: HTMLElement;
  histDays: HTMLElement;
  histDetail: HTMLElement;
  histClear: HTMLButtonElement;
  bgBtn: HTMLButtonElement;
  bgInput: HTMLInputElement;
  bgReset: HTMLButtonElement;
  alarmBtn: HTMLButtonElement;
  alarmInput: HTMLInputElement;
  alarmGrid: HTMLElement;
  defFocus: HTMLInputElement;
  defBreak: HTMLInputElement;
  applyDefaults: HTMLButtonElement;
  bgArt: HTMLElement;
}
