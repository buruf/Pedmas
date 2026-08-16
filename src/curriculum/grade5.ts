import type { GradeDef } from "./types";

export const grade5: GradeDef = {
  grade: 5,
  strands: [
    {
      id: "number",
      name: "Number Sense",
      topics: [
        { name: "Place Value", family: "place-value", params: { max: 1000000 } },
        { name: "Rounding", family: "rounding", params: { max: 1000000 } },
        { name: "Factors", family: "factors-multiples", params: { max: 100 } },
        { name: "Multiples", family: "factors-multiples", params: { max: 100 } },
        { name: "Prime Factorization", family: "primes", params: {} },
        { name: "Greatest Common Factor", family: "gcf-lcm", params: {} },
        { name: "Least Common Multiple", family: "gcf-lcm", params: {} },
      ],
    },
    {
      id: "operations",
      name: "Operations",
      topics: [
        { name: "Multi-digit Addition", family: "multi-digit", params: { op: "add", digits: 5 } },
        { name: "Multi-digit Subtraction", family: "multi-digit", params: { op: "sub", digits: 5 } },
        { name: "Multi-digit Multiplication", family: "mult-multi", params: {} },
        { name: "Long Division", family: "long-division", params: {} },
        { name: "Order of Operations", family: "order-of-ops", params: {} },
        { name: "Estimation", family: "estimation", params: {} },
        { name: "Mental Math", family: "mental-math", params: { op: "mixed" } },
      ],
    },
    {
      id: "fractions",
      name: "Fractions",
      topics: [
        { name: "Equivalent Fractions", family: "frac-equivalent", params: {} },
        { name: "Simplifying Fractions", family: "frac-simplify", params: {} },
        { name: "Comparing Fractions", family: "frac-compare", params: {} },
        { name: "Ordering Fractions", family: "frac-compare", params: {} },
        { name: "Common Denominators", family: "frac-equivalent", params: {} },
        { name: "Addition of Fractions", family: "frac-add-sub", params: { op: "add" } },
        { name: "Subtraction of Fractions", family: "frac-add-sub", params: { op: "sub" } },
        { name: "Addition of Mixed Numbers", family: "mixed-number-ops", params: {} },
        { name: "Subtraction of Mixed Numbers", family: "mixed-number-ops", params: {} },
        { name: "Multiplication of Fractions", family: "frac-mul", params: {} },
        { name: "Multiplication of Mixed Numbers", family: "mixed-number-ops", params: {} },
        { name: "Division of Fractions", family: "frac-div", params: {} },
        { name: "Fraction of a Number", family: "frac-of-number", params: {} },
      ],
    },
    {
      id: "decimals",
      name: "Decimals",
      topics: [
        { name: "Decimal Place Value", family: "dec-place-value", params: {} },
        { name: "Decimal Addition", family: "dec-add-sub", params: { op: "add" } },
        { name: "Decimal Subtraction", family: "dec-add-sub", params: { op: "sub" } },
        { name: "Decimal Multiplication", family: "dec-mul", params: {} },
        { name: "Decimal Division", family: "dec-div", params: {} },
        { name: "Comparing Decimals", family: "dec-compare", params: {} },
        { name: "Rounding Decimals", family: "dec-round", params: {} },
      ],
    },
    {
      id: "decimals",
      name: "Percent",
      topics: [
        { name: "Meaning of Percent", family: "percent-basic", params: { kind: "convert" } },
        { name: "Percent as a Fraction", family: "percent-basic", params: { kind: "convert" } },
        { name: "Percent as a Decimal", family: "percent-basic", params: { kind: "convert" } },
        { name: "Finding a Percentage", family: "percent-basic", params: { kind: "mixed" } },
        { name: "Finding a Percent of a Number", family: "percent-basic", params: { kind: "of-number" } },
      ],
    },
    {
      id: "ratios",
      name: "Ratios",
      topics: [
        { name: "Understanding Ratios", family: "ratio-basic", params: {} },
        { name: "Equivalent Ratios", family: "ratio-equivalent", params: {} },
        { name: "Ratio Tables", family: "ratio-equivalent", params: {} },
        { name: "Unit Rates", family: "unit-rate", params: {} },
      ],
    },
    {
      id: "geometry",
      name: "Geometry & Measurement",
      topics: [
        { name: "Classifying Triangles", family: "shapes-2d", params: {} },
        { name: "Classifying Quadrilaterals", family: "shapes-2d", params: {} },
        { name: "Coordinate Plane", family: "coordinate-plane", params: { kind: "identify" } },
        { name: "Symmetry", family: "symmetry", params: {} },
        { name: "Area", family: "perimeter-area", params: { shape: "mixed" } },
        { name: "Volume", family: "volume-surface", params: { kind: "volume" } },
      ],
    },
    {
      id: "measurement",
      name: "Geometry & Measurement",
      topics: [
        { name: "Unit Conversion", family: "unit-conversion", params: {} },
      ],
    },
    {
      id: "stats",
      name: "Data",
      topics: [
        { name: "Mean", family: "central-tendency", params: { stats: ["mean"] } },
        { name: "Median", family: "central-tendency", params: { stats: ["median"] } },
        { name: "Mode", family: "central-tendency", params: { stats: ["mode"] } },
        { name: "Line Plots", family: "read-graph", params: { type: "line-plot" } },
        { name: "Data Interpretation", family: "read-graph", params: { type: "mixed" } },
      ],
    },
  ],
};
