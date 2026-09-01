/**
 * Geometric figures for geometry questions.
 *
 * A math product cannot ask about rectangles, angles and right triangles in
 * words alone — the figure IS the mathematics for a child. Figures are
 * DERIVED from each question's fixed prompt format rather than emitted by
 * the generators: the CAS audit already proves these exact strings are
 * stable and parseable, deriving keeps one module instead of twenty
 * generator edits, and the failure mode is safe by construction — an
 * unmatched prompt simply gets no figure, never a wrong one. Tests pin that
 * derived numbers equal the prompt's numbers across generated sweeps.
 *
 * Figures are attached only where they teach rather than leak: a plotted
 * point on a grid is the given, an angle drawn at its true measure is the
 * thing being classified.
 */

export type FigureSpec =
  | { fig: "rect"; wLabel: string; hLabel: string; ratio: number }
  | { fig: "rect-cut"; W: number; H: number; w: number; h: number; unit: string }
  | { fig: "tri-base-height"; baseLabel: string; heightLabel: string; ratio: number }
  | { fig: "tri-sides"; a: number; b: number; c: number; unit: string }
  | { fig: "angle"; degrees: number }
  | { fig: "angle-pair"; total: 90 | 180; known: number }
  | { fig: "tri-angles"; degA: number; degB: number; labelA: string; labelB: string; labelC: string }
  | { fig: "right-triangle"; a: number; b: number; aLabel: string; bLabel: string; cLabel: string }
  | { fig: "circle"; mode: "radius" | "diameter"; label: string }
  | { fig: "cube"; edgeLabel: string }
  | { fig: "cuboid"; l: number; w: number; h: number; lLabel: string; wLabel: string; hLabel: string }
  | { fig: "grid-point"; x: number; y: number; label: string; quad: boolean };

const num = (s: string) => Number(s.replace("−", "-"));

