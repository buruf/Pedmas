# PEDMAS — Legal Rationale

**Status: draft for review by qualified counsel. This is not legal advice.**

**Companion document:** `docs/SECURITY-PROGRAM.md` is the written information security program this file's §4 requires.

This document was prepared by an AI assistant from a direct reading of the codebase (commit `a4fe228`, August 20, 2026). It explains the legal reasoning behind how PEDMAS is built, states the compliance posture regime by regime, and lists what remains open — ranked, with the blocking items first. Its purpose is to let a licensed lawyer review the service efficiently: the facts about what the system does are verified against the code, and the legal conclusions are the part needing professional judgement. Statements about specific laws reflect the state of knowledge as of early 2026 and must be re-verified by counsel.

---

## 1. What the service is, in legal terms

PEDMAS (www.pedmas.com) is a paid subscription web service that teaches and assesses K–12 mathematics. Its users are **children**; its customers are **adults**. That one sentence drives almost every legal obligation below, because services used by children carry the strictest privacy rules in every jurisdiction.

**The commercial shape:** a monthly subscription of $11.99 USD for the first child and $5.99 for each additional child (maximum 4), with a 7-day free trial. Payment runs entirely through Stripe Checkout; card data never touches PEDMAS servers. Auto-renews monthly until cancelled; cancellation is self-serve through the Stripe customer portal and takes effect at period end. Currently in Stripe sandbox; registration is closed for testing.

**The data shape:** the parent account holds name, email, and a scrypt-hashed password. Each child profile holds a first name *or nickname*, school grade, optional age and goal, and learning telemetry (answers, correctness, hints, placement, mastery, streaks, time on task). Region (US/INTL wording) and timezone are stamped from request headers. Four processors: Stripe (payments), Neon (database), Vercel (hosting), Resend (email).

---

## 2. Design decisions as compliance strategy

These are deliberate choices already in the code, and the reasoning behind them. Counsel should confirm the reasoning holds.

### 2.1 Adults hold every account; children hold none

Children cannot create accounts, are never asked for contact details, and the child "profile" is a container inside the parent's account. This is the central compliance strategy:

- **For COPPA (US):** the parent is present, identified, and affirms guardianship *before* any child data exists. The service never collects information *from* a child to establish the relationship — it collects information *about* a child from their parent.
- **For GDPR Article 8 (EU) and its per-country consent ages (13–16):** those ages govern when a child may consent *for themselves* to an information-society service. PEDMAS never asks a child to consent to anything; the parent, as holder of parental responsibility, consents on their behalf. This design largely moots the varying-consent-age problem — a fact worth stating because an earlier internal review flagged "consent age fixed at 13" as a gap. The 13 threshold in the code (`CHILD_AGE_THRESHOLD`) marks when parental consent language applies, not when a child may self-consent, since self-consent never happens.

### 2.2 Data minimization is structural, not aspirational

No child address, phone, photo, precise location, or biometrics. No free-text fields where a child could type personal information. A nickname is explicitly acceptable instead of a real name — meaning the service can operate with effectively **pseudonymous** child records. No advertising, no third-party trackers, no sale or sharing of personal information. Each of these removes an obligation rather than managing one: no CCPA "sale/share" opt-outs, no COPPA behavioral-advertising provisions, no ad-tech data-sharing agreements.

### 2.3 Consent is recorded, versioned, and re-collectable

At signup the account stores `{policyVersion, acceptedAt, parentAffirmed}`. The policy version (`POLICY_VERSION`) is bumped on material changes, which allows the service to force re-acceptance — the stated commitment in both policies. The parent affirms a specific statement (`PARENT_CONSENT_STATEMENT`) that they are the parent or guardian and consent to processing of the child's learning information.

