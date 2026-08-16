# PEDMAS

An adaptive K–12 mathematics learning platform. PEDMAS is a brand name, not a
site about order of operations — it covers the whole Grade 1–12 curriculum.

> **Don't teach students according to their grade. Teach them according to what
> they are ready to master.**

A student's school grade is context, not a placement. A Grade 6 student might be
Grade 7 in geometry and still growing into Grade 5 fractions. PEDMAS builds a
per-strand profile and practises each strand where the student actually is.

## The loop

**Diagnose → Place → Learn → Practice → Master → Advance → Review → Retain**

## Architecture

The curriculum and the learning engine are data, not pages.

| Piece | Location | What it does |
|---|---|---|
| Curriculum | `src/curriculum/grade1..12.ts` | 655 topics → Grade → Strand → Topic → 5 progression stages, with prerequisite chains |
| Generators | `src/engine/families/` | 121 parametric question families bound to topics by key |
| Validation | `src/engine/validate.ts` | Gate between generation and students — rejects, never patches |
| Placement | `src/engine/placement.ts` | Adaptive per-strand grade walk |
| Mastery | `src/engine/mastery.ts` | First-try accuracy + multi-session consistency |
| Review | `src/engine/mastery.ts` | Spaced review at 2 / 7 / 21 / 60 days |
| Practice mixer | `src/engine/practice.ts` | Builds the 12-question daily session |

### Difficulty is structural

Difficulty is never "make this harder". Each family defines five stages by
mathematical complexity — fraction addition climbs same-denominator → unlike
denominators → mixed numbers, not simply bigger numbers.

### Every question is validated

Generators produce candidates; `validateRaw` checks answer format, choice
counts, balanced markup, and runs an independent `verify()` hook that recomputes
the answer a second way. Failures are rejected and regenerated.

Guarded by tests that assert every curriculum family is implemented, that raw
output validates *without* relying on retries, and that each skill and stage
serves genuinely distinct questions.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Vitest. Mobile-first.

Storage sits behind a repository layer (`src/lib/store/db.ts`) with two
backends and one interface: **Upstash Redis** when `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` are set, and local JSON files otherwise. Production
needs Redis — a serverless filesystem is read-only, so the store fails fast
with a clear message rather than losing writes. Auth is scrypt-hashed passwords
with httpOnly session cookies.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3080.

```bash
npm test          # engine + curriculum invariants
npm run build     # production build
```

### Admin

An admin account is seeded on first use. Set `PEDMAS_ADMIN_EMAIL` and
`PEDMAS_ADMIN_PASSWORD` before deploying — the development fallbacks are
published in this repository.

## Payments

One family plan: **$11.99/month for the first child, $5.99 for each additional,
up to 4 children**, after a 7-day free trial. Placement and the starting report
are free forever; a subscription unlocks daily practice, mastery tracking and
the parent dashboard.

Stripe holds the truth. The app mirrors subscription state onto the account for
fast page loads, and one module — `src/lib/billing/entitlement.ts` — decides
every access question. Seats follow the real child count, so adding a child
updates the subscription automatically.

Set up in Stripe: one product with two recurring monthly prices (first child and
additional child), then point `STRIPE_PRICE_FIRST_CHILD` and
`STRIPE_PRICE_ADDITIONAL_CHILD` at them. Prefer a **restricted key** (`rk_`).
Point a webhook at `/api/stripe/webhook` — signatures are always verified, and
the endpoint refuses everything until `STRIPE_WEBHOOK_SECRET` is set.

## Email

Sent through Resend: password reset, the welcome placement report, a weekly
parent summary, and billing mail (receipt, trial ending, payment failed).

The weekly summary runs from `POST /api/cron/weekly-progress`, guarded by a
`CRON_SECRET` bearer token; without the secret the endpoint is disabled.

## Demo mode

With no Stripe or Resend keys the app still runs end to end: practice stays
unlocked, and emails are logged to the server rather than sent. Every billing
screen says exactly which variables are missing. See `.env.example`.

## Status

The learning engine is complete and verified: all 121 families implemented,
with 38,040 raw and 9,510 end-to-end generated questions passing validation.
Billing and email are built and tested against the live app.

Not deployed. No sales-tax handling, and no dunning beyond Stripe's own retries.
