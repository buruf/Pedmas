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
};
