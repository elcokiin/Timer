let audioCtx = null;
function getCtx() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
            throw new Error("Web Audio API is not supported in this browser.");
        }
        audioCtx = new Ctx();
    }
    return audioCtx;
}
export function playPresetAlarm(choice) {
    const ctx = getCtx();
    const patterns = {
        bell: [
            [523, 0, 0.5],
            [659, 0.6, 0.5],
            [784, 1.2, 0.9],
            [659, 2, 0.5],
        ],
        chime: [
            [880, 0, 0.4],
            [1047, 0.3, 0.4],
            [1319, 0.6, 0.4],
            [1047, 0.9, 0.4],
            [880, 1.2, 0.7],
        ],
        digital: [
            [440, 0, 0.15],
            [440, 0.2, 0.15],
            [440, 0.4, 0.15],
            [550, 0.6, 0.4],
            [440, 0.9, 0.2],
        ],
    };
    const sequence = patterns[choice] ?? patterns["bell"] ?? [];
    sequence.forEach(([freq, delay, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = choice === "digital" ? "square" : "sine";
        const start = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.4, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.start(start);
        osc.stop(start + dur + 0.1);
    });
}
