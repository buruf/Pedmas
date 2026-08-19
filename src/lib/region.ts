/**
 * Regional variant of the teaching material.
 *
 * Two variants only. Trying to serve every country at once produces a
 * curriculum that fits nobody, so the split is between American conventions
 * and the international/Commonwealth ones used across the UK, Ireland,
 * Australia, New Zealand, South Africa, India and most of Africa and Asia.
 *
 * Detection is a default, never a lock: a parent can override it, because an
 * American family in Dubai should still get American spelling.
 */
export type Region = "US" | "INTL";

export const REGION_LABELS: Record<Region, string> = {
  US: "United States",
  INTL: "International (UK, Australia, NZ, and elsewhere)",
};

/**
 * Countries taught with American conventions — American spelling, and
 * customary units alongside metric. Everywhere else follows Commonwealth
 * conventions, which is the safer default for the rest of the world.
 */
const US_COUNTRIES = new Set(["US", "PR", "GU", "VI", "AS", "MP"]);

/** Region for an ISO country code, defaulting to international. */
export function regionForCountry(country: string | null | undefined): Region {
  if (!country) return "INTL";
  return US_COUNTRIES.has(country.toUpperCase()) ? "US" : "INTL";
}

/**
 * Commonwealth spelling -> American. Applied only in this direction, which
 * makes it idempotent: running it twice changes nothing, so it is safe to
 * apply after every render.
 *
 * Ordering matters. Longer forms come first so "centimetres" is handled
 * before the bare "metres" rule can reach it.
 */
const SPELLING: [RegExp, string][] = [
  // Units of length. The prefix group is required: a bare \bmetre\b would
  // never match inside "centimetre", and matching loosely would corrupt
  // "perimeter", "diameter" and "parameter" — none of which contain "metre".
  [/\b(centi|milli|kilo|deci)?metres\b/gi, "$1meters"],
  [/\b(centi|milli|kilo|deci)?metre\b/gi, "$1meter"],
  [/\b(centi|milli|kilo|deci)?litres\b/gi, "$1liters"],
  [/\b(centi|milli|kilo|deci)?litre\b/gi, "$1liter"],
  // Subject name.
  [/\bmaths\b/g, "math"],
  [/\bMaths\b/g, "Math"],
  // Shape whose name genuinely differs, and inverts, between the two.
  [/\btrapezium\b/g, "trapezoid"],
  [/\btrapeziums\b/g, "trapezoids"],
  [/\bTrapezium\b/g, "Trapezoid"],
  // -our -> -or
  [/\bcolour(s|ed|ing)?\b/g, "color$1"],
  [/\bColour(s|ed|ing)?\b/g, "Color$1"],
  [/\bfavourite(s)?\b/g, "favorite$1"],
  [/\bFavourite(s)?\b/g, "Favorite$1"],
  [/\bneighbour(s|ing)?\b/g, "neighbor$1"],
  [/\bbehaviour(s)?\b/g, "behavior$1"],
  // -re -> -er (only words where it is unambiguous)
  [/\bcentre(s|d)?\b/g, "center$1"],
  [/\bCentre(s|d)?\b/g, "Center$1"],
  // -ise -> -ize
  [/\b(organi|recogni|summari|analy|memori)se\b/g, "$1ze"],
  [/\b(organi|recogni|summari|analy|memori)sed\b/g, "$1zed"],
  [/\b(organi|recogni|summari|analy|memori)sing\b/g, "$1zing"],
  // The verb: American uses "practice" for both noun and verb.
  [/\bpractise(s|d)?\b/g, "practice$1"],
  [/\bPractise(s|d)?\b/g, "Practice$1"],
  [/\bpractising\b/g, "practicing"],
  [/\bPractising\b/g, "Practicing"],
  // Colour word used in shapes and charts.
  [/\bgrey\b/g, "gray"],
  [/\bGrey\b/g, "Gray"],
];

/**
 * Rewrite a string for the given region.
 *
 * Idempotent by construction: only Commonwealth forms are matched, and their
 * replacements never match again. That matters because lesson text is
 * transformed after render, which can happen more than once.
 */
export function localise(text: string, region: Region): string {
  if (region !== "US") return text;
  let out = text;
  for (const [pattern, replacement] of SPELLING) out = out.replace(pattern, replacement);
  return out;
}
