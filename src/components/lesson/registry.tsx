"use client";

import type { LessonKey } from "@/lib/lessons";
import { AdditionLesson } from "./arithmetic/AdditionLesson";
import { SubtractionLesson } from "./arithmetic/SubtractionLesson";
import { MultiplicationLesson } from "./arithmetic/MultiplicationLesson";
import { DivisionLesson } from "./arithmetic/DivisionLesson";
import { FractionAdditionLesson } from "./fractions/FractionAdditionLesson";

/**
 * Lesson key -> component. Kept separate from `@/lib/lessons` so the server
 * can reason about which lesson applies without pulling React components into
 * its bundle.
 */
export const LESSON_COMPONENTS: Record<
  LessonKey,
  React.ComponentType<{ onFinish?: () => void }>
> = {
  "add-regroup": AdditionLesson,
  "sub-regroup": SubtractionLesson,
  "mult-2digit": MultiplicationLesson,
  "div-2digit": DivisionLesson,
  "frac-add": FractionAdditionLesson,
};
