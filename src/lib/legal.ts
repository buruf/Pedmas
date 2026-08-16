/**
 * Legal constants shared by the policy pages and the consent record.
 *
 * IMPORTANT: these documents are drafted to describe what this application
 * actually does, but they have not been reviewed by a lawyer. The operator
 * details below must be filled in, and the whole set reviewed, before taking
 * real payments — particularly because the service is used by children.
 */

/** Bump when the wording changes materially, so consent is re-collected. */
export const POLICY_VERSION = "2026-08-16";

export const POLICY_EFFECTIVE = "16 August 2026";

/**
 * Operator details. These appear verbatim in the published policies, so they
 * must be real before launch — a privacy policy without a contactable
 * operator is not a valid one.
 */
export const OPERATOR = {
  service: "PEDMAS",
  site: "www.pedmas.com",
  /** TODO before launch: registered legal entity name. */
  entity: "[Operator legal entity — to be completed]",
  /** TODO before launch: postal address for privacy requests. */
  address: "[Registered address — to be completed]",
  /** TODO before launch: monitored mailbox for privacy and deletion requests. */
  contactEmail: "[privacy@pedmas.com — to be confirmed]",
  /** TODO before launch: governing jurisdiction for the terms. */
  jurisdiction: "[Jurisdiction — to be completed]",
};

/** The age below which a parent or guardian must give consent. */
export const CHILD_AGE_THRESHOLD = 13;

/** Text a parent affirms at signup. Stored alongside the consent record. */
export const PARENT_CONSENT_STATEMENT =
  "I am the parent or legal guardian of any child I add to this account, and I consent to " +
  "PEDMAS collecting and using their learning information as described in the Privacy Policy.";

export const TERMS_ACCEPT_STATEMENT =
  "I agree to the Terms of Service and the Privacy Policy.";
