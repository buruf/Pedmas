#!/usr/bin/env node
/**
 * Push and PROVE it deployed.
 *
 * A push is not a deploy. On 2026-09-01 a commit reached GitHub, Vercel's
 * webhook never fired, and production quietly kept serving the previous
 * commit — discovered only by chance. Nothing prevents that webhook from
 * failing again, so this script removes the need for it to be reliable:
 * it pushes, watches what production actually reports it is running, and
 * deploys directly if the webhook has not delivered in time.
 *
 * Usage:  npm run deploy          push HEAD and confirm it goes live
 *         npm run deploy:check    only ask what is live right now
 *
 * Exits non-zero if production is not running HEAD when it finishes, so a
 * silent failure is impossible.
 */
import { execSync } from "node:child_process";

const SITE = process.env.PEDMAS_SITE ?? "https://www.pedmas.com";
const WEBHOOK_GRACE_MS = 3 * 60 * 1000; // how long to let the webhook try
const POLL_MS = 10_000;
const AFTER_DEPLOY_MS = 5 * 60 * 1000;

const sh = (cmd) => execSync(cmd, { encoding: "utf8" }).trim();
const log = (m) => console.log(m);

async function liveSha() {
  try {
    const res = await fetch(`${SITE}/api/version`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = await res.json();
    return typeof body.sha === "string" ? body.sha : null;
  } catch {
    return null; // network blip: treat as unknown, keep polling
  }
}

/** Poll until production reports `want`, or the deadline passes. */
async function waitForSha(want, ms, label) {
  const until = Date.now() + ms;
  let last = null;
  while (Date.now() < until) {
    const live = await liveSha();
    if (live === want) return true;
    if (live !== last) {
      log(`   live: ${live ? live.slice(0, 7) : "unknown"} (want ${want.slice(0, 7)}) — ${label}`);
      last = live;
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return false;
}

const checkOnly = process.argv.includes("--check");
const head = sh("git rev-parse HEAD");

if (checkOnly) {
  const live = await liveSha();
  log(`local HEAD : ${head}`);
  log(`live commit: ${live ?? "unknown (older build without /api/version)"}`);
  if (live === head) {
    log("✓ production is running HEAD");
    process.exit(0);
  }
  log("✗ production is NOT running HEAD — run: npm run deploy");
  process.exit(1);
}

// A deploy must not carry work that was never committed.
if (sh("git status --porcelain")) {
  log("✗ working tree is dirty — commit or stash first.");
  process.exit(1);
}

const branch = sh("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") {
  log(`✗ on branch "${branch}" — production deploys come from main.`);
  process.exit(1);
}

log(`Pushing ${head.slice(0, 7)} to origin/main…`);
try {
  execSync("git push origin main", { stdio: "inherit" });
} catch {
  log("✗ push failed — nothing was deployed.");
  process.exit(1);
}

// The push can succeed while the remote ref lags or a proxy swallows it, so
// confirm GitHub really has this commit before waiting on any webhook.
const remote = sh("git ls-remote origin refs/heads/main").split(/\s+/)[0];
if (remote !== head) {
  log(`✗ origin/main is ${remote.slice(0, 7)}, not ${head.slice(0, 7)} — push did not land.`);
  process.exit(1);
}
log("✓ on GitHub. Waiting for the auto-deploy…");

if (await waitForSha(head, WEBHOOK_GRACE_MS, "waiting for webhook")) {
  log(`✓ deployed by webhook — production is running ${head.slice(0, 7)}`);
  process.exit(0);
}

// The webhook did not deliver. Deploy directly rather than leaving the work
// stranded; the tree is clean and matches HEAD, so this ships the same code.
log("! webhook did not deliver in time — deploying directly.");
try {
  execSync("vercel --prod --yes", { stdio: "inherit" });
} catch {
  log("✗ direct deploy failed. Production is NOT running HEAD.");
  process.exit(1);
}

if (await waitForSha(head, AFTER_DEPLOY_MS, "waiting for direct deploy")) {
  log(`✓ deployed directly — production is running ${head.slice(0, 7)}`);
  process.exit(0);
}

log("✗ production is still not running HEAD. Check https://vercel.com/eduyro-s-projects/pedmas");
process.exit(1);
