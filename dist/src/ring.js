export function createRing(state, dom) {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const R_SIZE = vmin * 0.6;
    const RADIUS = R_SIZE * 0.42;
    const CX = R_SIZE / 2;
    const CY = R_SIZE / 2;
    const CIRC = 2 * Math.PI * RADIUS;
    const SW = R_SIZE * 0.017;
    const ring = { startFrac: 1, endFrac: 1, epochStart: 0, rafId: null };
    function drawTicks() {
        const n = 60;
        const oR = RADIUS + SW * 2.2;
        const iR = RADIUS + SW * 4.8;
        let h = "";
        for (let i = 0; i < n; i += 1) {
            const a = (i / n) * 2 * Math.PI;
            const major = i % 5 === 0;
            h += `<line x1="${CX + oR * Math.cos(a)}" y1="${CY + oR * Math.sin(a)}" x2="${CX + iR * Math.cos(a)}" y2="${CY + iR * Math.sin(a)}" stroke="rgba(255,255,255,${major ? 0.22 : 0.09})" stroke-width="${major ? 2 : 1}" stroke-linecap="round"/>`;
        }
        dom.ticksSvg.innerHTML = h;
    }
    function setupRing() {
        [dom.ringSvg, dom.ticksSvg].forEach((s) => {
            s.setAttribute("width", String(R_SIZE));
            s.setAttribute("height", String(R_SIZE));
            s.setAttribute("viewBox", `0 0 ${R_SIZE} ${R_SIZE}`);
        });
        dom.timerWrap.style.width = `${R_SIZE}px`;
        dom.timerWrap.style.height = `${R_SIZE}px`;
        dom.ringBg.setAttribute("cx", String(CX));
        dom.ringBg.setAttribute("cy", String(CY));
        dom.ringBg.setAttribute("r", String(RADIUS));
        dom.ringBg.setAttribute("stroke-width", String(SW));
        dom.ringProg.setAttribute("cx", String(CX));
        dom.ringProg.setAttribute("cy", String(CY));
        dom.ringProg.setAttribute("r", String(RADIUS));
        dom.ringProg.setAttribute("stroke-width", String(SW * 1.25));
        dom.ringProg.setAttribute("stroke-dasharray", String(CIRC));
        dom.ringProg.style.transition = "none";
        drawTicks();
    }
    function ringFrac() {
        return state.totalSeconds > 0 ? state.remaining / state.totalSeconds : 0;
    }
    function rafLoop() {
        ring.rafId = requestAnimationFrame((ts) => {
            ring.rafId = null;
            if (state.status !== "running")
                return;
            const t = Math.min((ts - ring.epochStart) / 1000, 1);
            const frac = ring.startFrac + (ring.endFrac - ring.startFrac) * t;
            dom.ringProg.setAttribute("stroke-dashoffset", String(CIRC * (1 - frac)));
            rafLoop();
        });
    }
    function setRingImmediate(frac) {
        if (ring.rafId != null)
            cancelAnimationFrame(ring.rafId);
        ring.rafId = null;
        ring.startFrac = frac;
        ring.endFrac = frac;
        dom.ringProg.setAttribute("stroke-dashoffset", String(CIRC * (1 - frac)));
    }
    function startRingEpoch(fromFrac, toFrac) {
        ring.startFrac = fromFrac;
        ring.endFrac = toFrac;
        ring.epochStart = performance.now();
        if (!ring.rafId)
            rafLoop();
    }
    return {
        setupRing,
        ringFrac,
        setRingImmediate,
        startRingEpoch,
    };
}
