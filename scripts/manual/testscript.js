const { makeDoc } = require("./dockit");
const d = makeDoc("../../docs/PEDMAS-Test-Script.pdf", "Test Script", "A step-by-step walkthrough for verifying every part of the site by hand");

d.title();
d.p("Work through the sections in order — later sections assume the accounts created in earlier ones. Each step says what to do and what you should see. Anything that does not match is a bug: note the step number and what happened instead (the Errors panel at /admin may already have the details).", { muted: true });
d.note("Where to test: use http://localhost:3080 to test safely against local data, or https://www.pedmas.com to test the real thing. The steps are identical. On the live site, remember Stripe is in sandbox — no real card is ever charged.");

d.h1("A. The public site (no login)");
d.step(1, "Open the homepage.", "Under-construction banner at the very top; \u201CSign up\u201D absent while registration is closed; hero shows \u201CSee a Real Lesson\u201D.");
d.step(2, "Click \u201CSee a Real Lesson\u201D (or the Sample Lesson link in the nav).", "The column-addition lesson opens with no login. Seven collapsible steps, only the first open.");
d.step(3, "Tap through all seven steps, reading as a parent would.", "Each step opens only after the previous one's button. Step 4 shows the classic mistake (27 + 15 = 312) and disproves it with the estimate.");
d.step(4, "In step 7, type 62 as the answer.", "\u201CCorrect! Great work\u201D appears, then a Next button; pressing it reveals the closing panel explaining how every lesson is built, with a curriculum link.");
d.step(5, "Try /signup directly while registration is closed.", "A \u201CNot open for new accounts yet\u201D message. No form that actually creates an account.");
d.step(6, "Open /curriculum, /pricing, /privacy, /terms.", "All load. Privacy and Terms carry the \u201Cdraft pending legal review\u201D notice. Pricing shows $11.99 + $5.99, 7-day trial, max 4 children.");

d.h1("B. Admin console");
d.step(7, "Log in at /login with the admin credentials (locally: admin@pedmas.com / pedmas-admin; live: the values from Vercel env).", "Login succeeds and /admin loads with the ADMIN badge.");
d.step(8, "Check the overview cards.", "Counts are plausible: 12 grades, 8 strands, 634 skills; account/student counts match reality.");
d.step(9, "In the question preview, pick Grade 1 counting at stage 1, then a Grade 11 topic at stage 5.", "Both generate. Grade 1 questions read like Grade 1; health verdict is \u201Chealthy\u201D for common skills.");
d.step(10, "Press \u201CFire a test error\u201D in the Errors panel.", "After the reload, a server-source group appears: \u201CTest error from the admin console…\u201D with path POST /api/admin/errors.");
d.step(11, "Press Dismiss on that group.", "It disappears and the panel returns to \u201CNo errors recorded\u201D.");

d.h1("C. A family's journey (the core test)");
d.p("This is the test that matters most — you are playing a parent and then their child.", { muted: true });
d.step(12, "Enable registration first if testing this section (locally: put REGISTRATION_OPEN=true in .env.local and restart; live: set it in Vercel). Register a fresh parent account.", "Signup requires accepting the Terms checkbox and the parent/guardian affirmation before it lets you through.");
d.step(13, "Add a child: name, grade 3, age 8.", "Child appears on the parent dashboard with a prompt to start placement.");
d.step(14, "Start the placement as the child.", "It announces it is a placement test before the first question. Questions start EASY (basic addition) and only climb while answers are right.");
d.step(15, "Answer the first ~5 questions wrong on purpose.", "Questions get easier, not harder, and placement ends early with a gentle message — a struggling child is not dragged through fractions.");
d.step(16, "Finish placement honestly for a typical 8-year-old.", "A per-strand report appears (different levels per strand is normal and said to be normal).");
d.step(17, "Start today's practice.", "About 12 questions, one at a time, with a number pad. The current skill's lesson is offered first (\u201CLearn\u201D) before practising it.");
d.step(18, "Open the lesson, finish it, return to practice.", "Lesson matches the skill being practised. Back in practice, the same concept appears in the questions.");
d.step(19, "Answer one question wrong on purpose.", "Coaching appears explaining the mistake; you retry until right; a \u201CShow me\u201D worked example is available.");
d.step(20, "Complete the whole session.", "A results screen with first-try accuracy; the streak ticks up; the dashboard reflects the session.");
d.step(21, "As the parent, open the child's dashboard page.", "Progress, streak, mastered skills and time-on-task all visible and matching what the child just did.");

