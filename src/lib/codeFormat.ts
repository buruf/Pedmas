/**
 * Formats a child's sign-in code as they type it: "k7m29qxt4rbh" becomes
 * "K7M2-9QXT-4RBH" without the child having to find the hyphen key. Safe
 * for the browser (no Node imports); the server ignores punctuation anyway
 * (see normalizeCode in childSignIn.ts), so this is purely for the child.
 */
export const CODE_GROUP = 4;
export const CODE_GROUPS = 3;

export function formatCodeInput(raw: string): string {
  const chars = (raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_GROUP * CODE_GROUPS);
  const groups: string[] = [];
  for (let i = 0; i < chars.length; i += CODE_GROUP) groups.push(chars.slice(i, i + CODE_GROUP));
  return groups.join("-");
}
