# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Scout is a **local, single-user** job-search dashboard: tracks job applications and a
networking rolodex of contacts with interaction history, plus an analytics tab over the
pipeline. Companies are the connective tissue between the two. It binds to `127.0.0.1`, has **no auth by design**, and talks to
no external APIs. Stack: Next.js (App Router, TS, React 19) · Prisma · SQLite · Tailwind.

## Commands

```bash
npm run dev          # dev server on http://127.0.0.1:3000 (note the -H 127.0.0.1 binding)
npm run build        # production build
npm run lint         # next lint
npm run db:migrate   # prisma migrate dev
npm run db:seed      # load fake demo data (tsx prisma/seed.ts)
```

First-time setup: `cp .env.example .env && npm install && npx prisma migrate dev && npm run db:seed`.
There is no test suite. After editing `prisma/schema.prisma`, run `npm run db:migrate`.

## Architecture & conventions

- **Server Components + Server Actions.** Pages are RSCs that query Prisma directly. All
  mutations are Server Actions in a per-route `actions.ts` (`app/<entity>/actions.ts`) marked
  `"use server"`. There are no API route handlers. Actions follow a consistent shape:
  parse `FormData` → write via Prisma → `revalidatePath(...)` every affected route →
  `redirect(...)`. When mutating one entity, revalidate the related entity's pages too (e.g.
  editing an application revalidates its company page).

- **`lastActivityAt` is touched on every Application create/edit** — it drives staleness.

- **Single source of truth for enums.** `prisma/schema.prisma` defines the enums; `lib/enums.ts`
  re-declares them as `as const` arrays with display labels (`enumLabel`, `options`) for forms,
  tables, and badges. Keep these two in sync — changing an enum means editing both.
  Prisma enum values **cannot contain spaces** (e.g. `AssumedStale`); multi-word display
  text lives in `enumLabel`'s `LABELS` map. **Always render a status through `enumLabel`,
  never raw** — `StatusBadge`, the dashboard ridge, the table filter, and the analytics
  donut all do. On SQLite, adding an enum *value* needs no migration (enums are TEXT), but
  `npx prisma generate` (via `db:migrate`) is still needed to refresh the client types.

- **"Terminal" statuses (`Accepted`/`Rejected`/`Withdrawn`/`AssumedStale`) are hand-listed
  in more than one place** — `lib/analytics.ts` (`TERMINAL_STATUSES`) and
  `app/applications/[id]/page.tsx`. Update every copy when the set changes.

- **Shared helpers (use these, don't reinvent):**
  - `lib/db.ts` — Prisma client singleton (`import { prisma } from "@/lib/db"`).
  - `lib/form.ts` — Server Action `FormData` parsers: `str` (trim→null), `asEnum`
    (whitelist a value against an enum), `url` (normalize to a safe http(s) URL or
    null, rejecting `javascript:`/`data:`). Use these in every `actions.ts`.
  - `lib/staleness.ts` — `isStale`, `isFollowUpDue`, `lastSpoken`, `daysSince`. "Last spoken"
    for a contact is always derived from `max(interaction.date)`, never stored.
  - `lib/settings.ts` — `getSettings()` upserts the single pinned `Settings` row (id=1) holding
    `applicationStaleDays` / `contactStaleDays` thresholds. `applicationStaleDays` flags
    gone-quiet open apps in the dashboard "Awaiting response" list; `contactStaleDays` drives
    the blaze on overdue contacts.
  - `lib/format.ts` — date helpers. **`parseDateInput` parses to local noon** to avoid TZ
    day-rollover; use it (and `toDateInputValue`) for all `<input type="date">` round-trips.
  - `lib/analytics.ts` — pure aggregation helpers (`statusCounts`, `rates`, `byState`,
    `monthlyApplied`, etc.) over plain arrays; the analytics page queries Prisma then maps.
  - `lib/colors.ts` (palette/`statusFill`) and `lib/us-states.ts` back the charts.
  - `@/*` path alias maps to the repo root.

- **Charts are hand-rolled SVG** in `components/charts/` (`DonutChart`, `BarList`,
  `TrendLine`, `USStateMap`, `Funnel`, `StatTile`) — no charting library. Don't add one.

## Data model (prisma/schema.prisma)

Company 1—* Application, Company 1—* Contact, Contact 1—* Interaction, Application *—*
Contact (referrers/people involved), plus a single-row Settings. Application delete cascades;
Contact's company link is `SetNull`. The full schema (all models + enums) was written up front
so feature work never touches migrations.

## Privacy constraints (do not violate)

This repo is **public**. The user's real data must never be committed.

- The SQLite DB lives at repo-root `data/` and is gitignored (`/data/`, `*.db`, `*.sqlite*`).
- `DATABASE_URL` in `.env.example` is `file:../data/jobsearch.db` — the `../` is deliberate:
  Prisma resolves SQLite paths relative to `prisma/`, so this lands the DB at repo-root `data/`.
- `.env` is gitignored; only `.env.example` and the **fake** `prisma/seed.ts` are committed.
- Keep the localhost-only binding (`-H 127.0.0.1` in `dev`/`start`) and the no-auth design.
