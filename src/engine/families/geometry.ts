import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, nearNumbers, pickName } from "./helpers";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

/** Numeric distractors that stay positive (counts, lengths, areas). */
function posNear(answer: number, spread = 3): string[] {
  return nearNumbers(answer, spread).filter((s) => Number(s) > 0);
}

/** Round avoiding float noise, 2 places. */
function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/* ------------------------------------------------------------------ shapes-2d */
const POLYGONS = [
  { name: "triangle", sides: 3 },
  { name: "quadrilateral", sides: 4 },
  { name: "pentagon", sides: 5 },
  { name: "hexagon", sides: 6 },
  { name: "octagon", sides: 8 },
] as const;

const QUADS = [
  { name: "square", clue: "It has 4 equal sides and 4 right angles." },
  { name: "rectangle", clue: "It has 4 right angles, and opposite sides are equal, but not all 4 sides are equal." },
  { name: "rhombus", clue: "It has 4 equal sides but no right angles." },
  { name: "parallelogram", clue: "It has two pairs of parallel sides, no right angles, and neighbouring sides of different lengths." },
  { name: "trapezoid", clue: "It has exactly one pair of parallel sides." },
] as const;

const shapes2d: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Sides and corners", "Name the shape", "Classify triangles", "Classify quadrilaterals", "Polygon angle sums"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const p = rng.pick(POLYGONS);
      const askSides = rng.chance(0.5);
      return inputQ({
        instruction: "Count the parts of the shape.",
        prompt: `How many ${askSides ? "sides" : "corners (vertices)"} does a ${p.name} have?`,
        answer: String(p.sides),
        hint: `Picture a ${p.name} and count each ${askSides ? "straight side" : "corner where two sides meet"}.`,
        steps: [
          `A ${p.name} is a polygon with ${p.sides} straight sides.`,
          `A polygon has the same number of corners as sides, so it has ${p.sides} ${askSides ? "sides" : "corners"}.`,
        ],
        concept: "In any polygon, the number of sides equals the number of corners.",
        representation: "visual",
        verify: () => p.sides >= 3,
      });
    }
    if (stage === 2) {
      const p = rng.pick(POLYGONS);
      const wrongs = POLYGONS.filter((q) => q.sides !== p.sides).map((q) => q.name);
      return mcQ({
        instruction: "Name the shape.",
        prompt: `Which shape has exactly ${p.sides} straight sides?`,
        choices: mcChoices(rng, p.name, rng.shuffle(wrongs)),
        answer: p.name,
        hint: "Count the sides of each shape you know.",
        steps: [
          `A polygon is named by its number of sides.`,
          `${p.sides} sides makes it a ${p.name}.`,
        ],
        concept: "Polygons are named by how many sides they have.",
        representation: "visual",
        verify: () => POLYGONS.filter((q) => q.sides === p.sides).length === 1,
      });
    }
    if (stage === 3) {
      const type = rng.pick(["equilateral", "isosceles", "scalene"] as const);
      let sides: [number, number, number];
      if (type === "equilateral") {
        const s = rng.int(3, 9);
        sides = [s, s, s];
      } else if (type === "isosceles") {
        const s = rng.int(4, 9);
        let t = rng.int(3, 2 * s - 1);
        while (t === s) t = rng.int(3, 2 * s - 1);
        sides = [s, s, t];
      } else {
        const a = rng.int(4, 7);
        const b = a + rng.int(1, 3);
        const c = b + rng.int(1, a - 1);
        sides = [a, b, c];
      }
      const eqCount = (sides[0] === sides[1] ? 1 : 0) + (sides[1] === sides[2] ? 1 : 0) + (sides[0] === sides[2] ? 1 : 0);
      return mcQ({
        instruction: "Classify the triangle by its sides.",
        prompt: `A triangle has sides of ${sides[0]} cm, ${sides[1]} cm, and ${sides[2]} cm. What kind of triangle is it?`,
        choices: rng.shuffle(["equilateral", "isosceles", "scalene"]),
        answer: type,
        hint: "Count how many sides are equal: all three, exactly two, or none.",
        steps: [
          type === "equilateral"
            ? `All three sides are ${sides[0]} cm — all equal.`
            : type === "isosceles"
              ? `Two sides are ${sides[0]} cm and one is ${sides[2]} cm — exactly two equal.`
              : `${sides[0]}, ${sides[1]}, ${sides[2]} are all different — no equal sides.`,
          `That makes the triangle ${type}.`,
        ],
        concept: "Triangles are classified by how many equal sides they have.",
        verify: () =>
          type === "equilateral" ? eqCount === 3 : type === "isosceles" ? eqCount === 1 : eqCount === 0,
      });
    }
    if (stage === 4) {
      const q = rng.pick(QUADS);
      const wrongs = QUADS.filter((x) => x.name !== q.name).map((x) => x.name);
      return mcQ({
        instruction: "Name the quadrilateral.",
        prompt: `A quadrilateral is described: ${q.clue} What is it?`,
        choices: mcChoices(rng, q.name, rng.shuffle(wrongs)),
        answer: q.name,
        hint: "Check the sides first, then the angles.",
        steps: [
          `${q.clue}`,
          `Only a ${q.name} matches every part of that description.`,
        ],
        concept: "Quadrilaterals are classified by their sides, angles, and parallel pairs.",
        verify: () => QUADS.filter((x) => x.clue === q.clue).length === 1,
      });
    }
    const p = rng.pick(POLYGONS.filter((x) => x.sides >= 4));
    const sum = (p.sides - 2) * 180;
    return inputQ({
      instruction: "Find the angle sum. Answer in degrees.",
      prompt: `What is the sum of the interior angles of a ${p.name}?`,
      answer: String(sum),
      answerHint: "degrees",
      hint: `Split the ${p.name} into triangles from one corner: it makes ${p.sides - 2} triangles.`,
      steps: [
        `A ${p.name} has ${p.sides} sides, so it splits into ${p.sides - 2} triangles.`,
        `Each triangle's angles sum to 180°.`,
        `${p.sides - 2} × 180° = ${sum}°.`,
      ],
      concept: "A polygon's angle sum is 180° times two fewer than its number of sides.",
      verify: () => 180 * p.sides - 360 === sum,
    });
  },
};

/* ------------------------------------------------------------------ shapes-3d */
const SOLIDS = [
  { name: "cube", f: 6, e: 12, v: 8, clue: "all 6 of its faces are equal squares" },
  { name: "rectangular prism", f: 6, e: 12, v: 8, clue: "its 6 faces are rectangles, like a cereal box" },
  { name: "triangular prism", f: 5, e: 9, v: 6, clue: "it has 2 triangular faces joined by 3 rectangles" },
  { name: "square pyramid", f: 5, e: 8, v: 5, clue: "it has 1 square base and 4 triangular faces meeting at a point" },
  { name: "triangular pyramid", f: 4, e: 6, v: 4, clue: "all 4 of its faces are triangles" },
] as const;

const ROUND_SOLIDS = [
  { name: "sphere", clue: "it is perfectly round, like a ball" },
  { name: "cylinder", clue: "it has 2 circular faces joined by a curved surface, like a can" },
  { name: "cone", clue: "it has 1 circular face and a curved surface that narrows to a point" },
] as const;

const shapes3d: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Name the solid", "Count faces", "Edges and vertices", "Match the property", "Euler's rule"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const all = [...SOLIDS, ...ROUND_SOLIDS];
      const target = rng.pick(all);
      const wrongs = all.filter((x) => x.name !== target.name).map((x) => x.name);
      return mcQ({
        instruction: "Name the 3D shape.",
        prompt: `Which solid is this: ${target.clue}?`,
        choices: mcChoices(rng, target.name, rng.shuffle(wrongs)),
        answer: target.name,
        hint: "Think about the faces: are they flat or curved, and what shape are they?",
        steps: [
          `The description says ${target.clue}.`,
          `That matches a ${target.name}.`,
        ],
        concept: "Solids are identified by the shapes of their faces and surfaces.",
        representation: "visual",
        verify: () => all.filter((x) => x.clue === target.clue).length === 1,
      });
    }
    if (stage === 2 || stage === 3) {
      const p = rng.pick(SOLIDS);
      const attr = stage === 2 ? "faces" : rng.pick(["edges", "vertices"] as const);
      const ans = attr === "faces" ? p.f : attr === "edges" ? p.e : p.v;
      return inputQ({
        instruction: `Count the ${attr}.`,
        prompt: `How many ${attr} does a ${p.name} have?`,
        answer: String(ans),
        hint:
          attr === "faces"
            ? "Faces are the flat surfaces."
            : attr === "edges"
              ? "Edges are the lines where two faces meet."
              : "Vertices are the corner points where edges meet.",
        steps: [
          `A ${p.name}: ${p.clue}.`,
          `It has ${p.f} faces, ${p.e} edges, and ${p.v} vertices — so the answer is ${ans}.`,
        ],
        concept: "Faces are flat surfaces, edges are where faces meet, vertices are corners.",
        representation: "visual",
        verify: () => p.f + p.v - p.e === 2,
      });
    }
    if (stage === 4) {
      const attr = rng.pick(["faces", "edges", "vertices"] as const);
      const val = (sd: (typeof SOLIDS)[number]) =>
        attr === "faces" ? sd.f : attr === "edges" ? sd.e : sd.v;
      const target = rng.pick(SOLIDS);
      const wrongs = SOLIDS.filter((sd) => val(sd) !== val(target)).map((sd) => sd.name);
      const choices = mcChoices(rng, target.name, rng.shuffle(wrongs));
      return mcQ({
        instruction: "Match the solid to its property.",
        prompt: `Which of these solids has exactly ${val(target)} ${attr}?`,
        choices,
        answer: target.name,
        hint: `Count the ${attr} of each solid in the list.`,
        steps: [
          `A ${target.name} has ${target.f} faces, ${target.e} edges, and ${target.v} vertices.`,
          `So the ${target.name} is the one with ${val(target)} ${attr}.`,
        ],
        concept: "Every solid has its own fixed count of faces, edges, and vertices.",
        verify: () =>
          SOLIDS.filter((sd) => choices.includes(sd.name) && val(sd) === val(target)).length === 1,
      });
    }
    const p = rng.pick(SOLIDS);
    return inputQ({
      instruction: "Use Euler's rule: faces + vertices − edges = 2.",
      prompt: `A ${p.name} has ${p.f} faces and ${p.v} vertices. How many edges does it have?`,
      answer: String(p.e),
      hint: `Add faces and vertices, then subtract 2.`,
      steps: [
        `Faces + vertices = ${p.f} + ${p.v} = ${p.f + p.v}.`,
        `Euler's rule says faces + vertices − edges = 2.`,
        `Edges = ${p.f + p.v} − 2 = ${p.e}.`,
      ],
      concept: "Euler's rule links faces, vertices, and edges in every polyhedron.",
      verify: () => p.f + p.v - p.e === 2,
    });
  },
};

