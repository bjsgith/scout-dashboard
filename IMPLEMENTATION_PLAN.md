# Job Search Dashboard — Implementation Plan

## Context
A local, single-user web dashboard to (1) track job applications and their details, and
(2) manage a networking "rolodex" of contacts with interaction history. Companies are the
connective tissue: a company page shows the jobs applied to there plus the contacts associated
with it. The repo is **public** so others can clone the tool — the user's personal data must
never be committed (the database and any env files stay local/gitignored; the repo ships only
schema + fake demo seed data).

Greenfield repo (only `LICENSE` exists today).

### Decisions (locked in)
- **Stack:** **Next.js (App Router, TypeScript) + Prisma + SQLite + Tailwind CSS**. One language, `npm install && npm run dev` to clone/run.
- **Data entry:** Fully manual (no external APIs in v1 → no secrets beyond the user's own DB).
- **Auth:** None. Server binds to `127.0.0.1` (localhost-only).
- **Main secret to protect:** the user's personal data (the SQLite DB) — gitignored.
- **Follow-ups:** Staleness-based flags on the dashboard (configurable thresholds). Push/notifications deferred.
- **Contacts:** Per-contact interaction timeline; "last spoken" derived from most recent interaction.

## Application fields (from user)
Job Title, Firm (Company), Status, Date Applied, Platform (job source), Type (FT/PT/Internship/Contract),
City, State, Work Mode (In-Person/Remote/Hybrid), Pay. Plus recommended detail-view fields:
job posting URL, notes, follow-up date, linked contacts, created/updated timestamps.

## Architecture
- **Framework:** Next.js App Router. React Server Components for pages; Route Handlers (`app/api/...`) or Server Actions for mutations.
- **DB:** SQLite file via Prisma ORM at `./data/jobsearch.db` (gitignored).
- **Styling:** Tailwind CSS. Lightweight table/filtering with plain React state (add TanStack Table later if needed).
- **Localhost binding:** run scripts use `next dev -H 127.0.0.1` / `next start -H 127.0.0.1`.

## Data model (`prisma/schema.prisma`)
- **Company**: `id, name, website?, industry?, location?, notes?, createdAt` — has many Applications, many Contacts.
- **Application**: `id, jobTitle, companyId→Company, status (enum), dateApplied?, platform?, employmentType (enum), city?, state?, workMode (enum), pay?, jobUrl?, notes?, followUpDate?, lastActivityAt, createdAt, updatedAt`.
  - `status` enum: Saved, Applied, Interviewing, Offer, Accepted, Rejected, Withdrawn.
  - `employmentType` enum: FullTime, PartTime, Internship, Contract, Temporary.
  - `workMode` enum: InPerson, Remote, Hybrid.
  - Optional many-to-many to **Contact** (referrer / people involved).
- **Contact**: `id, name, title?, companyId?→Company, email?, phone?, linkedinUrl?, notes?, createdAt` — has many Interactions. "Last spoken" = max(interaction.date), computed in queries.
- **Interaction**: `id, contactId→Contact, date, type (enum: Call, Email, Coffee, LinkedIn, Meeting, Other), notes?, createdAt`.
- **Settings** (single-row): `applicationStaleDays (default 7), contactStaleDays (default 30)`.

## Pages / routes
1. **`/` Dashboard** — status counts; **Follow-up widget** (applications stale by `applicationStaleDays`, contacts stale by `contactStaleDays`); recent activity.
2. **`/applications`** — filterable/sortable table. Row click → detail.
3. **`/applications/[id]`** — full detail + edit form, company link, linked contacts, notes, follow-up date.
4. **`/applications/new`** — create form (company select with inline "add new").
5. **`/contacts`** — rolodex table with "Last spoken" column (stale highlight). Row click → detail.
6. **`/contacts/[id]`** — detail + **interaction timeline** + "Log interaction" form (updates "last spoken").
7. **`/companies`** + **`/companies/[id]`** — company info + applications there + contacts there.
8. **`/settings`** — edit staleness thresholds.

Shared: nav layout (`app/layout.tsx`), reusable components under `components/`.

## Security & clone-friendly setup
- **`.gitignore`**: `.env`, `.env*.local`, `/data/`, `*.db`, `*.sqlite*`, `node_modules`, `.next`.
- **`.env.example`** (committed): `DATABASE_URL="file:./data/jobsearch.db"`. Real `.env` local-only.
- **`prisma/seed.ts`** (committed): fake demo data so a fresh clone shows a working UI; real data never enters git.
- **`README.md`**: Node ≥ 20, `cp .env.example .env`, `npm install`, `npx prisma migrate dev`, `npm run db:seed` (optional), `npm run dev` → `http://127.0.0.1:3000`. Note DB is local/gitignored, app binds to localhost only, no auth by design.

## File structure (new)
\`\`\`
package.json, tsconfig.json, next.config.js, tailwind.config.js, postcss.config.js
.gitignore, .env.example, README.md
prisma/schema.prisma, prisma/seed.ts
data/                      (gitignored, created at runtime)
app/layout.tsx, app/page.tsx, app/globals.css
app/applications/page.tsx, app/applications/[id]/page.tsx, app/applications/new/page.tsx
app/contacts/page.tsx, app/contacts/[id]/page.tsx
app/companies/page.tsx, app/companies/[id]/page.tsx
app/settings/page.tsx
app/api/...               (route handlers for CRUD, or Server Actions co-located)
lib/db.ts                 (Prisma client singleton)
lib/staleness.ts          (follow-up flag helpers)
components/               (Nav, DataTable, forms, InteractionTimeline, StatusBadge, etc.)
\`\`\`

## Execution — 3 self-contained shots
Run in order. Each is sized for one Opus 4.8 (medium) pass without exhausting context and ends
in a **runnable** state. Shots 2 & 3 depend on shot 1's schema/migration, so do not reorder.
Each may optionally be delegated to its own subagent (foundation → core → networking).

### Shot 1 — Foundation & data layer (no feature pages yet)
**Goal:** running Next.js app with DB, demo data, nav shell, and repo-hygiene files.
- Scaffold Next.js (App Router, TS) + Tailwind; `package.json` scripts incl. `dev`/`start` with `-H 127.0.0.1`, `db:seed`, `db:migrate`.
- Add Prisma + SQLite; write the **full** `prisma/schema.prisma` (ALL models/enums now, so shots 2 & 3 never touch migrations); run initial migration.
- `lib/db.ts` (Prisma singleton), `lib/staleness.ts` (helpers used later).
- `prisma/seed.ts` with fake demo companies/applications/contacts/interactions.
- `app/layout.tsx` nav shell, `app/globals.css`, placeholder `app/page.tsx`, and minimal placeholder pages for every route so nav doesn't 404.
- `.gitignore`, `.env.example`, `README.md`.
**Done when:** `npm install && npx prisma migrate dev && npm run db:seed && npm run dev` serves on `127.0.0.1:3000`; nav renders; `git check-ignore data/jobsearch.db .env` passes.

### Shot 2 — Core: Companies + Applications (Feature 1)
**Goal:** full CRUD + browsing for the application tracker.
- Reusable `components/`: `DataTable`, `StatusBadge`, form fields.
- Companies: `/companies` list, `/companies/[id]` detail (related applications + contacts — contacts section can stub until shot 3 but wire the query now), create/edit.
- Applications: `/applications` filterable/sortable table, `/applications/[id]` detail+edit, `/applications/new` create form with company select (+ inline "add company").
- CRUD via Route Handlers or Server Actions; update `lastActivityAt` on edit.
**Done when:** can create a company and an application linked to it; application appears on the company page; table filters by status.

### Shot 3 — Networking + Dashboard + Settings (Feature 2 + follow-ups)
**Goal:** rolodex, interaction history, follow-up surfacing, thresholds.
- Contacts: `/contacts` rolodex table with derived "Last spoken" column (stale highlight via `lib/staleness.ts`), `/contacts/[id]` detail with **interaction timeline** + "Log interaction" form (adding one updates last-spoken); link contact to a company.
- Fill in the contacts section on `/companies/[id]`.
- Dashboard `/`: status summary counts + **follow-up widget** (stale applications + stale contacts using Settings thresholds) + recent activity.
- `/settings`: edit `applicationStaleDays` / `contactStaleDays`.
**Done when:** logging an interaction updates "last spoken"; lowering a threshold in Settings makes the dashboard widget flag the right items; contact shows on its company page.

## Verification
- `npm install && npx prisma migrate dev && npm run db:seed && npm run dev`; open `http://127.0.0.1:3000`.
- Create a company, then an application linked to it; confirm it appears on the company page.
- Create a contact linked to that company; log an interaction; confirm "last spoken" updates and the contact shows on the company page.
- Set a stale threshold low in Settings; confirm the dashboard follow-up widget flags the right items.
- `git status` / `git check-ignore data/jobsearch.db .env` — confirm DB and env are ignored and nothing personal is staged.
- Confirm the server is bound to localhost only (not reachable from another device).
