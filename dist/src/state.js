export const state = {
    phase: "focus",
    status: "idle",
    totalSeconds: 25 * 60,
    remaining: 25 * 60,
    lastFocus: 25 * 60,
    lastBreak: 5 * 60,
    alarmChoice: "bell",
    customAlarmBlob: null,
    interval: null,
};
export function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
export function parseT(str) {
    const p = str.split(":");
    if (p.length === 2) {
        const mm = parseInt(p[0] ?? "0", 10) || 0;
        const ss = parseInt(p[1] ?? "0", 10) || 0;
        return mm * 60 + ss;
    }
    return (parseInt(str, 10) || 0) * 60;
}
export const EDITABLE_TIME_POS = [0, 1, 3, 4];
