# Placement engine (version 2)

`src/engine/placement.ts` · tests in `tests/placementV2.test.ts`, `tests/placementRecovery.test.ts`, `tests/placementCoverage*.test.ts`, `tests/engine.test.ts`

## Why version 2 exists

Version 1 produced a report no student could earn: **Algebra Grade 5 "Mastered"** beside **Number Sense Grade 4** and **Decimals Grade 1**. Three flaws let that happen:

1. Nothing connected the strands, so algebra could be placed two grades above the arithmetic it is built from.
2. One correct answer advanced a whole grade, so a strand was decided on two or three items.
3. A multiple-choice item counted like a typed one, though a four-option guess is right a quarter of the time.

Version 2 closes each of these. Every student whose placement was still in progress on version 1 is restarted on version 2 (`placementIsStale` in `src/lib/students.ts`); completed version-1 placements stand until the parent retakes them.

## The six rules

### 1. Prerequisites between strands

A strand's level may not exceed the **lowest unmet prerequisite's level + 1**. Written precisely: strand S at grade G needs prerequisite P at `min(G − 1, P's last grade)`. If that is below P's first grade the requirement is vacuous (Grade 1 algebra owes nothing to Grade 5 ratios). A prerequisite that has *ended* caps by shortfall: operations stops at Grade 6, so a student two grades short of finishing it is capped two grades in algebra, not dragged to Grade 5.

The cap is **never applied silently**. After the main pass, any strand whose estimate exceeds its cap triggers a re-probe of the binding prerequisite at the level the higher strand needs (up to 4 items per prerequisite). Only if that fails does the cap stand, and the report then carries `rawLevel` and `cappedBy`.

#### The map, and where it comes from

The curriculum's skill graph is linear inside a strand (each skill's prerequisite is the one before it), so cross-strand structure is derived from two things the data does say. `tests/placementV2.test.ts` checks every claim below against the live curriculum, so the map cannot drift from it.

**Rule 1 — family inheritance.** When strand B uses a question-generator family that strand A introduced at a lower grade, B is built on A. Same grade: the strand the curriculum lists first is upstream. Both directions: siblings, no edge.

| Edge | Evidence (family, first grade in each strand) |
|---|---|
| operations → algebra | `missing-number` (G1, G1; operations listed first) |
| number → algebra | `exponent-rules` (number G8 → algebra G9) |
| ratios → algebra | `proportional-relationships` (ratios G6 → algebra G8) |
| ratios → geometry | `scale-drawings` (G7, G7; ratios listed first) |
| algebra → functions | `poly-add-sub`, `poly-mul`, `factor`, `rational-expression`, `radical-expression`, `quadratic-solve`, `quadratic-features` |
| number ⟷ operations | **siblings** — operations introduces `mental-math` (G1) and `integer-ops` (G6) first; number introduces `skip-counting` |
| measurement ⟷ geometry | **siblings** — geometry has `perimeter-area` first (G3); measurement has `volume-surface` first (G4) |

`mc-bank` is shared too, but it is a generic bank of multiple-choice items, not a dependency. Trig and calculus share no family with any other strand. **Trig → algebra is the one edge added by judgement** (owner decision, 4 Sep 2026): solving trig equations and handling radicals rests on algebra even though no generator family is shared. Calculus carries only the arithmetic foundation.

**Rule 2 — arithmetic foundation.** Every grade file lists the five arithmetic strands first (number, operations, fractions, decimals, ratios) before algebra, geometry, measurement and statistics. Each of the five depends on those listed before it (number and operations being siblings by rule 1), and every other strand depends on all five.

Resolved table (`STRAND_PREREQS`):

