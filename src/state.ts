import type { AppState } from "./types.js";

export const state: AppState = {
  phase: "focus",
  status: "idle",
  theme: "forest",
  showRing: true,
  totalSeconds: 25 * 60,
  remaining: 25 * 60,
  lastFocus: 25 * 60,
  lastBreak: 5 * 60,
  alarmChoice: "bell",
  customAlarms: [],
  interval: null,
};

export function fmt(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function parseT(str: string): number {
  const p = str.split(":");
  if (p.length === 2) {
    const mm = parseInt(p[0] ?? "0", 10) || 0;
    const ss = parseInt(p[1] ?? "0", 10) || 0;
    return mm * 60 + ss;
  }
  return (parseInt(str, 10) || 0) * 60;
}

export const EDITABLE_TIME_POS = [0, 1, 3, 4] as const;
