# PEDMAS — Lesson System + "Show me how" (2026-08-16)

## Why

Spec §17 asked for a teaching layer and it was never built: PEDMAS could measure a
child accurately but could not teach one. A parent judging the product looks
here first. This closes that gap.

## Authoring model

Lessons live at the **generator-family level**, not per topic. 634 topics cannot
each carry a hand-crafted lesson at usable quality; 121 families can, because a
family already encodes the mathematics and its five-stage progression. One
`frac-add-sub` lesson serves Grade 3 "Simple Fraction Addition", Grade 5
"Addition of Fractions" and Grade 6 "Fraction Addition", adapting to the grade
and stage it is invoked for.

Coverage is deliberately partial and deepest-first along the spine children
actually travel — counting, place value, +/−, ×/÷, fractions. A skill with no
lesson simply goes straight to practice, exactly as it does today.

## Lesson shape

Every lesson follows one spine, which is what makes the set feel like a
curriculum instead of a pile of pages:

1. Hook — a concrete situation
2. You already know this — activate the prior skill
3. The new problem — why the known method breaks
4. **Confront the misconception** — name the classic error and disprove it
5. The idea — one sentence, carried by a picture
6. Worked example — visual and symbolic together
7. Faded example — the child finishes it, with a real answer check
8. The rule — stated last, once it means something

Step 4 is the load-bearing one. Stating a correct rule does not displace a wrong
method; disproving the wrong method does.

## Data model

Lessons are **data, not components** (§29). A lesson is a list of steps, each a
list of typed blocks, rendered by one renderer:

- prose: `p`, `idea`, `formula`, `wrong`, `steps`
- visuals: `baseten`, `column`, `area`, `groups`, `fracbar`, `fracrows`, `stack`
- interactive: `predict` (tap a prediction, then see it justified), `try`
  (finish a faded example, checked against accepted answers)

This keeps lessons serialisable, diffable and testable, and lets a validation
test assert every lesson is well formed the way `validateRaw` does for questions.

## Visual model library

`src/components/lesson/` — plain SVG, no dependencies, readable on a cheap phone:

- `BaseTen` — hundreds/tens/ones blocks, with a ring to show the ten being traded
- `ColumnSum` — the vertical algorithm in place-value columns, with carry marks
  and struck-through regrouping
- `AreaModel` — a rectangle split by place value, for multi-digit multiplication
- `ShareGroups` — equal groups, for the sharing meaning of division
- `FractionBar` / `FractionCompare` — part-whole bars

These are shared across dozens of families, which is what makes the lesson set
affordable to build.

## Where lessons appear

- **Before first practice of a skill.** If a lesson exists and the student has
  not seen it, practice offers it first. Offered, never forced — a student who
  already knows the skill can skip.
- **On demand** from the practice screen and the curriculum path.
- Seen lessons are recorded per student (`seenLessons`), so it is offered once.

## "Show me how"

A button on the practice screen that reveals a **parallel worked example**: the
same skill and stage, generated with a different seed, revealed one step at a
time.

It deliberately does not solve the question on screen — that teaches copying.
Using it is recorded like a hint, so the mastery engine keeps treating
independence as part of mastery.

## Testing

- Every registered lesson is structurally valid: steps present, no empty blocks,
  balanced markup, `try` blocks have accepted answers, `predict` blocks have a
  correct option.
- Faded-example answers are checked against the same `normalizeAnswer` the
  practice grader uses, so a lesson cannot accept an answer practice would mark
  wrong.
- The registry only binds to family keys that exist.

## Out of scope for this pass

Audio narration for Grades 1–3 (needed, tracked separately), and lessons for the
remaining families beyond the foundational spine.