/* ------------------------------------------------------------------- symmetry */
const LETTERS_SYM: readonly [string, number][] = [
  ["A", 1], ["B", 1], ["C", 1], ["D", 1], ["E", 1], ["H", 2], ["I", 2],
  ["M", 1], ["T", 1], ["U", 1], ["V", 1], ["W", 1], ["X", 2],
];
const LETTERS_NONE = ["F", "G", "J", "L", "N", "P", "Q", "R", "S", "Z"] as const;

const SHAPES_SYM = [
  { name: "square", lines: 4, rot: 4 },
  { name: "rectangle (not a square)", lines: 2, rot: 2 },
  { name: "equilateral triangle", lines: 3, rot: 3 },
  { name: "isosceles triangle (not equilateral)", lines: 1, rot: 1 },
  { name: "regular pentagon", lines: 5, rot: 5 },
  { name: "regular hexagon", lines: 6, rot: 6 },
  { name: "rhombus (not a square)", lines: 2, rot: 2 },
  { name: "parallelogram (not a rectangle or rhombus)", lines: 0, rot: 2 },
] as const;

const symmetry: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Symmetry in letters", "Lines of symmetry", "Match the count", "Rotational symmetry", "Regular polygons"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const has = rng.chance(0.5);
      const ch = has ? rng.pick(LETTERS_SYM)[0] : rng.pick(LETTERS_NONE);
      return mcQ({
        instruction: "A line of symmetry is a fold line where both halves match exactly.",
        prompt: `Does the capital letter ${ch} have a line of symmetry?`,
        choices: rng.shuffle(["Yes", "No", "Every letter does"]),
        answer: has ? "Yes" : "No",
        hint: `Imagine folding the letter ${ch} in half. Do the halves match?`,
        steps: [
          has
            ? `Folding ${ch} along its line of symmetry makes both halves match, so yes.`
            : `No fold of ${ch} makes the two halves match, so it has no line of symmetry.`,
        ],
        concept: "A figure is symmetric when a fold makes its halves match exactly.",
        representation: "visual",
        verify: () => (has ? LETTERS_SYM.some(([l]) => l === ch) : LETTERS_NONE.includes(ch as (typeof LETTERS_NONE)[number])),
      });
    }
    if (stage === 2) {
      const sh = rng.pick(SHAPES_SYM);
      return inputQ({
        instruction: "Count the lines of symmetry.",
        prompt: `How many lines of symmetry does a ${sh.name} have?`,
        answer: String(sh.lines),
        hint: "Try folds through corners and through the middles of sides.",
        steps: [
          `Each line of symmetry folds the ${sh.name} onto itself exactly.`,
          `A ${sh.name} has ${sh.lines} such fold line${sh.lines === 1 ? "" : "s"}.`,
        ],
        concept: "Lines of symmetry fold a shape onto itself.",
        representation: "visual",
        verify: () => sh.lines >= 0,
      });
    }
    if (stage === 3) {
      const target = rng.pick(SHAPES_SYM.filter((x) => x.lines > 0));
      const wrongs = SHAPES_SYM.filter((x) => x.lines !== target.lines).map((x) => x.name);
      return mcQ({
        instruction: "Match the shape to its symmetry.",
        prompt: `Which of these shapes has exactly ${target.lines} line${target.lines === 1 ? "" : "s"} of symmetry?`,
        choices: mcChoices(rng, target.name, rng.shuffle(wrongs)),
        answer: target.name,
        hint: "Regular shapes have as many lines of symmetry as sides.",
        steps: [
          `Count the fold lines of each choice.`,
          `A ${target.name} has exactly ${target.lines}.`,
        ],
        concept: "Different shapes have different numbers of symmetry lines.",
        verify: () => target.lines > 0,
      });
    }
    if (stage === 4) {
      const sh = rng.pick(SHAPES_SYM.filter((x) => x.rot >= 2));
      return inputQ({
        instruction: "Rotational symmetry counts how many times a shape fits onto itself in one full turn.",
        prompt: `What is the order of rotational symmetry of a ${sh.name}?`,
        answer: String(sh.rot),
        hint: `Turn the ${sh.name} slowly through a full circle and count the matches.`,
        steps: [
          `In one full 360° turn, a ${sh.name} lands exactly on itself ${sh.rot} times.`,
          `So its order of rotational symmetry is ${sh.rot}.`,
        ],
        concept: "Order of rotational symmetry = matches in one full turn.",
        representation: "visual",
        verify: () => 360 % sh.rot === 0,
      });
    }
    const n = rng.int(7, 12);
    const askRot = rng.chance(0.5);
    return inputQ({
      instruction: "Think about regular polygons.",
      prompt: `A regular polygon has ${n} equal sides. ${askRot ? "What is its order of rotational symmetry?" : "How many lines of symmetry does it have?"}`,
      answer: String(n),
      hint: "For a regular polygon, both symmetry counts equal the number of sides.",
      steps: [
        `A regular polygon has one line of symmetry through each of its ${n} sides or corners.`,
        `It also fits onto itself ${n} times in a full turn.`,
        `So the answer is ${n}.`,
      ],
      concept: "A regular n-sided polygon has n lines of symmetry and rotation order n.",
      verify: () => n >= 3,
    });
  },
};

/* --------------------------------------------------------------------- angles */
const ANGLE_LABELS: Record<string, string[]> = {
  identify: ["Right angles", "Acute and obtuse", "Straight and reflex", "Angle words", "Spot the measure"],
  measure: ["Inside a right angle", "Angles on a line", "Angles around a point", "Turns and degrees", "Split angles"],
  relationships: ["Complementary angles", "Supplementary angles", "Vertical angles", "Around a point", "Parallel lines"],
  "triangle-sum": ["Right triangles", "Two known angles", "Isosceles triangles", "Exterior angles", "Quadrilateral angles"],
  mixed: ["Angle basics", "Measuring angles", "Angle relationships", "Angle equations", "Angle problems"],
};

function angleType(deg: number): string {
  if (deg < 90) return "acute";
  if (deg === 90) return "right";
  if (deg < 180) return "obtuse";
  if (deg === 180) return "straight";
  return "reflex";
}

const ANGLE_KINDS = ["identify", "measure", "relationships", "triangle-sum"] as const;

function genAngleIdentify(stage: number, rng: Rng): RawQuestion {
  if (stage <= 3) {
    const pool =
      stage === 1
        ? [30, 45, 60, 90, 120, 150]
        : stage === 2
          ? [rng.int(2, 16) * 5 + 5, 90, rng.int(19, 34) * 5]
          : [90, 180, rng.int(20, 34) * 10, rng.int(10, 17) * 10 + 5];
    let deg = rng.pick(pool);
    if (stage === 2 && (deg === 90 || deg === 180)) deg = rng.chance(0.5) ? 90 : rng.pick([40, 65, 110, 155]);
    const t = angleType(deg);
    const choices =
      stage === 3
        ? rng.shuffle(["right", "obtuse", "straight", "reflex"])
        : rng.shuffle(["acute", "right", "obtuse"]);
    if (!choices.includes(t)) return genAngleIdentify(stage, rng);
    return mcQ({
      instruction: "Classify the angle.",
      prompt: `An angle measures ${deg}°. What type of angle is it?`,
      choices,
      answer: t,
      hint: "Compare the measure with 90° and 180°.",
      steps: [
        `90° is a right angle and 180° is a straight angle.`,
        `${deg}° is ${t === "acute" ? "less than 90°" : t === "right" ? "exactly 90°" : t === "obtuse" ? "between 90° and 180°" : t === "straight" ? "exactly 180°" : "more than 180°"}, so it is ${t}.`,
      ],
      concept: "Angles are classified by comparing them with 90° and 180°.",
      verify: () => angleType(deg) === t,
    });
  }
  if (stage === 4) {
    const DEFS = [
      { q: "an angle smaller than 90°", a: "acute" },
      { q: "an angle of exactly 90°", a: "right" },
      { q: "an angle between 90° and 180°", a: "obtuse" },
      { q: "an angle of exactly 180°", a: "straight" },
      { q: "an angle larger than 180°", a: "reflex" },
    ] as const;
    const d = rng.pick(DEFS);
    const wrongs = DEFS.filter((x) => x.a !== d.a).map((x) => x.a);
    return mcQ({
      instruction: "Know the angle words.",
      prompt: `What do we call ${d.q}?`,
      choices: mcChoices(rng, d.a, rng.shuffle(wrongs)),
      answer: d.a,
      hint: "Think of the benchmarks 90° and 180°.",
      steps: [`By definition, ${d.q} is called ${d.a}.`],
      concept: "Angle names come from comparing with 90° and 180°.",
    });
  }
  const askType = rng.pick(["acute", "obtuse", "reflex"] as const);
  const make = (t: string): number =>
    t === "acute" ? rng.int(2, 8) * 10 + 5 : t === "obtuse" ? rng.int(10, 17) * 10 + 5 : rng.int(19, 35) * 10 + 5;
  const ansDeg = make(askType);
  const others = (["acute", "obtuse", "reflex"] as const).filter((t) => t !== askType);
  const wrongs = [`${make(others[0])}°`, `${make(others[1])}°`, askType === "reflex" ? "90°" : "180°"];
  const ans = `${ansDeg}°`;
  return mcQ({
    instruction: "Spot the measure.",
    prompt: `Which of these measures is a ${askType} angle?`,
    choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
    answer: ans,
    hint:
      askType === "acute"
        ? "Acute means less than 90°."
        : askType === "obtuse"
          ? "Obtuse means between 90° and 180°."
          : "Reflex means more than 180°.",
    steps: [
      `A ${askType} angle is ${askType === "acute" ? "less than 90°" : askType === "obtuse" ? "between 90° and 180°" : "more than 180°"}.`,
      `${ans} fits that range; the others do not.`,
    ],
    concept: "Compare each measure with 90° and 180° to classify it.",
    verify: () => angleType(ansDeg) === askType,
  });
}

