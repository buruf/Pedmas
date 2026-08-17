/**
 * Runtime switches.
 *
 * Registration is CLOSED by default. The site is live on a real domain while
 * still being tested, and an account created now would collect a real
 * person's details — and a child's — into a product that is not finished.
 * Defaulting to closed means forgetting to set anything is the safe outcome.
 *
 * To open it, set REGISTRATION_OPEN=true in the environment and redeploy.
 */
export function registrationOpen(): boolean {
  return process.env.REGISTRATION_OPEN === "true";
}

export const REGISTRATION_CLOSED_TITLE = "Not open for new accounts yet";

export const REGISTRATION_CLOSED_MESSAGE =
  "PEDMAS is still being tested, so sign-ups are closed for now. " +
  "Existing accounts can still log in as usual.";
