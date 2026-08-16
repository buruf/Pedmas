# Lesson coverage plan

Goal: every generator family a student can meet has a lesson that teaches the
idea, not just a worked example. `Show me how` already covers all 121 families
with a parallel worked example — that is a floor, not teaching.

Every lesson follows the same spine (see `src/components/lesson/`):

> hook → activate prior knowledge → the new problem → **confront the
> misconception** → the big idea → worked example → faded example → the rule

The misconception step is the one that does the teaching. A lesson without a
real, named misconception is not finished.

## Status

| Tranche | Families | State |
|---|---|---|
| Foundational spine | place-value, add-sub (both bands), mult-facts, div-facts, frac-identify | ✅ done |
| Multi-digit arithmetic | multi-digit (add/sub), mult-multi, long-division | ✅ done |
| Fraction arithmetic | frac-add-sub | ✅ done |
| Decimals & percent | dec-place-value, dec-compare, dec-add-sub, dec-mul, dec-div, money, percent-basic, percent-apps, interest | ✅ done (94%) |
| Decimals, remainder | dec-round, dec-frac-convert | ⬜ |
| Fractions, rest | frac-equivalent, frac-simplify, frac-compare, frac-mul, frac-div, mixed-number-ops | ⬜ |
| Number sense | counting, compare-numbers, rounding, factors-multiples, gcf-lcm, primes, patterns | ⬜ |
| Ratios & integers | ratio-basic, unit-rate, proportion-solve, integer-ops, exponent-rules, sci-notation | ⬜ |
| Early algebra | evaluate-expression, combine-like-terms, distributive, one/two/multi-step-eq, inequality | ⬜ |
| Geometry & measurement | perimeter-area, volume-surface, angles, shapes-2d, coordinate-plane, pythagorean, unit-conversion, time | ⬜ |
| Statistics | central-tendency, probability, read-graph, scatter-correlation | ⬜ |
| Senior algebra | factor, quadratic-solve, poly-mul, systems, slope, linear-equation | ⬜ |
| Functions & beyond | function-notation, exponential, logarithm, sequence, trig, calculus | ⬜ |

## Known misconceptions to confront

Recorded as they are chosen, so lessons stay specific rather than generic.

- **dec-compare** — "0.45 > 0.5 because 45 > 5". Longer decimal read as bigger.
- **dec-add-sub** — right-aligning the digits instead of the decimal points.
- **dec-mul** — "multiplying always makes it bigger" (0.5 × 0.5 = 0.25).
- **dec-div** — "dividing always makes it smaller" (6 ÷ 0.5 = 12).
- **percent-apps** — 20% off then 10% off treated as 30% off; reversing an
  increase by subtracting the same percentage.
- **frac-compare** — bigger denominator read as the bigger fraction.
- **integer-ops** — subtracting a negative read as making it smaller.
- **combine-like-terms** — 2x + 3 collapsed to 5x.
- **perimeter-area** — the two confused, or units dropped.
- **central-tendency** — mean used where an outlier makes it misleading.

## Rules for authoring

1. Numbers must be chosen so the worked example is exact. No rounding fudge.
2. The faded example uses different numbers from the worked one.
3. Every lesson ends with a rule box, stated only after it has been earned.
4. Route by family **and params** — the size of the numbers changes which idea
   applies (see `lessonKeyForSkill`, which splits add-sub into three bands).
5. Check coverage after each tranche with the script in the repo history, and
   walk a real session to confirm the gate fires where expected.
