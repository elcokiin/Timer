# FocusFlow PWA

Single-page Pomodoro timer with history, background/alarm customization, push notifications, and offline mode via Service Worker.

## Quick Start

- Install dependencies: `npm install`
- Compile TypeScript: `npm run build`
- Serve with a local server (for example `npx serve .`)
- Open the local URL (not the file directly) to validate PWA/offline behavior

## Build TypeScript

- `npm run build`: compiles `src/**/*.ts` to `dist/src/*.js` and `sw.ts` to `sw.js`
- `npm run typecheck`: strict type checking for the app

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` / `Enter` | Start / Pause / Resume timer |
| `s` | Stop timer (running/paused) or Toggle settings (idle) |
| `i` | Edit time (idle only) |
| `r` | Toggle animated ring visibility |
| `p` | Toggle Pomodoro / Focus-only mode |
| `d` | Cycle theme (global) or Delete focused item (in menus) |
| `e` | Open advanced settings |
| `H` | Toggle history panel |
| `,` | Toggle settings panel |
| `?` | Show/hide keyboard shortcuts help |
| `q` / `Esc` | Close any open panel/menu |

Vim-style navigation in open menus (history, settings):

| Key | Action |
|---|---|
| `j` / `k` | Move focus down / up |
| `G` | Jump to bottom |
| `gg` (tap twice) | Jump to top |
| `h` / `l` | History: cycle days or collapse periods. Settings: move alarm chips horizontally |
| `d` | Delete focused history entry or custom alarm |
| `Enter` / `Space` | Activate focused item |

In the advanced settings modal:

| Key | Action |
|---|---|
| `h` / `l` / `j` / `k` | Navigate theme cards |
| `p` | Toggle Pomodoro mode |
| `r` | Toggle ring visibility |
| `q` / `Esc` / `e` | Close |

Shortcuts do not trigger while typing in `input`, `textarea`, `select`, or `contenteditable` elements. `Space` and `Enter` do not override normal interaction when focus is on buttons/links.

## Push Notifications

Available in Advanced settings. When enabled, the browser will ask for permission. On timer completion, a system notification is shown with the session result (focus → "Break time!", break → "Focus time!"). Requires the page to be served over HTTPS or localhost.

## History

- `Clear` button in the side panel header removes all history
- History is grouped by days (tabs)
- Each day shows `Morning`, `Afternoon`, `Evening` blocks
- Only `focus` time is counted for day/block totals
- Click or `Enter` on a focus session applies that duration to the timer

## Main Structure

- `index.html`: main UI and style shell
- `src/main.ts`: main module (timer, global keyboard, lazy loading)
- `src/state.ts`: global state and time utilities
- `src/ring.ts`: ring logic and rAF animation
- `src/timerCore.ts`: timer start/pause/resume/stop flow
- `src/uiBindings.ts`: UI rendering and event bindings
- `src/keyboard.ts`: global shortcuts and vim-style menu navigation
- `src/shortcuts.ts`: keyboard shortcuts help dialog
- `src/storage.ts`: localStorage + IndexedDB + serialization
- `src/lazyModules.ts`: lazy loading for history/audio
- `src/historyMenu.ts`: lazy history module (days/blocks)
- `src/audioEngine.ts`: lazy alarm sound module
- `src/audioTrim.ts`: audio file trimming for custom alarms
- `src/dom.ts`: typed DOM element references
- `src/types.ts`: TypeScript type definitions
- `src/appShell.ts`: full HTML template string
- `dist/src/*.js`: compiled output used by `index.html`
- `sw.js`: Service Worker for cache/offline
- `sw.ts`: TypeScript source for the Service Worker
- `manifest.json`: installable PWA manifest