function genAngleMeasure(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const a = rng.int(10, 80);
    const b = 90 - a;
    return inputQ({
      instruction: "Find the missing angle. Answer in degrees.",
      prompt: `Two angles fit together to make a right angle. One measures ${a}°. What does the other measure?`,
      answer: String(b),
      hint: "The two parts add up to 90°.",
      steps: [`Together they make 90°.`, `90° − ${a}° = ${b}°.`],
      concept: "Angles that make a right angle add to 90°.",
      verify: () => a + b === 90,
    });
  }
  if (stage === 2) {
    const a = rng.int(20, 160);
    const b = 180 - a;
    return inputQ({
      instruction: "Find the missing angle. Answer in degrees.",
      prompt: `Two angles sit together on a straight line. One measures ${a}°. What does the other measure?`,
      answer: String(b),
      hint: "Angles on a straight line add up to 180°.",
      steps: [`A straight line makes 180°.`, `180° − ${a}° = ${b}°.`],
      concept: "Angles on a straight line add to 180°.",
      verify: () => a + b === 180,
    });
  }
  if (stage === 3) {
    const a = rng.int(60, 150);
    const b = rng.int(60, 150);
    const c = 360 - a - b;
    return inputQ({
      instruction: "Find the missing angle. Answer in degrees.",
      prompt: `Three angles meet around a point. Two of them measure ${a}° and ${b}°. What does the third measure?`,
      answer: String(c),
      hint: "Angles around a point add up to 360°.",
      steps: [`A full turn is 360°.`, `${a}° + ${b}° = ${a + b}°.`, `360° − ${a + b}° = ${c}°.`],
      concept: "Angles around a point add to 360°.",
      verify: () => a + b + c === 360,
    });
  }
  if (stage === 4) {
    const t = rng.pick([
      ["a quarter", "{1/4}", 90],
      ["a half", "{1/2}", 180],
      ["a three-quarter", "{3/4}", 270],
      ["a full", "1", 360],
    ] as const);
    return inputQ({
      instruction: "Turns can be measured in degrees.",
      prompt: `${pickName(rng)} makes ${t[0]} turn. How many degrees is that?`,
      answer: String(t[2]),
      hint: "A full turn is 360°.",
      steps: [`A full turn is 360°.`, `${t[1]} of 360° = ${t[2]}°.`],
      concept: "Turns are fractions of 360°.",
      verify: () => t[2] <= 360 && t[2] % 90 === 0,
    });
  }
  const whole = rng.int(8, 17) * 10;
  const a = rng.int(20, whole - 20);
  const b = whole - a;
  return inputQ({
    instruction: "Find the missing part. Answer in degrees.",
    prompt: `A ray splits an angle of ${whole}° into two parts. One part measures ${a}°. What does the other part measure?`,
    answer: String(b),
    hint: `The two parts add up to ${whole}°.`,
    steps: [`The parts together make the whole angle: ${whole}°.`, `${whole}° − ${a}° = ${b}°.`],
    concept: "Adjacent angle parts add up to the whole angle.",
    verify: () => a + b === whole,
  });
}

function genAngleRelationships(stage: number, rng: Rng): RawQuestion {
  if (stage === 1 || stage === 2) {
    const total = stage === 1 ? 90 : 180;
    const word = stage === 1 ? "complementary" : "supplementary";
    const a = rng.int(10, total - 10);
    const b = total - a;
    return inputQ({
      instruction: `Two ${word} angles add up to ${total}°.`,
      prompt: `Angles A and B are ${word}. Angle A measures ${a}°. What does angle B measure?`,
      answer: String(b),
      hint: `Subtract ${a}° from ${total}°.`,
      steps: [`${word.charAt(0).toUpperCase() + word.slice(1)} angles sum to ${total}°.`, `${total}° − ${a}° = ${b}°.`],
      concept: `${word.charAt(0).toUpperCase() + word.slice(1)} angles always total ${total}°.`,
      verify: () => a + b === total,
    });
  }
  if (stage === 3) {
    const a = rng.int(25, 155);
    return inputQ({
      instruction: "Vertical angles are the opposite angles made by two crossing lines.",
      prompt: `Two straight lines cross. One of the four angles measures ${a}°. What is the measure of the angle directly opposite it?`,
      answer: String(a),
      hint: "Opposite angles at a crossing are equal.",
      steps: [
        `The angle next to ${a}° on the line measures 180° − ${a}° = ${180 - a}°.`,
        `The opposite angle pairs with that one on the other line: 180° − ${180 - a}° = ${a}°.`,
        `So vertical angles are equal: ${a}°.`,
      ],
      concept: "Vertical (opposite) angles are always equal.",
      verify: () => 180 - (180 - a) === a,
    });
  }
  if (stage === 4) {
    const a = rng.int(60, 100);
    const b = rng.int(60, 100);
    const c = rng.int(60, 100);
    const d = 360 - a - b - c;
    return inputQ({
      instruction: "Find the missing angle. Answer in degrees.",
      prompt: `Four angles meet around a point. Three of them measure ${a}°, ${b}°, and ${c}°. What does the fourth measure?`,
      answer: String(d),
      hint: "All the angles around a point add to 360°.",
      steps: [`${a}° + ${b}° + ${c}° = ${a + b + c}°.`, `360° − ${a + b + c}° = ${d}°.`],
      concept: "Angles around a point total 360°.",
      verify: () => a + b + c + d === 360,
    });
  }
  const a = rng.int(40, 140);
  const rel = rng.pick(["corresponding", "alternate", "co-interior"] as const);
  const ans = rel === "co-interior" ? 180 - a : a;
  return inputQ({
    instruction: "Two parallel lines are cut by a transversal.",
    prompt: `One angle measures ${a}°. What is the measure of its ${rel === "co-interior" ? "co-interior (same-side interior)" : rel} angle?`,
    answer: String(ans),
    hint:
      rel === "co-interior"
        ? "Co-interior angles are supplementary: they add to 180°."
        : `With parallel lines, ${rel} angles are equal.`,
    steps:
      rel === "co-interior"
        ? [`Co-interior angles between parallel lines add to 180°.`, `180° − ${a}° = ${ans}°.`]
        : [`Parallel lines make ${rel} angles equal.`, `So the ${rel} angle also measures ${a}°.`],
    concept:
      rel === "co-interior"
        ? "Co-interior angles between parallel lines are supplementary."
        : "Corresponding and alternate angles between parallel lines are equal.",
    verify: () => (rel === "co-interior" ? a + ans === 180 : ans === a),
  });
}

function genTriangleSum(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const a = rng.int(15, 75);
    const b = 90 - a;
    return inputQ({
      instruction: "Angles in a triangle add to 180°.",
      prompt: `A right triangle has a 90° angle and a ${a}° angle. What is the third angle?`,
      answer: String(b),
      hint: "The two acute angles of a right triangle add to 90°.",
      steps: [`90° + ${a}° = ${90 + a}°.`, `180° − ${90 + a}° = ${b}°.`],
      concept: "A triangle's three angles always total 180°.",
      verify: () => 90 + a + b === 180,
    });
  }
  if (stage === 2) {
    const a = rng.int(25, 90);
    const b = rng.int(25, 160 - a);
    const c = 180 - a - b;
    return inputQ({
      instruction: "Angles in a triangle add to 180°.",
      prompt: `Two angles of a triangle measure ${a}° and ${b}°. What is the third angle?`,
      answer: String(c),
      hint: "Add the two known angles, then subtract from 180°.",
      steps: [`${a}° + ${b}° = ${a + b}°.`, `180° − ${a + b}° = ${c}°.`],
      concept: "The angle sum of every triangle is 180°.",
      verify: () => a + b + c === 180,
    });
  }
  if (stage === 3) {
    const fromVertex = rng.chance(0.5);
    if (fromVertex) {
      const v = 2 * rng.int(10, 70);
      const base = (180 - v) / 2;
      return inputQ({
        instruction: "An isosceles triangle has two equal base angles.",
        prompt: `The top angle of an isosceles triangle measures ${v}°. What does each equal base angle measure?`,
        answer: String(base),
        hint: `The two base angles share what is left of 180°, equally.`,
        steps: [`180° − ${v}° = ${180 - v}° is left for the two base angles.`, `${180 - v}° ÷ 2 = ${base}° each.`],
        concept: "Equal sides face equal angles in an isosceles triangle.",
        verify: () => v + 2 * base === 180,
      });
    }
    const base = rng.int(25, 80);
    const v = 180 - 2 * base;
    return inputQ({
      instruction: "An isosceles triangle has two equal base angles.",
      prompt: `Each base angle of an isosceles triangle measures ${base}°. What does the top angle measure?`,
      answer: String(v),
      hint: "Add the two base angles, then subtract from 180°.",
      steps: [`${base}° + ${base}° = ${2 * base}°.`, `180° − ${2 * base}° = ${v}°.`],
      concept: "Equal sides face equal angles in an isosceles triangle.",
      verify: () => v + 2 * base === 180,
    });
  }
  if (stage === 4) {
    const a = rng.int(30, 80);
    const b = rng.int(30, 80);
    const ext = a + b;
    return inputQ({
      instruction: "An exterior angle equals the sum of the two remote interior angles.",
      prompt: `Two interior angles of a triangle measure ${a}° and ${b}°. What is the measure of the exterior angle at the third vertex?`,
      answer: String(ext),
      hint: "Exterior angle = sum of the two opposite interior angles.",
      steps: [
        `The third interior angle is 180° − ${a}° − ${b}° = ${180 - a - b}°.`,
        `The exterior angle there is 180° − ${180 - a - b}° = ${ext}°.`,
        `That equals ${a}° + ${b}° — the two remote interior angles.`,
      ],
      concept: "A triangle's exterior angle equals the sum of the two remote interior angles.",
      verify: () => 180 - (180 - a - b) === ext,
    });
  }
  const a = rng.int(60, 110);
  const b = rng.int(60, 110);
  const c = rng.int(60, 110);
  const d = 360 - a - b - c;
  return inputQ({
    instruction: "Angles in a quadrilateral add to 360°.",
    prompt: `Three angles of a quadrilateral measure ${a}°, ${b}°, and ${c}°. What is the fourth angle?`,
    answer: String(d),
    hint: "A quadrilateral splits into two triangles: 2 × 180° = 360°.",
    steps: [`${a}° + ${b}° + ${c}° = ${a + b + c}°.`, `360° − ${a + b + c}° = ${d}°.`],
    concept: "The angle sum of every quadrilateral is 360°.",
    verify: () => a + b + c + d === 360,
  });
}

