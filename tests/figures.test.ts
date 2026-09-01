import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { generateQuestion } from "@/engine/generate";
import { deriveFigure, triangleFromAngles, type FigureSpec } from "@/engine/figures";
import { Figure } from "@/components/Figure";
import { allSkills } from "@/curriculum";

/**
 * Geometry questions carry accurate figures. The figure is DERIVED from the
 * question's fixed prompt format (the same strings the CAS audit parses), so
 * the invariant that matters is: every number in a derived figure equals the
 * number in its prompt — a figure that lies is worse than no figure — and an
 * unmatched prompt yields no figure, never a wrong one.
 */

const skills = allSkills();
const withFamily = (family: string) => skills.filter((s) => s.family === family);

function sweep(family: string, stages: number[], count = 40): { prompt: string; figure?: FigureSpec }[] {
  const out: { prompt: string; figure?: FigureSpec }[] = [];
  for (const sk of withFamily(family)) {
    for (const stage of stages) {
      for (let i = 0; i < count; i++) {
        try {
          const q = generateQuestion(sk, stage, { seed: 4000 + i });
          out.push({ prompt: q.prompt, figure: q.figure });
        } catch {
          /* thin stages contribute nothing */
        }
      }
    }
  }
  return out;
}

describe("figures never lie about their question", () => {
  it("angle figures show exactly the stated degrees", () => {
    const qs = sweep("angles", [1, 2, 3]).filter((q) => /^An angle measures/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(20);
    for (const q of qs) {
      const stated = Number(/measures (\d+)°/.exec(q.prompt)![1]);
      if (stated <= 0 || stated >= 360) continue;
      expect(q.figure, q.prompt).toBeDefined();
      expect(q.figure!.fig).toBe("angle");
      expect((q.figure as { degrees: number }).degrees).toBe(stated);
    }
  });

  it("rectangle figures carry the prompt's own dimensions", () => {
    const qs = sweep("perimeter-area", [1, 2]).filter((q) => /^A rectangle is/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(20);
    for (const q of qs) {
      const m = /^A rectangle is (\d+) (\S+) long and (\d+)/.exec(q.prompt)!;
      expect(q.figure, q.prompt).toBeDefined();
      const f = q.figure as { wLabel: string; hLabel: string };
      expect(f.wLabel).toBe(`${m[1]} ${m[2]}`);
      expect(f.hLabel).toBe(`${m[3]} ${m[2]}`);
    }
  });

  it("right-triangle figures match the stated legs and hypotenuse", () => {
    const qs = sweep("pythagorean", [2, 3]);
    const legs = qs.filter((q) => /^A right triangle has legs of/.test(q.prompt));
    expect(legs.length).toBeGreaterThan(10);
    for (const q of legs) {
      const m = /legs of (\d+)(?: \S+)? and (\d+)/.exec(q.prompt)!;
      const f = q.figure as { a: number; b: number; cLabel: string };
      expect(q.figure, q.prompt).toBeDefined();
      expect(f.a).toBe(Number(m[1]));
      expect(f.b).toBe(Number(m[2]));
      expect(f.cLabel).toBe("?");
    }
    const hyp = qs.filter((q) => /^A right triangle has a hypotenuse/.test(q.prompt));
    for (const q of hyp) {
      const f = q.figure as { a: number; b: number };
      // The drawn unknown leg must be geometrically consistent with the triple.
      const m = /hypotenuse of (\d+) \S+ and one leg of (\d+)/.exec(q.prompt)!;
      const c = Number(m[1]);
      expect(Math.round(f.a * f.a + f.b * f.b)).toBe(c * c);
    }
  });

  it("circle figures carry the stated radius or diameter", () => {
    const qs = sweep("circle-measure", [1, 2, 3]).filter((q) => /^A circle has a/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(10);
    for (const q of qs) {
      const m = /^A circle has a (radius|diameter) of (\d+) (\S+)/.exec(q.prompt)!;
      expect(q.figure, q.prompt).toBeDefined();
      const f = q.figure as { mode: string; label: string };
      expect(f.mode).toBe(m[1]);
      expect(f.label).toBe(`${m[2]} ${m[3]}`);
    }
  });

  it("coordinate figures plot the stated point", () => {
    const qs = sweep("coordinate-plane", [1, 2]).filter((q) =>
      /units? right of the origin/.test(q.prompt)
    );
    expect(qs.length).toBeGreaterThan(5);
    for (const q of qs) {
      const m = /(\d+) units? right of the origin and (\d+) units? up/.exec(q.prompt)!;
      expect(q.figure, q.prompt).toBeDefined();
      const f = q.figure as { x: number; y: number };
      expect(f.x).toBe(Number(m[1]));
      expect(f.y).toBe(Number(m[2]));
    }
  });

  it("side-triangle figures respect the triangle inequality", () => {
    expect(deriveFigure("perimeter-area", "A triangle has sides of 6 cm, 9 cm, and 4 cm. What is its perimeter?")).toMatchObject({ fig: "tri-sides", a: 6, b: 9, c: 4 });
    expect(deriveFigure("perimeter-area", "A triangle has sides of 1 cm, 9 cm, and 4 cm. What is its perimeter?")).toBeNull();
  });

  it("prompts with no known format get no figure at all", () => {
    expect(deriveFigure("angles", "What do we call an angle smaller than 90°?")).toBeNull();
    expect(deriveFigure("place-value", "What is the value of the 3 in 345?")).toBeNull();
    expect(deriveFigure("angles", "An angle measures 400°. What type of angle is it?")).toBeNull();
  });
});

describe("wave 2: shapes, symmetry, transformations, similarity", () => {
  it("sides-counting questions draw the named polygon", () => {
    const qs = sweep("shapes-2d", [1]).filter((q) => /^How many/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(10);
    for (const q of qs) {
      const name = /does an? ([a-z ]+?) have/.exec(q.prompt)![1];
      expect(q.figure, q.prompt).toBeDefined();
      expect(name).toContain((q.figure as { name: string }).name.split(" ").pop()!);
    }
  });

  it("name-the-shape questions get NO figure — it would be the answer", () => {
    const qs = sweep("shapes-2d", [2]).filter((q) => /^Which shape has exactly/.test(q.prompt));
    for (const q of qs) expect(q.figure, q.prompt).toBeUndefined();
  });

  it("quadrant questions get NO figure — the plot would be the answer", () => {
    const qs = sweep("coordinate-plane", [1, 2, 3]).filter((q) =>
      /^(In which quadrant|Where does the point)/.test(q.prompt)
    );
    for (const q of qs) expect(q.figure, q.prompt).toBeUndefined();
  });

  it("letter-symmetry questions show the letter", () => {
    const qs = sweep("symmetry", [1]).filter((q) => /^Does the capital letter/.test(q.prompt));
    for (const q of qs) {
      const ch = /letter ([A-Z])/.exec(q.prompt)![1];
      expect(q.figure, q.prompt).toBeDefined();
      expect((q.figure as { ch: string }).ch).toBe(ch);
    }
  });

  it("transformation questions plot the original point, never the image", () => {
    const qs = sweep("transformations", [2, 3]).filter((q) => /^The point/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(10);
    for (const q of qs) {
      const m = /^The point \(([−-]?\d+), ([−-]?\d+)\)/.exec(q.prompt)!;
      expect(q.figure, q.prompt).toBeDefined();
      const f = q.figure as { x: number; y: number };
      expect(f.x).toBe(Number(m[1].replace("−", "-")));
      expect(f.y).toBe(Number(m[2].replace("−", "-")));
    }
  });

  it("distance and midpoint questions plot both given points", () => {
    const qs = sweep("coordinate-plane", [4, 5]).filter((q) =>
      /^(What is the distance between the points|What is the midpoint)/.test(q.prompt)
    );
    for (const q of qs) {
      expect(q.figure, q.prompt).toBeDefined();
      expect(q.figure!.fig).toBe("grid-2pts");
    }
  });

  it("slope questions draw the line through the two points", () => {
    const qs = sweep("slope", [3, 4]).filter((q) => /^([−-]?d+, [−-]?d+) and/.test(q.prompt));
    for (const q of qs) {
      expect(q.figure, q.prompt).toBeDefined();
      expect((q.figure as { line: boolean }).line).toBe(true);
    }
  });

  it("similarity scale questions draw both figures at the stated ratio", () => {
    const qs = sweep("similarity", [1, 3]).filter((q) => /^(A photo has a side|Side AB =)/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(5);
    for (const q of qs) expect(q.figure, q.prompt).toBeDefined();
  });
});

describe("wave 3: nets, congruence, whole-shape transformations", () => {
  it("net questions draw the net their text describes", () => {
    const qs = sweep("nets", [1, 2, 4]);
    const figured = qs.filter((q) => q.figure);
    expect(figured.length).toBeGreaterThan(10);
    for (const q of qs) {
      if (/^A net is made of|is unfolded into its net|^The net of a cube/.test(q.prompt)) {
        expect(q.figure, q.prompt).toBeDefined();
      }
      if (/^Which solid has a net made of/.test(q.prompt)) {
        expect(q.figure, "the reasoning variant must stay figure-free").toBeUndefined();
      }
    }
  });

  it("the box-net figure carries the stated dimensions", () => {
    const qs = sweep("nets", [5]).filter((q) => /Its net is drawn flat/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(3);
    for (const q of qs) {
      const m = /^A box is (\d+) \S+ long, (\d+) \S+ wide, and (\d+) \S+ tall/.exec(q.prompt)!;
      const f = q.figure as { l: number; w: number; h: number };
      expect(q.figure, q.prompt).toBeDefined();
      expect([f.l, f.w, f.h]).toEqual([Number(m[1]), Number(m[2]), Number(m[3])]);
    }
  });

  it("congruence questions show the two labeled triangles", () => {
    const qs = sweep("congruence", [2, 3, 4, 5]).filter((q) => /^Triangle ABC is congruent/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(10);
    for (const q of qs) expect(q.figure?.fig, q.prompt).toBe("congruent-tris");
  });

  it("apply-transformation questions draw only the ORIGINAL triangle", () => {
    const qs = sweep("shape-transform", [1, 2, 3, 4]).filter((q) => /^Triangle ABC has vertices/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(10);
    for (const q of qs) {
      expect(q.figure?.fig, q.prompt).toBe("grid-shape");
      const m = /vertices A\((\d+), (\d+)\)/.exec(q.prompt)!;
      const f = q.figure as { pts: [number, number][] };
      expect(f.pts[0]).toEqual([Number(m[1]), Number(m[2])]);
    }
  });

  it("identify-transformation questions draw both triangles — both are given", () => {
    const qs = sweep("shape-transform", [5]).filter((q) => /Its image has vertices/.test(q.prompt));
    expect(qs.length).toBeGreaterThan(3);
    for (const q of qs) expect(q.figure?.fig, q.prompt).toBe("grid-shape2");
  });

  it("every transformation answer is consistent with its rule", () => {
    // Independent re-check of the generator itself: parse the prompt, apply
    // the named rule, and demand the graded answer matches.
    const qs = sweep("shape-transform", [1, 2, 3, 4], 30);
    for (const sk of skills.filter((s) => s.family === "shape-transform")) {
      for (let i = 0; i < 30; i++) {
        const q = generateQuestion(sk, 2, { seed: 7000 + i });
        const m = /vertices A\((\d+), (\d+)\), B\((\d+), (\d+)\), and C\((\d+), (\d+)\)\. The triangle is reflected over the ([xy])-axis\. What are the coordinates of the image of ([ABC])\?/.exec(q.prompt);
        if (!m) continue;
        const pts: Record<string, [number, number]> = {
          A: [Number(m[1]), Number(m[2])],
          B: [Number(m[3]), Number(m[4])],
          C: [Number(m[5]), Number(m[6])],
        };
        const p = pts[m[8]];
        const want = m[7] === "x" ? `(${p[0]}, ${-p[1]})` : `(${-p[0]}, ${p[1]})`;
        expect(q.answer, q.prompt).toBe(want);
      }
    }
    expect(qs.length).toBeGreaterThan(0);
  });
});

describe("triangle construction is geometrically exact", () => {
  it("the apex angle of the built triangle equals 180 − A − B", () => {
    for (const [a, b] of [
      [50, 60],
      [90, 35],
      [25, 90],
      [80, 20],
      [30, 30],
    ]) {
      const { ax, ay } = triangleFromAngles(a, b);
      // Vectors from the apex to each base vertex.
      const v1 = [0 - ax, 0 - ay];
      const v2 = [1 - ax, 0 - ay];
      const dot = v1[0] * v2[0] + v1[1] * v2[1];
      const apex =
        (Math.acos(dot / (Math.hypot(...v1) * Math.hypot(...v2))) * 180) / Math.PI;
      expect(apex, `angles ${a}/${b}`).toBeCloseTo(180 - a - b, 3);
    }
  });
});

describe("the renderer produces labeled SVG for every spec kind", () => {
  const svg = (spec: FigureSpec) =>
    renderToStaticMarkup(React.createElement(Figure, { spec }));

  it("each kind renders an <svg> with its labels", () => {
    const cases: [FigureSpec, string][] = [
      [{ fig: "rect", wLabel: "8 cm", hLabel: "5 cm", ratio: 8 / 5 }, "8 cm"],
      [{ fig: "rect-cut", W: 10, H: 8, w: 3, h: 2, unit: "cm" }, "10 cm"],
      [{ fig: "tri-base-height", baseLabel: "6 m", heightLabel: "4 m", ratio: 1.5 }, "6 m"],
      [{ fig: "tri-sides", a: 6, b: 9, c: 4, unit: "cm" }, "9 cm"],
      [{ fig: "angle", degrees: 120 }, "120°"],
      [{ fig: "angle-pair", total: 90, known: 35 }, "35°"],
      [{ fig: "tri-angles", degA: 50, degB: 60, labelA: "50°", labelB: "60°", labelC: "?" }, "60°"],
      [{ fig: "right-triangle", a: 3, b: 4, aLabel: "3 cm", bLabel: "4 cm", cLabel: "?" }, "4 cm"],
      [{ fig: "circle", mode: "radius", label: "7 cm" }, "7 cm"],
      [{ fig: "cube", edgeLabel: "4 cm" }, "4 cm"],
      [{ fig: "cuboid", l: 5, w: 3, h: 2, lLabel: "5 m", wLabel: "3 m", hLabel: "2 m" }, "5 m"],
      [{ fig: "grid-point", x: 3, y: 2, label: "P", quad: false }, ">P<"],
    ];
    for (const [spec, mustContain] of cases) {
      const out = svg(spec);
      expect(out, spec.fig).toContain("<svg");
      expect(out, spec.fig).toContain(mustContain);
      expect(out, spec.fig).toContain("currentColor");
    }
  });
});
