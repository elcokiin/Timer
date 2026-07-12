<p align="center">
  <img src="./icons/icon-192.svg" width="96" alt="FocusFlow" />
</p>

<h1 align="center">FocusFlow</h1>

<p align="center">
  A keyboard-driven Pomodoro timer that loads instantly and works offline.
  <br/>
  Zero frameworks. Zero accounts. Zero config.
</p>

---

### The Gateway

You open it not because you have energy, but because you want energy. You tell yourself "just 10 minutes" — a commitment so small it bypasses the resistance. Once the timer is running, inertia takes over. The hardest part was opening the app.

---

## Features

- **Pomodoro & Focus-only modes** — full cycles or single sessions
- **Keyboard-first** — every operation without touching the mouse
- **Offline by default** — Service Worker caches everything on first visit
- **Push notifications** — system alerts when a session ends
- **Custom alarms** — upload your own audio files
- **Custom backgrounds** — set any image as the timer background
- **6 color themes** — Forest, Ocean, Sunset, Amber, Mono, Graphite
- **Session history** — grouped by day with morning/afternoon/evening blocks
- **Animated ring** — SVG progress indicator with optional tick marks
- **Alarm sounds** — three built-in (Bell, Chime, Digital) plus custom uploads

## Quick Start

```bash
npm install
npm run build
npx serve .
```

Then open the local URL. Do **not** open the file directly — Service Worker registration and push notifications require HTTP or HTTPS.

> [!NOTE]
> You can also use `python3 -m http.server` or any other static file server.

## Build Commands

| Command | Description |
|---|---|
| `npm run build` | Compiles `src/**/*.ts` to `dist/src/*.js` and `sw.ts` to `sw.js` |
| `npm run typecheck` | Runs strict TypeScript type checking |

## Keyboard Shortcuts

### Global

| Key | Action |
|---|---|
| `Space` / `Enter` | Start / Pause / Resume |
| `s` | Stop (running/paused) or Toggle settings (idle) |
| `i` | Edit time (idle only) |
| `r` | Toggle ring visibility |
| `p` | Toggle timer mode |
| `d` | Cycle theme |
| `e` | Open advanced settings |
| `H` | Toggle history panel |
| `,` | Toggle settings panel |
| `?` | Show keyboard shortcuts help |
| `q` / `Esc` | Close any open panel |

### Navigation (when a menu is open)

| Key | Action |
|---|---|
| `j` / `k` | Move down / up |
| `h` / `l` | History: cycle days. Settings: move alarm chips |
| `G` | Jump to bottom |
| `gg` (double-tap) | Jump to top |
| `d` | Delete focused entry or custom alarm |
| `Enter` / `Space` | Activate focused item |

> [!TIP]
> Shortcuts are disabled while typing in input fields. `Space` and `Enter` don't override button clicks.

## Push Notifications

Toggle **Push notifications** in Advanced settings. The first time you enable it, the browser will ask for permission. On session completion, a system notification shows whether it's time for a break or the next focus round.

Requires the page to be served over HTTPS or localhost.

## History

- Sessions are recorded automatically with duration, type, and timestamp
- Grouped by day, partitioned into Morning / Afternoon / Evening
- Click a past session to re-apply its duration to the timer
- Use the **Clear** button to erase all history

## Project Structure

```
├── index.html              # Single HTML shell
├── manifest.json           # PWA manifest
├── sw.ts / sw.js           # Service Worker (cache/offline)
├── philosophy.md           # Product philosophy
└── src/
    ├── main.ts             # Entry point
    ├── state.ts            # Global state
    ├── timerCore.ts        # Timer logic
    ├── uiBindings.ts       # UI rendering & events
    ├── keyboard.ts         # Shortcuts & menu navigation
    ├── shortcuts.ts        # Help dialog
    ├── ring.ts             # SVG ring animation
    ├── appShell.ts         # HTML template
    ├── storage.ts          # localStorage + IndexedDB
    ├── audioEngine.ts      # Web Audio API alarms
    ├── audioTrim.ts        # Audio trimming for custom alarms
    ├── historyMenu.ts      # History panel
    ├── lazyModules.ts      # Lazy loading
    ├── dom.ts              # Typed DOM references
    └── types.ts            # TypeScript definitions
```

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Browser (ES2022 modules)
- **Storage:** localStorage + IndexedDB
- **Audio:** Web Audio API
- **Build:** `tsc` only — no bundlers, no frameworks
- **Dependencies:** Zero runtime dependencies
