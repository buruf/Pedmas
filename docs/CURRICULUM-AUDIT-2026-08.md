# Curriculum grade-appropriateness audit — August 2026

Four independent curriculum-expert reviews (grades 1–3, 4–6, 7–9, 10–12) checked **all 634 skills**
against two reference standards: the **US Common Core State Standards (CCSS-M)** and the
**Ontario mathematics curriculum (2020 / MTH1W / MPM2D / MCR3U / MHF4U / MCV4U)** — Ontario because
the test families live there. Where a skill's *name* was ambiguous about depth, the reviewer read
the actual generator family to judge what is really asked.

## The owner's four Grade 3 doubts, answered

| Topic | Verdict | CCSS | Ontario |
|---|---|---|---|
| **Reading bar graphs** | ✅ APPROPRIATE — the best-aligned data skill in the file | 3.MD.B.3 (scaled bar graphs, Gr 3) | D1.3/D1.5 (Gr 3) |
| **Quadrilaterals** | ✅ APPROPRIATE (but stage 5 asks interior-angle sums = Gr 7–8) | 3.G.A.1 (Gr 3) | E1.1–E1.2 (Gr 3) |
| **Triangles (classifying)** | ❌ TOO EARLY — by 1 grade (CCSS) / 2 grades (Ontario) | 4.G.A.2 (Gr 4) | E1.1 (Gr 5) |
| **Right angles** | ⚠️ Name fine, implementation TOO EARLY — the generator never shows an angle to recognize; stage 1 already asks degree-based classification ("An angle measures 30°…" = Gr 4), stages 3–5 add straight/reflex (Gr 6) | 4.G.A.1 / 4.MD.C.5 | Gr 4–6 |

So: a Grade 3 student **should** read bar graphs and classify quadrilaterals; **should not yet** be
classifying triangles by side length, and should meet right angles only as "more/less than a right
angle", not degrees.

## Headline numbers

- **634 skills checked** (G1–3: 172, G4–6: 152, G7–9: 119, G10–12: 191)
- **~40 clearly misplaced** (≥1 grade off in both standards, or ≥2 in either)
- Grades 4–6: every flagged skill is **too early, never too late** — the platform tracks the US
  sequence while Ontario pushes fraction ×/÷, integers, volume, circles and proportions 1–3 grades later
- Grades 10–12 are the healthiest band

## Worst misplacements (fix first)

| Skill | Our grade | Should be | Off by |
|---|---|---|---|
| g2 Angles (degree-based identify) | 2 | CCSS 4 / ON 4–5 | 2–3 too early — worst in the file |
| g2 Symmetry (incl. rotational) | 2 | CCSS 4 / ON 3–4 | 2 too early (CCSS) |
| g2 symbolic fractions block (a/b notation, number lines, comparing) | 2 | CCSS 3 / ON 4 | 1–2 too early |
| g3 Triangles | 3 | CCSS 4 / ON 5 | 1–2 too early |
| g3 Right angles as implemented | 3 | CCSS 4 / ON 4–6 | 1–3 too early |
| g3 Place value & comparing to 10,000 | 3 | both cap Gr 3 at 1,000 | params fix: `max: 1000` |
| g4 Volume | 4 | CCSS 5 / **ON 7** | up to 3 too early |
| g4 Order of operations | 4 | CCSS 5–6 / **ON 7** | up to 3 too early |
| g5 Multiplication of mixed numbers | 5 | CCSS 5 ✓ / **ON 8** | 3 too early for Ontario |
| g5 GCF & LCM | 5 | CCSS 6 / ON 7 | 1–2 too early |
| g6 Integer ×/÷ | 6 | CCSS 7 / ON 8 | 1–2 too early |
| g6 Circles (circumference AND area, exact π) | 6 | CCSS 7 / ON 7 | 1 too early both |
| g8 Coordinate plane + ordered pairs | 8 | CCSS 5–6 / ON 5–6 | **2–3 too LATE** — Gr 5–6 content carrying Gr 8 placement weight |
| g9 One-step equations | 9 | CCSS 6 / ON 6–7 | 2–3 too late |
| g9 Radicals (incl. rationalizing denominators) | 9 | CCSS 11 / ON 11 | ~2 too early |
| g9 Probability (simple + compound) | 9 | CCSS 7 / ON ≤8 (MTH1W has none) | 1–2 too late |
| g10 Rational expressions | 10 | CCSS 11 / ON 11 (MCR3U) | 1 too early both |
| g11 Angle-sum + double-angle identities | 11 | CCSS 12 / ON 12 (MHF4U) | 1 too early both |
| g12 Sequences & series (5 skills) | 12 | CCSS 11 / ON 11 (MCR3U) | duplicates of g11 skills, 1 late |
| g12 Integration block (4 skills) | 12 | US AP Calc ✓ | **not in Ontario high school at all** (MCV4U stops at derivatives) |

## Systemic findings (root causes, not one-off mistakes)

1. **Stage ladders are not grade-parameterized.** A family's 5 stages attach to *every* skill using
   it: `shapes-2d` stage 5 asks polygon interior-angle sums (Gr 7–8) even on Grade 1 "2D Shapes";
   `read-graph` stage 4 injects scaled keys (Gr 3) into Grade 1 graph skills; the `angles` family
   serves Grades 2 and 3 identical degree-based content. Renaming topics won't help — the fix is a
   depth/grade param per family or a stage cap per grade.
2. **Duplicate skills across grades** carry double placement weight: g9 re-lists several g8 skills
   verbatim (transformations, Pythagorean, slope, correlation); g12 re-lists five g11
   sequence/series skills with identical params.
3. **US-vs-Ontario sequencing tension.** The platform consistently follows the American sequence.
   For Ontario families this means fraction operations, integers, volume, circles, proportions,
   logs and identities arrive 1–3 grades early. If Ontario is the launch market, the regional
   system (US/INTL) may eventually need to drive not just units and spelling but *sequencing* for
   the worst gaps (mixed-number ×, volume, order of operations, integration).
4. **Data quirk:** `grade8.ts` declares two strands with id `"number"` and two with id `"algebra"`,
   which may distort strand-level aggregation.
5. **Content note:** the Grade 3 shape-clue bank defines rhombus/parallelogram *exclusively*
   ("no right angles"), which will contradict inclusive classification (5.G.B.3–4) if the same bank
   ever serves Grade 5.

## Why this matters for placement

Too-early skills make children fail placement questions they were never supposed to know, dragging
their level down (under-placement); too-late skills (g8 coordinate plane, g9 one-step equations)
let placement award high grades for easy content (over-placement). The curriculum fixes and the
placement engine are two halves of the same accuracy problem.

## Recommended order of work

1. **Params-only fixes** (hours): g3 place-value/comparing `max: 1000`; cap g5 order-of-ops
   exponent stage; demote g2 mult-fact drills.
2. **Stage caps per grade** (the systemic fix): let a skill declare which stages of its family are
   in scope, so Grade 1 shapes never asks interior-angle sums.
3. **Move the clear misplacements**: triangles 3→4/5, degree-angles 2/3→4+, coordinate
   plane/ordered pairs 8→5-6 (or mark as review), one-step equations 9→review-only, radical
   rationalization 9→11, compound-angle identities 11→12, dedupe g12 sequences.
4. **Decide the Ontario question**: whether INTL region should re-sequence the ~10 biggest gaps, and
   whether Ontario-stream Grade 12 students should be gated on integration at all.
