/**
 * Which lesson teaches a given skill.
 *
 * Lessons are written per generator family rather than per topic, because the
 * family already encodes the mathematics and its stage progression. One
 * well-made lesson on regrouping therefore serves "Regrouping" in Grade 2 and
 * "Multi-digit Addition" in Grade 4 alike.
 *
 * Pure module with no React, so both the server (deciding whether to offer a
 * lesson) and the client (rendering it) can use the same mapping.
 */
export const LESSON_KEYS = [
  // Foundational spine — where struggling children actually sit.
  "place-value",
  "make-ten",
  "subtract-ten",
  "mult-meaning",
  "div-meaning",
  "frac-meaning",
  // Decimals and percent.
  "dec-place-value",
  "dec-compare",
  "dec-add-sub",
  "percent-basics",
  "dec-mul",
  "dec-div",
  "percent-change",
  // Building on it.
  "add-regroup",
  "sub-regroup",
  "mult-2digit",
  "div-2digit",
  "frac-equivalent",
  "frac-compare",
  "frac-mul",
  "frac-div",
  "mixed-numbers",
  "frac-add",
  // Number sense.
  "rounding",
  "factors-multiples",
  "primes",
  "gcf-lcm",
  // Early algebra.
  "alg-evaluate",
  "alg-translate",
  "alg-like-terms",
  "alg-distributive",
  "alg-one-step",
  "alg-two-step",
  "alg-multi-step",
  "alg-inequality",
  // Ratios, integers and exponents.
  "rat-basics",
  "rat-equivalent",
  "rat-unit-rate",
  "rat-proportion",
  "rat-scale",
  "int-compare",
  "int-ops",
  "exp-eval",
  "exp-rules",
  "sci-notation",
  // Senior algebra and statistics.
  "sa-slope",
  "sa-linear",
  "sa-systems",
  "sa-poly-addsub",
  "sa-poly-mul",
  "sa-factor",
  "sa-quad-solve",
  "sa-quad-features",
  "sa-poly-div",
  "sa-factor-thm",
  "sa-rational",
  "sa-radical",
  "st-averages",
  "st-choosing",
  "st-pictograph",
  "st-bargraph",
  "st-lineplot",
  "st-prob-basic",
  "st-prob-compound",
  "st-counting",
  "st-perm-comb",
  "st-scatter",
  // Functions, trigonometry and calculus.
  "fn-notation",
  "fn-domain-range",
  "fn-composition",
  "fn-inverse",
  "fn-transform",
  "fn-exponential",
  "fn-logarithm",
  "fn-sequence",
  "fn-series",
  "trig-right",
  "trig-unit-circle",
  "trig-identity",
  "calc-limits",
  "calc-derivative",
  "calc-integral",
] as const;

export type LessonKey = (typeof LESSON_KEYS)[number];