**The known weak point:** at signup this is a checkbox affirmation, which is *not* on the FTC's list of verifiable parental consent (VPC) methods. The mitigations are (a) the extreme data minimization above — before payment, the child data at risk is a nickname, a grade, and math answers — and (b) **a credit-card transaction is a recognized VPC method**, and every paying family completes one at subscription. The open question for counsel (§5, Q3): is checkbox-plus-minimal-data acceptable for the free placement/trial window, with the card transaction perfecting consent at subscription — or must a VPC method precede the placement test?

### 2.4 Deletion is real, immediate, and self-serve

The privacy policy's deletion promises were written to match implemented endpoints, not the reverse. `DELETE /api/account` erases every child profile and its learning history, revokes every session and reset token, then deletes the account record. Per-child deletion exists separately. Both are immediate hard deletes — there is no soft-delete or retention window in the application database. Stripe's own payment records persist under Stripe's retention policy, which the privacy policy discloses.

**One defect was found in this review and has since been fixed:** account deletion did not cancel an active Stripe subscription, so a family that deleted its account mid-subscription would have kept being charged. Deletion now cancels the subscription immediately first (including `past_due`/`unpaid` states, where Stripe would otherwise keep retrying the card); a billing-API failure is logged for manual follow-up but never blocks the erasure itself, since the right to delete data cannot depend on the billing API being up.

### 2.5 Subscription terms follow the strict-state playbook

