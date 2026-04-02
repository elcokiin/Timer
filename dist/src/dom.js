function byId(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Missing required element: #${id}`);
    return el;
}
export function getDomRefs() {
    return {
        bgEl: byId("bg"),
        ringBg: byId("ring-bg"),
        ringProg: byId("ring-progress"),
        ringSvg: byId("ring-svg"),
        ticksSvg: byId("ticks-svg"),
        timerWrap: byId("timer-wrap"),
        timeDisplay: byId("time-display"),
        timeEdit: byId("time-edit"),
        btnRow: byId("btn-row"),
        phaseLabel: byId("phase-label"),
        settingsBtn: byId("settings-btn"),
        settingsPanel: byId("settings-panel"),
        histToggle: byId("history-toggle"),
        histWrap: byId("history-wrap"),
        histDays: byId("hist-days"),
        histDetail: byId("hist-detail"),
        histClear: byId("hist-clear"),
        bgBtn: byId("bg-btn"),
        bgInput: byId("bg-input"),
        bgReset: byId("bg-reset"),
        alarmBtn: byId("alarm-btn"),
        alarmInput: byId("alarm-input"),
        alarmGrid: byId("alarm-grid"),
        defFocus: byId("def-focus"),
        defBreak: byId("def-break"),
        applyDefaults: byId("apply-defaults"),
        bgArt: byId("bg-art"),
    };
}