const angles: GeneratorFamily = {
  stageLabel: (s, st) => {
    const kind = str(s.params, "kind", "mixed");
    return (ANGLE_LABELS[kind] ?? ANGLE_LABELS.mixed)[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kindParam = str(skill.params, "kind", "mixed");
    const kind = (ANGLE_KINDS as readonly string[]).includes(kindParam)
      ? kindParam
      : rng.pick(ANGLE_KINDS);
    if (kind === "identify") return genAngleIdentify(stage, rng);
    if (kind === "measure") return genAngleMeasure(stage, rng);
    if (kind === "relationships") return genAngleRelationships(stage, rng);
    return genTriangleSum(stage, rng);
  },
};

/* ------------------------------------------------------------- perimeter-area */
function rectPerimeter(rng: Rng, u: string): RawQuestion {
  const l = rng.int(4, 12);
  const w = rng.int(2, l - 1);
  const p = 2 * (l + w);
  return inputQ({
    instruction: "Perimeter is the distance all the way around.",
    prompt: `A rectangle is ${l} ${u} long and ${w} ${u} wide. What is its perimeter in ${u}?`,
    answer: String(p),
    hint: "Add all four sides, or use 2 × (length + width).",
    steps: [`Perimeter = 2 × (${l} + ${w}).`, `${l} + ${w} = ${l + w}, and 2 × ${l + w} = ${p} ${u}.`],
    concept: "Rectangle perimeter doubles the length-plus-width.",
    verify: () => l + w + l + w === p,
  });
}

function rectArea(rng: Rng, u: string, mc: boolean): RawQuestion {
  const l = rng.int(4, 12);
  const w = rng.int(2, 9);
  const a = l * w;
  if (mc) {
    const wrongs = [String(2 * (l + w)), String(l + w), String(a + l)];
    return mcQ({
      instruction: `Find the area in square ${u === "cm" ? "centimetres" : "metres"}.`,
      prompt: `A rectangle is ${l} ${u} long and ${w} ${u} wide. What is its area in ${u}^2?`,
      choices: mcChoices(rng, String(a), rng.shuffle(wrongs)),
      answer: String(a),
      hint: "Area covers the inside: length × width. Perimeter goes around.",
      steps: [`Area = length × width = ${l} × ${w} = ${a} ${u}^2.`, `Careful: ${2 * (l + w)} is the perimeter, not the area.`],
      concept: "Area multiplies the sides; perimeter adds them.",
      verify: () => a / w === l,
    });
  }
  return inputQ({
    instruction: `Find the area in ${u}^2.`,
    prompt: `A rectangle is ${l} ${u} long and ${w} ${u} wide. What is its area?`,
    answer: String(a),
    hint: "Area of a rectangle = length × width.",
    steps: [`Area = ${l} × ${w} = ${a} ${u}^2.`, `That counts the ${a} unit squares that tile the rectangle.`],
    concept: "Rectangle area is length times width.",
    verify: () => a / w === l,
  });
}

function triArea(rng: Rng, u: string, big: boolean): RawQuestion {
  const b = 2 * rng.int(big ? 5 : 2, big ? 10 : 6);
  const h = rng.int(big ? 6 : 3, big ? 14 : 9);
  const a = (b * h) / 2;
  return inputQ({
    instruction: `Find the area in ${u}^2.`,
    prompt: `A triangle has a base of ${b} ${u} and a height of ${h} ${u}. What is its area?`,
    answer: String(a),
    hint: "Triangle area = half of base × height.",
    steps: [
      `A triangle is half of a ${b} × ${h} rectangle.`,
      `${b} × ${h} = ${b * h}, and half of ${b * h} is ${a} ${u}^2.`,
    ],
    concept: "A triangle's area is half the matching rectangle's.",
    verify: () => (b / 2) * h === a,
  });
}

function compositeArea(rng: Rng, u: string): RawQuestion {
  const W = rng.int(8, 14);
  const H = rng.int(6, 12);
  const w = rng.int(2, W - 3);
  const h = rng.int(2, H - 3);
  const a = W * H - w * h;
  return inputQ({
    instruction: `Find the remaining area in ${u}^2.`,
    prompt: `A rectangular sheet ${W} ${u} by ${H} ${u} has a ${w} ${u} by ${h} ${u} rectangle cut from one corner. What area is left?`,
    answer: String(a),
    hint: "Find the whole area, then subtract the cut-out.",
    steps: [
      `Whole sheet: ${W} × ${H} = ${W * H} ${u}^2.`,
      `Cut-out: ${w} × ${h} = ${w * h} ${u}^2.`,
      `Left over: ${W * H} − ${w * h} = ${a} ${u}^2.`,
    ],
    concept: "Composite areas come from adding or subtracting rectangles.",
    verify: () => W * (H - h) + (W - w) * h === a,
  });
}

const perimeterArea: GeneratorFamily = {
  stageLabel: (s, st) => {
    const shape = str(s.params, "shape", "rect");
    if (shape === "tri")
      return ["Perimeter of triangles", "Area basics", "Area practice", "Missing base or height", "Composite figures"][st - 1];
    if (shape === "mixed")
      return ["Rectangles", "Triangles", "Parallelograms", "Missing dimensions", "Composite figures"][st - 1];
    return ["Perimeter of rectangles", "Area of rectangles", "Squares", "Missing sides", "Composite figures"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const shape = str(skill.params, "shape", "rect");
    const u = rng.pick(["cm", "m"] as const);
    if (shape === "tri") {
      if (stage === 1) {
        const a = rng.int(5, 12);
        const b = rng.int(5, 12);
        const c = rng.int(Math.abs(a - b) + 1, a + b - 1);
        const p = a + b + c;
        return inputQ({
          instruction: "Perimeter is the distance all the way around.",
          prompt: `A triangle has sides of ${a} ${u}, ${b} ${u}, and ${c} ${u}. What is its perimeter?`,
          answer: String(p),
          hint: "Add all three sides.",
          steps: [`${a} + ${b} + ${c} = ${p} ${u}.`],
          concept: "Perimeter adds every side once.",
          verify: () => c + b + a === p,
        });
      }
      if (stage === 2) return triArea(rng, u, false);
      if (stage === 3) return triArea(rng, u, true);
      if (stage === 4) {
        const b = 2 * rng.int(3, 8);
        const h = rng.int(4, 12);
        const A = (b * h) / 2;
        return inputQ({
          instruction: "Work backwards from the area.",
          prompt: `A triangle has an area of ${A} ${u}^2 and a base of ${b} ${u}. What is its height in ${u}?`,
          answer: String(h),
          hint: "Area = half of base × height, so height = 2 × area ÷ base.",
          steps: [`2 × ${A} = ${2 * A}.`, `${2 * A} ÷ ${b} = ${h} ${u}.`, `Check: half of ${b} × ${h} = ${A}. ✓`],
          concept: "Undo the area formula to find a missing dimension.",
          verify: () => (b * h) / 2 === A,
        });
      }
      const l = rng.int(6, 12);
      const w = 2 * rng.int(2, 5);
      const t = rng.int(3, 8);
      const total = l * w + (w * t) / 2;
      return inputQ({
        instruction: `Find the total area in ${u}^2.`,
        prompt: `A figure is a ${l} ${u} by ${w} ${u} rectangle with a triangle on top. The triangle's base is ${w} ${u} and its height is ${t} ${u}. What is the total area?`,
        answer: String(total),
        hint: "Add the rectangle's area and the triangle's area.",
        steps: [
          `Rectangle: ${l} × ${w} = ${l * w} ${u}^2.`,
          `Triangle: half of ${w} × ${t} = ${(w * t) / 2} ${u}^2.`,
          `Total: ${l * w} + ${(w * t) / 2} = ${total} ${u}^2.`,
        ],
        concept: "Split a composite figure into shapes you can measure.",
        verify: () => l * w + (w / 2) * t === total,
      });
    }
    if (shape === "mixed") {
      if (stage === 1) return rng.chance(0.5) ? rectPerimeter(rng, u) : rectArea(rng, u, rng.chance(0.4));
      if (stage === 2) return triArea(rng, u, false);
      if (stage === 3) {
        const b = rng.int(4, 12);
        const h = rng.int(3, 9);
        const a = b * h;
        return inputQ({
          instruction: `Find the area in ${u}^2.`,
          prompt: `A parallelogram has a base of ${b} ${u} and a height of ${h} ${u}. What is its area?`,
          answer: String(a),
          hint: "Parallelogram area = base × height, just like a rectangle.",
          steps: [
            `Slicing a triangle off one end and moving it to the other turns the parallelogram into a ${b} × ${h} rectangle.`,
            `Area = ${b} × ${h} = ${a} ${u}^2.`,
          ],
          concept: "A parallelogram rearranges into a rectangle with the same base and height.",
          verify: () => a / h === b,
        });
      }
      if (stage === 4) {
        const A = rng.int(3, 9);
        const w = rng.int(2, 8);
        const area = A * w;
        return inputQ({
          instruction: "Work backwards from the area.",
          prompt: `A rectangle has an area of ${area} ${u}^2 and a width of ${w} ${u}. What is its length in ${u}?`,
          answer: String(A),
          hint: "Length = area ÷ width.",
          steps: [`${area} ÷ ${w} = ${A} ${u}.`, `Check: ${A} × ${w} = ${area}. ✓`],
          concept: "Division undoes the area formula.",
          verify: () => A * w === area,
        });
      }
      return compositeArea(rng, u);
    }
    // rect
    if (stage === 1) return rectPerimeter(rng, u);
    if (stage === 2) return rectArea(rng, u, rng.chance(0.4));
    if (stage === 3) {
      const s = rng.int(3, 12);
      const askArea = rng.chance(0.5);
      const ans = askArea ? s * s : 4 * s;
      return inputQ({
        instruction: askArea ? `Find the area in ${u}^2.` : `Find the perimeter in ${u}.`,
        prompt: `A square has sides of ${s} ${u}. What is its ${askArea ? "area" : "perimeter"}?`,
        answer: String(ans),
        hint: askArea ? "All sides are equal: side × side." : "All four sides are equal: 4 × side.",
        steps: askArea
          ? [`Area = ${s} × ${s} = ${ans} ${u}^2.`]
          : [`Perimeter = ${s} + ${s} + ${s} + ${s} = ${ans} ${u}.`],
        concept: "A square's equal sides make its formulas simple.",
        verify: () => (askArea ? ans / s === s : ans / 4 === s),
      });
    }
    if (stage === 4) {
      const l = rng.int(4, 12);
      const w = rng.int(2, 9);
      const byArea = rng.chance(0.5);
      if (byArea) {
        return inputQ({
          instruction: "Work backwards from the area.",
          prompt: `A rectangle has an area of ${l * w} ${u}^2 and a length of ${l} ${u}. What is its width in ${u}?`,
          answer: String(w),
          hint: "Width = area ÷ length.",
          steps: [`${l * w} ÷ ${l} = ${w} ${u}.`, `Check: ${l} × ${w} = ${l * w}. ✓`],
          concept: "Division undoes the area formula.",
          verify: () => l * w === w * l,
        });
      }
      const p = 2 * (l + w);
      return inputQ({
        instruction: "Work backwards from the perimeter.",
        prompt: `A rectangle has a perimeter of ${p} ${u} and a length of ${l} ${u}. What is its width in ${u}?`,
        answer: String(w),
        hint: "Half the perimeter is length + width.",
        steps: [`Half of ${p} is ${p / 2}, which equals length + width.`, `${p / 2} − ${l} = ${w} ${u}.`],
        concept: "Half the perimeter of a rectangle is one length plus one width.",
        verify: () => 2 * (l + w) === p,
      });
    }
    return compositeArea(rng, u);
  },
};

/* ------------------------------------------------------------- volume-surface */
const volumeSurface: GeneratorFamily = {
  stageLabel: (s, st) => {
    const kind = str(s.params, "kind", "volume");
    if (kind === "surface")
      return ["Faces of a cube", "Surface area of cubes", "Boxes", "Working backwards", "Choose and check"][st - 1];
    return ["Counting unit cubes", "Boxes (l × w × h)", "Cubes", "Missing dimensions", "Solve problems"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "volume");
    if (kind === "surface") {
      if (stage === 1) {
        const e = rng.int(2, 9);
        return inputQ({
          instruction: "Think about one face of the cube.",
          prompt: `A cube has edges of ${e} cm. What is the area of one face in cm^2?`,
          answer: String(e * e),
          hint: "Each face is a square with sides equal to the edge.",
          steps: [`Each face is a ${e} × ${e} square.`, `${e} × ${e} = ${e * e} cm^2.`],
          concept: "A cube's faces are squares built on its edge length.",
          verify: () => (e * e) / e === e,
        });
      }
      if (stage === 2) {
        const e = rng.int(2, 9);
        const sa = 6 * e * e;
        return inputQ({
          instruction: "Surface area adds up every face.",
          prompt: `A cube has edges of ${e} cm. What is its total surface area in cm^2?`,
          answer: String(sa),
          hint: "A cube has 6 identical square faces.",
          steps: [`One face: ${e} × ${e} = ${e * e} cm^2.`, `Six faces: 6 × ${e * e} = ${sa} cm^2.`],
          concept: "Cube surface area is six times one face's area.",
          verify: () => sa / 6 === e * e,
        });
      }
      if (stage === 3) {
        const l = rng.int(2, 7);
        const w = rng.int(2, 7);
        const h = rng.int(2, 7);
        const sa = 2 * (l * w + l * h + w * h);
        return inputQ({
          instruction: "Surface area adds up every face.",
          prompt: `A box is ${l} cm long, ${w} cm wide, and ${h} cm tall. What is its total surface area in cm^2?`,
          answer: String(sa),
          hint: "The box has three different pairs of matching faces.",
          steps: [
            `Top and bottom: 2 × (${l} × ${w}) = ${2 * l * w} cm^2.`,
            `Front and back: 2 × (${l} × ${h}) = ${2 * l * h} cm^2.`,
            `The two sides: 2 × (${w} × ${h}) = ${2 * w * h} cm^2.`,
            `Total: ${2 * l * w} + ${2 * l * h} + ${2 * w * h} = ${sa} cm^2.`,
          ],
          concept: "A box's faces come in three equal pairs.",
          verify: () => 2 * l * w + 2 * l * h + 2 * w * h === sa,
        });
      }
      if (stage === 4) {
        const e = rng.int(2, 9);
        const sa = 6 * e * e;
        return inputQ({
          instruction: "Work backwards from the surface area.",
          prompt: `A cube has a total surface area of ${sa} cm^2. How long is each edge in cm?`,
          answer: String(e),
          hint: "Divide by 6 to get one face, then find the square's side.",
          steps: [
            `One face: ${sa} ÷ 6 = ${e * e} cm^2.`,
            `A square face of ${e * e} cm^2 has sides of ${e} cm, since ${e} × ${e} = ${e * e}.`,
          ],
          concept: "Undo surface area: divide by 6, then find the square root.",
          verify: () => 6 * e * e === sa,
        });
      }
      const l = rng.int(2, 6);
      const w = rng.int(2, 6);
      const h = rng.int(2, 6);
      const sa = 2 * (l * w + l * h + w * h);
      const ans = String(sa);
      const wrongs = [String(l * w * h), String(l * w + l * h + w * h), String(2 * (l * w + l * h))];
      return mcQ({
        instruction: "Choose the surface area.",
        prompt: `A gift box is ${l} cm by ${w} cm by ${h} cm. How many cm^2 of paper exactly cover all its faces?`,
        choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
        answer: ans,
        hint: "Cover all six faces — three matching pairs. Volume is a different measure.",
        steps: [
          `Pairs of faces: ${l}×${w}, ${l}×${h}, and ${w}×${h}, each twice.`,
          `2 × (${l * w} + ${l * h} + ${w * h}) = ${sa} cm^2.`,
          `Careful: ${l * w * h} would be the volume, not the surface area.`,
        ],
        concept: "Surface area covers the outside; volume fills the inside.",
        verify: () => 2 * l * w + 2 * l * h + 2 * w * h === sa,
      });
    }
    // volume
    if (stage === 1) {
      const l = rng.int(2, 5);
      const w = rng.int(2, 5);
      const h = rng.int(2, 4);
      const v = l * w * h;
      return inputQ({
        instruction: "Count the unit cubes.",
        prompt: `A box holds ${l} rows of ${w} unit cubes in each layer, and there are ${h} layers. How many unit cubes fill the box?`,
        answer: String(v),
        hint: "Find one layer first, then multiply by the number of layers.",
        steps: [`One layer: ${l} × ${w} = ${l * w} cubes.`, `${h} layers: ${l * w} × ${h} = ${v} cubes.`],
        concept: "Volume counts the unit cubes that fill a solid.",
        verify: () => v % h === 0 && v / h === l * w,
      });
    }
    if (stage === 2) {
      const l = rng.int(2, 9);
      const w = rng.int(2, 9);
      const h = rng.int(2, 9);
      const v = l * w * h;
      return inputQ({
        instruction: "Find the volume in cm^3.",
        prompt: `A box is ${l} cm long, ${w} cm wide, and ${h} cm tall. What is its volume?`,
        answer: String(v),
        hint: "Volume = length × width × height.",
        steps: [`${l} × ${w} = ${l * w}.`, `${l * w} × ${h} = ${v} cm^3.`],
        concept: "Box volume multiplies all three dimensions.",
        verify: () => l * (w * h) === v,
      });
    }
    if (stage === 3) {
      const e = rng.int(2, 9);
      const v = e * e * e;
      return inputQ({
        instruction: "Find the volume in cm^3.",
        prompt: `A cube has edges of ${e} cm. What is its volume?`,
        answer: String(v),
        hint: "A cube's length, width, and height are all the same.",
        steps: [`${e} × ${e} = ${e * e}.`, `${e * e} × ${e} = ${v} cm^3.`],
        concept: "Cube volume is the edge length used three times.",
        verify: () => v / e === e * e,
      });
    }
    if (stage === 4) {
      const l = rng.int(2, 9);
      const w = rng.int(2, 9);
      const h = rng.int(2, 9);
      const v = l * w * h;
      return inputQ({
        instruction: "Work backwards from the volume.",
        prompt: `A box has a volume of ${v} cm^3. Its base is ${l} cm by ${w} cm. How tall is it in cm?`,
        answer: String(h),
        hint: "Height = volume ÷ base area.",
        steps: [`Base area: ${l} × ${w} = ${l * w} cm^2.`, `${v} ÷ ${l * w} = ${h} cm.`, `Check: ${l * w} × ${h} = ${v}. ✓`],
        concept: "Division undoes the volume formula.",
        verify: () => l * w * h === v,
      });
    }
    const l = rng.int(10, 30);
    const w = rng.int(5, 20);
    const h = rng.int(4, 15);
    const v = l * w * h;
    return inputQ({
      instruction: "Solve the problem.",
      prompt: `A fish tank is ${l} cm long, ${w} cm wide, and filled with water to a depth of ${h} cm. How many cm^3 of water does it hold?`,
      answer: String(v),
      hint: "The water forms a box: length × width × depth.",
      steps: [`${l} × ${w} = ${l * w} cm^2 of base.`, `${l * w} × ${h} = ${v} cm^3 of water.`],
      concept: "Real volumes are found with the same box formula.",
      representation: "word",
      verify: () => v / h === l * w,
    });
  },
};

/* ----------------------------------------------------------- coordinate-plane */
const QUAD_NAMES = ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"] as const;
const TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
];
const NON_TRIPLES: readonly [number, number][] = [
  [1, 2],
  [2, 3],
  [1, 4],
  [2, 5],
  [3, 5],
  [4, 6],
  [1, 5],
];

function quadrantOf(x: number, y: number): string {
  if (x > 0 && y > 0) return "Quadrant I";
  if (x < 0 && y > 0) return "Quadrant II";
  if (x < 0 && y < 0) return "Quadrant III";
  return "Quadrant IV";
}

function genCoordIdentify(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const a = rng.int(1, 9);
    const b = rng.int(1, 9);
    const askX = rng.chance(0.5);
    return inputQ({
      instruction: "Coordinates count steps from the origin.",
      prompt: `Point P is ${a} units right of the origin and ${b} units up. What is its ${askX ? "x" : "y"}-coordinate?`,
      answer: String(askX ? a : b),
      hint: "The x-coordinate counts right; the y-coordinate counts up.",
      steps: [`Right ${a} means x = ${a}; up ${b} means y = ${b}.`, `So the ${askX ? "x" : "y"}-coordinate is ${askX ? a : b}.`],
      concept: "An ordered pair lists steps right, then steps up.",
      representation: "visual",
      verify: () => a > 0 && b > 0,
    });
  }
  if (stage === 2) {
    let a = rng.int(1, 8);
    let b = rng.int(1, 8);
    while (b === a) b = rng.int(1, 8);
    const ans = `(${a}, ${b})`;
    const wrongs = [`(${b}, ${a})`, `(${a}, 0)`, `(0, ${b})`];
    return mcQ({
      instruction: "Write the ordered pair.",
      prompt: `A point sits ${a} units right of the origin and ${b} units up. Which ordered pair names it?`,
      choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
      answer: ans,
      hint: "x comes first: (right, up).",
      steps: [`Right ${a} → x = ${a}. Up ${b} → y = ${b}.`, `The pair is (${a}, ${b}) — order matters.`],
      concept: "Ordered pairs always list x before y.",
      verify: () => a !== b,
    });
  }
  if (stage === 3) {
    const onX = rng.chance(0.5);
    const v = rng.int(1, 9) * (rng.chance(0.5) ? 1 : -1);
    const pt = onX ? `(${v}, 0)` : `(0, ${v})`;
    const ans = onX ? "the x-axis" : "the y-axis";
    return mcQ({
      instruction: "Points with a zero coordinate sit on an axis.",
      prompt: `Where does the point ${pt} lie?`,
      choices: rng.shuffle(["the x-axis", "the y-axis", "Quadrant I", "Quadrant III"]),
      answer: ans,
      hint: "Which coordinate is 0?",
      steps: [
        onX ? `Its y-coordinate is 0, so it has no height above or below the x-axis.` : `Its x-coordinate is 0, so it sits directly on the vertical axis.`,
        `The point lies on ${ans}.`,
      ],
      concept: "A zero coordinate places a point on an axis, not in a quadrant.",
      verify: () => v !== 0,
    });
  }
  if (stage === 4) {
    let a = rng.int(1, 8);
    let b = rng.int(1, 8);
    while (b === a) b = rng.int(1, 8);
    const overX = rng.chance(0.5);
    const img = overX ? `(${a}, ${-b})` : `(${-a}, ${b})`;
    const wrongs = [overX ? `(${-a}, ${b})` : `(${a}, ${-b})`, `(${-a}, ${-b})`, `(${b}, ${a})`];
    return mcQ({
      instruction: "Reflect the point.",
      prompt: `The point (${a}, ${b}) is reflected over the ${overX ? "x" : "y"}-axis. What are the coordinates of its image?`,
      choices: mcChoices(rng, img, rng.shuffle(wrongs)),
      answer: img,
      hint: overX ? "Reflecting over the x-axis flips the sign of y." : "Reflecting over the y-axis flips the sign of x.",
      steps: [
        overX
          ? `The x-axis mirror keeps x the same and flips y: (${a}, ${b}) → (${a}, ${-b}).`
          : `The y-axis mirror keeps y the same and flips x: (${a}, ${b}) → (${-a}, ${b}).`,
      ],
      concept: "Reflections over an axis flip exactly one coordinate's sign.",
      verify: () => a !== b,
    });
  }
  const c = rng.int(-5, 5);
  const x1 = rng.int(-8, 3);
  const x2 = x1 + rng.int(3, 9);
  return inputQ({
    instruction: "Find the distance along the grid.",
    prompt: `How far apart are the points (${x1}, ${c}) and (${x2}, ${c})?`,
    answer: String(x2 - x1),
    hint: "They share a y-coordinate, so count the gap between the x-coordinates.",
    steps: [`Both points sit on the line y = ${c}.`, `Distance = ${x2} − (${x1}) = ${x2 - x1} units.`],
    concept: "Points on the same horizontal line are separated by their x-difference.",
    verify: () => Math.abs(x2 - x1) === x2 - x1,
  });
}

