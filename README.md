# Scout — Job Search Dashboard

A local, single-user web dashboard to track job applications and manage a
networking rolodex of contacts with interaction history. Companies tie the two
together: a company page shows the jobs you applied to there plus the contacts
associated with it.

**Local-only by design.** The app binds to `127.0.0.1`, there is no auth, and it
talks to no external APIs. Your data lives in a local SQLite file that is
gitignored — only the schema and fake demo seed data are committed.

## Stack

Next.js (App Router, TypeScript) · Prisma · SQLite · Tailwind CSS.

## Requirements

- Node.js **≥ 20**

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev      # creates the SQLite DB and applies migrations
npm run db:seed             # optional: load fake demo data
npm run dev                 # http://127.0.0.1:3000
```

Then open <http://127.0.0.1:3000>.

## Scripts

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server, bound to `127.0.0.1:3000`       |
| `npm run build`     | Production build                            |
| `npm run start`     | Production server, bound to `127.0.0.1`     |
| `npm run db:migrate`| `prisma migrate dev`                        |
| `npm run db:seed`   | Load fake demo data                         |

## Data & privacy

- The SQLite database (`DATABASE_URL` in `.env`, default `file:../data/jobsearch.db`,
  which resolves to the repo-root `data/` directory) is **gitignored** — your real
  data never enters git.
- `.env` is gitignored; only `.env.example` is committed.
- The server binds to localhost only, so it is not reachable from other devices.
- No authentication is implemented, by design, since the app is single-user and
  local-only.

## Project layout

```
app/                 App Router pages (dashboard, applications, contacts, companies, settings)
components/           Reusable UI (added in later shots)
lib/db.ts            Prisma client singleton
lib/staleness.ts     Follow-up / staleness helpers
prisma/schema.prisma Full data model (Company, Application, Contact, Interaction, Settings)
prisma/seed.ts       Fake demo data
data/                Local SQLite DB (gitignored, created at runtime)
```
