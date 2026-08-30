# PEDMAS on YouTube — channel copy, description system, and Made-for-Kids setup

**Status: DRAFT for founder review. Nothing here is published. You upload; you publish.**

Cross-product note: the lesson-video system (Remotion renders, Vercel Blob CDN) lives in the
**eduyro repo** (`C:\Users\buruf\Downloads\brightsteps-phase5\eduyro\src\remotion\lesson\`), not this
one. The registry (`registry.ts` → `ALL_LESSON_UNITS`) now lists **157 units** across 24 templates
(it was 107/18 on Aug 16; place-value, fraction-ops, decimal-ops, linear-equation, pre-algebra and
polynomial-ops units were added since). Some of the newest units may not have voice/renders yet —
upload only what has passed `npm run audit:videos`.

---

## Fix before uploading anything: the videos say eduyro.com

`Brand.tsx` puts the **eduyro.com wordmark on every frame** of every lesson video. Uploading these
to a channel called PEDMAS sends viewers to a different product and splits your funnel.

Recommended fix (cheap): swap the wordmark in `src/remotion/lesson/Brand.tsx` to a PEDMAS mark,
re-render (`scripts/render-lessons.ts`), and re-run the validation gates. **Narration audio is
untouched, so this costs zero ElevenLabs credits** — just render time. Alternative: launch the
channel under the Eduyro brand instead and reuse this whole document with a find-and-replace
(the structure is brand-agnostic).

Everything below assumes PEDMAS branding.

---

## 1. Channel-level copy

**Suggested channel name:** `PEDMAS Math` (handle `@pedmasmath` if free — check at signup).

**Channel description ("About" text), parent-facing:**

> Short, animated math lessons for kids — Kindergarten through high school.
>
> Each video teaches one skill the way a good tutor would: see the idea, watch a worked
> example, hear every step explained out loud. Counting and number sense, addition and
> subtraction with regrouping, times tables, long division, fractions, decimals, equations,
> all the way up to functions, trig and intro calculus.
>
> These videos come from PEDMAS, an adaptive K-12 math practice platform built by a parent-run
> company in Ontario, Canada. On pedmas.com, the same lessons are paired with a placement test,
> daily practice sheets, and a parent dashboard that shows you exactly where your child is.
>
> Not sure what grade level your child is really working at? The PEDMAS placement test is free:
> https://www.pedmas.com
>
> Questions: privacy@pedmas.com · Operated by BAAF Consulting Inc., Brampton, Ontario.

Notes:
- No user counts, no testimonials, no results claims — there are none yet. The free placement
  test is the honest hook.
- The About page is one of the few places a Made-for-Kids channel can carry a clickable link
  reliably, so the pedmas.com URL earns its spot.
- **Channel trailer:** record one 60–90 second *parent-facing* tour (what PEDMAS is, what the
  placement test tells you). Mark THAT video "not made for kids" (see §5) so it keeps end
  screens and cards — it becomes the only fully-featured video on the channel.

---

## 2. Description template (mechanical, one per video)

### What parents actually type (research-backed guidance)

Parent search behavior for math-help video content clusters into a few shapes — work these into
line 1 and the title, in this priority order:

1. **"how to do/teach X"** — "how to teach long division", "how to do long division step by step".
   Long division is repeatedly described as the single topic that "drives kids and their parents
   crazy" ([Third Space Learning](https://thirdspacelearning.com/us/blog/teach-long-division-steps/),
   [Caffeine Queen Teacher](https://caffeinequeenteacher.com/solve-long-division-problems/),
   [Kate Snow — Homeschool Math Help](https://kateshomeschoolmath.com/1686-2/)).
2. **"X for kids"** — "long division for kids", "fractions for kids".
3. **Grade-tagged** — "grade 4 math", "4th grade math help" (use BOTH "grade 4" and "4th grade"
   across title/description — Canadian and US parents phrase it differently).
4. **"step by step"** — the dominant modifier in top-performing lesson titles, e.g.
   "Long Division: A Step-By-Step Review | How to do Long Division | Math with Mr. J"
   ([YouTube](https://youtube.com/watch?v=HJYHNxS64f0)).
5. **Audience-context tags** — "homeschool math", "math help" (homeschool parents are heavy
   searchers of exactly this content).

### The template

Slots: `{SKILL}` (the registry label, plain-English-ified), `{GRADE_BAND}` (see table below),
`{SEARCH_PHRASE}` (the how-to phrasing of the skill), `{TEACHES_1..3}` (what the video actually
shows — pull from the unit's narration/scenes, never invent), `{HASHTAGS}` (3–5 from the bank).

```
{SEARCH_PHRASE}, explained step by step for {GRADE_BAND} — a short animated math lesson.
Free math placement test for your child: https://www.pedmas.com

In this video your child will learn:
• {TEACHES_1}
• {TEACHES_2}
• {TEACHES_3}

Every step is shown on screen and spoken out loud, so kids can follow along
even if this topic is brand new.

—— About PEDMAS ——
PEDMAS is an adaptive K-12 math platform: a placement test finds exactly where
your child is, then daily practice and lessons like this one move them forward
one skill at a time. Parents get a dashboard that shows real progress.

▶ Free placement test (takes about 15 minutes): https://www.pedmas.com
▶ All lesson videos, in order: [link to channel playlists]

Made by BAAF Consulting Inc. in Ontario, Canada.

{HASHTAGS}
```

Template rules:
- **Lines 1–2 are the whole game.** Search results and the collapsed watch page show roughly the
  first 100–150 characters. Line 1 = keyword phrasing of the skill + grade band. Line 2 = the
  pedmas.com link. On Made-for-Kids videos the description is effectively the ONLY link surface
  (no cards, no end screens, no pinned comments — see §5), so the link cannot live below the fold.
- Bullet points come from the unit's actual scenes (`preview-lesson-script.ts <id>` prints the
  narration — bullets are a compression of that, never an embellishment).
- Placement-test duration: verify the "about 15 minutes" claim against the real placement flow
  before shipping; if it varies too much, write "free placement test" with no time.
- **Hashtag bank** (pick 3–5; only the first 3 display above the title):
  `#math #mathforkids #gradeXmath #Xthgrademath #longdivision #fractions #timestables
  #multiplication #decimals #algebra #homeschool #homeschoolmath #mathhelp #kindergartenmath
  #highschoolmath` — always include one grade tag and one topic tag.

### Grade-band lookup (map registry units → `{GRADE_BAND}`)

Approximate, aligned to Ontario/US sequence — say "around Grade X" if unsure, never guarantee:

| Units (by family/template) | Grade band |
|---|---|
| Count, Compare, `cur-add-within-5` | Kindergarten |
| TenFrame add/sub strategies, `cur-add-within-10`, PlaceValue units, NumberLine counting units | Grade 1–2 |
| Column add/sub (regrouping/borrowing), fact families, `cur-number-bonds` | Grade 2–3 |
| EqualGroups (times tables), Dealing ÷ facts | Grade 3 |
| Area multiplication (2d×1d, 2d×2d), `div-remainder`, `div-larger`, identify/compare fractions | Grade 4 |
| FractionBar + FractionOps, HundredGrid decimals, DecimalOps basics | Grade 4–6 |
| RatioTable, percentages, percent change | Grade 6–7 |
| PreAlg, Balance (one/two-step equations, inequalities), LinEq, `cur-order-integers`, `cur-order-ops` | Grade 7–8 |
| Graph lines/systems, Poly + PolyOps, quadratics | Grade 9–10 |
| Trig, FunctionMachine, exponential/logs, sequences, complex numbers | Grade 10–12 |
| Limits, derivatives, integrals, power rule | Grade 12 / intro calculus |

---

## 3. Five fully-written example descriptions (real videos from the registry)

### a) `cur-add-within-10` — Addition within 10 (Kindergarten–Grade 1)

**Title:** Addition Within 10 with Ten Frames | Kindergarten & Grade 1 Math | PEDMAS

```
How to teach addition within 10, step by step for kindergarten and grade 1 — a short animated lesson.
Free math placement test for your child: https://www.pedmas.com

In this video your child will learn:
• How to show an addition fact on a ten frame
• How to count the counters to find the total
• Why seeing the numbers makes adding faster than counting fingers

Every step is shown on screen and spoken out loud, so kids can follow along
even if this topic is brand new.

—— About PEDMAS ——
PEDMAS is an adaptive K-12 math platform: a placement test finds exactly where
your child is, then daily practice and lessons like this one move them forward
one skill at a time. Parents get a dashboard that shows real progress.

▶ Free placement test: https://www.pedmas.com
▶ All lesson videos, in order: [channel playlists link]

Made by BAAF Consulting Inc. in Ontario, Canada.

#math #kindergartenmath #grade1math #mathforkids #homeschoolmath
```

### b) `mul-6-9` — ×6, ×7, ×8, ×9, the hard facts (Grade 3)

**Title:** Times Tables 6, 7, 8 and 9 — The Hard Facts | Grade 3 Math | PEDMAS

```
How to learn the 6, 7, 8 and 9 times tables — the facts kids find hardest — step by step for grade 3.
Free math placement test for your child: https://www.pedmas.com

In this video your child will learn:
• How to build a hard fact from equal groups instead of memorizing blind
• How facts they already know (×2, ×5) unlock the ones they don't
• How to picture 6s–9s so the answers stop feeling random

Every step is shown on screen and spoken out loud, so kids can follow along
even if this topic is brand new.

—— About PEDMAS ——
PEDMAS is an adaptive K-12 math platform: a placement test finds exactly where
your child is, then daily practice and lessons like this one move them forward
one skill at a time. Parents get a dashboard that shows real progress.

▶ Free placement test: https://www.pedmas.com
▶ All lesson videos, in order: [channel playlists link]

Made by BAAF Consulting Inc. in Ontario, Canada.

#timestables #grade3math #multiplication #mathforkids #homeschoolmath
```

### c) `div-larger` — 2-digit & 3-digit ÷ 1-digit (Grade 4)

**Title:** Long Division for Kids: 2- and 3-Digit ÷ 1-Digit, Step by Step | Grade 4 Math | PEDMAS

```
How to do long division — dividing 2-digit and 3-digit numbers by a 1-digit number, step by step for grade 4.
Free math placement test for your child: https://www.pedmas.com

In this video your child will learn:
• How to share a bigger number out one place value at a time
• Where each digit of the answer comes from (no mystery steps)
• What to do when a digit doesn't divide evenly

Every step is shown on screen and spoken out loud, so kids can follow along
even if this topic is brand new.

—— About PEDMAS ——
PEDMAS is an adaptive K-12 math platform: a placement test finds exactly where
your child is, then daily practice and lessons like this one move them forward
one skill at a time. Parents get a dashboard that shows real progress.

▶ Free placement test: https://www.pedmas.com
▶ All lesson videos, in order: [channel playlists link]

Made by BAAF Consulting Inc. in Ontario, Canada.

#longdivision #grade4math #4thgrademath #mathforkids #homeschoolmath
```

### d) `cur-add-fractions` — Adding fractions (Grade 4–5)

**Title:** How to Add Fractions with Fraction Bars | Grade 4-5 Math | PEDMAS

```
How to add fractions, explained step by step with fraction bars for grades 4 and 5 — a short animated lesson.
Free math placement test for your child: https://www.pedmas.com

In this video your child will learn:
• What the top and bottom numbers of a fraction really mean
• How to add fractions by combining pieces on a fraction bar
• Why you add the numerators but not the denominators

Every step is shown on screen and spoken out loud, so kids can follow along
even if this topic is brand new.

—— About PEDMAS ——
PEDMAS is an adaptive K-12 math platform: a placement test finds exactly where
your child is, then daily practice and lessons like this one move them forward
one skill at a time. Parents get a dashboard that shows real progress.

▶ Free placement test: https://www.pedmas.com
▶ All lesson videos, in order: [channel playlists link]

Made by BAAF Consulting Inc. in Ontario, Canada.

#fractions #grade5math #grade4math #mathforkids #homeschoolmath
```

### e) `cur-quadratic-formula` — Quadratic formula (Grade 9–10)

**Title:** The Quadratic Formula, Step by Step | Grade 9-10 Algebra | PEDMAS

```
How to use the quadratic formula to solve any quadratic equation, step by step for grades 9–10 algebra.
Free math placement test for your child: https://www.pedmas.com

In this video your child will learn:
• How to read a, b and c straight off the equation
• How to substitute into the formula without sign mistakes
• How the graph confirms the two solutions

Every step is shown on screen and spoken out loud, so kids can follow along
even if this topic is brand new.

—— About PEDMAS ——
PEDMAS is an adaptive K-12 math platform: a placement test finds exactly where
your child is, then daily practice and lessons like this one move them forward
one skill at a time. Parents get a dashboard that shows real progress.

▶ Free placement test: https://www.pedmas.com
▶ All lesson videos, in order: [channel playlists link]

Made by BAAF Consulting Inc. in Ontario, Canada.

#quadraticformula #algebra #highschoolmath #grade9math #mathhelp
```

**Before publishing any of these:** the bullet lines were written from the unit labels and template
mechanics (ten frames, equal groups, fraction bars, graphs). Spot-check each against the actual
narration (`npx tsx scripts/preview-lesson-script.ts <id>` in the eduyro repo) and correct any
bullet the video doesn't literally deliver. No bullet may promise something the video doesn't show.

---

## 4. Title convention

**Pattern:** `{Search keyword phrasing} | {Grade band} Math | PEDMAS`

- **Front-load the search phrase** — the skill in the words a parent types ("Long Division for
  Kids", "How to Add Fractions"), not the internal label ("div-larger", "2-digit & 3-digit ÷ 1-digit").
- **Grade tag in the middle**, always — it's a top query modifier and it tells a scanning parent
  instantly whether the video fits their kid. Use "Grade 4" (Canadian phrasing) in titles and put
  "4th grade" in the description/hashtags to catch US phrasing.
- **Brand last.** PEDMAS means nothing to searchers yet; it earns recognition over time.
- Keep titles ≤ 70 characters where possible (~60 shows without truncation in most surfaces);
  the keyword must survive truncation, the brand may not — that's the right sacrifice.
- Add "Step by Step" when it fits — it's the strongest performing modifier in this niche.
- One steal-worthy structure from the top of the niche: keyword phrase, then a natural-language
  restatement ("Long Division: A Step-By-Step Review | How to do Long Division | Math with Mr. J").
  Use the restatement trick only when the title stays under ~70 chars.

---

## 5. COPPA / "Made for Kids" — the compliant setup

**The facts (YouTube's own docs, Aug 2026):**

- Every channel and every video must declare an audience. Options at channel level: made for
  kids, not made for kids, or **"review this setting for every video"**
  ([YouTube Help: Setting your audience](https://support.google.com/youtube/answer/9527654)).
- Content is "made for kids" if children are an intended audience
  ([Determining if your content is made for kids](https://support.google.com/youtube/answer/9528076)).
  These are animated lessons that speak directly to the child ("your child will…" — no, the
  narration addresses the kid). **They are unambiguously child-directed. There is no honest way
  to mark them otherwise**, and YouTube's classifier can override a false designation anyway.
- On a made-for-kids video, YouTube disables: **comments, cards and end screens, the notification
  bell, save-to-playlist / watch-later, miniplayer, channel memberships, live chat, stories,
  personalized ads** ([full list](https://support.google.com/youtube/answer/9527654);
  [MFK FAQ](https://support.google.com/youtube/answer/9684541)).
- Enforcement is real and current: the FTC's updated COPPA rule took full effect in 2025, and
  Disney paid **$10M in Sept 2026** to settle an FTC complaint over mislabeled kids' content on
  YouTube ([NBC News](https://www.nbcnews.com/business/business-news/disney-pay-10-million-settle-ftc-complaint-collection-childrens-person-rcna228786)).

**Recommended setup — per-video review, not channel-wide MFK:**

1. In Studio → Settings → Channel → Advanced settings, choose **"I want to review this setting
   for every video."**
2. **Mark every lesson video "Yes, made for kids"** at upload (Studio's Content page supports
   multi-select bulk-editing the audience field, so 157 videos is one batch job, not 157 clicks).
3. Keep a small set of genuinely **parent-directed** videos as "not made for kids": the channel
   trailer, a "what the placement test tells you" walkthrough, a parent-dashboard tour. These are
   aimed at the buying adult, not the child, so the designation is honest — and they retain end
   screens, cards and comments, making them your only full-featured conversion surfaces.

Why not just set the whole channel MFK? It would be compliant, but it forces the future
parent-facing trailer/tour videos into MFK too, killing the one place you're allowed end screens
and cards. Per-video review costs one extra click per upload and keeps that door open. If you
never plan parent-facing videos, channel-wide MFK is the simpler, equally compliant choice.

**Consequences to design around (already baked into §2):**

- **The description is your only link.** No end screens, no cards, no pinned comment on lesson
  videos — so pedmas.com sits on line 2 of every description, above the fold.
- **No notification bell / subscriptions prompts matter less** — don't write "smash subscribe"
  CTAs anywhere; they'd be pointed at children anyway, which violates our own rules.
- **No comments** means no comment moderation burden — genuinely fine for a solo founder.
- Playlists still work and MFK videos still surface in search and in the YouTube Kids app —
  search is the whole strategy here, so nothing that matters is lost.
- **AI voice disclosure:** narration is a synthetic (ElevenLabs) voice. At upload, YouTube asks
  about altered/synthetic content. An AI voiceover on animated math lessons is not deceptive
  realistic media, but answer the disclosure question truthfully — when in doubt, disclose. Do
  not label the voice as a real named teacher anywhere.
- **Never target ads at these videos or this audience.** Not that you're running ads yet — but
  when you do, children's content is off-limits as an ad vehicle and under-18 as an audience.

---

## 6. Upload order — first 10 for the Sept 8 launch window

September = back-to-school. Teachers spend the first weeks reviewing last year's material, and
parent panic-searches spike on the classic homework pain points. Upload in this order:

| # | Unit id | Video | Why first |
|---|---|---|---|
| 1 | `div-larger` | Long division (2- & 3-digit ÷ 1-digit) | The single most-searched parent pain point in elementary math |
| 2 | `mul-6-9` | ×6–×9, the hard facts | "Times tables" is a perennial high-volume query; Sept is facts-review season |
| 3 | `sub-2d-borrow` | 2-digit subtraction (borrowing) | "Borrowing/regrouping" is the classic "they teach it differently now" parent search |
| 4 | `add-2d-regroup` | 2-digit addition (regrouping) | Pairs with #3; catches the same searches from the addition side |
| 5 | `cur-add-fractions` | Adding fractions | Fractions = the #2 parent panic topic after long division |
| 6 | `cur-compare-fractions` | Comparing fractions | Sept review topic in grades 4–5; feeds a Fractions playlist with #5 |
| 7 | `cur-place-value-tens` | Place value — tens | Place value is where nearly every teacher starts the year |
| 8 | `mul-2d2d` | 2-digit × 2-digit | "2 digit by 2 digit multiplication" is a specific, low-competition long-tail query |
| 9 | `cur-two-step` | Solving two-step equations | Captures the middle-school band; equations searches climb through fall |
| 10 | `cur-decimal-place-value` | Decimal place value | Grade 5–6 September review; completes K-8 spread across the first ten |

Logic: 10 videos covering grades 2–8 (the sweet spot of parent search volume), each one a topic
with proven standalone search demand, weighted toward September's review-season queries. Upload
1–2 per day rather than all at once — steady uploads look alive to both parents and the algorithm.
Group into playlists immediately (Times Tables, Fractions, Long Division & Division Facts,
Equations) — playlists still function on MFK content and are your substitute for end-screen
chaining. Kindergarten and high-school videos follow in week 2+; they broaden coverage but their
September search volume is lower.

---

## What NOT to do

- Don't upload before the eduyro.com wordmark is resolved (top of this doc).
- Don't buy YouTube ads or promote videos — no conversion tracking exists yet, and ads on/around
  kids' content are a policy minefield.
- Don't invent view-count/social-proof language ("thousands of kids love…") — there is none yet.
- Don't put any CTA aimed at the child in titles or descriptions. Every sentence is written to
  the parent.
- Don't exceed 3–5 hashtags or stuff keywords — YouTube treats it as spam signal.

## Sources

- [YouTube Help — Setting your channel or video's audience](https://support.google.com/youtube/answer/9527654) (designation levels + disabled-features list)
- [YouTube Help — Made for Kids FAQ](https://support.google.com/youtube/answer/9684541)
- [YouTube Help — Determining if your content is made for kids](https://support.google.com/youtube/answer/9528076)
- [YouTube Blog — Better protecting kids' privacy on YouTube](https://blog.youtube/news-and-events/better-protecting-kids-privacy-on-youtube/)
- [NBC News — Disney pays $10M to settle FTC complaint over kids' data on YouTube](https://www.nbcnews.com/business/business-news/disney-pay-10-million-settle-ftc-complaint-collection-childrens-person-rcna228786)
- [Third Space Learning — How to teach long division](https://thirdspacelearning.com/us/blog/teach-long-division-steps/)
- [Caffeine Queen Teacher — Parent's guide to long division](https://caffeinequeenteacher.com/solve-long-division-problems/)
- [Kate Snow — Homeschool Math Help: hands-on long division](https://kateshomeschoolmath.com/1686-2/)
- [Math with Mr. J — Long Division: A Step-By-Step Review](https://youtube.com/watch?v=HJYHNxS64f0) (title-convention reference)
