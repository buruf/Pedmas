import Link from "next/link";
import { Logo, Card } from "@/components/ui";

export const metadata = { title: "Offline — PEDMAS" };

/** Shown by the service worker when the network is gone mid-use. */
export default function OfflinePage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <Card className="max-w-md text-center">
        <div className="text-4xl">📡</div>
        <h1 className="mt-2 text-xl font-black text-ink-900">You&rsquo;re offline</h1>
        <p className="mt-2 text-ink-700">
          PEDMAS needs the internet to check your answers and save your progress. Nothing you
          finished is lost — reconnect and pick up right where you were.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="btn inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-5 font-bold text-white hover:bg-brand-700"
          >
            Try again
          </Link>
        </div>
      </Card>
    </div>
  );
}
