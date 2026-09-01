import { describe, it, expect } from "vitest";
import { allSkills, getSkill } from "@/curriculum";
import { currentSkillFor } from "@/engine/practice";

/**
 * Tier 3 of the August 2026 curriculum audit: every misplaced skill flagged
 * in both standards turned out to duplicate content that already exists at
 * the correct grade — Grade 3 "Triangles" vs Grade 4-5 classification,
 * Grade 8 "Coordinate Plane" vs the identical Grade 5 skill, the Grade 12
 * sequence block vs Grade 11, and so on. Tier 3 is therefore 29 removals.
 * The danger of removing a live skill id is a placed student whose strand
 * pointer references it: without healing that strand stalls silently.
 */

describe("the duplicate skills are gone and their keepers remain", () => {
  const cases: [string, string][] = [
    // [removed id, the keeper at the correct grade]
    ["g1.number.odd-and-even-numbers", "g2.number.even-and-odd-numbers"],
    ["g1.measurement.centimetres", "g2.measurement.centimetres"],
    ["g2.geometry.angles", "g4.geometry.angles"],
    ["g2.geometry.symmetry", "g3.geometry.symmetry"],
    ["g2.fractions.unit-fractions", "g3.fractions.unit-fractions"],
    ["g2.operations.multiplication-by-2", "g3.operations.multiplication-by-2"],
    ["g3.geometry.triangles", "g4.geometry.triangles"],
    ["g3.geometry.right-angles", "g4.geometry.angle-measurement"],
    ["g7.ratios.similar-figures", "g8.geometry.similarity"],
    ["g8.algebra.coordinate-plane", "g5.geometry.coordinate-plane"],
    ["g8.algebra.ordered-pairs", "g6.geometry.coordinate-plane"],
    ["g9.number.radicals", "g10.algebra.simplifying-radicals"],
    ["g9.algebra.one-step-equations", "g7.algebra.one-step-equations"],
    ["g9.stats.simple-probability", "g7.stats.simple-probability"],
    ["g9.stats.compound-probability", "g7.stats.compound-probability"],
    ["g11.trig.angle-sum-identities", "g12.trig.compound-angle-identities"],
    ["g11.trig.double-angle-identities", "g12.trig.double-angle-identities"],
    ["g12.functions.arithmetic-sequences", "g11.functions.arithmetic-sequences"],
    ["g12.functions.geometric-series", "g11.functions.geometric-series"],
  ];
  for (const [removed, keeper] of cases) {
    it(`${removed} → ${keeper}`, () => {
      expect(getSkill(removed), "should have been removed").toBeUndefined();
      expect(getSkill(keeper), "keeper must exist").toBeDefined();
    });
  }

  it("29 duplicates removed, missing topics added (634 → 605 → 607)", () => {
    // The additions: g6 Nets of 3D Shapes (CCSS 6.G.A.4) and g8 Transforming
    // Shapes (8.G.A.1-3) — spec topics with no content at all. g8 Congruence
    // kept its id but was repointed from the similarity family (mislabeled —
    // it taught scale factors) to the real congruence family.
    expect(allSkills().length).toBe(607);
    expect(getSkill("g6.geometry.nets-of-3d-shapes")).toBeDefined();
    expect(getSkill("g8.geometry.congruence")?.family).toBe("congruence");
    expect(getSkill("g8.geometry.transforming-shapes")).toBeDefined();
  });
});

describe("a pointer to a removed skill heals instead of stalling", () => {
  it("re-anchors at the placed level and rewrites the pointer", () => {
    const learner = {
      grade: 3,
      strandLevels: { geometry: 3 },
      pointers: { geometry: "g3.geometry.triangles" },
      skills: {},
    };
    const skill = currentSkillFor(learner, "geometry");
    expect(skill, "the strand must not stall").toBeDefined();
    expect(getSkill(skill!.id), "must resolve to a live skill").toBeDefined();
    expect(skill!.strandId).toBe("geometry");
  });

  it("an intact pointer is untouched", () => {
    const learner = {
      grade: 3,
      strandLevels: { geometry: 3 },
      pointers: { geometry: "g3.geometry.quadrilaterals" },
      skills: {},
    };
    expect(currentSkillFor(learner, "geometry")!.id).toBe("g3.geometry.quadrilaterals");
  });
});