| Strand | Prerequisites |
|---|---|
| number | — |
| operations | — |
| fractions | number, operations |
| decimals | number, operations, fractions |
| ratios | number, operations, fractions, decimals |
| algebra | number, operations, fractions, decimals, ratios |
| measurement | number, operations, fractions, decimals, ratios |
| geometry | number, operations, fractions, decimals, ratios |
| stats | number, operations, fractions, decimals, ratios |
| functions | number, operations, fractions, decimals, ratios, algebra |
| trig | number, operations, fractions, decimals, ratios, **algebra** (by judgement) |
| calculus | number, operations, fractions, decimals, ratios |

Two views of the levels placed so far feed this rule. **Estimated** levels (a strand's placed grade; one below the floor if it failed the floor or was gated) choose where later strands start and which are gated — cheap decisions the staircase corrects. **Earned** levels (only grades actually passed) compute the caps that bind the final result; an unverified estimate a higher strand leans on is re-probed rather than trusted.

### 2. Evidence threshold and the staircase

| Constant | Value | Meaning |
|---|---|---|
| `ITEMS_PER_LEVEL` | 4 | items at one grade before it is decided |
| `PASS_CORRECT` | 3 | counted correct answers to pass a grade |
| `FAIL_MISSES` | 2 | misses that make 3-of-4 impossible — the grade fails early |
| `MAX_REVERSALS` | 2 | direction changes before the strand stops |
| `FAST_DESCENT_AFTER` | 3 | failed grades in a row (nothing passed) before stepping down by two |
| `MAX_ITEMS_PER_STRAND` | 10 | counted items after which no new grade is started |
| `MAX_RAW_ITEMS_PER_STRAND` | 20 | hard stop on items served, multiple-choice halves included |

Each strand starts at the student's **expected grade** (their school year, capped by the strand's last grade, lowered to what its prerequisites allow). A pass steps up one grade, a fail steps down one, and the search stops after two reversals, at the strand's ceiling, or when the grade above was already failed. The counted budget stops the search only at a **grade boundary** — a grade in progress is never cut short, and a descent that has passed nothing yet continues (two quick misses a grade) until something passes or the floor is reached, so a far-behind student is placed on a pass rather than on the last grade the budget happened to allow.

A grade passed with exactly one miss sits at 75%, which no status band was written for; one further item at that grade turns it into 80% (Strong) or 60% (Developing). The pass itself is not in question.

### 3. Guess protection

- **Typed items are preferred.** When a grade has both typed and multiple-choice skills, the typed ones are served. Across the curriculum 74 families are typed, 28 multiple-choice, 22 mixed.
- **A correct multiple-choice answer counts only once a second item on the same skill and level is also correct.** Correct-then-wrong is *inconclusive*: a lucky guess and a slip look the same, so neither half counts. (Counting the miss alone made a grade served as multiple choice markedly harder than the same grade typed — a real bias against figure-heavy strands like geometry.)
- A uniform guesser (25% on multiple choice, ~0 on typed) places at the floor of every strand as **Practicing**, never above.

### 4. Strand floors

No strand is ever reported below the grade it begins at (decimals 4, ratios 5, fractions 2, functions and trig 10, calculus 12). A strand whose prerequisites are below what even its floor requires is **gated**: never probed, reported **"Not started" at its floor**. There is no Grade 1 default.

### 5. Status labels

Accuracy is counted evidence *at the placed level*.

