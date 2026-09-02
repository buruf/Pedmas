"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

/**
 * Sign out, from anywhere.
 *
 * Every signed-in surface needs this, not just the parent hub: an admin
 * console with no way out is a security problem, and a child practising on a
 * shared family tablet must be able to leave their own session — otherwise
 * the next person to pick up the device is still them.
 *
 * Navigates with a hard load rather than a client route so no cached
 * client state survives the sign-out.
 */
export function LogoutButton({
  label = "Log out",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={
        className ??
        "btn rounded-xl px-3 py-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
      }
      onClick={async () => {
        await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
        // Replace, not push: Back must not land on a signed-in screen.
        router.replace("/");
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
