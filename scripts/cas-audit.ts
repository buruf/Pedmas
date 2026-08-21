/** Full CAS audit over grades 8-12: npx tsx scripts/cas-audit.ts */
import { allSkills } from "../src/curriculum";
import { generateQuestion } from "../src/engine/generate";
import { casCheck } from "../src/engine/casAudit";

let checked = 0, passed = 0, skipped = 0;
const failures: string[] = [];
const byChecker = new Map<string, number>();
const uncoveredFamilies = new Map<string, number>();

for (const skill of allSkills().filter((s) => s.grade >= 8)) {
  for (let stage = 1; stage <= 5; stage++) {
    for (let s = 0; s < 6; s++) {
      let q;
      try {
        q = generateQuestion(skill, stage, { seed: 40 + s * 1097 });
      } catch { continue; }
      const v = casCheck(q);
      if (!v.checked) {
        skipped++;
        uncoveredFamilies.set(skill.family, (uncoveredFamilies.get(skill.family) ?? 0) + 1);
        continue;
      }
      checked++;
      byChecker.set(v.checker!, (byChecker.get(v.checker!) ?? 0) + 1);
      if (v.ok) passed++;
      else failures.push(`${skill.id} s${stage}: [${v.checker}] ${v.detail}\n    P: ${q.prompt.split("\n")[0]}\n    A: ${q.answer}`);
    }
  }
}

console.log(`checked ${checked} | passed ${passed} | FAILED ${failures.length} | no checker ${skipped}`);
console.log("\nby checker:", [...byChecker.entries()].map(([k, n]) => `${k}:${n}`).join("  "));
console.log("\nfailures:");
for (const f of failures.slice(0, 25)) console.log("  " + f);
if (failures.length > 25) console.log(`  ... and ${failures.length - 25} more`);
console.log("\ntop unchecked families:", [...uncoveredFamilies.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,n])=>`${k}:${n}`).join("  "));
