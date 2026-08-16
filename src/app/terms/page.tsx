import Link from "next/link";
import { Logo } from "@/components/ui";
import { OPERATOR, POLICY_EFFECTIVE } from "@/lib/legal";
import { FIRST_CHILD_CENTS, ADDITIONAL_CHILD_CENTS, MAX_CHILDREN, TRIAL_DAYS } from "@/lib/billing/plan";

export const metadata = {
  title: "Terms of Service — PEDMAS",
  description: "The agreement between you and PEDMAS.",
};

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-extrabold text-ink-900">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-ink-700">{children}</p>;
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link href="/privacy" className="text-sm font-semibold text-brand-700 hover:underline">
          Privacy Policy →
        </Link>
      </header>

      <h1 className="text-3xl font-black text-ink-900">Terms of Service</h1>
      <p className="mt-1 text-sm text-ink-500">Effective {POLICY_EFFECTIVE}</p>

      <div className="mt-6 rounded-xl border border-warn-600/30 bg-warn-100 px-4 py-3 text-sm text-ink-700">
        ⚠️ <strong>Draft pending legal review.</strong> These terms describe how the service
        actually works, but they have not been reviewed by a lawyer and the operator details and
        governing jurisdiction are not yet complete.
      </div>

      <P>
        These terms are the agreement between you and {OPERATOR.entity} for use of{" "}
        {OPERATOR.service} at {OPERATOR.site}. By creating an account you accept them.
      </P>

      <H>Who may use PEDMAS</H>
      <P>
        Accounts must be created by an adult. If you add a child profile you confirm that you are
        that child&rsquo;s parent or legal guardian and that you consent to us processing their
        learning information as set out in the Privacy Policy.
      </P>

      <H>The subscription</H>
      <P>
        A subscription costs {money(FIRST_CHILD_CENTS)} per month for the first child and{" "}
        {money(ADDITIONAL_CHILD_CENTS)} per month for each additional child, up to {MAX_CHILDREN}{" "}
        children on one account. The placement test is free.
      </P>
      <P>
        New subscriptions include a {TRIAL_DAYS}-day free trial. We do not charge during the trial.
        If you cancel before it ends you are not charged at all.
      </P>
      <P>
        After the trial the subscription renews automatically each month until cancelled. If you
        add or remove a child the monthly amount changes accordingly from the next billing period.
        Payments are processed by Stripe; we never see or store your card details.
      </P>

      <H>Cancelling and refunds</H>
      <P>
        You can cancel at any time from the billing page. Cancellation stops future charges and
        your access continues until the end of the period you have already paid for. We do not
        automatically refund part-used months, but if something has gone wrong please write to{" "}
        {OPERATOR.contactEmail} and we will deal with it fairly.
      </P>

      <H>Acceptable use</H>
      <P>
        Please use PEDMAS for learning. Do not attempt to break into other accounts, disrupt the
        service, scrape the question bank in bulk, or resell access. Accounts may be suspended for
        this kind of behaviour.
      </P>

      <H>What we provide, and what we don't promise</H>
      <P>
        PEDMAS teaches and assesses mathematics, and adapts to a child&rsquo;s demonstrated
        ability. It is a learning tool, not a substitute for school, and we do not promise any
        particular result, grade or examination outcome.
      </P>
      <P>
        We aim to keep the service available and correct, but we provide it &ldquo;as is&rdquo;.
        To the extent the law allows, our liability is limited to the amount you paid us in the
        twelve months before the issue arose. Nothing here excludes liability that cannot legally
        be excluded.
      </P>

      <H>Your content and ours</H>
      <P>
        The curriculum, lessons, generated questions and software are ours. You may use them for
        your family&rsquo;s own learning. Your account information and your children&rsquo;s
        learning records remain yours, and you may delete them at any time from the parent
        dashboard.
      </P>

      <H>Ending the agreement</H>
      <P>
        You may stop using PEDMAS and delete your account whenever you like. We may end the
        agreement if these terms are seriously or repeatedly breached, and we will tell you why.
      </P>

      <H>Changes</H>
      <P>
        We may update these terms. If a change is material we will ask you to accept the new
        version before continuing.
      </P>

      <H>Governing law</H>
      <P>These terms are governed by the laws of {OPERATOR.jurisdiction}.</P>

      <H>Contact</H>
      <P>
        {OPERATOR.entity}
        <br />
        {OPERATOR.address}
        <br />
        {OPERATOR.contactEmail}
      </P>

      <div className="mt-10 border-t border-ink-100 pt-5 text-sm text-ink-500">
        <Link href="/" className="font-semibold text-brand-700 hover:underline">
          ← Back to PEDMAS
        </Link>
      </div>
    </div>
  );
}
