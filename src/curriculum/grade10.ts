import type { GradeDef } from "./types";

export const grade10: GradeDef = {
  grade: 10,
  strands: [
    {
      id: "algebra",
      name: "Algebra",
      topics: [
        { name: "Polynomial Operations", family: "poly-add-sub", params: {} },
        { name: "Exponent Laws", family: "exponent-rules", params: {} },
        { name: "Rational Expressions", family: "rational-expression", params: { kind: "simplify" } },
        { name: "Radical Expressions", family: "radical-expression", params: { kind: "mixed" } },
        { name: "Simplifying Radicals", family: "radical-expression", params: { kind: "simplify" } },
      ],
    },
    {
      id: "algebra",
      name: "Factoring",
      topics: [
        { name: "Common Factors", family: "factor", params: { kind: "gcf" } },
        { name: "Difference of Squares", family: "factor", params: { kind: "diff-squares" } },
        { name: "Trinomials", family: "factor", params: { kind: "trinomial" } },
        { name: "Perfect Square Trinomials", family: "factor", params: { kind: "perfect-square" } },
        { name: "Factoring by Grouping", family: "factor", params: { kind: "grouping" } },
      ],
    },
    {
      id: "algebra",
      name: "Quadratics",
      topics: [
        { name: "Quadratic Expressions", family: "poly-mul", params: { kind: "binomial" } },
        { name: "Quadratic Equations", family: "quadratic-solve", params: { method: "mixed" } },
        { name: "Factoring Quadratics", family: "quadratic-solve", params: { method: "factoring" } },
        { name: "Completing the Square", family: "quadratic-solve", params: { method: "complete-square" } },
        { name: "Quadratic Formula", family: "quadratic-solve", params: { method: "formula" } },
        { name: "Vertex Form", family: "quadratic-features", params: { form: "vertex" } },
        { name: "Standard Form", family: "quadratic-features", params: { form: "standard" } },
        { name: "Factored Form", family: "quadratic-features", params: { form: "factored" } },
        { name: "Quadratic Graphs", family: "quadratic-features", params: { form: "mixed" } },
        { name: "Vertex", family: "quadratic-features", params: { form: "vertex" } },
        { name: "Axis of Symmetry", family: "quadratic-features", params: { form: "standard" } },
        { name: "Roots / Zeros", family: "quadratic-features", params: { form: "factored" } },
      ],
    },
    {
      id: "algebra",
      name: "Systems",
      topics: [
        { name: "Linear Systems", family: "systems", params: { method: "mixed" } },
        { name: "Substitution", family: "systems", params: { method: "substitution" } },
        { name: "Elimination", family: "systems", params: { method: "elimination" } },
        { name: "Graphical Solutions", family: "systems", params: { method: "graph" } },
        { name: "Linear-Quadratic Systems", family: "systems", params: { method: "mixed" } },
      ],
    },
    {
      id: "functions",
      name: "Functions",
      topics: [
        { name: "Relations", family: "mc-bank", params: { bank: "relations" } },
        { name: "Function Notation", family: "function-notation", params: {} },
        { name: "Domain", family: "domain-range", params: {} },
        { name: "Range", family: "domain-range", params: {} },
        { name: "Evaluating Functions", family: "function-notation", params: {} },
        { name: "Transformations", family: "function-transform", params: {} },
      ],
    },
    {
      id: "trig",
      name: "Trigonometry",
      topics: [
        { name: "Right Triangles", family: "right-triangle-trig", params: { find: "mixed" } },
        { name: "Sine", family: "right-triangle-trig", params: { find: "side" } },
        { name: "Cosine", family: "right-triangle-trig", params: { find: "side" } },
        { name: "Tangent", family: "right-triangle-trig", params: { find: "side" } },
        { name: "Inverse Trigonometry", family: "right-triangle-trig", params: { find: "angle" } },
        { name: "Solving Right Triangles", family: "right-triangle-trig", params: { find: "mixed" } },
        { name: "Angles of Elevation", family: "angle-apps", params: {} },
        { name: "Angles of Depression", family: "angle-apps", params: {} },
      ],
    },
    {
      id: "functions",
      name: "Financial Mathematics",
      topics: [
        { name: "Simple Interest", family: "financial", params: { kind: "simple" } },
        { name: "Compound Interest", family: "financial", params: { kind: "compound" } },
        { name: "Percent Change", family: "financial", params: { kind: "percent-change" } },
        { name: "Growth and Decay", family: "financial", params: { kind: "growth-decay" } },
      ],
    },
  ],
};
