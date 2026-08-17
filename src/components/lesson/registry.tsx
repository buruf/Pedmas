"use client";

import type { LessonKey } from "@/lib/lessons";
import { AdditionLesson } from "./arithmetic/AdditionLesson";
import { SubtractionLesson } from "./arithmetic/SubtractionLesson";
import { MultiplicationLesson } from "./arithmetic/MultiplicationLesson";
import { DivisionLesson } from "./arithmetic/DivisionLesson";
import { FractionAdditionLesson } from "./fractions/FractionAdditionLesson";
import { FractionMeaningLesson } from "./fractions/FractionMeaningLesson";
import { DecimalPlaceValueLesson } from "./decimals/DecimalPlaceValueLesson";
import { DecimalCompareLesson } from "./decimals/DecimalCompareLesson";
import { DecimalAddSubLesson } from "./decimals/DecimalAddSubLesson";
import { PercentBasicsLesson } from "./decimals/PercentBasicsLesson";
import { DecimalMulLesson, DecimalDivLesson } from "./decimals/DecimalMulDivLesson";
import { PercentChangeLesson } from "./decimals/PercentChangeLesson";
import { FractionCompareLesson } from "./fractions/FractionCompareLesson";
import { FractionEquivalentLesson } from "./fractions/FractionEquivalentLesson";
import { FractionMulLesson, FractionDivLesson } from "./fractions/FractionMulDivLesson";
import { MixedNumberLesson } from "./fractions/MixedNumberLesson";
import { RoundingLesson } from "./number/RoundingLesson";
import { FactorsMultiplesLesson } from "./number/FactorsMultiplesLesson";
import { PrimesLesson, GcfLcmLesson } from "./number/PrimesGcfLcmLesson";
import { EvaluateExpressionLesson } from "./algebra/EvaluateExpressionLesson";
import { TranslateExpressionLesson } from "./algebra/TranslateExpressionLesson";
import { CombineLikeTermsLesson } from "./algebra/CombineLikeTermsLesson";
import { DistributiveLesson } from "./algebra/DistributiveLesson";
import { OneStepEquationLesson, TwoStepEquationLesson } from "./algebra/EquationLessons";
import { MultiStepEquationLesson } from "./algebra/MultiStepEquationLesson";
import { InequalityLesson } from "./algebra/InequalityLesson";
import { RatioBasicsLesson, EquivalentRatioLesson } from "./ratios/RatioLesson";
import { UnitRateLesson } from "./ratios/UnitRateLesson";
import { ProportionSolveLesson, ScaleDrawingLesson } from "./ratios/ProportionLesson";
import { IntegerCompareLesson, IntegerOpsLesson } from "./ratios/IntegerLesson";
import { ExponentEvalLesson, ExponentRulesLesson } from "./ratios/ExponentLesson";
import { SciNotationLesson } from "./ratios/SciNotationLesson";
import { SlopeLesson, LinearEquationLesson } from "./senior-algebra/SlopeAndLinesLesson";
import { SystemsLesson } from "./senior-algebra/SystemsLesson";
import { PolyAddSubLesson, PolyMulLesson } from "./senior-algebra/PolynomialArithmeticLesson";
import { FactorLesson } from "./senior-algebra/FactorLesson";
import { QuadraticSolveLesson } from "./senior-algebra/QuadraticSolveLesson";
import { QuadraticFeaturesLesson } from "./senior-algebra/QuadraticFeaturesLesson";
import { PolyDivisionLesson, FactorTheoremLesson } from "./senior-algebra/PolyDivisionLesson";
import { RationalExpressionLesson, RadicalExpressionLesson } from "./senior-algebra/RationalRadicalLesson";
import { MeanMedianModeLesson, ChoosingAverageLesson } from "./stats/CentralTendencyLesson";
import { PictographLesson, BarGraphLesson } from "./stats/ReadGraphLesson";
import { LinePlotLesson } from "./stats/LinePlotLesson";
import { ProbabilityBasicsLesson, CompoundProbabilityLesson } from "./stats/ProbabilityLesson";
import { CountingPrincipleLesson, PermutationCombinationLesson } from "./stats/CountingPrincipleLesson";
import { ScatterCorrelationLesson } from "./stats/ScatterCorrelationLesson";
import { FunctionNotationLesson } from "./functions/FunctionNotationLesson";
import { DomainRangeLesson } from "./functions/DomainRangeLesson";
import { CompositionLesson, InverseFunctionLesson } from "./functions/CompositionInverseLesson";
import { FunctionTransformLesson } from "./functions/FunctionTransformLesson";
import { ExponentialLesson, LogarithmLesson } from "./functions/ExponentialLogLesson";
import { SequenceLesson, SeriesLesson } from "./functions/SequenceSeriesLesson";
import { RightTriangleTrigLesson } from "./functions/RightTriangleTrigLesson";
import { UnitCircleLesson, TrigIdentityLesson } from "./functions/UnitCircleTrigIdentityLesson";
import { LimitsLesson, DerivativeLesson } from "./functions/LimitsDerivativeLesson";
import { IntegralLesson } from "./functions/IntegralLesson";
import { PerimeterAreaLesson } from "./geometry/PerimeterAreaLesson";
import { VolumeLesson, SurfaceAreaLesson } from "./geometry/VolumeSurfaceLesson";
import { AnglesLesson } from "./geometry/AnglesLesson";
import { Shapes2dLesson, Shapes3dLesson } from "./geometry/ShapesLesson";
import { SymmetryLesson } from "./geometry/SymmetryLesson";
import { CoordinatePlaneLesson } from "./geometry/CoordinatePlaneLesson";
import { PythagoreanLesson } from "./geometry/PythagoreanLesson";
import { TransformationsLesson, SimilarityLesson } from "./geometry/TransformSimilarityLesson";
import { CircleMeasureLesson } from "./geometry/CircleMeasureLesson";
import { UnitConversionLesson, MeasureUnitsLesson } from "./geometry/MeasurementLesson";
import { TimeLesson } from "./geometry/TimeLesson";
import { OrderOfOpsLesson } from "./early-ops/OrderOfOpsLesson";
import { CountingOnLesson, CountingBackLesson } from "./early-ops/CountingOnLesson";
import { FactFamilyLesson } from "./early-ops/FactFamilyLesson";
import { MissingNumberLesson } from "./early-ops/MissingNumberLesson";
import { MentalMathLesson } from "./early-ops/MentalMathLesson";
import { FractionNumberLineLesson } from "./early-ops/FractionNumberLineLesson";
import { CountingObjectsLesson } from "./early-number/CountingObjectsLesson";
import { CountingSequenceLesson } from "./early-number/CountingSequenceLesson";
import { NumberLineLesson } from "./early-number/NumberLineLesson";
import { CompareNumbersLesson } from "./early-number/CompareNumbersLesson";
import { OrderBigNumbersLesson } from "./early-number/OrderBigNumbersLesson";
import { OddEvenLesson } from "./early-number/OddEvenLesson";
import { SkipCountingLesson } from "./early-number/SkipCountingLesson";
import { PatternsLesson } from "./early-number/PatternsLesson";
import { MakingTenLesson } from "./early/MakingTenLesson";
import { SubtractThroughTenLesson } from "./early/SubtractThroughTenLesson";
import { PlaceValueLesson } from "./early/PlaceValueLesson";
import { MultiplicationMeaningLesson } from "./early/MultiplicationMeaningLesson";
import { DivisionMeaningLesson } from "./early/DivisionMeaningLesson";

