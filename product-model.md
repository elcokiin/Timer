# FocusFlow Product Model

FocusFlow is a focus timer designed to stay out of your way. It does one thing — run a timer — and does it with the minimum viable surface area. No accounts, no data collection, no electron shell, no frameworks. Just a vanilla TypeScript PWA that loads instantly and works offline by default.

This document defines the product philosophy. It is not a technical specification. Its purpose is to preserve what makes FocusFlow distinct as the product evolves.

## Goals

- FocusFlow should be the fastest-loading Pomodoro timer on the web. Every byte is accountable. No framework runtime, no unnecessary dependencies, no splash screens.
- The timer should be controllable entirely from the keyboard. The user should never need to touch a mouse to start, stop, or configure a session.
- The app must work offline. A focus timer is useless if it requires a network connection to function.
- The app must not require accounts, logins, or cloud sync. The user's data lives in their browser and nowhere else.
- The product should be installable as a PWA but never nag the user about it.

## Product Surfaces

FocusFlow has a single product surface.

### PWA / Web App

A Progressive Web App that works on any device with a browser. On mobile it is installable via "Add to Home Screen" and behaves like a native app. On desktop it runs in any modern browser tab. There is no native app, no Electron wrapper, no app store submission — the web is the platform.

## Core Concepts

FocusFlow is built around three concepts.

### Timer

The timer is the product. It counts down from a configured duration and alerts the user when time is up. It supports two modes: Pomodoro (focus + break cycles) and Focus-only (single sessions with no breaks).

### Session History

When a focus session completes, it is recorded in local storage with its duration, type, and timestamp. History is grouped by day and partitioned into morning, afternoon, and evening. The user can clear their history or click a past session to re-apply its duration.

### Preferences

All user settings are stored in the browser. Themes, durations, alarm choice, ring visibility, timer mode, push notification preference, custom alarm audio, and background images — everything lives in localStorage or IndexedDB. No server, no sync, no accounts.

## Design Tenets

### Vanilla First

Zero framework dependencies. No React, no Vue, no bundler. TypeScript compiles directly to JS. This keeps the bundle small, the load time instant, and the codebase understandable without framework churn.

### Keyboard-First

Every operation is accessible from the keyboard. Vim-style navigation (`h`/`j`/`k`/`l`) within menus, single-key shortcuts for all actions, and no required mouse interaction. The keyboard is the primary interface; the mouse is a convenience.

### Progressive Enhancement

Offline is not a fallback — it is the default. The Service Worker caches all assets on first load. If the network disappears, the timer keeps running. Push notifications work over HTTPS or localhost without any server infrastructure.

### Minimal UI

The interface is a ring, a time display, and four buttons. Settings and history are hidden behind toggle panels. There is no settings gear in your face, no onboarding wizard, no tutorial overlay. The user sees the timer and nothing else until they ask for more.

### Audible and Visible Feedback

When a session ends, the app rings an alarm (built-in oscillator or user-uploaded audio), optionally shows a system notification, and pulses the ring. The user cannot miss the transition even if they are looking away.

## What FocusFlow Is Not

- Not a productivity suite. No task lists, no calendar integration, no team features.
- Not a data collection service. No analytics, no telemetry, no accounts.
- Not a platform. There are no plugins, no APIs, no third-party integrations.
- Not a mobile app. It is a web page that happens to work great on mobile.

## Competitive Positioning

FocusFlow competes with every Pomodoro timer app on the market by being the simplest and fastest. It is for developers and keyboard-driven users who want a timer that loads in one HTTP request, respects their privacy, and never asks them to create an account. Its strategic advantage is that it is indistinguishable from a native app while being a single HTML file with a few kilobytes of compiled JavaScript.

The inspirations are minimalism (remove everything that is not the timer), keyboard-driven interfaces (vim, tiling window managers), and the PWA ethos (the web is enough).