function genCoordQuadrant(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) return genCoordIdentify(2, rng);
  if (stage === 2) {
    const x = rng.int(1, 8) * (rng.chance(0.5) ? 1 : -1);
    const y = rng.int(1, 8) * (rng.chance(0.5) ? 1 : -1);
    const ans = quadrantOf(x, y);
    return mcQ({
      instruction: "Name the quadrant.",
      prompt: `In which quadrant is the point (${x}, ${y})?`,
      choices: rng.shuffle([...QUAD_NAMES]),
      answer: ans,
      hint: "Check the signs: (+, +) is Quadrant I, then go counterclockwise.",
      steps: [
        `x is ${x > 0 ? "positive" : "negative"} and y is ${y > 0 ? "positive" : "negative"}.`,
        `That sign pattern belongs to ${ans}.`,
      ],
      concept: "The signs of x and y decide the quadrant.",
      verify: () => quadrantOf(x, y) === ans,
    });
  }
  if (stage === 3) {
    const combos = [
      { sx: "positive", sy: "positive", q: "Quadrant I" },
      { sx: "negative", sy: "positive", q: "Quadrant II" },
      { sx: "negative", sy: "negative", q: "Quadrant III" },
      { sx: "positive", sy: "negative", q: "Quadrant IV" },
    ] as const;
    const c = rng.pick(combos);
    return mcQ({
      instruction: "Think about the signs.",
      prompt: `A point has a ${c.sx} x-coordinate and a ${c.sy} y-coordinate. In which quadrant is it?`,
      choices: rng.shuffle([...QUAD_NAMES]),
      answer: c.q,
      hint: "Quadrants are numbered counterclockwise starting from (+, +).",
      steps: [`(${c.sx === "positive" ? "+" : "−"}, ${c.sy === "positive" ? "+" : "−"}) points land in ${c.q}.`],
      concept: "Each quadrant has its own sign pattern.",
    });
  }
  if (stage === 4) {
    const onX = rng.chance(0.5);
    const v = rng.int(1, 9) * (rng.chance(0.5) ? 1 : -1);
    const pt = onX ? `(${v}, 0)` : `(0, ${v})`;
    const ans = onX ? "On the x-axis" : "On the y-axis";
    return mcQ({
      instruction: "Not every point is in a quadrant.",
      prompt: `Where does the point ${pt} lie?`,
      choices: rng.shuffle(["On the x-axis", "On the y-axis", "Quadrant I", "Quadrant II"]),
      answer: ans,
      hint: "A zero coordinate puts the point on an axis.",
      steps: [
        onX ? `y = 0 means no vertical distance from the x-axis.` : `x = 0 means no horizontal distance from the y-axis.`,
        `So ${pt} lies ${ans.toLowerCase()}.`,
      ],
      concept: "Axis points belong to no quadrant.",
      verify: () => v !== 0,
    });
  }
  const a = rng.int(1, 8);
  const b = rng.int(1, 8);
  const overY = rng.chance(0.5);
  const img: [number, number] = overY ? [-a, b] : [a, -b];
  const ans = quadrantOf(img[0], img[1]);
  return mcQ({
    instruction: "Reflect, then locate.",
    prompt: `The point (${a}, ${b}) in Quadrant I is reflected over the ${overY ? "y" : "x"}-axis. In which quadrant is its image?`,
    choices: rng.shuffle([...QUAD_NAMES]),
    answer: ans,
    hint: overY ? "The reflection flips x to negative." : "The reflection flips y to negative.",
    steps: [
      `(${a}, ${b}) → (${img[0]}, ${img[1]}).`,
      `x is ${img[0] > 0 ? "positive" : "negative"} and y is ${img[1] > 0 ? "positive" : "negative"}, so the image is in ${ans}.`,
    ],
    concept: "Reflections over an axis move points to a neighbouring quadrant.",
    verify: () => quadrantOf(img[0], img[1]) === ans,
  });
}

