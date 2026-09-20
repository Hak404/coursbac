import type { CourseSection } from "./types";
import { introSection, rappelsSection } from "./intro";
import {
  limitePointSection,
  gaucheDroiteSection,
  limitesInfiniesSection,
  limitesInfiniSection,
} from "./limites";
import {
  operationsSection,
  formesIndetermineesSection,
  methodesSection,
} from "./operations";
import {
  continuitePointSection,
  continuiteIntervalleSection,
  prolongementSection,
} from "./continuite";
import { tviSection, applicationsTviSection, dichotomieSection } from "./tvi";
import { bijectionSection, racineNSection, arctanSection } from "./fonctions";
import { syntheseSection, piegesSection } from "./synthese";
import { exercicesProgressifsSection, exercicesBacSection } from "./exercices";
import { quizSection } from "./quiz";

export const COURSE_SECTIONS: CourseSection[] = [
  introSection,
  rappelsSection,
  limitePointSection,
  gaucheDroiteSection,
  limitesInfiniesSection,
  limitesInfiniSection,
  operationsSection,
  formesIndetermineesSection,
  methodesSection,
  continuitePointSection,
  continuiteIntervalleSection,
  prolongementSection,
  tviSection,
  applicationsTviSection,
  dichotomieSection,
  bijectionSection,
  racineNSection,
  arctanSection,
  syntheseSection,
  piegesSection,
  exercicesProgressifsSection,
  exercicesBacSection,
  quizSection,
];