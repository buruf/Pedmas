# PEDMAS — Written Information Security Program

**Version 1.3 — 22 August 2026**
Applies to: PEDMAS (www.pedmas.com), an adaptive K–12 mathematics service used by children.

This document exists because the amended COPPA rule requires an operator collecting children's personal information to maintain a *written* information security program, proportionate to the sensitivity of the data and the size of the operation. It describes the safeguards actually implemented in the service as of commit `ec06b12` — not aspirations. Where a control is not yet in place, it is listed in §9 as a gap rather than omitted.

**Status:** prepared by an AI assistant from a direct reading of the codebase, for review by the operator and by counsel. Every technical claim is verifiable in the repository.

---

## 1. Scope and responsible person

**In scope:** the PEDMAS web application, its database, its email and payment integrations, and the administrative access used to operate them.

**Responsible person:** the operator (sole proprietor / to be named on incorporation — see the open item in `docs/LEGAL-RATIONALE.md` §4). At present one person holds all administrative access. On adding any second person with production access, §7 must be re-read and access reviewed.

**Reviewed:** at least annually, and whenever the data collected, the processors used, or the authentication design changes.

## 2. What is protected

| Data | Sensitivity | Where it lives |
|---|---|---|
| Parent name, email | Moderate — identifies an adult | `accounts` table (Neon Postgres) |
| Parent password | High — but stored only as a scrypt hash with a per-account salt; the password itself is never stored and cannot be recovered | `accounts` table |
| Child first name or nickname, grade, optional age and goal | High — children's personal information under COPPA | `students` table |
| Child learning activity: answers, correctness, hints, placement, mastery, streaks, time on task | High — children's personal information | `students` table |
| Session tokens | High — confer account access | `auth_sessions` table |
| Password-reset tokens | High — confer account access | `password_reset_tokens`, stored **as hashes only** |
| Payment card details | Critical | **Never touch PEDMAS systems.** Held entirely by Stripe; the application stores only Stripe identifiers and subscription status |

**Deliberately not collected:** child address, phone number, photographs, precise location, biometrics, or free-text self-description. A nickname is explicitly acceptable in place of a real name, so a child record can be effectively pseudonymous. Minimising collection is the primary security control: data never collected cannot be breached.

## 3. Access control and authentication

- **Passwords** are hashed with **scrypt** and a per-account random salt (`src/lib/auth.ts`). Verification is constant-time. Plaintext passwords are never written to storage or logs.
- **Sessions** are opaque random tokens stored server-side with a 30-day expiry, delivered in cookies that are `HttpOnly`, `SameSite=Lax`, `Secure` in production, and scoped to `.pedmas.com`. There is no client-readable session state and no JWT to forge.
- **Password reset** tokens are single-use, time-limited, and stored **only as hashes** — a database reader cannot mint a working reset link. Using a reset revokes all existing sessions for that account.
- **Children sign in with a parent-issued code, never with credentials of their own.** The parent generates a 12-character random code from their dashboard; it is stored only as a SHA-256 hash, shown once, and revocable at any time. No email, password or other detail is ever collected from a child, so this adds no personal information under COPPA.
- **A child session is scoped to one child.** It carries that student id and is refused — by a distinct `requireParent()` guard — at billing, account settings, account deletion, MFA, the admin console, and any sibling's record (404, so a sibling's existence is not disclosed). Payloads are scoped as well as routes: the session endpoint returns only that child, without the parent's email address. Before this existed, a child using the family laptop held the parent's full session, one click from the Stripe portal and from deleting every child's history.
- **Admin credential recovery.** Setting `PEDMAS_ADMIN_RESEED=true` makes the environment authoritative for the admin email and password on the next request, and is the documented way back in when the stored credentials are unusable and no reset email can be sent. It requires hosting-platform access (already the trust boundary for the database URL and payment keys), it never touches a configured second factor, and it must be unset again once used.
- **Administrative access** is a role on a normal account (`role: "ADMIN"`), seeded once from environment variables and reachable only at `/admin`, which refuses any non-admin session. There is no separate admin credential store and no shared admin login.
- **Two-factor authentication (TOTP) is available on admin accounts** and is the control protecting the highest-value credential in the service. Implementation notes:
  - RFC 6238 TOTP, SHA-1, 6 digits, 30-second steps — compatible with any standard authenticator app. The implementation is verified in CI against the RFC's own published test vectors.
  - The password step alone **never mints a session**. On success it returns only a single-use challenge ticket (5-minute lifetime, maximum 5 attempts); the session cookie is issued only after a valid code. A stolen password therefore grants nothing.
  - Codes cannot be replayed: the time step a code was accepted at is recorded and codes at or before it are refused.
  - Ten single-use **recovery codes** are issued at enrolment and stored **only as SHA-256 hashes**, compared in constant time. The TOTP secret itself must be stored recoverably in order to verify codes at all; this is inherent to TOTP and is why the secret sits behind the same database access controls as everything else.
  - Enrolment is proved before it is trusted: the new secret is held pending until a code generated from it verifies, so a mis-scanned setup cannot lock anyone out. Disabling MFA or reissuing recovery codes both require a current code, so a hijacked session cannot quietly remove the protection.

## 4. Rate limiting and abuse resistance

