/**
 * Legal constants shared by the policy pages and the consent record.
 *
 * These documents are drafted to describe what this application actually
 * does. Operator details were completed on 2026-08-23 (BAAF Consulting
 * Inc.). They have not yet had a professional legal review — recommended
 * before or shortly after real payments begin, particularly because the
 * service is used by children.
 */

/** Bump when the wording changes materially, so consent is re-collected. */
export const POLICY_VERSION = "2026-08-23";

export const POLICY_EFFECTIVE = "23 August 2026";

/**
 * Operator details. These appear verbatim in the published policies —
 * a privacy policy without a contactable operator is not a valid one.
 */
export const OPERATOR = {
  service: "PEDMAS",
  site: "www.pedmas.com",
  entity: "BAAF Consulting Inc.",
  address: "67 Masters Green Cres, Brampton, Ontario L7A 3K6, Canada",
  /** Forwarded via name.com to a monitored inbox. */
  contactEmail: "privacy@pedmas.com",
  jurisdiction: "Ontario, Canada",
};

/** The age below which a parent or guardian must give consent. */
export const CHILD_AGE_THRESHOLD = 13;

/** Text a parent affirms at signup. Stored alongside the consent record. */
export const PARENT_CONSENT_STATEMENT =
  "I am the parent or legal guardian of any child I add to this account, and I consent to " +
  "PEDMAS collecting and using their learning information as described in the Privacy Policy.";

export const TERMS_ACCEPT_STATEMENT =
  "I agree to the Terms of Service and the Privacy Policy.";