function genCoordDistance(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) return genCoordIdentify(5, rng);
  if (stage === 2 || stage === 3) {
    const [dx, dy, c] = rng.pick(TRIPLES);
    const x0 = stage === 3 ? rng.int(-6, -1) : rng.int(0, 5);
    const y0 = stage === 3 ? rng.int(-6, -1) : rng.int(0, 5);
    return inputQ({
      instruction: "Use the distance formula (a right triangle in disguise).",
      prompt: `What is the distance between the points (${x0}, ${y0}) and (${x0 + dx}, ${y0 + dy})?`,
      answer: String(c),
      hint: `The horizontal gap is ${dx} and the vertical gap is ${dy}. Use a right triangle.`,
      steps: [
        `Horizontal change: ${dx}. Vertical change: ${dy}.`,
        `Distance = sqrt(${dx}^2 + ${dy}^2) = sqrt(${dx * dx} + ${dy * dy}) = sqrt(${c * c}).`,
        `sqrt(${c * c}) = ${c}.`,
      ],
      concept: "Distance on a grid is the hypotenuse of a right triangle.",
      verify: () => dx * dx + dy * dy === c * c,
    });
  }
  if (stage === 4) {
    const [dx, dy] = rng.pick(NON_TRIPLES);
    const c2 = dx * dx + dy * dy;
    const ans = `sqrt(${c2})`;
    const wrongs = [`${c2}`, `${dx + dy}`, `sqrt(${dx + dy})`];
    return mcQ({
      instruction: "Give the exact distance.",
      prompt: `What is the exact distance between (0, 0) and (${dx}, ${dy})?`,
      choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
      answer: ans,
      hint: "Square the two gaps, add them, and keep the square root.",
      steps: [
        `Distance = sqrt(${dx}^2 + ${dy}^2) = sqrt(${dx * dx} + ${dy * dy}) = sqrt(${c2}).`,
        `${c2} is not a perfect square, so the exact answer keeps the root sign.`,
      ],
      concept: "Exact distances keep the square root when it does not simplify.",
      verify: () => !Number.isInteger(Math.sqrt(c2)),
    });
  }
  const [dx, dy, c] = rng.pick(TRIPLES);
  return inputQ({
    instruction: "Solve the problem.",
    prompt: `A ship sails ${dx} km east and then ${dy} km north. How far is it from its starting point, in km?`,
    answer: String(c),
    hint: "East and north are at right angles — draw the triangle.",
    steps: [
      `The path forms a right triangle with legs ${dx} and ${dy}.`,
      `Distance = sqrt(${dx}^2 + ${dy}^2) = sqrt(${c * c}) = ${c} km.`,
    ],
    concept: "Straight-line distance is found with the Pythagorean theorem.",
    representation: "word",
    verify: () => dx * dx + dy * dy === c * c,
  });
}

function genCoordMidpoint(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const c = rng.int(1, 8);
    const x1 = rng.int(0, 6);
    const x2 = x1 + 2 * rng.int(1, 5);
    const mid = (x1 + x2) / 2;
    return inputQ({
      instruction: "The midpoint is halfway between the endpoints.",
      prompt: `A segment joins (${x1}, ${c}) and (${x2}, ${c}). What is the x-coordinate of its midpoint?`,
      answer: String(mid),
      hint: "Average the two x-coordinates.",
      steps: [`(${x1} + ${x2}) ÷ 2 = ${x1 + x2} ÷ 2 = ${mid}.`],
      concept: "The midpoint averages the endpoints' coordinates.",
      verify: () => mid - x1 === x2 - mid,
    });
  }
  if (stage === 2 || stage === 3) {
    const lo = stage === 3 ? -5 : 2;
    const hi = stage === 3 ? 5 : 8;
    let mx = rng.int(lo, hi);
    let my = rng.int(lo, hi);
    while (my === mx) my = rng.int(lo, hi);
    const dx = rng.int(1, 3);
    const dy = rng.int(1, 3);
    const x1 = mx - dx, x2 = mx + dx, y1 = my - dy, y2 = my + dy;
    const ans = `(${mx}, ${my})`;
    const wrongs = [`(${x1 + x2}, ${y1 + y2})`, `(${my}, ${mx})`, `(${dx}, ${dy})`];
    return mcQ({
      instruction: "Find the midpoint.",
      prompt: `What is the midpoint of the segment joining (${x1}, ${y1}) and (${x2}, ${y2})?`,
      choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
      answer: ans,
      hint: "Average the x-coordinates, then average the y-coordinates.",
      steps: [
        `x: (${x1} + ${x2}) ÷ 2 = ${mx}.`,
        `y: (${y1} + ${y2}) ÷ 2 = ${my}.`,
        `Midpoint: (${mx}, ${my}) — remember to divide the sums by 2.`,
      ],
      concept: "Midpoints average each coordinate separately.",
      verify: () => mx - x1 === x2 - mx && my - y1 === y2 - my,
    });
  }
  if (stage === 4) {
    let bx = rng.int(-6, 6);
    let by = rng.int(-6, 6);
    while (by === bx) by = rng.int(-6, 6);
    const dx = rng.int(1, 3);
    const dy = rng.int(1, 3);
    const ax = bx - 2 * dx, ay = by - 2 * dy;
    const mx = bx - dx, my = by - dy;
    const ans = `(${bx}, ${by})`;
    const wrongs = [`(${by}, ${bx})`, `(${mx}, ${my})`, `(${bx + 1}, ${by - 1})`];
    return mcQ({
      instruction: "Find the missing endpoint.",
      prompt: `M(${mx}, ${my}) is the midpoint of a segment. One endpoint is A(${ax}, ${ay}). What is the other endpoint?`,
      choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
      answer: ans,
      hint: "The midpoint is as far from B as it is from A — keep going the same amount.",
      steps: [
        `From A to M: x changed by ${dx} and y changed by ${dy}.`,
        `Go the same amount again: (${mx} + ${dx}, ${my} + ${dy}) = (${bx}, ${by}).`,
      ],
      concept: "Double the trip from an endpoint to the midpoint to reach the other endpoint.",
      verify: () => (ax + bx) / 2 === mx && (ay + by) / 2 === my,
    });
  }
  const x1 = rng.int(0, 5) * 2;
  const x2 = x1 + 2 * rng.int(2, 6);
  const y = rng.int(1, 8);
  const mid = (x1 + x2) / 2;
  return inputQ({
    instruction: "Solve the problem.",
    prompt: `Two friends live at (${x1}, ${y}) and (${x2}, ${y}) on a map grid. They meet exactly halfway. What is the x-coordinate of their meeting point?`,
    answer: String(mid),
    hint: "Halfway means the average of the two x-coordinates.",
    steps: [`(${x1} + ${x2}) ÷ 2 = ${mid}.`, `Check: ${mid} is ${mid - x1} from each home. ✓`],
    concept: "The midpoint is the same distance from both endpoints.",
    representation: "word",
    verify: () => mid - x1 === x2 - mid,
  });
}