export const LESSON_TITLES: Record<LessonKey, string> = {
  "place-value": "What the digits in a number mean",
  "make-ten": "Making ten to add",
  "subtract-ten": "Jumping back to ten to subtract",
  "mult-meaning": "Multiplying is counting equal groups",
  "div-meaning": "Dividing is sharing into equal groups",
  "frac-meaning": "What a fraction really means",
  "dec-place-value": "What the numbers after the point mean",
  "dec-compare": "Which decimal is bigger?",
  "dec-add-sub": "Adding decimals: line up the point",
  "percent-basics": "What percent actually means",
  "dec-mul": "Multiplying by less than one",
  "dec-div": "Dividing by less than one",
  "percent-change": "Percent changes in the real world",
  "add-regroup": "Adding when the ones spill over",
  "sub-regroup": "Subtracting when you haven't got enough ones",
  "mult-2digit": "Multiplying a 2-digit number",
  "div-2digit": "Sharing when the tens don't split evenly",
  "frac-equivalent": "Different fractions, same amount",
  "frac-compare": "Which fraction is bigger?",
  "frac-mul": "Multiplying fractions means of",
  "frac-div": "Dividing by a fraction",
  "mixed-numbers": "Whole numbers and fractions together",
  "frac-add": "Adding fractions when the bottoms are different",
  rounding: "Rounding is asking which one it is nearer to",
  "factors-multiples": "Factors go in, multiples come out",
  primes: "Numbers that cannot be split",
  "gcf-lcm": "Greatest common factor and lowest common multiple",
  "alg-evaluate": "What a letter is worth",
  "alg-translate": "Turning words into algebra",
  "alg-like-terms": "Only add what matches",
  "alg-distributive": "Multiplying into a bracket",
  "alg-one-step": "Keeping the scales level",
  "alg-two-step": "Undoing in the right order",
  "alg-multi-step": "When x is on both sides",
  "alg-inequality": "The one rule that flips",
  "rat-basics": "What a ratio is comparing",
  "rat-equivalent": "Different numbers, same mix",
  "rat-unit-rate": "The price of exactly one",
  "rat-proportion": "Solving a proportion",
  "rat-scale": "Reading a scale both ways",
  "int-compare": "Which is bigger, minus 7 or minus 3?",
  "int-ops": "Taking away a negative",
  "exp-eval": "What a power really means",
  "exp-rules": "Why the exponents add",
  "sci-notation": "Very big and very small numbers",
  "sa-slope": "Reading slope from a line",
  "sa-linear": "Writing the equation of a line",
  "sa-systems": "Solving two equations at once",
  "sa-poly-addsub": "Adding and subtracting polynomials",
  "sa-poly-mul": "The middle term everyone forgets",
  "sa-factor": "Factoring a quadratic",
  "sa-quad-solve": "Solving quadratic equations",
  "sa-quad-features": "Reading a parabola",
  "sa-poly-div": "Dividing polynomials",
  "sa-factor-thm": "The factor theorem",
  "sa-rational": "Cancelling safely",
  "sa-radical": "Roots do not split over plus",
  "st-averages": "Mean, median and mode",
  "st-choosing": "Choosing the right average",
  "st-pictograph": "Reading a pictograph key",
  "st-bargraph": "Reading a bar graph",
  "st-lineplot": "Reading a line plot",
  "st-prob-basic": "What probability measures",
  "st-prob-compound": "Two things happening together",
  "st-counting": "Multiplying choices",
  "st-perm-comb": "When order matters",
  "st-scatter": "Correlation is not cause",
  "fn-notation": "What f(x) actually means",
  "fn-domain-range": "What goes in and what comes out",
  "fn-composition": "Putting one function inside another",
  "fn-inverse": "Running a function backwards",
  "fn-transform": "Moving and stretching a graph",
  "fn-exponential": "Growth that speeds up",
  "fn-logarithm": "Logarithms ask what power",
  "fn-sequence": "Finding the rule of a sequence",
  "fn-series": "Adding a sequence up",
  "trig-right": "Choosing sine, cosine or tangent",
  "trig-unit-circle": "Reading the unit circle",
  "trig-identity": "Why sin 2x is not 2 sin x",
  "calc-limits": "Approaching a value without reaching it",
  "calc-derivative": "The slope of a curve at a point",
  "calc-integral": "Undoing a derivative",
};

/**
 * The lesson for a skill, or null when none has been written yet. Families
 * without a lesson still get "Show me how" during practice, which works
 * everywhere because every generated question carries worked steps.
 */
