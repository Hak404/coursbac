import type { ChapterMeta } from "./types";

type ChapterPathsLike = {
  subjectSlug: string;
  levelSlug: string;
  slug: string;
};

const LEVELS = {
  "2bac": {
    label: "2ème BAC Sciences Physiques",
    short: "2BAC PC",
  },
} as const;

export type SubjectTree = {
  slug: string;
  title: string;
  levels: {
    slug: string;
    title: string;
    modules: {
      slug: string;
      title: string;
      chapters: string[];
    }[];
  }[];
};

export const SUBJECTS_META: Record<string, { title: string }> = {
  math: { title: "Mathématiques" },
  physique: { title: "Physique-Chimie" },
};

export const LEVELS_META: Record<string, { label: string; short: string }> = {
  ...LEVELS,
  "1bac": { label: "1ère BAC Sciences Expérimentales", short: "1BAC SE" },
  "5eme": { label: "5ème Année Primaire", short: "5ème" },
};

export function subjectTitle(slug: string): string {
  return SUBJECTS_META[slug]?.title ?? slug;
}

export function levelLabel(slug: string): string {
  return LEVELS_META[slug]?.label ?? slug;
}

export const SUBJECT_TREE: SubjectTree[] = [
  {
    slug: "math",
    title: "Mathématiques",
    levels: [
      {
        slug: "2bac",
        title: LEVELS["2bac"].label,
        modules: [
          {
            slug: "analyse",
            title: "Analyse",
            chapters: ["limites-continuite"],
          },
        ],
      },
    ],
  },
  {
    slug: "physique",
    title: "Physique-Chimie",
    levels: [
      {
        slug: "2bac",
        title: LEVELS["2bac"].label,
        modules: [
          {
            slug: "mecanique",
            title: "MÉCANIQUE",
            chapters: ["transformations-lentes-rapides"],
          },
        ],
      },
    ],
  },
];

export const CHAPTERS_META: Record<string, ChapterMeta> = {
  "limites-continuite": {
    subjectSlug: "math",
    levelSlug: "2bac",
    moduleSlug: "analyse",
    slug: "limites-continuite",
    title: "Limites et continuité",
    shortTitle: "Limites et continuité",
    subjectLabel: "Mathématiques",
    levelLabel: LEVELS["2bac"].label,
    levelShort: LEVELS["2bac"].short,
    moduleLabel: "Analyse",
    description:
      "Une séance interactive pour comprendre les limites, visualiser les comportements des fonctions et guider les élèves étape par étape.",
    badgeLabel: "Chapitre 1 · Analyse",
    progressScope: "limites",
    categories: [
      { key: "decouverte", label: "Découverte" },
      { key: "limites", label: "Les limites" },
      { key: "continuite", label: "La continuité" },
      { key: "fonctions", label: "Fonctions fondamentales" },
      { key: "entrainement", label: "S'entraîner" },
    ],
    lessonLabels: {
      decouverte: "Introduction",
      limites: "Les limites",
      continuite: "La continuité",
      fonctions: "Fonctions",
      entrainement: "Entraînement",
    },
  },
  "transformations-lentes-rapides": {
    subjectSlug: "physique",
    levelSlug: "2bac",
    moduleSlug: "mecanique",
    slug: "transformations-lentes-rapides",
    title: "Transformations lentes et rapides",
    shortTitle: "Transformations lentes et rapides",
    subjectLabel: "Physique-Chimie",
    levelLabel: LEVELS["2bac"].label,
    levelShort: LEVELS["2bac"].short,
    moduleLabel: "MÉCANIQUE",
    description:
      "Distinguer les transformations chimiques lentes, rapides et quasi-instantanées, et introduire la vitesse d'une transformation.",
    badgeLabel: "MÉCANIQUE · Chapitre 1",
    progressScope: "physique-transformations",
    categories: [{ key: "mecanique", label: "MÉCANIQUE" }],
    lessonLabels: { mecanique: "Transformations" },
  },
};

export function getChapterMeta(slug: string): ChapterMeta | null {
  return CHAPTERS_META[slug] ?? null;
}

export function findChapterByPath(
  subjectSlug: string,
  levelSlug: string,
  slug: string
): ChapterMeta | null {
  const chapter = CHAPTERS_META[slug];
  if (
    chapter &&
    chapter.subjectSlug === subjectSlug &&
    chapter.levelSlug === levelSlug
  ) {
    return chapter;
  }
  return null;
}

export function getChapterPaths(): {
  subject: string;
  level: string;
  slug: string;
}[] {
  return Object.values(CHAPTERS_META).map((c) => ({
    subject: c.subjectSlug,
    level: c.levelSlug,
    slug: c.slug,
  }));
}

export function courseHref(chapter: ChapterPathsLike): string {
  return `/cours/${chapter.subjectSlug}/${chapter.levelSlug}/${chapter.slug}`;
}

export function presentationHref(chapter: ChapterPathsLike): string {
  return `/presentation/${chapter.subjectSlug}/${chapter.levelSlug}/${chapter.slug}`;
}