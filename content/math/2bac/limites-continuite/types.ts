import type { ComponentType } from "react";

export type CourseSection = {
  id: string;
  number: number;
  title: string;
  category: string;
  Component: ComponentType;
};

export const CATEGORIES: { key: string; label: string }[] = [
  { key: "decouverte", label: "Découverte" },
  { key: "limites", label: "Les limites" },
  { key: "continuite", label: "La continuité" },
  { key: "fonctions", label: "Fonctions fondamentales" },
  { key: "entrainement", label: "S'entraîner" },
];