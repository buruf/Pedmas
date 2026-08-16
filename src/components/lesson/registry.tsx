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
  "add-regroup": AdditionLesson,
  "sub-regroup": SubtractionLesson,
  "mult-2digit": MultiplicationLesson,
  "div-2digit": DivisionLesson,
  "frac-add": FractionAdditionLesson,
};
