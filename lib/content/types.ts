import type { ComponentType } from "react";

export type CourseSection = {
  id: string;
  number: number;
  title: string;
  category: string;
  Component: ComponentType;
};

export type Category = { key: string; label: string };

export type ChapterPaths = {
  subjectSlug: string;
  levelSlug: string;
  moduleSlug: string;
  slug: string;
};

export type ChapterMeta = ChapterPaths & {
  title: string;
  shortTitle: string;
  subjectLabel: string;
  levelLabel: string;
  levelShort: string;
  moduleLabel: string;
  description: string;
  badgeLabel: string;
  progressScope: string;
  categories: Category[];
  lessonLabels: Record<string, string>;
};

export type ChapterDef = ChapterMeta & {
  sections: CourseSection[];
};