Fixed-window rate limits are enforced server-side, in shared storage so they hold across serverless instances (`src/lib/rateLimit.ts`):

| Endpoint | Limit |
|---|---|
| Sign-in | 10 attempts / 15 minutes / client |
| Two-factor code | 10 / 15 minutes / client, and 5 attempts per challenge ticket |
| Registration | 5 / hour / client |
| Password reset request | 5 / hour / client |
| Browser error reporting | 10 / 10 minutes / client |
| Child sign-in code | 20 / 15 minutes / client, cleared on success |

Sign-in responses are deliberately identical for "no such account" and "wrong password", so the endpoint cannot be used to enumerate which email addresses have accounts. Password-reset responses are likewise uniform.

## 5. Data in transit and at rest

- All traffic is served over **HTTPS**; the production host redirects plain HTTP.
- The database is **Neon Postgres**, reached over TLS with credentials held only in Vercel's encrypted environment variables. Neon encrypts data at rest and takes managed backups.
- Application secrets (database URL, Stripe keys, cron secret, mail key) exist only as environment variables in the hosting platform. **No secret is committed to the repository**, and the repository contains no production credentials.
- The Stripe webhook endpoint verifies the signature on every request before acting, so forged billing events are rejected.
- Scheduled jobs (`/api/cron/*`) and the health check require a bearer `CRON_SECRET` and **fail closed** when it is unset — an unauthenticated caller cannot trigger a mail run or a data purge.

## 6. Software security practices

- The codebase is **TypeScript under strict mode**; the production build fails on type errors.
- **316 automated tests** run before each deployment, covering authentication, billing arithmetic and entitlement gating, the store layer against a real Postgres engine, data-retention decisions, and content correctness.
- Database access goes through a single repository module using **parameterised queries exclusively**; table names come from a fixed allow-list, never from user input. There is no string-concatenated SQL.
- User-supplied values are rendered through React's escaping; the application does not use `dangerouslySetInnerHTML` for user content.
- Dependencies are few and mainstream (Next.js, Stripe SDK, Neon driver, mathjs). Updates are applied when advisories affect them.

## 7. Monitoring, logging and incident response

- **Error monitoring** is built in (`src/lib/errors.ts`): unhandled server and browser errors are recorded, grouped, and surfaced in the admin console; a newly-seen error emails the operator, rate-limited to one alert per six hours.
- **Logs never contain** passwords, reset links, session tokens, or card data. Error messages and stacks are truncated before storage.
- **Incident response.** On suspicion of compromise the operator will, in order: (1) rotate the affected secrets in the hosting platform and redeploy, which invalidates the exposed credential; (2) invalidate all sessions if session data may be affected, forcing re-authentication; (3) determine which records were exposed using database and platform logs; (4) notify affected parents by email without undue delay, and any regulator where required by the law of the launch jurisdiction; (5) record the cause and the corrective change. Because card data never enters the system, no card breach is possible through PEDMAS.

## 8. Data retention and disposal

- A parent may delete an individual child profile or the entire account at any time from the Account page. Deletion is **immediate and permanent** in the application database — there is no soft-delete or hidden copy — and it cancels any active Stripe subscription first, so a deleted family cannot continue to be charged.
- **Dormant accounts are erased automatically.** After **730 days (24 months)** with no sign-in and no child practice, the account holder is emailed a warning; **30 days later**, if nobody has signed in, the account and every child profile and learning record on it are permanently deleted. A daily job performs this (`src/lib/retention.ts`, `/api/cron/retention`). An account with a live subscription is exempt, and no account is ever purged without a warning having been sent.
- Both paths run through the **same erasure function**, so the promise made in the Privacy Policy cannot be true in one place and false in the other.
- Stripe retains its own payment records under its own retention policy, as the Privacy Policy states.

## 9. Known gaps and planned improvements

Stated plainly, because a security document that lists only strengths is not useful:

1. ~~No multi-factor authentication on the administrative account.~~ **Implemented** (21 August 2026) — see §3. It is available and tested but **not yet enabled on the production admin account**; enrolling it at `/admin` is an operator action and should be done before the service opens to the public.
2. **Email delivery is not yet configured** (`RESEND_API_KEY` unset). Until it is, password reset cannot complete, error alerts do not send, and — by deliberate design — the retention purge never deletes anything, because no warning can be sent.
3. **No formal dependency-scanning schedule.** Updates are currently applied ad hoc rather than on a defined cadence.
4. **No independent penetration test** has been performed.
5. **Backups are Neon's managed backups**; no separate restore drill has been rehearsed.
6. **Single administrator, single point of failure** — no documented succession for access to the hosting, database, or payment accounts.

## 10. Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 21 August 2026 | First written program. Documents controls as implemented at commit `ec06b12`, including the newly-added automatic dormancy purge. |
| 1.1 | 21 August 2026 | Two-factor authentication implemented for admin accounts (§3, §4); gap 1 closed pending operator enrolment. |
| 1.2 | 22 August 2026 | Admin credentials are normalized when seeded, so whitespace pasted into a hosting dashboard can no longer lock the operator out; documented opt-in reseed recovery added (§3). |
| 1.3 | 22 August 2026 | Child sign-in added: parent-issued codes and child-scoped sessions, closing the gap where a child on a shared device held the parent's full authority (§3, §4). |
