# FocusFlow PWA

Single-page Pomodoro timer (`index.html`) with history, background/alarm customization, and offline mode via Service Worker.

## Quick Start

- Install dependencies: `npm install`
- Compile TypeScript: `npm run build`
- Serve with a local server (for example `npx serve .`)
- Open the local URL (not the file directly) to validate PWA/offline behavior

## Build TypeScript

- `npm run build`: compiles `src/**/*.ts` to `dist/src/*.js` and `sw.ts` to `sw.js`
- `npm run typecheck`: strict type checking for the app

## Keyboard Shortcuts

- `Space` or `Enter`: toggle start, pause, and resume timer
- `s`: stop the timer (while running or paused)
- `i`: toggle timer time edit mode (idle only)
- `Shift+H`: open/close the history panel
- `,` or `p`: open/close the settings panel
- `e`: toggle advanced settings (open/close)
- `r`: show/hide the animated ring (global)
- `Esc`: close open panels

Vim-style navigation in open menus:

- `j` / `k`: move focus down/up
- `G`: jump to bottom
- `gg`: jump to top
- In history: `h` / `l` changes selected day
- In advanced settings modal: `h` / `l` moves across cards and `j` / `k` moves up/down rows
- `Enter`: activate focused item (tab, block, or session)

## History

- `Clear` button in the side panel header removes all history
- History is grouped by days (tabs)
- Each day shows `Morning`, `Afternoon`, `Evening` blocks
- Only `focus` time is counted for day/block totals
- Click or `Enter` on a focus session applies that duration to the timer

Behavior notes:

- Shortcuts do not trigger while typing in `input`, `textarea`, `select`, or `contenteditable` elements
- `Space` and `Enter` do not override normal interaction when focus is on buttons/links

## Right Panel (History)

The right side panel positioning was adjusted to avoid tab/panel overlap or misalignment:

- The history tab stays fixed to the right edge
- The panel is positioned absolutely relative to the wrapper and slides with `transform`
- A responsive width (`min(230px, 78vw)`) improves small-screen behavior

## Main Structure

- `index.html`: main UI and style shell
- `src/main.ts`: main module (timer, global keyboard, lazy loading)
- `src/state.ts`: global state and time utilities
- `src/ring.ts`: ring logic and rAF animation
- `src/timerCore.ts`: timer start/pause/resume/stop flow
- `src/uiBindings.ts`: UI rendering and event bindings
- `src/keyboard.ts`: global shortcuts and vim-style menu navigation
- `src/storage.ts`: localStorage + IndexedDB + serialization
- `src/lazyModules.ts`: lazy loading for history/audio
- `src/historyMenu.ts`: lazy history module (days/blocks)
- `src/audioEngine.ts`: lazy alarm sound module
- `dist/src/*.js`: compiled output used by `index.html`
- `sw.js`: Service Worker for cache/offline
- `sw.ts`: TypeScript source for the Service Worker
- `manifest.json`: installable PWA manifest