export function lessonKeyForSkill(
  family: string,
  params: Record<string, unknown> = {}
): LessonKey | null {
  const op = typeof params.op === "string" ? params.op : undefined;
  // "add" and "mixed" both start from the addition trade, which subtraction
  // then reverses — so mixed practice is introduced by the addition lesson.
  const byOp = (): LessonKey => (op === "sub" ? "sub-regroup" : "add-regroup");

  if (family === "add-sub") {
    const max = typeof params.max === "number" ? params.max : 0;
    // Column regrouping only applies once sums run past 100. Between ten and
    // there, the idea that matters is bridging through ten — a different
    // lesson. Below ten there is no crossing at all, so nothing to teach yet.
    if (max >= 100) return byOp();
    if (max > 10) return op === "sub" ? "subtract-ten" : "make-ten";
    return null;
  }
  if (family === "place-value") return "place-value";
  if (family === "dec-place-value") return "dec-place-value";
  if (family === "dec-compare") return "dec-compare";
  if (family === "dec-add-sub" || family === "money") return "dec-add-sub";
  if (family === "percent-basic") return "percent-basics";
  if (family === "dec-mul") return "dec-mul";
  if (family === "dec-div") return "dec-div";
  if (family === "percent-apps" || family === "interest") return "percent-change";
  if (family === "mult-facts") return "mult-meaning";
  if (family === "div-facts") return "div-meaning";
  if (family === "frac-identify") return "frac-meaning";
  if (family === "frac-equivalent" || family === "frac-simplify") return "frac-equivalent";
  if (family === "frac-compare") return "frac-compare";
  if (family === "frac-mul" || family === "frac-of-number") return "frac-mul";
  if (family === "frac-div") return "frac-div";
  if (family === "mixed-number-ops") return "mixed-numbers";
  if (family === "multi-digit") {
    const digits = typeof params.digits === "number" ? params.digits : 2;
    return digits >= 2 ? byOp() : null;
  }
  if (family === "mult-multi") return "mult-2digit";
  if (family === "long-division") return "div-2digit";
  if (family === "frac-add-sub") return "frac-add";
  if (family === "rounding" || family === "estimation") return "rounding";
  if (family === "factors-multiples") return "factors-multiples";
  if (family === "primes") return "primes";
  if (family === "gcf-lcm") return "gcf-lcm";
  if (family === "evaluate-expression") return "alg-evaluate";
  if (family === "translate-expression") return "alg-translate";
  if (family === "combine-like-terms") return "alg-like-terms";
  if (family === "distributive") return "alg-distributive";
  if (family === "one-step-eq") return "alg-one-step";
  if (family === "two-step-eq") return "alg-two-step";
  if (family === "multi-step-eq") return "alg-multi-step";
  if (family === "inequality") return "alg-inequality";
  if (family === "ratio-basic") return "rat-basics";
  if (family === "ratio-equivalent") return "rat-equivalent";
  if (family === "unit-rate") return "rat-unit-rate";
  if (family === "proportional-relationships") return "rat-unit-rate";
  if (family === "proportion-solve") return "rat-proportion";
  if (family === "scale-drawings") return "rat-scale";
  if (family === "int-compare") return "int-compare";
  if (family === "abs-value") return "int-compare";
  if (family === "integer-ops") return "int-ops";
  if (family === "exponent-eval") return "exp-eval";
  if (family === "roots") return "exp-eval";
  if (family === "exponent-rules") return "exp-rules";
  if (family === "sci-notation") return "sci-notation";
  if (family === "slope") return "sa-slope";
  if (family === "linear-equation") return "sa-linear";
  if (family === "systems") return "sa-systems";
  if (family === "poly-add-sub") return "sa-poly-addsub";
  if (family === "poly-mul") return "sa-poly-mul";
  if (family === "factor") return "sa-factor";
  if (family === "quadratic-solve") return "sa-quad-solve";
  if (family === "quadratic-features") return "sa-quad-features";
  if (family === "poly-division") return "sa-poly-div";
  if (family === "factor-theorem") return "sa-factor-thm";
  if (family === "rational-expression") return "sa-rational";
  if (family === "radical-expression") return "sa-radical";
  // Statistics routes on params: the same family teaches different ideas
  // depending on which statistic or display the topic asks for.
  if (family === "central-tendency") {
    const stats = Array.isArray(params.stats) ? (params.stats as string[]) : [];
    return stats.includes("range") ? "st-choosing" : "st-averages";
  }
  if (family === "read-graph") {
    const type = typeof params.type === "string" ? params.type : "bar";
    if (type === "picture") return "st-pictograph";
    if (type === "line-plot") return "st-lineplot";
    return "st-bargraph";
  }
  if (family === "probability") {
    return params.kind === "simple" ? "st-prob-basic" : "st-prob-compound";
  }
  if (family === "counting-principle") {
    return params.kind === "fcp" ? "st-counting" : "st-perm-comb";
  }
  if (family === "scatter-correlation") return "st-scatter";
  if (family === "function-notation") return "fn-notation";
  if (family === "domain-range") return "fn-domain-range";
  if (family === "composition") return "fn-composition";
  if (family === "inverse-function") return "fn-inverse";
  if (family === "function-transform") return "fn-transform";
  if (family === "exponential") return "fn-exponential";
  if (family === "logarithm") return "fn-logarithm";
  if (family === "sequence") return "fn-sequence";
  if (family === "series") return "fn-series";
  if (family === "right-triangle-trig") return "trig-right";
  if (family === "unit-circle") return "trig-unit-circle";
  if (family === "trig-identity") return "trig-identity";
  if (family === "limits") return "calc-limits";
  if (family === "derivative") return "calc-derivative";
  if (family === "integral") return "calc-integral";
  return null;
}
