const PERIODS = [
    { key: "morning", label: "Morning", startHour: 5, endHour: 12 },
    { key: "afternoon", label: "Afternoon", startHour: 12, endHour: 18 },
    { key: "evening", label: "Evening", startHour: 18, endHour: 24 },
];
const EARLY_SLOT = "morning";
let selectedDay = null;
const openPeriodsByDay = new Map();
function fmt(secs) {
    return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}
function parseHist() {
    try {
        return JSON.parse(localStorage.getItem("ff_hist") || "[]");
    }
    catch {
        return [];
    }
}
function saveHist(next) {
    localStorage.setItem("ff_hist", JSON.stringify(next));
}
function dayKey(ts) {
    const d = new Date(ts);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function labelForDay(day) {
    const [yearRaw, monthRaw, dateRaw] = day.split("-").map(Number);
    const year = yearRaw ?? 1970;
    const month = monthRaw ?? 1;
    const date = dateRaw ?? 1;
    const target = new Date(year, month - 1, date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const diff = Math.round((today - targetDay) / 86400000);
    if (diff === 0)
        return "Today";
    if (diff === 1)
        return "Yesterday";
    return target.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function bucketForHour(hour) {
    const period = PERIODS.find((slot) => hour >= slot.startHour && hour < slot.endHour);
    return period ? period.key : EARLY_SLOT;
}
function groupedHistory() {
    const all = parseHist().slice(0, 60);
    const groups = new Map();
    all.forEach((item) => {
        const day = dayKey(item.ts);
        if (!groups.has(day)) {
            groups.set(day, { day, items: [], focusTotal: 0 });
        }
        const group = groups.get(day);
        if (!group)
            return;
        const date = new Date(item.ts);
        group.items.push({
            ...item,
            bucket: bucketForHour(date.getHours()),
            hourLabel: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        if (item.phase === "focus")
            group.focusTotal += Number(item.secs) || 0;
    });
    return Array.from(groups.values()).sort((a, b) => b.day.localeCompare(a.day));
}
function ensureOpenPeriods(day) {
    if (!openPeriodsByDay.has(day)) {
        openPeriodsByDay.set(day, new Set(PERIODS.map((x) => x.key)));
    }
    return openPeriodsByDay.get(day);
}
export function initHistoryMenu(options) {
    const { daysEl, detailEl, clearEl } = options;
    function renderDays(groups) {
        daysEl.innerHTML = "";
        groups.forEach((group, index) => {
            const active = selectedDay ? selectedDay === group.day : index === 0;
            if (active)
                selectedDay = group.day;
            const btn = document.createElement("button");
            btn.className = `hist-tab${active ? " active" : ""}`;
            btn.type = "button";
            btn.dataset.day = group.day;
            btn.dataset.menuItem = "true";
            btn.dataset.kind = "day-tab";
            btn.setAttribute("role", "tab");
            btn.setAttribute("aria-selected", active ? "true" : "false");
            btn.setAttribute("tabindex", active ? "0" : "-1");
            btn.textContent = labelForDay(group.day);
            daysEl.appendChild(btn);
        });
    }
    function renderDetail(groups) {
        const chosen = groups.find((x) => x.day === selectedDay) || groups[0];
        if (!chosen) {
            detailEl.innerHTML = '<div class="hist-empty">No history yet</div>';
            return;
        }
        selectedDay = chosen.day;
        const openSet = ensureOpenPeriods(chosen.day);
        const byPeriod = PERIODS.map((period) => {
            const list = chosen.items.filter((x) => x.phase === "focus" && x.bucket === period.key);
            const total = list.reduce((sum, x) => sum + (Number(x.secs) || 0), 0);
            return { ...period, list, total, open: openSet.has(period.key) };
        });
        const sections = byPeriod
            .map((period) => {
            const rows = period.list.length
                ? period.list
                    .map((item) => `
        <div class="hist-item" tabindex="0" role="button" data-menu-item="true" data-kind="focus-item" data-secs="${item.secs}" data-ts="${item.ts}" aria-label="Use focus time ${fmt(item.secs)}">
          <div class="hist-left">
            <span class="hist-time">${fmt(item.secs)}</span>
            <span class="hist-label">${item.hourLabel}</span>
          </div>
          <button class="hist-del" title="Delete item" aria-label="Delete item" data-ts="${item.ts}">x</button>
        </div>`)
                    .join("")
                : '<div class="hist-empty">No focus sessions</div>';
            return `
      <section class="hist-period ${period.open ? "open" : ""}" data-period="${period.key}">
        <button class="hist-period-head" type="button" data-menu-item="true" data-kind="period-toggle" data-period="${period.key}" aria-expanded="${period.open ? "true" : "false"}">
          <span>${period.label}</span>
          <span>${fmt(period.total)}</span>
        </button>
        <div class="hist-period-list">${rows}</div>
      </section>`;
        })
            .join("");
        detailEl.innerHTML = `
      <div class="hist-day-title">${labelForDay(chosen.day)}</div>
      <div class="hist-day-total">Total focus: ${fmt(chosen.focusTotal)}</div>
      ${sections}`;
    }
    function render() {
        const groups = groupedHistory();
        if (!groups.length) {
            daysEl.innerHTML = "";
            detailEl.innerHTML = '<div class="hist-empty">No history yet</div>';
            return;
        }
        if (!selectedDay || !groups.some((g) => g.day === selectedDay)) {
            selectedDay = groups[0]?.day ?? null;
        }
        renderDays(groups);
        renderDetail(groups);
    }
    function removeHistoryItem(ts) {
        const next = parseHist().filter((x) => Number(x.ts) !== ts);
        saveHist(next);
        render();
    }
    function clearHistory() {
        localStorage.removeItem("ff_hist");
        selectedDay = null;
        openPeriodsByDay.clear();
        render();
    }
    daysEl.addEventListener("click", (event) => {
        const btn = event.target?.closest(".hist-tab");
        if (!btn)
            return;
        selectedDay = btn.dataset.day ?? null;
        render();
    });
    daysEl.addEventListener("keydown", (event) => {
        const btn = event.target?.closest(".hist-tab");
        if (!btn || event.key !== "Enter")
            return;
        event.preventDefault();
        selectedDay = btn.dataset.day ?? null;
        render();
    });
    detailEl.addEventListener("click", (event) => {
        const del = event.target?.closest(".hist-del");
        if (del) {
            event.stopPropagation();
            const ts = Number(del.dataset.ts || 0);
            if (ts)
                removeHistoryItem(ts);
            return;
        }
        const periodBtn = event.target?.closest(".hist-period-head");
        if (periodBtn) {
            if (!selectedDay)
                return;
            const set = ensureOpenPeriods(selectedDay);
            const period = periodBtn.dataset.period;
            if (!period)
                return;
            if (set.has(period))
                set.delete(period);
            else
                set.add(period);
            render();
            return;
        }
        const item = event.target?.closest('.hist-item[data-kind="focus-item"]');
        if (item) {
            const secs = Number(item.dataset.secs || 0);
            if (secs > 0)
                options.onApplyDuration(secs);
        }
    });
    detailEl.addEventListener("keydown", (event) => {
        const item = event.target?.closest('[data-menu-item="true"]');
        if (!item || event.key !== "Enter")
            return;
        event.preventDefault();
        item.click();
    });
    clearEl.addEventListener("click", clearHistory);
    function focusItems() {
        const roots = [daysEl, detailEl];
        return roots.flatMap((root) => Array.from(root.querySelectorAll('[data-menu-item="true"]')));
    }
    function selectPrevDay() {
        const tabs = Array.from(daysEl.querySelectorAll(".hist-tab"));
        if (!tabs.length)
            return;
        const index = tabs.findIndex((el) => el.classList.contains("active"));
        const nextIndex = index <= 0 ? tabs.length - 1 : index - 1;
        selectedDay = tabs[nextIndex]?.dataset.day ?? selectedDay;
        render();
        daysEl.querySelector(".hist-tab.active")?.focus();
    }
    function selectNextDay() {
        const tabs = Array.from(daysEl.querySelectorAll(".hist-tab"));
        if (!tabs.length)
            return;
        const index = tabs.findIndex((el) => el.classList.contains("active"));
        const nextIndex = index >= tabs.length - 1 ? 0 : index + 1;
        selectedDay = tabs[nextIndex]?.dataset.day ?? selectedDay;
        render();
        daysEl.querySelector(".hist-tab.active")?.focus();
    }
    function toggleFocusedPeriod(direction) {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement))
            return;
        const periodBtn = active.closest(".hist-period-head");
        if (!periodBtn || !selectedDay)
            return;
        const period = periodBtn.dataset.period;
        if (!period)
            return;
        const set = ensureOpenPeriods(selectedDay);
        if (direction > 0)
            set.add(period);
        else
            set.delete(period);
        render();
        detailEl.querySelector(`.hist-period-head[data-period="${period}"]`)?.focus();
    }
    render();
    return {
        render,
        focusItems,
        selectPrevDay,
        selectNextDay,
        toggleFocusedPeriod,
    };
}
