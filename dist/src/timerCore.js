export function createTimerCore(deps) {
    const { state, ring } = deps;
    function onEnd() {
        void deps.playAlarmLazy();
        state.status = "idle";
        if (state.phase === "focus") {
            state.phase = "break";
            state.totalSeconds = state.lastBreak;
            state.remaining = state.lastBreak;
        }
        else {
            state.phase = "focus";
            state.totalSeconds = state.lastFocus;
            state.remaining = state.lastFocus;
        }
        deps.render();
        ring.setRingImmediate(1);
        deps.renderButtons();
    }
    function tick() {
        const fromFrac = ring.ringFrac();
        state.remaining -= 1;
        deps.render();
        if (state.remaining <= 0) {
            if (state.interval)
                clearInterval(state.interval);
            state.interval = null;
            onEnd();
            return;
        }
        ring.startRingEpoch(fromFrac, ring.ringFrac());
    }
    function startTimer() {
        if (state.remaining <= 0)
            return;
        if (state.phase === "focus")
            state.lastFocus = state.totalSeconds;
        else
            state.lastBreak = state.totalSeconds;
        deps.addHistoryRaw(state.totalSeconds, state.phase);
        deps.getHistoryApi()?.render();
        deps.savePrefs();
        state.status = "running";
        deps.renderButtons();
        deps.render();
        ring.startRingEpoch(ring.ringFrac(), ring.ringFrac());
        state.interval = setInterval(tick, 1000);
    }
    function pauseTimer() {
        if (state.interval)
            clearInterval(state.interval);
        state.interval = null;
        state.status = "paused";
        deps.renderButtons();
        deps.render();
    }
    function resumeTimer() {
        state.status = "running";
        deps.renderButtons();
        deps.render();
        const nextFrac = state.totalSeconds > 0 ? (state.remaining - 1) / state.totalSeconds : 0;
        ring.startRingEpoch(ring.ringFrac(), nextFrac);
        state.interval = setInterval(tick, 1000);
    }
    function stopTimer() {
        if (state.interval)
            clearInterval(state.interval);
        state.interval = null;
        state.status = "idle";
        if (state.phase === "break") {
            state.phase = "focus";
            state.totalSeconds = state.lastFocus;
        }
        state.remaining = state.totalSeconds;
        deps.render();
        ring.setRingImmediate(1);
        deps.renderButtons();
    }
    return {
        tick,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
    };
}
