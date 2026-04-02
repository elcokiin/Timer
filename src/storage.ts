import type { AppState, HistoryEntry } from "./types.js";

interface Prefs {
  alarm?: string;
  lastFocus?: number;
  lastBreak?: number;
}

function parseJson<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadHistRaw(): HistoryEntry[] {
  return parseJson<HistoryEntry[]>(localStorage.getItem("ff_hist"), []);
}

export function saveHistRaw(next: HistoryEntry[]): void {
  localStorage.setItem("ff_hist", JSON.stringify(next));
}

export function addHistoryRaw(secs: number, phase: HistoryEntry["phase"]): void {
  const next = loadHistRaw();
  next.unshift({ secs, phase, ts: Date.now() });
  saveHistRaw(next.slice(0, 90));
}

export function savePrefs(state: AppState): void {
  localStorage.setItem(
    "ff_prefs",
    JSON.stringify({
      alarm: state.alarmChoice,
      lastFocus: state.lastFocus,
      lastBreak: state.lastBreak,
    })
  );
}

export function loadPrefs(state: AppState): void {
  const p = parseJson<Prefs>(localStorage.getItem("ff_prefs"), {});
  if (p.alarm) state.alarmChoice = p.alarm;
  if (p.lastFocus) {
    state.lastFocus = p.lastFocus;
    state.totalSeconds = p.lastFocus;
    state.remaining = p.lastFocus;
  }
  if (p.lastBreak) state.lastBreak = p.lastBreak;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("focusflow", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSet(k: string, v: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(v, k);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGet(k: string): Promise<string | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readonly");
    const req = tx.objectStore("kv").get(k);
    req.onsuccess = () => resolve(req.result as string | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function idbDel(k: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").delete(k);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
