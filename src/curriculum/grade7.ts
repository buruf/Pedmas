import type { GradeDef } from "./types";

export const grade7: GradeDef = {
  grade: 7,
  strands: [
    {
      id: "number",
      name: "Number & Rational Numbers",
      topics: [
        { name: "Integers", family: "integer-ops", params: { op: "mixed" } },
        { name: "Rational Numbers", family: "int-compare", params: { rational: true } },
        { name: "Absolute Value", family: "abs-value", params: {} },
        { name: "Rational Number Comparison", family: "int-compare", params: { rational: true } },
        { name: "Rational Number Operations", family: "integer-ops", params: { op: "mixed" } },
      ],
    },
    {
      id: "ratios",
      name: "Ratios & Proportions",
      topics: [
        { name: "Ratios", family: "ratio-basic", params: {} },
        { name: "Rates", family: "unit-rate", params: {} },
        { name: "Unit Rates", family: "unit-rate", params: {} },
        { name: "Proportional Relationships", family: "proportional-relationships", params: {} },
        { name: "Solving Proportions", family: "proportion-solve", params: {} },
        { name: "Scale Drawings", family: "scale-drawings", params: {} },
      ],
    },
    {
      id: "decimals",
      name: "Percent",
      topics: [
        { name: "Percent of a Number", family: "percent-basic", params: { kind: "of-number" } },
        { name: "Percent Increase", family: "percent-apps", params: { kind: "increase" } },
        { name: "Percent Decrease", family: "percent-apps", params: { kind: "decrease" } },
        { name: "Discounts", family: "percent-apps", params: { kind: "discount" } },
        { name: "Markups", family: "percent-apps", params: { kind: "markup" } },
        { name: "Tax", family: "percent-apps", params: { kind: "tax" } },
        { name: "Simple Interest", family: "interest", params: { kind: "simple" } },
      ],
    },
    {
      id: "algebra",
      name: "Algebra",
      topics: [
        { name: "Variables", family: "evaluate-expression", params: { vars: 1 } },
        { name: "Expressions", family: "translate-expression", params: {} },
        { name: "Combining Like Terms", family: "combine-like-terms", params: {} },
        { name: "Distributive Property", family: "distributive", params: {} },
        { name: "One-step Equations", family: "one-step-eq", params: {} },
        { name: "Two-step Equations", family: "two-step-eq", params: {} },
        { name: "Inequalities", family: "inequality", params: { steps: 1 } },
        { name: "Algebraic Expressions", family: "evaluate-expression", params: { vars: 2 } },
      ],
    },
    {
      id: "geometry",
      name: "Geometry",
      topics: [
        { name: "Angle Relationships", family: "angles", params: { kind: "relationships" } },
        { name: "Triangles", family: "angles", params: { kind: "triangle-sum" } },
        { name: "Quadrilaterals", family: "shapes-2d", params: {} },
        { name: "Circles", family: "circle-measure", params: { kind: "mixed" } },
        { name: "Area", family: "perimeter-area", params: { shape: "mixed" } },
        { name: "Surface Area", family: "volume-surface", params: { kind: "surface" } },
        { name: "Volume", family: "volume-surface", params: { kind: "volume" } },
        { name: "Scale Drawings", family: "scale-drawings", params: {} },
      ],
    },
    {
      id: "stats",
      name: "Statistics & Probability",
      topics: [
        { name: "Mean", family: "central-tendency", params: { stats: ["mean"] } },
        { name: "Median", family: "central-tendency", params: { stats: ["median"] } },
        { name: "Range", family: "central-tendency", params: { stats: ["range"] } },
        { name: "Data Distributions", family: "mc-bank", params: { bank: "distributions" } },
        { name: "Sampling", family: "mc-bank", params: { bank: "sampling" } },
        { name: "Simple Probability", family: "probability", params: { kind: "simple" } },
        { name: "Compound Probability", family: "probability", params: { kind: "compound" } },
      ],
    },
  ],
};