/**
 * Lesson key -> component. Kept separate from `@/lib/lessons` so the server
 * can reason about which lesson applies without pulling React components into
 * its bundle.
 */
export const LESSON_COMPONENTS: Record<
  LessonKey,
  React.ComponentType<{ onFinish?: () => void }>
> = {
  "place-value": PlaceValueLesson,
  "make-ten": MakingTenLesson,
  "subtract-ten": SubtractThroughTenLesson,
  "mult-meaning": MultiplicationMeaningLesson,
  "div-meaning": DivisionMeaningLesson,
  "frac-meaning": FractionMeaningLesson,
  "dec-place-value": DecimalPlaceValueLesson,
  "dec-compare": DecimalCompareLesson,
  "dec-add-sub": DecimalAddSubLesson,
  "percent-basics": PercentBasicsLesson,
  "dec-mul": DecimalMulLesson,
  "dec-div": DecimalDivLesson,
  "percent-change": PercentChangeLesson,
  "add-regroup": AdditionLesson,
  "sub-regroup": SubtractionLesson,
  "mult-2digit": MultiplicationLesson,
  "div-2digit": DivisionLesson,
  "frac-equivalent": FractionEquivalentLesson,
  "frac-compare": FractionCompareLesson,
  "frac-mul": FractionMulLesson,
  "frac-div": FractionDivLesson,
  "mixed-numbers": MixedNumberLesson,
  "frac-add": FractionAdditionLesson,
  rounding: RoundingLesson,
  "factors-multiples": FactorsMultiplesLesson,
  primes: PrimesLesson,
  "gcf-lcm": GcfLcmLesson,
  "alg-evaluate": EvaluateExpressionLesson,
  "alg-translate": TranslateExpressionLesson,
  "alg-like-terms": CombineLikeTermsLesson,
  "alg-distributive": DistributiveLesson,
  "alg-one-step": OneStepEquationLesson,
  "alg-two-step": TwoStepEquationLesson,
  "alg-multi-step": MultiStepEquationLesson,
  "alg-inequality": InequalityLesson,
  "rat-basics": RatioBasicsLesson,
  "rat-equivalent": EquivalentRatioLesson,
  "rat-unit-rate": UnitRateLesson,
  "rat-proportion": ProportionSolveLesson,
  "rat-scale": ScaleDrawingLesson,
  "int-compare": IntegerCompareLesson,
  "int-ops": IntegerOpsLesson,
  "exp-eval": ExponentEvalLesson,
  "exp-rules": ExponentRulesLesson,
  "sci-notation": SciNotationLesson,
  "sa-slope": SlopeLesson,
  "sa-linear": LinearEquationLesson,
  "sa-systems": SystemsLesson,
  "sa-poly-addsub": PolyAddSubLesson,
  "sa-poly-mul": PolyMulLesson,
  "sa-factor": FactorLesson,
  "sa-quad-solve": QuadraticSolveLesson,
  "sa-quad-features": QuadraticFeaturesLesson,
  "sa-poly-div": PolyDivisionLesson,
  "sa-factor-thm": FactorTheoremLesson,
  "sa-rational": RationalExpressionLesson,
  "sa-radical": RadicalExpressionLesson,
  "st-averages": MeanMedianModeLesson,
  "st-choosing": ChoosingAverageLesson,
  "st-pictograph": PictographLesson,
  "st-bargraph": BarGraphLesson,
  "st-lineplot": LinePlotLesson,
  "st-prob-basic": ProbabilityBasicsLesson,
  "st-prob-compound": CompoundProbabilityLesson,
  "st-counting": CountingPrincipleLesson,
  "st-perm-comb": PermutationCombinationLesson,
  "st-scatter": ScatterCorrelationLesson,
  "fn-notation": FunctionNotationLesson,
  "fn-domain-range": DomainRangeLesson,
  "fn-composition": CompositionLesson,
  "fn-inverse": InverseFunctionLesson,
  "fn-transform": FunctionTransformLesson,
  "fn-exponential": ExponentialLesson,
  "fn-logarithm": LogarithmLesson,
  "fn-sequence": SequenceLesson,
  "fn-series": SeriesLesson,
  "trig-right": RightTriangleTrigLesson,
  "trig-unit-circle": UnitCircleLesson,
  "trig-identity": TrigIdentityLesson,
  "calc-limits": LimitsLesson,
  "calc-derivative": DerivativeLesson,
  "calc-integral": IntegralLesson,
  "geo-perimeter-area": PerimeterAreaLesson,
  "geo-volume": VolumeLesson,
  "geo-surface": SurfaceAreaLesson,
  "geo-angles": AnglesLesson,
  "geo-shapes-2d": Shapes2dLesson,
  "geo-shapes-3d": Shapes3dLesson,
  "geo-symmetry": SymmetryLesson,
  "geo-coordinates": CoordinatePlaneLesson,
  "geo-pythagoras": PythagoreanLesson,
  "geo-transformations": TransformationsLesson,
  "geo-similarity": SimilarityLesson,
  "geo-circle": CircleMeasureLesson,
  "meas-conversion": UnitConversionLesson,
  "meas-units": MeasureUnitsLesson,
  "meas-time": TimeLesson,
  "ops-order": OrderOfOpsLesson,
  "ops-count-on": CountingOnLesson,
  "ops-count-back": CountingBackLesson,
  "ops-fact-family": FactFamilyLesson,
  "ops-missing": MissingNumberLesson,
  "ops-mental": MentalMathLesson,
  "frac-number-line": FractionNumberLineLesson,
  "num-counting-objects": CountingObjectsLesson,
  "num-counting-sequence": CountingSequenceLesson,
  "num-number-line": NumberLineLesson,
  "num-compare-small": CompareNumbersLesson,
  "num-compare-big": OrderBigNumbersLesson,
  "num-odd-even": OddEvenLesson,
  "num-skip-counting": SkipCountingLesson,
  "num-patterns": PatternsLesson,
};