const coordinatePlane: GeneratorFamily = {
  stageLabel: (s, st) => {
    const kind = str(s.params, "kind", "mixed");
    const L: Record<string, string[]> = {
      identify: ["Reading coordinates", "Ordered pairs", "On the axes", "Reflections", "Grid distances"],
      quadrant: ["Ordered pairs", "Name the quadrant", "Sign patterns", "On the axes", "Reflect and locate"],
      distance: ["Along the grid", "Right-triangle distance", "Any two points", "Exact distances", "Distance problems"],
      midpoint: ["Halfway points", "Midpoint formula", "With negatives", "Missing endpoints", "Midpoint problems"],
      mixed: ["Reading points", "Locating points", "Working the plane", "Formulas", "Coordinate problems"],
    };
    return (L[kind] ?? L.mixed)[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "mixed");
    const k =
      kind === "mixed" ? rng.pick(["identify", "quadrant", "distance", "midpoint"] as const) : kind;
    if (k === "identify") return genCoordIdentify(stage, rng);
    if (k === "quadrant") return genCoordQuadrant(stage, rng);
    if (k === "distance") return genCoordDistance(stage, rng);
    return genCoordMidpoint(stage, rng);
  },
};

/* ---------------------------------------------------------------- pythagorean */
const pythagorean: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Squares of the legs", "Find the hypotenuse", "Find a leg", "Exact answers", "Real problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const [a, b] = rng.pick(TRIPLES);
      const ans = a * a + b * b;
      return inputQ({
        instruction: "The theorem starts with the squares of the legs.",
        prompt: `A right triangle has legs of ${a} and ${b}. What is the value of ${a}^2 + ${b}^2?`,
        answer: String(ans),
        hint: `Square each leg first, then add.`,
        steps: [
          `${a}^2 = ${a * a} and ${b}^2 = ${b * b}.`,
          `${a * a} + ${b * b} = ${ans}.`,
          `The Pythagorean theorem says this equals the hypotenuse squared.`,
        ],
        concept: "In a right triangle, the legs' squares add to the hypotenuse's square.",
        verify: () => Number.isInteger(Math.sqrt(ans)),
      });
    }
    if (stage === 2) {
      const [a, b, c] = rng.pick(TRIPLES);
      return inputQ({
        instruction: "Find the hypotenuse.",
        prompt: `A right triangle has legs of ${a} cm and ${b} cm. How long is the hypotenuse in cm?`,
        answer: String(c),
        hint: "c^2 = a^2 + b^2. Then take the square root.",
        steps: [
          `c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}.`,
          `c = sqrt(${c * c}) = ${c} cm.`,
        ],
        concept: "The hypotenuse comes from adding the legs' squares, not the legs.",
        verify: () => a * a + b * b === c * c,
      });
    }
    if (stage === 3) {
      const [a, b, c] = rng.pick(TRIPLES);
      const known = rng.chance(0.5) ? a : b;
      const missing = known === a ? b : a;
      return inputQ({
        instruction: "Find the missing leg.",
        prompt: `A right triangle has a hypotenuse of ${c} cm and one leg of ${known} cm. How long is the other leg in cm?`,
        answer: String(missing),
        hint: "Subtract the known leg's square from the hypotenuse's square.",
        steps: [
          `leg^2 = ${c}^2 − ${known}^2 = ${c * c} − ${known * known} = ${missing * missing}.`,
          `leg = sqrt(${missing * missing}) = ${missing} cm.`,
        ],
        concept: "Rearranged, the theorem finds a leg by subtracting squares.",
        verify: () => known * known + missing * missing === c * c,
      });
    }
    if (stage === 4) {
      const [a, b] = rng.pick(NON_TRIPLES);
      const c2 = a * a + b * b;
      const ans = `sqrt(${c2})`;
      const wrongs = [`${c2}`, `${a + b}`, `sqrt(${a + b})`];
      return mcQ({
        instruction: "Give the exact length.",
        prompt: `A right triangle has legs of ${a} and ${b}. What is the exact length of the hypotenuse?`,
        choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
        answer: ans,
        hint: "Add the squares of the legs — never the legs themselves — then keep the root.",
        steps: [
          `c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c2}.`,
          `${c2} is not a perfect square, so c = sqrt(${c2}) exactly.`,
          `Adding the legs (${a + b}) is the classic mistake — lengths do not add like that.`,
        ],
        concept: "Squares add; side lengths do not.",
        verify: () => !Number.isInteger(Math.sqrt(c2)),
      });
    }
    const [a, b, c] = rng.pick(TRIPLES);
    const ladder = rng.chance(0.5);
    return inputQ({
      instruction: "Solve the problem.",
      prompt: ladder
        ? `A ladder leans against a wall. Its foot is ${a} m from the wall and its top reaches ${b} m up the wall. How long is the ladder in m?`
        : `A rectangular field is ${a} m by ${b} m. How long is the diagonal path across it, in m?`,
      answer: String(c),
      hint: "Sketch the right triangle: the answer is its hypotenuse.",
      steps: [
        `The two given lengths are the legs of a right triangle.`,
        `c^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}, so c = ${c} m.`,
      ],
      concept: "Right angles in real situations invite the Pythagorean theorem.",
      representation: "word",
      verify: () => a * a + b * b === c * c,
    });
  },
};

/* ------------------------------------------------------------ transformations */
const transformations: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Slides, flips, turns", "Translations", "Reflections", "Rotations", "Which transformation?"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const DESC = [
        { d: "slides 4 units to the right without turning or flipping", a: "translation" },
        { d: "flips over a line to make a mirror image", a: "reflection" },
        { d: "turns around a fixed point", a: "rotation" },
      ] as const;
      const t = rng.pick(DESC);
      const wrongs = ["translation", "reflection", "rotation", "dilation"].filter((x) => x !== t.a);
      return mcQ({
        instruction: "Name the transformation.",
        prompt: `A shape ${t.d}. What is this transformation called?`,
        choices: mcChoices(rng, t.a, rng.shuffle(wrongs)),
        answer: t.a,
        hint: "Slide = translation, flip = reflection, turn = rotation.",
        steps: [`A ${t.a} is exactly a ${t.a === "translation" ? "slide" : t.a === "reflection" ? "flip" : "turn"}.`],
        concept: "Translations slide, reflections flip, rotations turn.",
      });
    }
    if (stage === 2) {
      const x = rng.int(1, 7);
      const y = rng.int(1, 7);
      const dx = rng.int(1, 4);
      const dy = rng.int(1, 4);
      const ans = `(${x + dx}, ${y + dy})`;
      const wrongs = [`(${x - dx}, ${y - dy})`, `(${x + dx}, ${y})`, `(${x + dy}, ${y + dx})`];
      return mcQ({
        instruction: "Translate the point.",
        prompt: `The point (${x}, ${y}) is translated ${dx} units right and ${dy} units up. What are the coordinates of its image?`,
        choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
        answer: ans,
        hint: "Right adds to x; up adds to y.",
        steps: [`x: ${x} + ${dx} = ${x + dx}.`, `y: ${y} + ${dy} = ${y + dy}.`, `Image: (${x + dx}, ${y + dy}).`],
        concept: "A translation adds the same amounts to every point's coordinates.",
        verify: () => x + dx - dx === x && y + dy - dy === y,
      });
    }
    if (stage === 3) {
      const a = rng.int(1, 7);
      const b = rng.int(1, 7);
      const overX = rng.chance(0.5);
      const ans = overX ? `(${a}, ${-b})` : `(${-a}, ${b})`;
      const wrongs = [overX ? `(${-a}, ${b})` : `(${a}, ${-b})`, `(${-a}, ${-b})`, `(${b}, ${a})`];
      return mcQ({
        instruction: "Reflect the point.",
        prompt: `The point (${a}, ${b}) is reflected over the ${overX ? "x" : "y"}-axis. What are the coordinates of its image?`,
        choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
        answer: ans,
        hint: overX ? "The x-axis mirror flips the y-coordinate's sign." : "The y-axis mirror flips the x-coordinate's sign.",
        steps: [
          `The mirror line is the ${overX ? "x" : "y"}-axis, so the ${overX ? "y" : "x"}-coordinate changes sign.`,
          `(${a}, ${b}) → ${ans}.`,
        ],
        concept: "Axis reflections flip the sign of exactly one coordinate.",
        verify: () => a > 0 && b > 0,
      });
    }
    if (stage === 4) {
      let x = rng.int(1, 6);
      let y = rng.int(1, 6);
      while (y === x) y = rng.int(1, 6);
      const rot = rng.pick([
        { name: "180°", img: [-x, -y] as const },
        { name: "90° counterclockwise", img: [-y, x] as const },
        { name: "90° clockwise", img: [y, -x] as const },
      ]);
      const ans = `(${rot.img[0]}, ${rot.img[1]})`;
      const all = [`(${-x}, ${-y})`, `(${-y}, ${x})`, `(${y}, ${-x})`, `(${x}, ${y})`];
      const wrongs = all.filter((p) => p !== ans);
      return mcQ({
        instruction: "Rotate the point about the origin.",
        prompt: `The point (${x}, ${y}) is rotated ${rot.name} about the origin. What are the coordinates of its image?`,
        choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
        answer: ans,
        hint:
          rot.name === "180°"
            ? "A half turn flips both signs."
            : "A quarter turn swaps the coordinates and flips one sign.",
        steps: [
          rot.name === "180°"
            ? `180° about the origin: (x, y) → (−x, −y).`
            : rot.name === "90° counterclockwise"
              ? `90° counterclockwise: (x, y) → (−y, x).`
              : `90° clockwise: (x, y) → (y, −x).`,
          `So (${x}, ${y}) → ${ans}.`,
        ],
        concept: "Each rotation about the origin follows a fixed coordinate rule.",
        verify: () => x !== y,
      });
    }
    let a = rng.int(1, 6);
    let b = rng.int(1, 6);
    while (b === a) b = rng.int(1, 6);
    const options = [
      { name: "a reflection over the x-axis", img: [a, -b] as const },
      { name: "a reflection over the y-axis", img: [-a, b] as const },
      { name: "a rotation of 180° about the origin", img: [-a, -b] as const },
      { name: "a translation 2 units right and 1 unit up", img: [a + 2, b + 1] as const },
    ];
    const t = rng.pick(options);
    const choices = rng.shuffle(options.map((o) => o.name));
    return mcQ({
      instruction: "Identify the transformation.",
      prompt: `A transformation maps the point (${a}, ${b}) to (${t.img[0]}, ${t.img[1]}). Which transformation is it?`,
      choices,
      answer: t.name,
      hint: "Look at what happened to the signs of the coordinates.",
      steps: [
        `Compare (${a}, ${b}) with (${t.img[0]}, ${t.img[1]}).`,
        `Only ${t.name} produces exactly that change.`,
      ],
      concept: "Sign changes reveal reflections and rotations; shifts reveal translations.",
      verify: () =>
        options.filter((o) => o.img[0] === t.img[0] && o.img[1] === t.img[1]).length === 1,
    });
  },
};

