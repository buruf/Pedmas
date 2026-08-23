import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Test isolation for the store.
 *
 * Tests exercise real store writes, and the store defaults to the same data/
 * directory the dev server uses — one suite run deleted the local admin
 * account outright. Worse, a developer with DATABASE_URL exported in their
 * shell would have pointed those writes at production.
 *
 * So, before anything imports the store: unset every connection variable and
 * send file-mode writes to a fresh temp directory for this run.
 */
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
delete process.env.NEON_DATABASE_URL;
process.env.PEDMAS_DATA_DIR = mkdtempSync(join(tmpdir(), "pedmas-test-"));
