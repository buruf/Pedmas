import type { GradeDef } from "./types";

export const grade6: GradeDef = {
  grade: 6,
  strands: [
    {
      id: "number",
      name: "Number Sense",
      topics: [
        { name: "Whole Numbers", family: "place-value", params: { max: 1000000 } },
        { name: "Integers", family: "int-compare", params: {} },
        { name: "Absolute Value", family: "abs-value", params: {} },
        { name: "Rational Numbers", family: "int-compare", params: { rational: true } },
        { name: "Number Lines", family: "number-line", params: { max: 100 } },
        { name: "Factors", family: "factors-multiples", params: { max: 100 } },
        { name: "Prime Factorization", family: "primes", params: {} },
      ],
    },
    {
      id: "operations",
      name: "Operations",
      topics: [
        { name: "Integer Addition", family: "integer-ops", params: { op: "add" } },
        { name: "Integer Subtraction", family: "integer-ops", params: { op: "sub" } },
        { name: "Integer Multiplication", family: "integer-ops", params: { op: "mul" } },
        { name: "Integer Division", family: "integer-ops", params: { op: "div" } },
        { name: "Rational Number Operations", family: "integer-ops", params: { op: "mixed" } },
        { name: "Order of Operations", family: "order-of-ops", params: {} },
      ],
    },
    {
      id: "fractions",
      name: "Fractions",
      topics: [
        { name: "Fraction Addition", family: "frac-add-sub", params: { op: "add" } },
        { name: "Fraction Subtraction", family: "frac-add-sub", params: { op: "sub" } },
        { name: "Fraction Multiplication", family: "frac-mul", params: {} },
        { name: "Fraction Division", family: "frac-div", params: {} },
        { name: "Mixed Number Operations", family: "mixed-number-ops", params: {} },
        { name: "Complex Fractions", family: "frac-div", params: {} },
      ],
    },
    {
      id: "decimals",
      name: "Decimals & Percent",
      topics: [
        { name: "Decimal Operations", family: "dec-add-sub", params: { op: "mixed" } },
        { name: "Decimal Conversion", family: "dec-frac-convert", params: { dir: "mixed" } },
        { name: "Percent of a Number", family: "percent-basic", params: { kind: "of-number" } },
        { name: "Finding the Whole", family: "percent-apps", params: { kind: "whole" } },
        { name: "Percent Increase", family: "percent-apps", params: { kind: "increase" } },
        { name: "Percent Decrease", family: "percent-apps", params: { kind: "decrease" } },
      ],
    },
    {
      id: "ratios",
      name: "Ratios & Proportions",
      topics: [
        { name: "Ratios", family: "ratio-basic", params: {} },
        { name: "Equivalent Ratios", family: "ratio-equivalent", params: {} },
        { name: "Unit Rates", family: "unit-rate", params: {} },
        { name: "Rates", family: "unit-rate", params: {} },
        { name: "Proportional Relationships", family: "proportional-relationships", params: {} },
        { name: "Solving Proportions", family: "proportion-solve", params: {} },
      ],
    },
    {
      id: "algebra",
      name: "Algebra Foundations",
      topics: [
        { name: "Variables", family: "translate-expression", params: {} },
        { name: "Expressions", family: "translate-expression", params: {} },
        { name: "Evaluating Expressions", family: "evaluate-expression", params: { vars: 1 } },
        { name: "Properties of Operations", family: "distributive", params: {} },
        { name: "One-step Equations", family: "one-step-eq", params: {} },
        { name: "One-step Inequalities", family: "inequality", params: { steps: 1 } },
      ],
    },
    {
      id: "geometry",
      name: "Geometry",
      topics: [
        { name: "Area", family: "perimeter-area", params: { shape: "mixed" } },
        { name: "Triangles", family: "perimeter-area", params: { shape: "tri" } },
        { name: "Quadrilaterals", family: "perimeter-area", params: { shape: "rect" } },
        { name: "Circles", family: "circle-measure", params: { kind: "mixed" } },
        { name: "Surface Area", family: "volume-surface", params: { kind: "surface" } },
        { name: "Volume", family: "volume-surface", params: { kind: "volume" } },
        // Added Aug 2026: nets were a named spec topic with no content
        // (CCSS 6.G.A.4 puts them exactly here).
        { name: "Nets of 3D Shapes", family: "nets", params: {} },
        { name: "Coordinate Plane", family: "coordinate-plane", params: { kind: "quadrant" } },
      ],
    },
    {
      id: "stats",
      name: "Statistics & Probability",
      topics: [
        { name: "Mean", family: "central-tendency", params: { stats: ["mean"] } },
        { name: "Median", family: "central-tendency", params: { stats: ["median"] } },
        { name: "Mode", family: "central-tendency", params: { stats: ["mode"] } },
        { name: "Range", family: "central-tendency", params: { stats: ["range"] } },
        { name: "Data Displays", family: "read-graph", params: { type: "mixed" } },
        { name: "Simple Probability", family: "probability", params: { kind: "simple" } },
      ],
    },
  ],
};