| Status | Rule |
|---|---|
| Mastered | ≥ 90% at the level, level at or above the expected grade, **and** confirmed above it (the grade above was attempted, or the level is the strand's ceiling) |
| Strong | ≥ 80% |
| Developing | 50–79% |
| Practicing | < 50% |
| Ready to Learn | placed at the floor with no evidence at that level |
| Not started | gated on prerequisites; never probed |

Status describes accuracy at the placed level, not distance from the school year: a Grade 8 student solid at Grade 3 number sense is *Strong at Grade 3*, and the level is what says they are behind.

### 6. Coherence check

After caps are resolved, if the highest and lowest placed strands are more than **two grades** apart, the lowest strand that could still be lifted (one at its own ceiling is finished, not behind) gets up to **4 tie-break items** one grade above its placement — even if the main pass failed that grade, since that fail is the suspicious result. A pass lifts it one grade; prerequisite caps still apply.

## The log

`state.log` records every item served: phase (`main`, `confirm`, `tiebreak`), strand, grade under test, skill, stage, kind, the response, whether it was counted, and a note for pair handling, prerequisite checks, tie-breaks, settlements and caps. Each probe keeps a `trajectory` (the estimate after every counted item). The report exposes `accuracy`, `rawLevel`, `cappedBy` and `trajectory` per strand, so any result can be explained afterwards.

## Test length

Consistent answering costs 4–6 items per strand; realistic noise 6–10; coin-flip answering is the expensive case and is bounded by the per-strand caps. Multiple-choice pairs add raw items without adding counted evidence, so figure-heavy strands run longer than typed ones.

## Before / after

Version 1 stored only pass/fail per grade, not the items served, so the screenshot student's actual responses cannot be replayed. A synthetic student built to match that report (Grade 5; arithmetic at Grade 3–4, algebra at 3) was run through both engines with identical answering behaviour — see the table below, produced by the replay harness at ship time.

Synthetic Grade 5 student — true levels: number 4, operations 4, fractions 3, decimals 3 (below its floor of 4), ratios 3 (below its floor of 5), algebra 3, measurement 4, geometry 4, stats 3. Answer model: 92% below level, 72% at level, 30% one above, 8% further, plus a 25% lucky guess on any multiple-choice item. Five seeds each.

| Strand | Truth | v1 (seeds 11, 22, 33, 44, 55) | v2 (same seeds) |
|---|---|---|---|
| number | 4 | 4 Dev · 4 Dev · 4 Dev · 4 Dev · 4 Dev | 5 Dev · 4 Str · 3 Str · 3 Str · 4 Str |
| operations | 4 | 4 Dev · 5 Str · 4 Dev · 4 Dev · 5 Str | 3 Str · 3 Str · 4 Str · 4 Dev · 4 Str |
| fractions | 3 | 4 Dev · 4 Dev · 2 Pra · 2 Pra · 5 Str | 3 Dev · 3 Dev · 3 Dev · 3 Str · 3 Dev |
| decimals | 3 (floor 4) | **1 Pra** · 5 Str · **1 Pra** · 3 Pra · 4 Dev | 4 Not started · 4 Not started · 4 Not started · 4 Dev · 4 Not started |
| ratios | 3 (floor 5) | 5 Ready · **1 Pra** · 5 Ready · 5 Ready · **1 Pra** | 5 Not started ×5 |
| algebra | 3 | **6 Mastered** · 5 Str · 5 Str · 2 Pra · 5 Str | 3 Dev · 2 Str · 3 Str · 3 Str · 3 Str |
| measurement | 4 | 3 Pra · 3 Pra · 5 Mastered · 4 Dev · 4 Ready | 4 Str ×5 |
| geometry | 4 | **6 Mastered** · 3 Pra · 5 Str · 4 Dev · 4 Ready | 4 Str · 3 Str · 4 Str · 4 Str · 4 Str |
| stats | 3 | 5 Ready · 4 Ready · 4 Ready · 3 Pra · 4 Ready | 3 Str · 2 Str · 3 Str · 3 Dev · 2 Str |
| items served | | 32 · 32 · 32 · 24 · 32 | 70 · 70 · 71 · 66 · 77 |
| mean absolute error (grades) | | **1.02**, worst 4 | **0.20**, worst 1 |

Version 1 reports Grade 1 decimals under Grade 6 "Mastered" algebra for the same child; version 2 never places a strand more than one grade from the truth, and the strands this child is not ready for read "Not started" at their floor instead of Grade 1. The price is roughly twice the items (about eight per strand), which is the evidence threshold the owner asked for.

Reproduce: the harness lived at `tests/_replay.test.ts` during the rebuild; it drives both engines with the answer model above. Version 1 is preserved in git history (`src/engine/placement.ts` before the version-2 commit).