Clear price disclosure before checkout, free trial with no charge during it, cancel-anytime through a self-serve portal, cancellation effective at period end with access retained, no automatic partial refunds but a stated fairness commitment. This matches the substance of state auto-renewal laws (California's being the strictest) and FTC Act §5 expectations. Note: the FTC's 2024 Negative Option Rule ("click-to-cancel") was vacated by the Eighth Circuit in July 2025 before taking effect — but the state ARLs it resembled remain in force, and following them is the right posture regardless.

### 2.6 Email follows the consent-and-exit playbook

Transactional email (password reset, receipts, trial-ending, payment-failure) is sent as needed. The one recurring commercial-adjacent message — the weekly parent progress summary — has an account-level opt-out preference, a signed one-click unsubscribe link in every send, and per-day send dedup. This satisfies CAN-SPAM (US) and is the conservative posture for CASL (Canada), where the existing-business-relationship plus unsubscribe mechanism covers messages to subscribers.

### 2.7 Security measures match the stated policy

scrypt password hashing with per-account salts, HTTP-only SameSite cookies with the Secure flag, HTTPS-only, rate-limited sign-in and password-reset, no card storage. The privacy policy describes exactly these and claims no more.

---

## 3. Regime-by-regime posture

| Regime | Applies? | Posture | Notes |
|---|---|---|---|
| **COPPA** (US, under-13) | Yes — child-directed service | Strong on minimization; VPC question open | See §2.3. The 2025 COPPA amendments add a written retention policy (no indefinite retention) and a written information-security program — both currently missing (§4, items 6–7). |
| **FTC Act §5 / state auto-renewal laws** | Yes | Good | §2.5. Counsel to confirm California ARL specifics if selling to CA. |
| **CCPA/CPRA + other state privacy laws** | Not yet | Thresholds (revenue/volume) almost certainly unmet at launch | No sale/share means the children's opt-in provisions are moot. Revisit at scale. |
| **PIPEDA + CASL** (Canada) | Yes, if the operator is Canadian or serves Canadians | Good on substance | Consent, minimization, deletion, unsubscribe all align. If the operator is in Ontario: no provincial private-sector privacy statute applies (PIPEDA covers); AODA accessibility obligations are light at this size but exist. Quebec (Law 25, French-language rules) deserves a separate look **only if** Quebec is targeted. |
| **GDPR / UK GDPR** | Only if EU/UK families are served | **Not ready — defer** | Would require: an EU representative (Art 27), documented transfer mechanism to US-hosted processors (DPF certification or SCCs), a records-of-processing document, and — hardest — the **UK ICO Children's Code**, a substantive design standard for services likely accessed by children. Recommendation: launch US + Canada only (§4, item 4). |
| **EU consumer law (14-day withdrawal), VAT/OSS** | Only if EU is served | Not built | USD-only pricing, no VAT collection. Another reason to defer EU. |
| **Australia / NZ** | Only if served | Likely exempt initially | Australia's Privacy Act small-business exemption (< A$3M turnover) currently applies but is under reform; NZ Privacy Act is consent-based and the model fits. Defer with EU. |
| **US state sales tax on SaaS** | At scale | Not built | Varies by state; Stripe Tax automates it. Low priority until revenue is real. |

---

## 4. Open items, ranked

**Blocking before the first real charge:**

1. **Operator identity.** `src/lib/legal.ts` has four placeholders: legal entity, postal address, monitored privacy mailbox, governing jurisdiction. A privacy policy without a contactable operator is not a valid one, and for a children's service the entity question is also a liability question — counsel should advise on incorporating rather than operating personally.
2. ~~Fix account deletion to cancel any active Stripe subscription~~ **Done** (August 20, 2026 — see §2.4).
3. **Execute Data Processing Agreements** with Stripe, Neon, Vercel, and Resend. All four offer standard self-serve DPAs; this is hours, not weeks.
4. **Decide launch geography and enforce it.** Recommendation: US + Canada. Enforcement can be a signup-time statement plus Stripe billing-country restriction; counsel to advise whether active geo-blocking is needed or a terms statement suffices.
5. **Counsel review of the Terms and Privacy Policy**, then remove the "draft pending legal review" banners. The documents were drafted to describe actual behavior, so review should be verification rather than rewriting.

**Near-term (COPPA amendment compliance window):**

6. ~~Written data-retention policy with a real limit.~~ **Done** (August 21, 2026). A 24-month dormancy window is now enforced in code: a warning email, then permanent erasure 30 days later, run by a daily job that shares its erasure path with the parent's own delete button. Live subscriptions and the admin account are exempt, and nothing is ever purged without a warning first — which means nothing is purged at all until email is configured. The Privacy Policy's retention section was rewritten to match, and `POLICY_VERSION` was bumped so account holders re-accept.
7. ~~Written information-security program.~~ **Done** (August 21, 2026) — `docs/SECURITY-PROGRAM.md`, covering what is protected, access control, rate limiting, transit and rest, software practices, monitoring and incident response, retention and disposal, and an explicit list of six known gaps.
8. **Resolve the VPC question** (§2.3, and §5 Q3) with counsel; if the answer is that card-first is required, reorder the flow so subscription (with trial) precedes the placement test.

**When expanding beyond US + Canada:** the EU/UK column of §3 becomes a project — representative, transfers, Children's Code conformance, withdrawal rights, VAT. Treat it as a deliberate market entry, not a default.

---

## 5. Questions for counsel

1. **Entity:** should the operator incorporate before taking payments for a children's service, and in which jurisdiction? (This also fills the governing-law placeholder.)
2. **COPPA applicability framing:** we treat PEDMAS as child-directed. Confirm, and confirm the parent-account model is correctly analyzed in §2.1.
3. **VPC sufficiency:** is checkbox affirmation acceptable for the pre-payment window given the minimal data collected (nickname, grade, math answers), with the card transaction as the VPC event at subscription — or must a listed VPC method precede any collection?
4. **Geographic limitation:** what is the minimum sufficient mechanism to avoid GDPR/UK obligations at launch — terms restriction, billing-country restriction, or geo-blocking?
5. **Arbitration / class-action waiver and a formal refund policy:** the current terms are silent on arbitration and informal on refunds ("we will deal with it fairly"). Advise whether to add standard clauses.
6. **Canada specifics:** if the operator is Ontario-based, confirm PIPEDA posture and whether CASL treatment of the weekly summary as consented/EBR mail is correct.

---

## 6. Maintenance rule

This document claims the policies describe what the code actually does. That is only true while it is kept true: **any change to data collection, retention, deletion, billing, or email requires updating the policy pages and bumping `POLICY_VERSION` in the same commit** — which forces re-consent from every account holder, which is the mechanism working as designed.
