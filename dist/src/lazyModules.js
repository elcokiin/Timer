let historyApi = null;
let historyPromise = null;
let audioPromise = null;
export function getHistoryApi() {
    return historyApi;
}
export async function ensureHistoryModule(ctx) {
    if (historyApi)
        return historyApi;
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
export async function preloadHistory(ctx) {
    try {
        await ensureHistoryModule(ctx);
    }
    catch {
        // retry on demand
    }
}
export async function playAlarmLazy(state) {
    if (state.customAlarmBlob) {
        void new Audio(state.customAlarmBlob).play().catch(() => { });
        return;
    }
    if (!audioPromise) {
        audioPromise = import("./audioEngine.js");
    }
    const module = await audioPromise;
    module.playPresetAlarm(state.alarmChoice);
}
