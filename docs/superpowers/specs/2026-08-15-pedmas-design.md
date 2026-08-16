# PEDMAS.com — Design Spec (2026-08-15)

## What we're building
Adaptive K–12 mathematics learning platform (Grades 1–12). Not an order-of-operations site — PEDMAS is the brand for a full math progression engine: **Diagnose → Place → Learn → Practice → Master → Advance → Review → Retain**.

Source of truth: the user's 31-section build spec + 3 mockup images. The detailed dashboard mockups elaborate **Option A (Modern & Vibrant, purple)** — that is the chosen visual direction.

## Architecture

- **Next.js 15 App Router + TypeScript + Tailwind CSS 4**, mobile-first.
- **Storage:** repository layer (`src/lib/store/`) over a local JSON file store in `data/`. Interface designed so Prisma/Postgres can replace it without touching callers. Rationale: no DB provisioned in this environment; keeps build dependency-free.
- **Auth:** email+password (scrypt hash), httpOnly session cookie, roles `PARENT | STUDENT | ADMIN`. Parent accounts own student profiles; students can also be standalone. Admin seeded.
- **Curriculum as data:** `src/curriculum/grade{1..12}.ts` — Grade → Strand → Topic (= skill) → 5 progression stages, prerequisites by skill id, generator binding (`family` + params). Nothing hard-coded in pages.

## Core engine (`src/engine/`)

1. **Generators** — ~30+ parametric families (arithmetic, place value, fractions, decimals, percent, ratios, integers, linear algebra, geometry, stats, exponents, quadratics, trig, logs, sequences, polynomials, calculus…). Each question carries metadata: grade, strand, topic, skill, stage, difficulty score, representation, answer format. Difficulty is **structural** (per-stage constraint tables), never "make it harder".
2. **Validation engine** — independent answer recomputation where possible, constraint checks (number ranges, stage concepts), duplicate rejection within a session. Invalid questions are rejected and regenerated, never patched.
3. **Placement** — adaptive per strand: start at school grade, step up on success / down on failure, probe prerequisites on failure; minimal question count via branching. Produces a per-strand grade-level **Mathematics Profile** with positive labels (Mastered / Strong / Developing / Practicing / Ready to Learn).
4. **Mastery** — per skill+stage: rolling accuracy, first-try weighting, hint usage, multi-session consistency. Stage mastered → next stage; stage 5 mastered → skill mastered → advance along prerequisite graph.
5. **Spaced review** — intervals 2d → 7d → 21d → 60d; failed review returns skill to active practice.
6. **Daily practice mixer** — 12 questions: current skill(s), near-mastery, fluency, due reviews, prerequisite repair.

## Surfaces

- **Homepage** — hero "Master Math. One Skill at a Time.", how-it-works (5 steps), grades 1–12 grid, adaptive explanation. Purple Option A styling.
- **Onboarding** — account + student profile (name, grade, age) → adaptive placement flow → placement report (per-strand table).
- **Student dashboard** — Today's Practice CTA, streak, strand progress bars, mastery achievements, curriculum path view (no free skipping).
- **Practice screen** — one question at a time, big touch targets, hint + "Show me how" worked-example support (steps-first per edu standards), retry on wrong with concise explanation.
- **Parent dashboard** — per-child profile, strengths/developing, activity, accuracy, streak, positive language.
- **Admin** — curriculum browser, question generator preview/validator run, student list.

## Design system
Purple primary (#7c3aed family) per Option A mockups; edu-product-standards structural rules kept (steps-first explanations, ≥44px touch targets, encouraging tone, green success/red gentle error, formula boxes). Visual maturity scales with grade band (playful 1–3 → academic 10–12).

## Testing
Vitest unit tests on the engine: generator constraint compliance per stage, validator answer checks, placement stepping logic, mastery/review transitions.

## MVP boundaries
- All 12 grades' strands/topics present as data; generator coverage is broad (every strand functional at every grade) via parametric families — some advanced topics use structured template banks.
- No payments, no email, no deployment in this pass.

## Process note
Session is autonomous; the user's build instruction + exhaustive spec stand in for the interactive design-approval gate. Deviations from spec section 28 (Postgres/Prisma) recorded above with rationale.
