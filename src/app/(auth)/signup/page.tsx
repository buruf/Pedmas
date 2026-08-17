import Link from "next/link";
import { Logo, Card, PrimaryButton } from "@/components/ui";
import {
  registrationOpen,
  REGISTRATION_CLOSED_TITLE,
  REGISTRATION_CLOSED_MESSAGE,
} from "@/lib/flags";
import { SignupForm } from "./SignupForm";

/**
 * Server component so the closed state is decided before anything renders —
 * a form that only fails on submit wastes the visitor's time and looks broken.
 */
export default function SignupPage() {
  if (registrationOpen()) return <SignupForm />;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </div>
      <Card>
        <div className="text-center">
          <div className="text-3xl">🚧</div>
          <h1 className="mt-2 text-xl font-extrabold text-ink-900">
            {REGISTRATION_CLOSED_TITLE}
          </h1>
          <p className="mt-2 text-sm text-ink-700">{REGISTRATION_CLOSED_MESSAGE}</p>
        </div>
        <div className="mt-6 space-y-3">
          <PrimaryButton href="/login" className="w-full">
            Log in to an existing account
          </PrimaryButton>
          <Link
            href="/curriculum"
            className="btn block w-full rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700"
          >
            Explore the curriculum
          </Link>
        </div>
      </Card>
    </div>
  );
}
