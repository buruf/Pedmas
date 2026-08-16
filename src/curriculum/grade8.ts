import type { GradeDef } from "./types";

export const grade8: GradeDef = {
  grade: 8,
  strands: [
    {
      id: "number",
      name: "Number Systems",
      topics: [
        { name: "Rational Numbers", family: "int-compare", params: { rational: true } },
        { name: "Irrational Numbers", family: "real-numbers", params: {} },
        { name: "Real Numbers", family: "real-numbers", params: {} },
        { name: "Square Roots", family: "roots", params: { kind: "square" } },
        { name: "Cube Roots", family: "roots", params: { kind: "cube" } },
      ],
    },
    {
      id: "number",
      name: "Exponents",
      topics: [
        { name: "Integer Exponents", family: "exponent-eval", params: {} },
        { name: "Exponent Rules", family: "exponent-rules", params: {} },
        { name: "Scientific Notation", family: "sci-notation", params: { dir: "mixed" } },
        { name: "Powers of Ten", family: "sci-notation", params: { dir: "to-standard" } },
      ],
    },
    {
      id: "algebra",
      name: "Algebra",
      topics: [
        { name: "Expressions", family: "translate-expression", params: {} },
        { name: "Combining Like Terms", family: "combine-like-terms", params: {} },
        { name: "Distributive Property", family: "distributive", params: {} },
        { name: "Linear Equations", family: "multi-step-eq", params: { kind: "basic" } },
        { name: "Variables on Both Sides", family: "multi-step-eq", params: { kind: "both-sides" } },
        { name: "Linear Inequalities", family: "inequality", params: { steps: 2 } },
        { name: "Systems Introduction", family: "systems", params: { method: "graph" } },
      ],
    },
    {
      id: "algebra",
      name: "Linear Relationships",
      topics: [
        { name: "Coordinate Plane", family: "coordinate-plane", params: { kind: "identify" } },
        { name: "Ordered Pairs", family: "coordinate-plane", params: { kind: "quadrant" } },
        { name: "Tables", family: "proportional-relationships", params: {} },
        { name: "Graphs", family: "linear-equation", params: { kind: "graph" } },
        { name: "Slope", family: "slope", params: {} },
        { name: "Rate of Change", family: "slope", params: {} },
        { name: "Slope-intercept Form", family: "linear-equation", params: { kind: "slope-intercept" } },
        { name: "Graphing Linear Equations", family: "linear-equation", params: { kind: "graph" } },
      ],
    },
    {
      id: "geometry",
      name: "Geometry",
      topics: [
        { name: "Transformations", family: "transformations", params: {} },
        { name: "Translations", family: "transformations", params: {} },
        { name: "Reflections", family: "transformations", params: {} },
        { name: "Rotations", family: "transformations", params: {} },
        { name: "Congruence", family: "similarity", params: {} },
        { name: "Similarity", family: "similarity", params: {} },
        { name: "Pythagorean Theorem", family: "pythagorean", params: {} },
        { name: "Volume", family: "volume-surface", params: { kind: "volume" } },
        { name: "Surface Area", family: "volume-surface", params: { kind: "surface" } },
      ],
    },
    {
      id: "stats",
      name: "Statistics",
      topics: [
        { name: "Scatter Plots", family: "scatter-correlation", params: {} },
        { name: "Correlation", family: "scatter-correlation", params: {} },
        { name: "Line of Best Fit", family: "scatter-correlation", params: {} },
        { name: "Data Interpretation", family: "read-graph", params: { type: "mixed" } },
      ],
    },
  ],
};
