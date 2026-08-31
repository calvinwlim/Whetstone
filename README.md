# Whetstone

A daily practice app for software engineering interviews and day-to-day work:
system design, technical communication, DSA concepts, and workplace craft.

Answer a short set of questions each day, earn XP and a streak, and have the
ones you miss come back on a spaced-repetition schedule.

## How it works

Content lives in the repo as typed TypeScript, not in a database. A malformed
question fails the build rather than reaching a drill, every content change is
a reviewable diff, and rendering a question costs no network round trips.

Progress lives in `localStorage` behind a `ProgressStore` interface, so adding
real accounts later is a new implementation of that interface rather than a
rewrite of the app.

Grading is deterministic and runs in the browser — no model, no API call.

## Running locally

```bash
pnpm install
```

```bash
pnpm dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm test` | Full test suite |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm lint` | ESLint |
| `pnpm stats` | Question and topic counts, plus content validation |
| `pnpm review` | Editorial review: thin topics, format mix, coverage gaps |

## Accounts and sync

Accounts are optional. With no Supabase environment variables the app works
exactly as before, keeping progress in `localStorage`. Signing in adds sync
across devices; it is not a gate on using the app.

Progress is stored as a single JSONB blob per user, which maps directly onto
the `ProgressState` the reducer already produces, so there is no mapping
layer. Row Level Security scopes every row to its owner -- that is what makes
the public anon key safe to ship to the browser.

```bash
vercel integration add supabase
```

```bash
vercel env pull .env.local --yes
```

```bash
pnpm db:migrate
```

```bash
pnpm db:verify
```

`db:migrate` applies `supabase/schema.sql`. `db:verify` proves RLS is working
by confirming an anonymous client can neither read nor write the table.

Sync is background and local-first: `localStorage` stays authoritative during
a session and changes are pushed after a short quiet period, so a dropped
connection mid-drill never costs an answer or a streak.

## Deploying to Vercel

The app is entirely static — every route prerenders at build time, there is no
database, and **no environment variables are required**. Deployment is
zero-config.

### From the dashboard

1. Push this repo to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import the repository.
3. Accept the detected defaults (framework Next.js, build `next build`).
4. Deploy.

Every push to `main` then ships to production, and every branch gets a preview
URL.

### From the CLI

```bash
npm i -g vercel
```

```bash
vercel deploy
```

Add `--prod` to promote to production instead of a preview.

### Requirements

- Node.js 20.9 or newer (enforced by `engines` in `package.json`)
- No environment variables, no database, no third-party accounts

## Adding content

Questions live in `src/content/tracks/`. Add an entry to the relevant file and
run:

```bash
pnpm stats
```

That validates every question — unique ids, answers that exist among the
options, unambiguous matching and ordering items, well-formed resource URLs —
and fails if anything is wrong.

## Structure

```
src/
  content/          Question bank, schema, and validation
  lib/              Grading, SM-2 scheduling, sessions, XP, storage
  components/       UI, including one renderer per question format
  app/              Routes: today, drill, topics, stats, settings
```