d.h1("D. Billing (sandbox)");
d.step(22, "From the parent account, start the subscription with card 4242 4242 4242 4242, any future expiry, any CVC.", "Stripe Checkout shows $11.99/month for one child and a 7-day trial. After success you land back in the app with the subscription active (trialing).");
d.step(23, "Add a second child, then check the Billing page.", "Seat count and monthly amount update to $17.98 from the next period.");
d.step(24, "Open the Stripe customer portal from the Billing page and cancel.", "Cancellation is self-serve; the app shows access continuing to period end.");

d.h1("E. Deletion (the promises the privacy policy makes)");
d.step(25, "Re-subscribe (sandbox), then from the Account page delete ONE child profile.", "A confirmation naming the child; after deleting, the profile and its history are gone and billing seats adjust.");
d.step(26, "Now delete the ENTIRE account while the subscription is active.", "Explicit confirmation, then logout. In the Stripe sandbox dashboard, the subscription shows CANCELED — an orphaned account must never keep charging.");
d.step(27, "Try logging in as the deleted parent.", "\u201CEmail or password is incorrect\u201D — the account genuinely no longer exists.");

d.h1("F. Regional behaviour");
d.step(28, "With a US connection (or a US VPN) register/log a fresh visit; as any US-region student, practise measurement or geometry.", "Units are inches/feet/miles/°F and spelling is American (meters, color). No metric leaks.");
d.step(29, "Repeat from a non-US connection (or an INTL-region account).", "Units are cm/m/km/°C and Commonwealth spelling. No imperial leaks.");

d.h1("G. After email is configured (Resend key set)");
d.step(30, "Use \u201CForgot password\u201D on a real account you control.", "The reset email arrives; the link works once and expires; you can log in with the new password.");
d.step(31, "Trigger the weekly summary manually: send GET to /api/cron/weekly-progress with header Authorization: Bearer <CRON_SECRET>.", "Response reports sent/skipped counts; the parent inbox receives the summary; its unsubscribe link works with one click.");
d.step(32, "Fire a test error from /admin.", "Within a minute the admin inbox gets the error alert; firing another immediately does NOT send a second email (6-hour cooldown).");

d.h1("H. Every skill and every step — how full coverage works");
d.p("No human can hand-test 634 skills x 5 stages x 2 regions (6,340 combinations) or all 132 lessons' steps — so the machine does, on every single test run:");
d.bullets([
  "Every skill, every stage, both regions: the suite generates and validates questions for all 6,340 combinations (three random seeds each, about 19,000 questions per run). A failure names the exact skill, stage and region.",
  "Every step of every lesson: an automated walker opens all 132 lessons and taps through every step, failing on anything that crashes, prints a template placeholder, or renders NaN.",
  "Every skill's five stage names, every skill-to-lesson route, and every advertised error-analysis question are checked exhaustively the same way.",
]);
d.p("What the machine cannot judge is whether a question FEELS right for the grade and whether the teaching lands. That is the human job, and it has its own document: the Skill Coverage Checklist PDF lists all 634 skills with a tick-box per stage. Work through it with the admin question preview (/admin) at whatever pace you like — it is designed to be done over days, not in one sitting.");

d.h1("I. Automated checks (run before every deploy)");
d.code("cd C:\\Users\\buruf\\Documents\\Pedmas\nnpm test          # 275 tests, including EVERY skill x stage x region and EVERY lesson step\nnpm run build     # must compile clean — stop the dev server first");
d.p("After a production deploy, three quick probes from any terminal:");
d.code("curl -s -o NUL -w \"%{http_code}\" https://www.pedmas.com/            (expect 200)\ncurl -s -X POST https://www.pedmas.com/api/auth/login -H \"Content-Type: application/json\" -d \"{\\\"email\\\":\\\"nobody@example.com\\\",\\\"password\\\":\\\"x\\\"}\"   (expect a clean 'incorrect' message, not a 500)\ncurl -s https://www.pedmas.com/sample-lesson | findstr \"spill\"        (expect the lesson title)");
d.note("A full pass of sections A–F takes roughly 45 minutes. Sections A, B and the automated checks alone take 10 and are the minimum before any deploy you care about.");

d.finish();
console.log("test script written");
