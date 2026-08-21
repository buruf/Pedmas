/** Detailed per-family CAS report. */
import { allSkills } from "../src/curriculum";
import { generateQuestion } from "../src/engine/generate";
import { casCheck } from "../src/engine/casAudit";

interface Row { grade: Set<number>; total: number; checked: number; passed: number; checkers: Set<string> }
const rows = new Map<string, Row>();
const failures: string[] = [];

for (const skill of allSkills().filter((s) => s.grade >= 8)) {
  for (let stage = 1; stage <= 5; stage++) {
    for (let s = 0; s < 6; s++) {
      let q;
      try { q = generateQuestion(skill, stage, { seed: 40 + s * 1097 }); } catch { continue; }
      const r = rows.get(skill.family) ?? { grade: new Set(), total: 0, checked: 0, passed: 0, checkers: new Set() };
      r.grade.add(skill.grade); r.total++;
      const v = casCheck(q);
      if (v.checked) { r.checked++; r.checkers.add(v.checker!); if (v.ok) r.passed++; else failures.push(`${skill.id} s${stage}: ${v.detail}`); }
      rows.set(skill.family, r);
    }
  }
}

const sorted = [...rows.entries()].sort((a, b) => b[1].checked - a[1].checked);
let tc = 0, tp = 0, tt = 0;
console.log("family                    | grades | questions | checked | passed | coverage | checkers");
for (const [fam, r] of sorted) {
  tc += r.checked; tp += r.passed; tt += r.total;
  const g = [...r.grade].sort((a, b) => a - b);
  const gr = g.length > 1 ? `${g[0]}-${g[g.length - 1]}` : String(g[0]);
  console.log(
    `${fam.padEnd(25)} | ${gr.padEnd(6)} | ${String(r.total).padStart(9)} | ${String(r.checked).padStart(7)} | ${String(r.passed).padStart(6)} | ${String(Math.round((r.checked / r.total) * 100) + "%").padStart(8)} | ${[...r.checkers].join(", ")}`
  );
}
console.log(`\nTOTAL: ${tt} questions | ${tc} checked (${Math.round((tc / tt) * 100)}%) | ${tp} passed | ${tc - tp} FAILED`);
if (failures.length) { console.log("\nFAILURES:"); failures.slice(0, 20).forEach((f) => console.log("  " + f)); }