/* ----------------------------------------------------------------- similarity */
const similarity: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Enlargements", "Scale factors", "Matching sides", "Area and scale", "Indirect measurement"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const k = rng.int(2, 4);
      const side = rng.int(3, 9);
      return inputQ({
        instruction: "Enlarge the figure.",
        prompt: `A photo has a side of ${side} cm. It is enlarged by a scale factor of ${k}. How long is that side in the enlargement, in cm?`,
        answer: String(k * side),
        hint: `Multiply the side by the scale factor.`,
        steps: [`${side} × ${k} = ${k * side} cm.`, `Every length in the enlargement is ${k} times as long.`],
        concept: "A scale factor multiplies every length by the same amount.",
        verify: () => (k * side) / side === k,
      });
    }
    if (stage === 2) {
      const k = rng.int(2, 5);
      const side = rng.int(3, 9);
      return inputQ({
        instruction: "Find the scale factor.",
        prompt: `Two similar figures match a side of ${side} cm to a side of ${k * side} cm. What is the scale factor from the small figure to the large one?`,
        answer: String(k),
        hint: "Divide the new length by the original length.",
        steps: [`${k * side} ÷ ${side} = ${k}.`, `Every pair of matching sides has this same ratio.`],
        concept: "Similar figures share one ratio between all matching sides.",
        verify: () => side * k === k * side,
      });
    }
    if (stage === 3) {
      const k = rng.int(2, 4);
      let a = rng.int(3, 9);
      let b = rng.int(3, 9);
      while (b === a) b = rng.int(3, 9);
      return inputQ({
        instruction: "Triangles ABC and DEF are similar.",
        prompt: `Side AB = ${a} cm matches side DE = ${k * a} cm. Side BC = ${b} cm matches side EF. How long is EF in cm?`,
        answer: String(k * b),
        hint: `First find the scale factor from AB to DE.`,
        steps: [
          `Scale factor: ${k * a} ÷ ${a} = ${k}.`,
          `EF = ${b} × ${k} = ${k * b} cm.`,
          `Check the proportion: {${a}/${k * a}} = {${b}/${k * b}}. ✓`,
        ],
        concept: "Matching sides of similar triangles are in the same ratio.",
        verify: () => a * (k * b) === b * (k * a),
      });
    }
    if (stage === 4) {
      const k = rng.int(2, 5);
      return inputQ({
        instruction: "Think about how area scales.",
        prompt: `Every side of a rectangle is multiplied by ${k}. Its area is multiplied by what number?`,
        answer: String(k * k),
        hint: "Both the length and the width grow — the area grows twice over.",
        steps: [
          `New area = (${k} × length) × (${k} × width) = ${k} × ${k} × old area.`,
          `So the area is multiplied by ${k * k}, not ${k}.`,
        ],
        concept: "Scaling lengths by k scales areas by k squared.",
        verify: () => k ** 2 === k * k,
      });
    }
    const h = rng.int(2, 4);
    const s = rng.int(1, 3);
    const k = rng.int(2, 5);
    return inputQ({
      instruction: "Use similar triangles.",
      prompt: `A ${h} m pole casts a ${s} m shadow. At the same time, a tree casts a ${k * s} m shadow. How tall is the tree in m?`,
      answer: String(k * h),
      hint: "The sun makes both triangles similar: same ratio of height to shadow.",
      steps: [
        `The tree's shadow is ${k * s} ÷ ${s} = ${k} times the pole's shadow.`,
        `So the tree is ${k} times the pole's height: ${h} × ${k} = ${k * h} m.`,
      ],
      concept: "Similar triangles let you measure heights from shadows.",
      representation: "word",
      verify: () => h * (k * s) === s * (k * h),
    });
  },
};

/* -------------------------------------------------------------- circle-measure */
const circleMeasure: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Radius and diameter", "Circumference with π", "Area with π", "Using π ≈ 3.14", "Circle problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const r = rng.int(2, 12);
      const giveRadius = rng.chance(0.5);
      return inputQ({
        instruction: "The diameter crosses the whole circle through the centre.",
        prompt: giveRadius
          ? `A circle has a radius of ${r} cm. What is its diameter in cm?`
          : `A circle has a diameter of ${2 * r} cm. What is its radius in cm?`,
        answer: String(giveRadius ? 2 * r : r),
        hint: "The diameter is twice the radius.",
        steps: giveRadius
          ? [`Diameter = 2 × radius = 2 × ${r} = ${2 * r} cm.`]
          : [`Radius = diameter ÷ 2 = ${2 * r} ÷ 2 = ${r} cm.`],
        concept: "Diameter = 2 × radius, always.",
        verify: () => (2 * r) / 2 === r,
      });
    }
    if (stage === 2) {
      const r = rng.int(2, 9);
      const ans = `${2 * r}π`;
      const wrongs = [`${r}π`, `${r * r}π`, `${4 * r}π`, `${2 * r}`];
      return mcQ({
        instruction: "Give the exact circumference.",
        prompt: `A circle has a radius of ${r} cm. What is its circumference, in terms of π?`,
        choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
        answer: ans,
        hint: "Circumference = 2πr.",
        steps: [
          `C = 2 × π × r = 2 × π × ${r}.`,
          `C = ${2 * r}π cm — exactly, with no rounding.`,
        ],
        concept: "Answers in terms of π stay exact.",
        verify: () => 2 * r === r + r,
      });
    }
    if (stage === 3) {
      const r = rng.int(2, 9);
      const ans = `${r * r}π`;
      const wrongs = [`${2 * r}π`, `${4 * r * r}π`, `${2 * r * r}π`, `${r}π`];
      return mcQ({
        instruction: "Give the exact area.",
        prompt: `A circle has a radius of ${r} cm. What is its area, in terms of π?`,
        choices: mcChoices(rng, ans, rng.shuffle(wrongs)),
        answer: ans,
        hint: "Area = πr^2 — square the radius first.",
        steps: [
          `A = π × r^2 = π × ${r}^2 = π × ${r * r}.`,
          `A = ${r * r}π cm^2. (${2 * r}π would be the circumference.)`,
        ],
        concept: "Area uses the radius squared; circumference uses the radius doubled.",
        verify: () => r * r === r ** 2,
      });
    }
    if (stage === 4) {
      const isC = rng.chance(0.5);
      if (isC) {
        const d = rng.pick([5, 10, 15, 20, 25, 30]);
        const c = round2(3.14 * d);
        return inputQ({
          instruction: "Use π ≈ 3.14.",
          prompt: `A circle has a diameter of ${d} cm. What is its circumference in cm?`,
          answer: String(c),
          answerFormat: "decimal",
          hint: "Circumference = π × diameter.",
          steps: [`C = π × d ≈ 3.14 × ${d}.`, `C ≈ ${c} cm.`],
          concept: "The circumference is about 3.14 diameters long.",
          verify: () => round2((3.14 * d * 100) / 100) === c,
        });
      }
      const r = rng.pick([5, 10, 15, 20]);
      const a = round2(3.14 * r * r);
      return inputQ({
        instruction: "Use π ≈ 3.14.",
        prompt: `A circle has a radius of ${r} cm. What is its area in cm^2?`,
        answer: String(a),
        answerFormat: "decimal",
        hint: "Area = π × radius × radius.",
        steps: [`r^2 = ${r} × ${r} = ${r * r}.`, `A ≈ 3.14 × ${r * r} = ${a} cm^2.`],
        concept: "Square the radius before multiplying by π.",
        verify: () => round2(3.14 * r ** 2) === a,
      });
    }
    const isWheel = rng.chance(0.5);
    if (isWheel) {
      const d = rng.pick([5, 10, 15, 20, 25, 30]);
      const c = round2(3.14 * d);
      return inputQ({
        instruction: "Solve the problem. Use π ≈ 3.14.",
        prompt: `A wheel has a diameter of ${d} cm. How far does it roll in one complete turn, in cm?`,
        answer: String(c),
        answerFormat: "decimal",
        hint: "One turn rolls out exactly one circumference.",
        steps: [`One turn covers the circumference: C = π × d.`, `C ≈ 3.14 × ${d} = ${c} cm.`],
        concept: "A rolling wheel travels its circumference each turn.",
        representation: "word",
        verify: () => round2(3.14 * d) === c,
      });
    }
    const r = rng.pick([5, 10, 15, 20]);
    const a = round2(3.14 * r * r);
    return inputQ({
      instruction: "Solve the problem. Use π ≈ 3.14.",
      prompt: `A circular garden has a radius of ${r} m. What area of ground does it cover, in m^2?`,
      answer: String(a),
      answerFormat: "decimal",
      hint: "Area = π × r^2.",
      steps: [`r^2 = ${r * r}.`, `A ≈ 3.14 × ${r * r} = ${a} m^2.`],
      concept: "Circle area problems use πr^2 with the radius, not the diameter.",
      representation: "word",
      verify: () => round2(3.14 * r * r) === a,
    });
  },
};

export const geometryFamilies = {
  "shapes-2d": shapes2d,
  "shapes-3d": shapes3d,
  symmetry,
  angles,
  "perimeter-area": perimeterArea,
  "volume-surface": volumeSurface,
  "coordinate-plane": coordinatePlane,
  pythagorean,
  transformations,
  similarity,
  "circle-measure": circleMeasure,
} satisfies Record<string, GeneratorFamily>;
