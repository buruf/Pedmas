import type { GradeDef } from "./types";

export const grade11: GradeDef = {
  grade: 11,
  strands: [
    {
      id: "functions",
      name: "Functions",
      topics: [
        { name: "Function Notation", family: "function-notation", params: {} },
        { name: "Domain", family: "domain-range", params: {} },
        { name: "Range", family: "domain-range", params: {} },
        { name: "Function Composition", family: "composition", params: {} },
        { name: "Inverse Functions", family: "inverse-function", params: {} },
        { name: "Transformations", family: "function-transform", params: {} },
        { name: "Piecewise Functions", family: "function-notation", params: {} },
      ],
    },
    {
      id: "functions",
      name: "Quadratic Functions",
      topics: [
        { name: "Vertex Form", family: "quadratic-features", params: { form: "vertex" } },
        { name: "Standard Form", family: "quadratic-features", params: { form: "standard" } },
        { name: "Factored Form", family: "quadratic-features", params: { form: "factored" } },
        { name: "Transformations", family: "function-transform", params: {} },
        { name: "Maximum and Minimum", family: "quadratic-features", params: { form: "vertex" } },
        { name: "Quadratic Inequalities", family: "quadratic-solve", params: { method: "mixed" } },
      ],
    },
    {
      id: "functions",
      name: "Polynomial Functions",
      topics: [
        { name: "Polynomial Operations", family: "poly-add-sub", params: {} },
        { name: "Polynomial Factoring", family: "factor", params: { kind: "mixed" } },
        { name: "Polynomial Zeros", family: "factor-theorem", params: {} },
        { name: "Polynomial Graphs", family: "function-transform", params: {} },
        { name: "End Behaviour", family: "function-transform", params: {} },
        { name: "Multiplicity", family: "factor-theorem", params: {} },
      ],
    },
    {
      id: "functions",
      name: "Rational Functions",
      topics: [
        { name: "Rational Expressions", family: "rational-expression", params: { kind: "simplify" } },
        { name: "Simplification", family: "rational-expression", params: { kind: "simplify" } },
        { name: "Restrictions", family: "rational-expression", params: { kind: "restrictions" } },
        { name: "Rational Equations", family: "rational-expression", params: { kind: "solve" } },
        { name: "Graphs", family: "rational-expression", params: { kind: "mixed" } },
        { name: "Asymptotes", family: "rational-expression", params: { kind: "asymptotes" } },
      ],
    },
    {
      id: "functions",
      name: "Radical Functions",
      topics: [
        { name: "Square Root Functions", family: "radical-expression", params: { kind: "mixed" } },
        { name: "Radical Equations", family: "radical-expression", params: { kind: "solve" } },
        { name: "Radical Expressions", family: "radical-expression", params: { kind: "simplify" } },
        { name: "Radical Graphs", family: "function-transform", params: {} },
      ],
    },
    {
      id: "functions",
      name: "Exponential Functions",
      topics: [
        { name: "Exponential Growth", family: "exponential", params: { kind: "growth-decay" } },
        { name: "Exponential Decay", family: "exponential", params: { kind: "growth-decay" } },
        { name: "Exponential Equations", family: "exponential", params: { kind: "solve" } },
        { name: "Exponential Graphs", family: "exponential", params: { kind: "graph" } },
        { name: "Transformations", family: "function-transform", params: {} },
      ],
    },
    {
      id: "functions",
      name: "Logarithms",
      topics: [
        { name: "Meaning of Logarithms", family: "logarithm", params: { kind: "eval" } },
        { name: "Common Logarithms", family: "logarithm", params: { kind: "eval" } },
        { name: "Natural Logarithms", family: "logarithm", params: { kind: "natural" } },
        { name: "Logarithm Laws", family: "logarithm", params: { kind: "laws" } },
        { name: "Exponential Equations", family: "exponential", params: { kind: "solve" } },
        { name: "Logarithmic Equations", family: "logarithm", params: { kind: "solve" } },
        { name: "Logarithmic Graphs", family: "logarithm", params: { kind: "graph" } },
      ],
    },
    {
      id: "functions",
      name: "Sequences & Series",
      topics: [
        { name: "Arithmetic Sequences", family: "sequence", params: { kind: "arith" } },
        { name: "Geometric Sequences", family: "sequence", params: { kind: "geom" } },
        { name: "Recursive Sequences", family: "sequence", params: { kind: "recursive" } },
        { name: "Explicit Form", family: "sequence", params: { kind: "mixed" } },
        { name: "Arithmetic Series", family: "series", params: { kind: "arith" } },
        { name: "Geometric Series", family: "series", params: { kind: "geom" } },
      ],
    },
    {
      id: "trig",
      name: "Trigonometry",
      topics: [
        { name: "Unit Circle", family: "unit-circle", params: {} },
        { name: "Exact Trigonometric Values", family: "unit-circle", params: {} },
        { name: "Trigonometric Functions", family: "trig-graph", params: {} },
        { name: "Trigonometric Graphs", family: "trig-graph", params: {} },
        { name: "Trigonometric Identities", family: "trig-identity", params: { level: 1 } },
        { name: "Trigonometric Equations", family: "trig-equation", params: {} },
      ],
    },
    {
      id: "stats",
      name: "Counting & Probability",
      topics: [
        { name: "Fundamental Counting Principle", family: "counting-principle", params: { kind: "fcp" } },
        { name: "Permutations", family: "counting-principle", params: { kind: "permutation" } },
        { name: "Combinations", family: "counting-principle", params: { kind: "combination" } },
        { name: "Conditional Probability", family: "probability", params: { kind: "conditional" } },
        { name: "Independent Events", family: "probability", params: { kind: "compound" } },
        { name: "Binomial Probability", family: "probability", params: { kind: "binomial" } },
      ],
    },
  ],
};
