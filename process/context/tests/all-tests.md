# SePay Monitor - All Tests

Last updated: 2026-05-31

Attach this file first when the task involves testing, verification, or test debugging.

---

## What This Covers

- test runner selection
- quick commands by package
- fast debugging procedures
- current testing gaps worth remembering

## Read This When

- running tests after implementation
- deciding between test runners
- debugging failing tests

## Quick Routing

(No deeper test docs yet. Add routing entries here as they are created.)

---

## Quick Decision Guide

### Use `vitest` for frontend (React)

- React components, hooks, stores
- TTS logic, transaction parsing, notification logic
- Drizzle query helpers

### Use `cargo test` for Rust backend

- Tauri commands (polling engine, SQLite operations)
- SePay API client deserialization (especially string→number coercion)
- System tray / auto-start logic

### Use Playwright when

- full app flow needs verification (e.g., transaction appears in UI after poll)
- notification popup behavior

---

## Default Verification Order

1. run the narrowest existing automated test
2. unit/integration before browser tests
3. e2e only when real UI behavior is being verified

---

## Commands

| Package | Runner | Command | Notes |
|---|---|---|---|
| `src/` (frontend) | vitest | `npm test` | jsdom environment (not yet configured) |
| `src-tauri/` (Rust) | cargo | `cargo test` | run from `src-tauri/` dir |

**Typecheck:**
```bash
npm run build   # tsc + vite build
npx tsc --noEmit  # typecheck only
```

---

## Debugging Quick Reference

- **Tauri commands:** test via `cargo test` in `src-tauri/`, mock Tauri APIs in vitest with `vi.mock('@tauri-apps/api')`
- **SQLite in tests:** use in-memory SQLite (`:memory:`) for Drizzle tests to avoid file state
- **Web Speech API:** mock `window.speechSynthesis` in vitest jsdom environment
- **SePay API:** mock HTTP responses — never use real API key in tests
- **SePay number coercion:** API returns all numbers as strings (`"id":"60320160"`) — custom serde deserializers handle this in `src-tauri/src/sepay/client.rs`

---

## Known Gaps

- No tests exist yet (project just implemented)
- vitest not yet configured (no `vite.config.ts` test block)
- Rust unit tests not scaffolded yet
- E2E Playwright setup not configured
