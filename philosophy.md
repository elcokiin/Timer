# FocusFlow Philosophy

A timer is a commitment device. You set it, and for the duration you are bound to something you chose. FocusFlow exists to enforce that commitment with the least possible resistance between you and the timer.

It is not a productivity system. It is not a habit tracker. It is not a dashboard of your efficiency. It is a timer.

## Vanilla

Every framework you add is a future rewrite you are deferring. FocusFlow has zero framework dependencies — no React, no Vue, no bundler, no runtime. TypeScript compiles to JavaScript and that is the entire build step. The result loads in a single HTTP request and is interactive before most framework SPAs have finished parsing their vendor chunk.

The web platform is enough. It has been enough for years. The industry's collective amnesia about this is not your problem.

## Keyboard

A timer should not require a mouse. Every operation in FocusFlow has a keybinding. You can start, stop, edit, configure, and navigate without leaving the keyboard. Not because mouse users are second-class, but because the keyboard is the faster path and speed is the point.

Vim-style navigation in menus is not a gimmick. It is a recognition that once your hands are on the keyboard, reaching for the mouse is a context switch that costs more than a millisecond.

## Offline

A timer that needs the network is a timer that fails when you need it most. FocusFlow works offline by design, not as an afterthought. Every asset is cached on first visit. Your history and preferences live in localStorage. There is no server to reach, no API to call, no account to authenticate.

This is not a feature. This is the default. The web should work without permission from a server.

## Private

There are no accounts. There is no telemetry. There is no analytics. There is no "sign up for free" button. Your session data belongs to your browser and nothing leaves it.

A focus timer has no business knowing your email address.

## Minimal

The default state of FocusFlow is a ring, a number, and a button. Settings and history are hidden until you ask for them. There is no onboarding, no tutorial, no "welcome" modal. The interface assumes you know what a timer is.

Every pixel that is not the timer is a distraction from the timer.

## Fast

Speed is not a feature. Speed is respect for the user's time. FocusFlow is fast not because of performance optimizations but because of omission — it does not load what it does not need.

The fastest code is the code that was never written.

## Audible

When time is up, the app rings. It uses the Web Audio API or your uploaded audio file. It can push a notification to your system. The transition from focus to break is unambiguous. You will not miss it because you looked away for a second.

The timer's job is to tell you when your commitment is fulfilled. It should do that clearly.

## What FocusFlow Is Not

FocusFlow competes by being less. It is not a platform, not an ecosystem, not a daily planner, not a gamified streak machine. It is not trying to replace your todo list, your calendar, or your journal. It is a timer that gets out of your way.

The best tools are the ones you forget you are using. FocusFlow aims to be forgotten the instant you press Start.
