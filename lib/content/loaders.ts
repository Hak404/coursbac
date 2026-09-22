import type { CourseSection } from "./types";
import { COURSE_SECTIONS } from "@/content/math/2bac/limites-continuite";
import { PHYSIQUE_SECTIONS } from "@/content/physique/2bac/mecanique";

const LOADERS: Record<string, () => CourseSection[]> = {
  "limites-continuite": () => COURSE_SECTIONS,
  "transformations-lentes-rapides": () => PHYSIQUE_SECTIONS,
};

export function loadSections(slug: string): CourseSection[] {
  return LOADERS[slug]?.() ?? [];
}