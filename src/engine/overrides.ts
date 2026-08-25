/**
 * Curriculum overrides: the operational controls over curriculum-as-code.
 *
 * The curriculum itself deliberately lives in the repository — versioned,
 * tested by the full generation sweep, reviewed like any other change. What
 * an operator needs at runtime is narrower: when a skill's generator turns
 * out to be broken in production, pull that ONE skill from rotation now,
 * without a deploy, and put it back when it is fixed.
 *
 * Overrides are stored rows, cached here with a short TTL so the sync
 * progression engine can consult them without threading async everywhere.
 * Fail-open: no rows, or a store hiccup, means nothing is disabled.
 */
import { allRows, putRow, deleteRow } from "@/lib/store/db";

export interface CurriculumOverride {
  id: string; // the skill id
  disabled: boolean;
  reason: string;
  setBy: string;
  setAt: number;
}

let disabledIds = new Set<string>();
let loadedAt = 0;
const TTL_MS = 60_000;

export function isSkillDisabled(skillId: string): boolean {
  return disabledIds.has(skillId);
}

export function disabledSkillIds(): ReadonlySet<string> {
  return disabledIds;
}

/** Refresh the cache. Call at API boundaries before building sessions. */
export async function loadOverrides(force = false): Promise<void> {
  if (!force && Date.now() - loadedAt < TTL_MS) return;
  try {
    const rows = await allRows<CurriculumOverride>("curriculumOverrides");
    disabledIds = new Set(rows.filter((r) => r.disabled).map((r) => r.id));
    loadedAt = Date.now();
  } catch {
    // Keep whatever we had; never let the override layer break practice.
  }
}

export async function setSkillDisabled(
  skillId: string,
  disabled: boolean,
  setBy: string,
  reason: string
): Promise<void> {
  if (disabled) {
    await putRow<CurriculumOverride>("curriculumOverrides", skillId, {
      id: skillId,
      disabled: true,
      reason: reason.slice(0, 300),
      setBy,
      setAt: Date.now(),
    });
  } else {
    await deleteRow("curriculumOverrides", skillId);
  }
  await loadOverrides(true);
}

export async function listOverrides(): Promise<CurriculumOverride[]> {
  return allRows<CurriculumOverride>("curriculumOverrides");
}