export function deriveFigure(family: string, prompt: string): FigureSpec | null {
  let m: RegExpExecArray | null;

  if (family === "perimeter-area") {
    if ((m = /^A rectangle is (\d+) (\S+) long and (\d+) \S+ wide/.exec(prompt))) {
      const l = num(m[1]);
      const w = num(m[3]);
      return { fig: "rect", wLabel: `${m[1]} ${m[2]}`, hLabel: `${m[3]} ${m[2]}`, ratio: l / w };
    }
    if ((m = /^A rectangular sheet (\d+) (\S+) by (\d+) \S+ has a (\d+) \S+ by (\d+) \S+ rectangle cut/.exec(prompt))) {
      return { fig: "rect-cut", W: num(m[1]), H: num(m[3]), w: num(m[4]), h: num(m[5]), unit: m[2] };
    }
    if ((m = /^A triangle has sides of (\d+) (\S+), (\d+) \S+, and (\d+) \S+/.exec(prompt))) {
      const a = num(m[1]);
      const b = num(m[3]);
      const c = num(m[4]);
      // Only a triangle that can actually exist gets drawn.
      return a + b > c && a + c > b && b + c > a
        ? { fig: "tri-sides", a, b, c, unit: m[2] }
        : null;
    }
    if ((m = /^A triangle has a base of (\d+) (\S+) and a height of (\d+)/.exec(prompt))) {
      return {
        fig: "tri-base-height",
        baseLabel: `${m[1]} ${m[2]}`,
        heightLabel: `${m[3]} ${m[2]}`,
        ratio: num(m[1]) / num(m[3]),
      };
    }
    return null;
  }

  if (family === "angles") {
    if ((m = /^An angle measures (\d+)°\./.exec(prompt))) {
      const d = num(m[1]);
      return d > 0 && d < 360 ? { fig: "angle", degrees: d } : null;
    }
    if ((m = /^Two angles fit together to make a right angle\. One measures (\d+)°/.exec(prompt))) {
      return { fig: "angle-pair", total: 90, known: num(m[1]) };
    }
    if ((m = /^Two angles sit together on a straight line\. One measures (\d+)°/.exec(prompt))) {
      return { fig: "angle-pair", total: 180, known: num(m[1]) };
    }
    if ((m = /^Two angles of a triangle measure (\d+)° and (\d+)°/.exec(prompt))) {
      const a = num(m[1]);
      const b = num(m[2]);
      return a + b < 180
        ? { fig: "tri-angles", degA: a, degB: b, labelA: `${a}°`, labelB: `${b}°`, labelC: "?" }
        : null;
    }
    if ((m = /^A right triangle has a 90° angle and a (\d+)° angle/.exec(prompt))) {
      const a = num(m[1]);
      return a < 90
        ? { fig: "tri-angles", degA: 90, degB: a, labelA: "90°", labelB: `${a}°`, labelC: "?" }
        : null;
    }
    return null;
  }

  if (family === "pythagorean") {
    if ((m = /^A right triangle has legs of (\d+)(?: (\S+))? and (\d+)/.exec(prompt))) {
      const u = m[2] ? ` ${m[2]}` : "";
      return {
        fig: "right-triangle",
        a: num(m[1]),
        b: num(m[3]),
        aLabel: `${m[1]}${u}`,
        bLabel: `${m[3]}${u}`,
        cLabel: "?",
      };
    }
    if ((m = /^A right triangle has a hypotenuse of (\d+) (\S+) and one leg of (\d+)/.exec(prompt))) {
      const c = num(m[1]);
      const k = num(m[3]);
      const other = Math.sqrt(Math.max(1, c * c - k * k));
      return {
        fig: "right-triangle",
        a: k,
        b: other,
        aLabel: `${m[3]} ${m[2]}`,
        bLabel: "?",
        cLabel: `${m[1]} ${m[2]}`,
      };
    }
    return null;
  }

  if (family === "circle-measure") {
    if ((m = /^A circle has a (radius|diameter) of (\d+) (\S+)/.exec(prompt))) {
      return { fig: "circle", mode: m[1] as "radius" | "diameter", label: `${m[2]} ${m[3]}` };
    }
    return null;
  }

  if (family === "volume-surface") {
    if ((m = /^A cube has edges of (\d+) (\S+)/.exec(prompt))) {
      return { fig: "cube", edgeLabel: `${m[1]} ${m[2]}` };
    }
    if ((m = /^A box is (\d+) (\S+) long, (\d+) \S+ wide, and (\d+) \S+ tall/.exec(prompt))) {
      return {
        fig: "cuboid",
        l: num(m[1]),
        w: num(m[3]),
        h: num(m[4]),
        lLabel: `${m[1]} ${m[2]}`,
        wLabel: `${m[3]} ${m[2]}`,
        hLabel: `${m[4]} ${m[2]}`,
      };
    }
    return null;
  }

  if (family === "coordinate-plane") {
    if ((m = /^(?:Point P is|A point sits) (\d+) units? right of the origin and (\d+) units? up/.exec(prompt))) {
      return { fig: "grid-point", x: num(m[1]), y: num(m[2]), label: "P", quad: false };
    }
    if ((m = /^Where does the point \((−?-?\d+), (−?-?\d+)\)/.exec(prompt))) {
      return { fig: "grid-point", x: num(m[1]), y: num(m[2]), label: "P", quad: true };
    }
    return null;
  }

  return null;
}

/**
 * Construct a triangle from its two base angles, for accurate drawing:
 * base from (0,0) to (1,0), apex at the intersection of the two rays.
 * Returns unit-space coordinates (y grows upward; the renderer flips).
 */
export function triangleFromAngles(degA: number, degB: number): { ax: number; ay: number } {
  const A = (degA * Math.PI) / 180;
  const B = (degB * Math.PI) / 180;
  // A right angle at a base vertex puts the apex directly above it — the
  // tangent blows up there, so handle it exactly instead of numerically.
  if (degA >= 89.999) return { ax: 0, ay: Math.tan(B) };
  if (degB >= 89.999) return { ax: 1, ay: Math.tan(A) };
  // Ray from (0,0) at angle A meets ray from (1,0) at angle 180−B.
  const tanA = Math.tan(A);
  const tanB = Math.tan(B);
  const x = tanB / (tanA + tanB);
  const y = x * tanA;
  return { ax: x, ay: y };
}
