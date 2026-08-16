import type { GradeDef } from "./types";

export const grade9: GradeDef = {
  grade: 9,
  strands: [
    {
      id: "number",
      name: "Number Systems",
      topics: [
        { name: "Real Numbers", family: "real-numbers", params: {} },
        { name: "Rational Numbers", family: "int-compare", params: { rational: true } },
        { name: "Irrational Numbers", family: "real-numbers", params: {} },
        { name: "Radicals", family: "radical-expression", params: { kind: "simplify" } },
        { name: "Exponents", family: "exponent-eval", params: {} },
      ],
    },
    {
      id: "algebra",
      name: "Algebra",
      topics: [
        { name: "Algebraic Expressions", family: "evaluate-expression", params: { vars: 2 } },
        { name: "Combining Like Terms", family: "combine-like-terms", params: {} },
        { name: "Distributive Property", family: "distributive", params: {} },
        { name: "Polynomial Addition", family: "poly-add-sub", params: {} },
        { name: "Polynomial Subtraction", family: "poly-add-sub", params: {} },
        { name: "Polynomial Multiplication", family: "poly-mul", params: { kind: "mixed" } },
        { name: "Exponent Laws", family: "exponent-rules", params: {} },
        { name: "Factoring Introduction", family: "factor", params: { kind: "gcf" } },
      ],
    },
    {
      id: "algebra",
      name: "Linear Equations",
      topics: [
        { name: "One-step Equations", family: "one-step-eq", params: {} },
        { name: "Multi-step Equations", family: "multi-step-eq", params: { kind: "mixed" } },
        { name: "Equations with Fractions", family: "multi-step-eq", params: { kind: "fractions" } },
        { name: "Equations with Decimals", family: "multi-step-eq", params: { kind: "decimals" } },
        { name: "Inequalities", family: "inequality", params: { steps: 2 } },
      ],
    },
    {
      id: "algebra",
      name: "Linear Relations",
      topics: [
        { name: "Slope", family: "slope", params: {} },
        { name: "Rate of Change", family: "slope", params: {} },
        { name: "Slope-intercept Form", family: "linear-equation", params: { kind: "slope-intercept" } },
        { name: "Point-slope Form", family: "linear-equation", params: { kind: "point-slope" } },
        { name: "Graphing Lines", family: "linear-equation", params: { kind: "graph" } },
        { name: "Parallel Lines", family: "linear-equation", params: { kind: "parallel-perpendicular" } },
        { name: "Perpendicular Lines", family: "linear-equation", params: { kind: "parallel-perpendicular" } },
      ],
    },
    {
      id: "algebra",
      name: "Systems",
      topics: [
        { name: "Graphical Solutions", family: "systems", params: { method: "graph" } },
        { name: "Substitution", family: "systems", params: { method: "substitution" } },
        { name: "Elimination", family: "systems", params: { method: "elimination" } },
        { name: "Applications", family: "systems", params: { method: "mixed" } },
      ],
    },
    {
      id: "geometry",
      name: "Geometry",
      topics: [
        { name: "Pythagorean Theorem", family: "pythagorean", params: {} },
        { name: "Similar Triangles", family: "similarity", params: {} },
        { name: "Coordinate Geometry", family: "coordinate-plane", params: { kind: "mixed" } },
        { name: "Distance", family: "coordinate-plane", params: { kind: "distance" } },
        { name: "Midpoint", family: "coordinate-plane", params: { kind: "midpoint" } },
        { name: "Transformations", family: "transformations", params: {} },
      ],
    },
    {
      id: "stats",
      name: "Probability & Statistics",
      topics: [
        { name: "Simple Probability", family: "probability", params: { kind: "simple" } },
        { name: "Compound Probability", family: "probability", params: { kind: "compound" } },
        { name: "Data Distributions", family: "mc-bank", params: { bank: "distributions" } },
        { name: "Correlation", family: "scatter-correlation", params: {} },
        { name: "Statistical Reasoning", family: "mc-bank", params: { bank: "correlation" } },
      ],
    },
  ],
};
