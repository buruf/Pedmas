import type { GeneratorFamily } from "../types";
import type { FamilyKey } from "./keys";
import { foundationFamilies } from "./foundations";
import { arithFamilies } from "./arith";
import { fractionFamilies } from "./fractions";
import { decimalFamilies } from "./decimals";
import { ratioFamilies } from "./ratio";
import { integerFamilies } from "./integers";
import { algebraFamilies } from "./algebra";
import { algebraAdvancedFamilies } from "./algebra-advanced";
import { functionFamilies } from "./functions";
import { trigFamilies } from "./trig";
import { calculusFamilies } from "./calculus";
import { geometryFamilies } from "./geometry";
import { measurementFamilies } from "./measurement";
import { dataFamilies } from "./data";

export const FAMILIES: Record<string, GeneratorFamily> = {
  ...foundationFamilies,
  ...arithFamilies,
  ...fractionFamilies,
  ...decimalFamilies,
  ...ratioFamilies,
  ...integerFamilies,
  ...algebraFamilies,
  ...algebraAdvancedFamilies,
  ...functionFamilies,
  ...trigFamilies,
  ...calculusFamilies,
  ...geometryFamilies,
  ...measurementFamilies,
  ...dataFamilies,
} satisfies Partial<Record<FamilyKey, GeneratorFamily>>;
