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
  | { fig: "grid-point"; x: number; y: number; label: string; quad: boolean }
  | { fig: "poly"; name: string }
  | { fig: "letter"; ch: string }
  | { fig: "grid-2pts"; x1: number; y1: number; x2: number; y2: number; l1: string; l2: string; segment: boolean; line: boolean }
  | { fig: "grid-reflect"; x: number; y: number; axis: "x" | "y" }
  | { fig: "grid-map"; x1: number; y1: number; x2: number; y2: number }
  | { fig: "similar-tris"; small: [string, string]; large: [string, string]; k: number }
  | { fig: "similar-rects"; sideLabel: string; k: number };

/** Shape names the polygon renderer knows, normalised from prompt wording. */
export function normaliseShapeName(raw: string): string | null {
  const base = raw.toLowerCase().replace(/\(.*\)/, "").replace(/\bregular\b/, "").trim();
  const KNOWN = [
    "triangle", "equilateral triangle", "isosceles triangle", "quadrilateral",
    "square", "rectangle", "rhombus", "parallelogram", "trapezoid", "trapezium",
    "pentagon", "hexagon", "heptagon", "octagon",
  ];
  return KNOWN.includes(base) ? base : null;
}

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
    // NOT matched on purpose: "In which quadrant…" / "Where does the point
    // (x, y) lie?" — plotting the point would answer the question.
    if (
      (m = /^(?:How far apart are the points|What is the distance between the points) \(([−-]?\d+), ([−-]?\d+)\) and \(([−-]?\d+), ([−-]?\d+)\)/.exec(prompt))
    ) {
      return twoPoints(m, "A", "B", false, false);
    }
    if ((m = /^What is the exact distance between \(0, 0\) and \((\d+), (\d+)\)/.exec(prompt))) {
      return { fig: "grid-2pts", x1: 0, y1: 0, x2: num(m[1]), y2: num(m[2]), l1: "O", l2: "A", segment: false, line: false };
    }
    if (
      (m = /^(?:What is the midpoint of the segment joining|A segment joins) \(([−-]?\d+), ([−-]?\d+)\) and \(([−-]?\d+), ([−-]?\d+)\)/.exec(prompt))
    ) {
      return twoPoints(m, "A", "B", true, false);
    }
    if ((m = /^M\(([−-]?\d+), ([−-]?\d+)\) is the midpoint of a segment\. One endpoint is A\(([−-]?\d+), ([−-]?\d+)\)/.exec(prompt))) {
      return twoPoints(m, "M", "A", false, false);
    }
    if ((m = /^The point \(([−-]?\d+), ([−-]?\d+)\)(?: in Quadrant I)? is reflected over the ([xy])-axis/.exec(prompt))) {
      return { fig: "grid-reflect", x: num(m[1]), y: num(m[2]), axis: m[3] as "x" | "y" };
    }
    return null;
  }

  if (family === "shapes-2d") {
    if ((m = /^How many (?:sides|corners \(vertices\)) does a ([a-z]+) have\?/.exec(prompt))) {
      const name = normaliseShapeName(m[1]);
      return name ? { fig: "poly", name } : null;
    }
    return null;
  }

  if (family === "symmetry") {
    if ((m = /^Does the capital letter ([A-Z]) have a line of symmetry\?/.exec(prompt))) {
      return { fig: "letter", ch: m[1] };
    }
    if (
      (m = /^(?:How many lines of symmetry does an?|What is the order of rotational symmetry of an?) ([a-z ()]+?)\s*have\?/.exec(prompt)) ||
      (m = /^What is the order of rotational symmetry of an? ([a-z ()]+?)\?/.exec(prompt))
    ) {
      const name = normaliseShapeName(m[1]);
      return name ? { fig: "poly", name } : null;
    }
    return null;
  }

  if (family === "transformations") {
    if ((m = /^The point \(([−-]?\d+), ([−-]?\d+)\) is translated (\d+) units? right and (\d+) units? up/.exec(prompt))) {
      const x = num(m[1]);
      const y = num(m[2]);
      return { fig: "grid-point", x, y, label: "P", quad: x < 0 || y < 0 };
    }
    if ((m = /^The point \(([−-]?\d+), ([−-]?\d+)\) is reflected over the ([xy])-axis/.exec(prompt))) {
      return { fig: "grid-reflect", x: num(m[1]), y: num(m[2]), axis: m[3] as "x" | "y" };
    }
    if ((m = /^The point \(([−-]?\d+), ([−-]?\d+)\) is rotated /.exec(prompt))) {
      return { fig: "grid-point", x: num(m[1]), y: num(m[2]), label: "P", quad: true };
    }
    if ((m = /^A transformation maps the point \(([−-]?\d+), ([−-]?\d+)\) to \(([−-]?\d+), ([−-]?\d+)\)\./.exec(prompt))) {
      return { fig: "grid-map", x1: num(m[1]), y1: num(m[2]), x2: num(m[3]), y2: num(m[4]) };
    }
    return null;
  }

  if (family === "slope") {
    if ((m = /^\(([−-]?\d+), ([−-]?\d+)\) and \(([−-]?\d+), ([−-]?\d+)\)$/.exec(prompt))) {
      return twoPoints(m, "A", "B", false, true);
    }
    return null;
  }

  if (family === "similarity") {
    if ((m = /^A photo has a side of (\d+) (\S+)\. It is enlarged by a scale factor of (\d+)/.exec(prompt))) {
      return { fig: "similar-rects", sideLabel: `${m[1]} ${m[2]}`, k: num(m[3]) };
    }
    if ((m = /^Two similar figures match a side of (\d+) (\S+) to a side of (\d+) \S+/.exec(prompt))) {
      return {
        fig: "similar-tris",
        small: [`${m[1]} ${m[2]}`, ""],
        large: [`${m[3]} ${m[2]}`, ""],
        k: Math.max(1.2, Math.min(3, num(m[3]) / num(m[1]))),
      };
    }
    if ((m = /^Side AB = (\d+) (\S+) matches side DE = (\d+) \S+\. Side BC = (\d+) \S+ matches side EF\./.exec(prompt))) {
      return {
        fig: "similar-tris",
        small: [`AB = ${m[1]} ${m[2]}`, `BC = ${m[4]} ${m[2]}`],
        large: [`DE = ${m[3]} ${m[2]}`, "EF = ?"],
        k: Math.max(1.2, Math.min(3, num(m[3]) / num(m[1]))),
      };
    }
    return null;
  }

  return null;
}

function twoPoints(
  m: RegExpExecArray,
  l1: string,
  l2: string,
  segment: boolean,
  line: boolean
): FigureSpec {
  return {
    fig: "grid-2pts",
    x1: num(m[1]),
    y1: num(m[2]),
    x2: num(m[3]),
    y2: num(m[4]),
    l1,
    l2,
    segment,
    line,
  };
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
