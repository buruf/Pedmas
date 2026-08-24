import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { focusSkillFor, buildPracticeSession, type LearnerState } from "@/engine/practice";
import { strandEntrySkill, strandChain } from "@/curriculum";

/**
 * The dashboard, the learning path and the session must name the SAME topic.
 *
 * They did not: the path marked every strand's pointer "Current", so a
 * student saw three current topics at once while the dashboard and the
 * practice session both named a fourth. Three screens, three answers, for a
 * product whose whole promise is "one thing at a time".
 */

function learner(): LearnerState {
  const strandLevels = { trig: 12, stats: 12, functions: 12 };
  const pointers: Record<string, string> = {};
  for (const [sid, g] of Object.entries(strandLevels)) {
    pointers[sid] = strandEntrySkill(sid, g)?.id ?? "";
  }
  return { grade: 11, strandLevels, pointers, skills: {} };
}

/** Recompute the path's status rule exactly as the route does. */
function pathStatuses(state: LearnerState) {
  const focusId = focusSkillFor(state)?.skill.id;
  const out: { id: string; status: string }[] = [];
  for (const sid of Object.keys(state.strandLevels)) {
    const level = state.strandLevels[sid];
    const pointer = state.pointers[sid];
    const chain = strandChain(sid).filter(
      (s) => s.grade >= Math.max(1, level - 1) && s.grade <= Math.min(12, level + 1)
    );
    const pointerIdx = chain.findIndex((s) => s.id === pointer);
    chain.forEach((s, i) => {
      const isPointer = s.id === pointer || (pointerIdx === -1 && i === 0);
      const status = state.skills[s.id]?.mastered
        ? "Mastered"
        : s.id === focusId
          ? "Current"
          : isPointer
            ? "Next up"
            : i < pointerIdx
              ? "Ready to Learn"
              : "Locked";
      out.push({ id: s.id, status });
    });
  }
  return out;
}

describe("all three screens agree", () => {
  it("marks exactly one skill Current across the whole path", () => {
    const current = pathStatuses(learner()).filter((s) => s.status === "Current");
    expect(current.length, `path showed ${current.length} current topics`).toBe(1);
  });

  it("the Current skill is the one the session actually practises", () => {
    const state = learner();
    const current = pathStatuses(state).find((s) => s.status === "Current")!;
    const items = buildPracticeSession(state, { now: Date.now(), seed: 4 });
    const practised = new Set(items.filter((i) => !i.isReview).map((i) => i.question.skillId));
    expect([...practised]).toEqual([current.id]);
  });

  it("the dashboard focus is that same skill", () => {
    const state = learner();
    const current = pathStatuses(state).find((s) => s.status === "Current")!;
    expect(focusSkillFor(state)?.skill.id).toBe(current.id);
  });

  it("other strands are queued, not presented as current", () => {
    const statuses = pathStatuses(learner());
    expect(statuses.filter((s) => s.status === "Next up").length).toBeGreaterThan(0);
  });

  it("the route really uses the shared focus, not its own idea of current", () => {
    const route = readFileSync(join(process.cwd(), "src/app/api/students/[id]/path/route.ts"), "utf8");
    expect(route, "path must derive Current from focusSkillFor").toMatch(/focusSkillFor/);
    expect(route, "Current must be the focus skill").toMatch(/s\.id === focusId/);
  });
});
