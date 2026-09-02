# PEDMAS — project notes for Claude

## Deploy
- **Always deploy with `npm run deploy`** — never a bare `git push`. A push is NOT a deploy: on 2026-09-01 a commit reached GitHub, the Vercel webhook silently never fired, and production kept serving the previous commit for hours. The script pushes, confirms GitHub has the commit, waits for the auto-deploy, and runs `vercel --prod` itself if the webhook does not deliver — then proves production is running HEAD, or exits non-zero.
- `npm run deploy:check` answers "what is live right now?" at any time.
- `GET /api/version` returns the commit production is actually running. That is the source of truth; deployment dashboards can disagree with reality.
- Auto-deploy from `main` (Vercel, project `pedmas`, team `eduyro-s-projects`) still works most of the time — the script exists because "most of the time" is not good enough for a live product.
- Verifying a change on prod: client-rendered pages (/admin, dashboards) do NOT show new UI in server HTML — grep the `/_next/static/chunks/*.js` bundles. And note every page inlines Next's error CSS containing `rgba(255,255,255`, which trips naive number regexes.

## Email (migrated to Brevo, 2026-08-23)
- Transport: `src/lib/email/send.ts` — tries `BREVO_API_KEY` (Brevo REST, no SDK) first, falls back to `RESEND_API_KEY`. Tests in `tests/emailSend.test.ts`.
- Vercel production has `BREVO_API_KEY` + `EMAIL_FROM = PEDMAS <noreply@pedmas.com>` set and delivery is inbox-verified.
- `EMAIL_FROM` must stay on a Brevo-verified domain (pedmas.com is verified). Never use an `@resend.dev` address on the Brevo path.
- The Brevo account (login eduyro.edu@gmail.com) has API IP-blocking **disabled** — required, Vercel IPs rotate. Do not re-enable it.
- Inbound: `privacy@pedmas.com` is a name.com forward to the owner's inbox — verified working.

## Legal pages (completed 2026-08-23)
- Operator constants live in `src/lib/legal.ts`: BAAF Consulting Inc., 67 Masters Green Cres, Brampton, Ontario L7A 3K6, Canada; governing law Ontario, Canada; contact privacy@pedmas.com.
- `tests/legal.test.ts` fails if a bracketed placeholder reappears in the operator fields — keep it that way.
- Bump `POLICY_VERSION` on any material wording change so consent re-collects.
- Not yet reviewed by a lawyer (recommended before real payments; the service is used by children).
- Remaining pre-payment blockers are Stripe-only: live keys + webhook signing secret on Vercel; Stripe entity should match BAAF Consulting Inc.
