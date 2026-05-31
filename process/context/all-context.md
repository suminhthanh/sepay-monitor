# SePay Monitor - All Context

Last updated: 2026-05-31

This file is the root context entrypoint for the repo.

---

## Quick Start

For most substantial tasks:
1. read this file first
2. choose the smallest relevant root file or context group from the tables below
3. only then load deeper files

---

## Current Root Entry Points

| File | Read when |
|---|---|
| `process/context/all-context.md` | any substantial planning, research, review, or implementation task |
| `process/context/tests/all-tests.md` | testing, verification, debugging test failures, execution planning |
| `process/context/planning/all-planning.md` | plan-shape calibration, planning examples, SIMPLE vs COMPLEX reference docs |

## Task Routing Table

| If the task involves... | Start with |
|---|---|
| architecture or stack questions | this file |
| testing or verification | `process/context/tests/all-tests.md` |
| creating a new plan | `process/context/planning/all-planning.md` |
| polling engine, SePay API client | this file → `src-tauri/src/` |
| TTS, notifications, UI components | this file → `src/` |
| database schema or migrations | this file → `src/db/` |
| CI/CD or release | this file → `.github/workflows/` |

---

## Repository Structure

```
sepay-monitor/
  src/                        -- React + TypeScript frontend (Tauri webview)
    components/ui/            -- shadcn/ui components
    hooks/                    -- use-transaction-listener.ts, use-settings-loader.ts
    stores/                   -- transactions.ts, settings.ts (Zustand)
    pages/                    -- Dashboard.tsx, History.tsx, Settings.tsx
    db/                       -- schema.ts, client.ts, queries.ts (Drizzle)
    lib/                      -- tts.ts, format.ts, export.ts
    App.tsx                   -- root component with Tabs navigation
    main.tsx                  -- React entry point
  src-tauri/                  -- Rust backend (Tauri)
    src/
      lib.rs                  -- Tauri app setup, plugins, tray, commands
      main.rs                 -- entry point
      sepay/
        mod.rs
        client.rs             -- SePayClient (reqwest, fetch_transactions)
      polling/
        mod.rs                -- 5s tokio polling loop, since_id, emit events
    capabilities/
      default.json            -- plugin permissions
    tauri.conf.json
    Cargo.toml
  .github/
    workflows/
      release.yml             -- GitHub Actions release on tag push
  process/
    context/                  -- this context system
    general-plans/            -- plans, reports, references
    development-protocols/    -- RIPER-5 methodology docs
  package.json
  vite.config.ts
  tsconfig.json
  components.json             -- shadcn config
```

---

## Technology Stack

- **Desktop framework:** Tauri 2.11.x (Rust backend + webview frontend)
- **Frontend:** React 19 + TypeScript 5.8 + Vite 7
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State management:** Zustand
- **Database:** SQLite via `tauri-plugin-sql` 2.4.0 (sqlx bridge) + Drizzle ORM 0.45.2
- **TTS:** Web Speech API (`window.speechSynthesis`)
- **Notifications:** `@tauri-apps/plugin-notification` 2.3.3
- **System tray:** Tauri 2.x built-in (`tray-icon` feature), `TrayIconBuilder` in `lib.rs`
- **Auto-start:** `@tauri-apps/plugin-autostart` 2.5.1
- **Store (settings):** `@tauri-apps/plugin-store` 2.4.3
- **Export:** `exceljs` (replaced `xlsx` due to security vulnerabilities)
- **File dialog:** `@tauri-apps/plugin-dialog` 2, `@tauri-apps/plugin-fs` 2
- **Language:** TypeScript (frontend) + Rust (backend)
- **Package manager:** npm
- **CI/CD:** GitHub Actions — triggers on git tag `v*`, builds macOS/Windows/Linux installers

---

## Key Patterns and Conventions

**Polling engine:** Rust tokio task polls SePay API every 5s. Uses `since_id` stored in Tauri Store. Emits `"new-transaction"` Tauri event to frontend.

**Event flow:**
```
Rust polling loop (5s)
  → GET /transactions/list?since_id=X (SePay API)
  → filter tx.id > since_id
  → emit "new-transaction" event per new tx
  → frontend useTransactionListener hook:
      → insertTransaction (SQLite via Drizzle)
      → setSinceId (SQLite app_state)
      → addTransaction (Zustand store)
      → enqueueTts (Web Speech API queue)
      → sendNotification (Tauri notification)
```

**since_id cursor:** Stored in both Tauri Store (Rust reads) and SQLite `app_state` table (frontend reads/writes). Rust store is source of truth for polling; SQLite is source of truth for history.

**TTS queue:** Serializes utterances via `src/lib/tts.ts` — prevents overlapping speech.

**Transaction filter:** `creditOnly` setting (default: true) — skips debit announcements in listener hook.

**Import aliases:** `@/` → `src/`

**Naming:** kebab-case files, PascalCase React components, camelCase TS functions, snake_case Rust.

**Error handling:** Tauri commands return `Result<T, String>`. Frontend logs errors to console.

---

## Environment and Configuration

**Config files:** `tauri.conf.json`, `tsconfig.json`, `Cargo.toml`, `components.json`

**Settings persisted via plugin-store** (`settings.json` in app data dir):
- `api_token` — SePay Bearer token (never log)
- `tts_voice` — selected voice name
- `credit_only` — boolean filter
- `announcements_enabled` — boolean
- `notifications_enabled` — boolean
- `autostart_enabled` — boolean
- `since_id` — last seen transaction id (Rust polling cursor)

**SePay API:**
- Base URL: `https://my.sepay.vn/userapi`
- Endpoint: `GET /transactions/list?limit=20&since_id=X`
- Auth: `Authorization: Bearer <token>`

---

## MVP Features Status

| Feature | Status |
|---|---|
| SePay API polling (5s, since_id) | ✅ implemented |
| Desktop notification | ✅ implemented |
| TTS announcement (Web Speech API) | ✅ implemented |
| SQLite transaction history (Drizzle) | ✅ implemented |
| Settings UI (API key, TTS, filter) | ✅ implemented |
| Transaction filter (credit only default) | ✅ implemented |
| Export to Excel (exceljs) | ✅ implemented |
| Auto-start on login | ✅ implemented |
| Minimize to system tray | ✅ implemented |
| GitHub Actions CI/CD on tag | ✅ implemented |
| Multi-account support | ⏳ deferred to v2 |
| Webhook mode | ⏳ deferred to v2 |

---

## Current Features List (process/features/)

(No feature folders yet — all work tracked in process/general-plans/)

---

## Scan Metadata

- Generated: 2026-05-31
- Mode: post-implementation — based on actual code written
- Package manager: npm
