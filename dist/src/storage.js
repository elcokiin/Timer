function parseJson(raw, fallback) {
    try {
        return raw ? JSON.parse(raw) : fallback;
    }
    catch {
        return fallback;
    }
}
export function loadHistRaw() {
    return parseJson(localStorage.getItem("ff_hist"), []);
}
export function saveHistRaw(next) {
    localStorage.setItem("ff_hist", JSON.stringify(next));
}
export function addHistoryRaw(secs, phase) {
    const next = loadHistRaw();
    next.unshift({ secs, phase, ts: Date.now() });
    saveHistRaw(next.slice(0, 90));
}
export function savePrefs(state) {
    localStorage.setItem("ff_prefs", JSON.stringify({
        alarm: state.alarmChoice,
        lastFocus: state.lastFocus,
        lastBreak: state.lastBreak,
        theme: state.theme,
        showRing: state.showRing,
    }));
}
export function loadPrefs(state) {
    const p = parseJson(localStorage.getItem("ff_prefs"), {});
    if (p.alarm)
        state.alarmChoice = p.alarm;
    if (p.theme)
        state.theme = p.theme;
    if (typeof p.showRing === "boolean")
        state.showRing = p.showRing;
    if (p.lastFocus) {
        state.lastFocus = p.lastFocus;
        state.totalSeconds = p.lastFocus;
        state.remaining = p.lastFocus;
    }
    if (p.lastBreak)
        state.lastBreak = p.lastBreak;
}
function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("focusflow", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("kv");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
export async function idbSet(k, v) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put(v, k);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
export async function idbGet(k) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readonly");
        const req = tx.objectStore("kv").get(k);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
export async function idbDel(k) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").delete(k);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
const ALARM_LIBRARY_KEY = "ff_alarm_library";
export async function saveAlarmLibraryRaw(alarms) {
    await idbSet(ALARM_LIBRARY_KEY, JSON.stringify(alarms));
}
export async function loadAlarmLibraryRaw() {
    const raw = await idbGet(ALARM_LIBRARY_KEY);
    if (!raw)
        return [];
    const parsed = parseJson(raw, []);
    return Array.isArray(parsed) ? parsed : [];
}
export function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
