import type { GradeDef } from "./types";

export const grade4: GradeDef = {
  grade: 4,
  strands: [
    {
      id: "number",
      name: "Number Sense",
      topics: [
        { name: "Large Numbers", family: "place-value", params: { max: 1000000 } },
        { name: "Place Value", family: "place-value", params: { max: 100000 } },
        { name: "Expanded Form", family: "place-value", params: { max: 100000 } },
        { name: "Rounding", family: "rounding", params: { max: 100000 } },
        { name: "Comparing Numbers", family: "compare-numbers", params: { max: 1000000 } },
        { name: "Factors", family: "factors-multiples", params: { max: 100 } },
        { name: "Multiples", family: "factors-multiples", params: { max: 100 } },
        { name: "Prime Numbers", family: "primes", params: {} },
        { name: "Composite Numbers", family: "primes", params: {} },
      ],
    },
    {
      id: "operations",
      name: "Operations",
      topics: [
        { name: "Multi-digit Addition", family: "multi-digit", params: { op: "add", digits: 4 } },
        { name: "Multi-digit Subtraction", family: "multi-digit", params: { op: "sub", digits: 4 } },
        { name: "Multi-digit Multiplication", family: "mult-multi", params: {} },
        { name: "Long Division", family: "long-division", params: {} },
        { name: "Estimation", family: "estimation", params: {} },
        { name: "Mental Math", family: "mental-math", params: { op: "mixed" } },
        { name: "Order of Operations Introduction", family: "order-of-ops", params: {} },
      ],
    },
    {
      id: "fractions",
      name: "Fractions",
      topics: [
        { name: "Fraction Equivalence", family: "frac-equivalent", params: {} },
        { name: "Simplifying Fractions", family: "frac-simplify", params: {} },
        { name: "Comparing Fractions", family: "frac-compare", params: {} },
        { name: "Ordering Fractions", family: "frac-compare", params: {} },
        { name: "Fractions on Number Lines", family: "frac-number-line", params: {} },
        { name: "Addition with Same Denominators", family: "frac-add-sub", params: { op: "add" } },
        { name: "Subtraction with Same Denominators", family: "frac-add-sub", params: { op: "sub" } },
        { name: "Mixed Numbers Introduction", family: "mixed-number-ops", params: {} },
      ],
    },
    {
      id: "decimals",
      name: "Decimals",
      topics: [
        { name: "Decimal Place Value", family: "dec-place-value", params: {} },
        { name: "Tenths", family: "dec-place-value", params: {} },
        { name: "Hundredths", family: "dec-place-value", params: {} },
        { name: "Comparing Decimals", family: "dec-compare", params: {} },
        { name: "Ordering Decimals", family: "dec-compare", params: {} },
        { name: "Decimal Addition", family: "dec-add-sub", params: { op: "add" } },
        { name: "Decimal Subtraction", family: "dec-add-sub", params: { op: "sub" } },
      ],
    },
    {
      id: "geometry",
      name: "Geometry",
      topics: [
        { name: "Angles", family: "angles", params: { kind: "identify" } },
        { name: "Angle Measurement", family: "angles", params: { kind: "measure" } },
        { name: "Triangles", family: "shapes-2d", params: {} },
        { name: "Quadrilaterals", family: "shapes-2d", params: {} },
        { name: "Symmetry", family: "symmetry", params: {} },
        { name: "Lines", family: "mc-bank", params: { bank: "lines" } },
        { name: "Parallel Lines", family: "mc-bank", params: { bank: "lines" } },
        { name: "Perpendicular Lines", family: "mc-bank", params: { bank: "lines" } },
      ],
    },
    {
      id: "measurement",
      name: "Measurement",
      topics: [
        { name: "Area", family: "perimeter-area", params: { shape: "rect" } },
        { name: "Perimeter", family: "perimeter-area", params: { shape: "rect" } },
        { name: "Volume", family: "volume-surface", params: { kind: "volume" } },
        { name: "Unit Conversion", family: "unit-conversion", params: {} },
      ],
    },
    {
      id: "stats",
      name: "Data",
      topics: [
        { name: "Line Plots", family: "read-graph", params: { type: "line-plot" } },
        { name: "Bar Graphs", family: "read-graph", params: { type: "bar" } },
        { name: "Data Tables", family: "read-graph", params: { type: "table" } },
        { name: "Interpreting Data", family: "read-graph", params: { type: "mixed" } },
      ],
    },
  ],
};
