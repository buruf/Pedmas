import Link from "next/link";
import { Logo } from "@/components/ui";
import { OPERATOR, POLICY_EFFECTIVE, CHILD_AGE_THRESHOLD } from "@/lib/legal";
import { DORMANT_DAYS, WARNING_LEAD_DAYS } from "@/lib/retention";

const RETENTION_MONTHS = Math.round(DORMANT_DAYS / 30.44);

export const metadata = {
  title: "Privacy Policy — PEDMAS",
  description: "What PEDMAS collects about you and your child, why, and how to delete it.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-extrabold text-ink-900">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-ink-700">{children}</p>;
}
function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-700">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link href="/terms" className="text-sm font-semibold text-brand-700 hover:underline">
          Terms of Service →
        </Link>
      </header>

      <h1 className="text-3xl font-black text-ink-900">Privacy Policy</h1>
      <p className="mt-1 text-sm text-ink-500">Effective {POLICY_EFFECTIVE}</p>

      <P>
        {OPERATOR.service} is a mathematics learning service at {OPERATOR.site}, operated by{" "}
        {OPERATOR.entity}. This policy explains what we collect, why we collect it, and how you
        remove it. It covers parents and children alike.
      </P>

      <H>Who holds an account</H>
      <P>
        Accounts are held by adults. A parent or guardian creates the account and adds a profile
        for each child. Children do not create their own accounts and we do not ask children for
        contact details.
      </P>

      <H>What we collect</H>
      <P>About the account holder:</P>
      <List
        items={[
          "Name and email address, so we can identify the account and send service messages.",
          "A password, stored only as a salted scrypt hash. We never store the password itself and cannot recover it.",
          "Subscription status and billing identifiers supplied by Stripe. Card details are handled entirely by Stripe and never reach our servers.",
        ]}
      />
      <P>About each child profile:</P>
      <List
        items={[
          "A first name or nickname chosen by the parent. A real name is not required, and a nickname is fine.",
          "School grade, and optionally age and a learning goal.",
          "Learning activity: which questions were answered, whether each was correct, hints used, placement results, mastery levels and streaks.",
        ]}
      />
      <P>
        We do not collect a child&rsquo;s address, phone number, photograph, precise location, or
        any biometric data. We do not ask children to write free text about themselves, and we do
        not run advertising or third-party tracking on the service.
      </P>

      <H>Why we collect it</H>
      <List
        items={[
          "To place a child at the right level and choose their next question — the core purpose of the service.",
          "To show a parent how their child is progressing.",
          "To keep the account secure and to take payment for the subscription.",
        ]}
      />
      <P>
        We do not sell personal information, and we do not use children&rsquo;s learning data for
        advertising or to build profiles for any purpose other than teaching them mathematics.
      </P>

      <H>Children under {CHILD_AGE_THRESHOLD}</H>
      <P>
        A parent or guardian must consent before a child profile is created, and we record that
        consent with the date and the version of this policy. A parent may at any time review what
        we hold about their child, correct it, or delete it — see below. Deleting a child profile
        removes their learning history.
      </P>

      <H>Deleting your data</H>
      <P>
        You are in control. From your parent dashboard you can delete an individual child profile,
        or your entire account. Deleting the account removes the account record, every child
        profile on it and all associated learning history from our database.
      </P>
      <P>
        Deletion is immediate and cannot be undone. Records we are required to keep for accounting
        or fraud-prevention purposes, such as Stripe payment records, are retained by Stripe under
        their own policy. You can also write to {OPERATOR.contactEmail} and ask us to do it for you.
      </P>

      <H>How long we keep it</H>
      <P>
        Learning data is kept while the account is in use, because progress and spaced review
        depend on history. If you delete a profile or account it goes immediately.
      </P>
      <P>
        We do not keep it indefinitely. If nobody signs in and no child practises for{" "}
        {RETENTION_MONTHS} months, we email the account holder a warning and then, {WARNING_LEAD_DAYS}{" "}
        days later, permanently delete the account and every child profile and learning record on
        it. Signing in at any point resets the clock, and an account with an active subscription is
        never deleted this way. This runs automatically — it is not something you have to ask for.
      </P>

      <H>Who else sees it</H>
      <List
        items={[
          "Stripe — payment processing and subscription status.",
          "Neon — the database that stores account and learning records.",
          "Vercel — hosting and delivery of the website.",
          "Brevo — sending service email such as password resets and progress summaries.",
        ]}
      />
      <P>
        These providers process data on our instructions in order to run the service. We do not
        share personal information with anyone else, and we never sell it.
      </P>

      <H>Security</H>
      <P>
        Passwords are hashed with scrypt and a per-account salt. Sessions use signed, HTTP-only
        cookies. Traffic is served over HTTPS. Sign-in and password-reset attempts are rate
        limited. No system is perfectly secure, but we do not store card numbers and we keep what
        we do store to a minimum.
      </P>

      <H>Your rights</H>
      <P>
        Depending on where you live you may have rights to access, correct, export or delete
        personal information, and to withdraw consent. The deletion controls in the app cover the
        common cases immediately; for anything else, write to {OPERATOR.contactEmail} and we will
        respond.
      </P>

      <H>Changes</H>
      <P>
        If we change this policy materially we will ask account holders to review and accept the
        new version before continuing to use the service.
      </P>

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
