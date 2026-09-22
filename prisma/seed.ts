import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  PrismaClient,
  Prisma,
  Role,
  Difficulty,
} from "../lib/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = "password123";

const SUBJECTS = [
  { slug: "math", name: "Mathématiques" },
  { slug: "physique", name: "Physique-Chimie" },
];

const LEVELS = [
  { slug: "2bac", name: "2ème BAC Sciences Physiques", order: 1 },
  { slug: "1bac", name: "1ère BAC Sciences Expérimentales", order: 2 },
  { slug: "5eme", name: "5ème Année Primaire", order: 3 },
];

const CHAPTERS = [
  {
    slug: "limites-continuite",
    title: "Limites et continuité",
    subjectSlug: "math",
    levelSlug: "2bac",
    order: 1,
  },
  {
    slug: "transformations-lentes-rapides",
    title: "Transformations lentes et rapides",
    subjectSlug: "physique",
    levelSlug: "2bac",
    order: 1,
  },
];

type SeedQuestion = {
  title: string;
  formula: string;
  options: string[];
  correctOptionIndex: number;
  difficulty: Difficulty;
};

const QUIZ_BANK: Record<string, SeedQuestion[]> = {
  "limites-continuite": [
    {
      title: "Limite d'un quotient",
      formula: "\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}",
      options: ["4", "2", "0", "n'existe pas"],
      correctOptionIndex: 0,
      difficulty: Difficulty.EASY,
    },
    {
      title: "Limite trigonométrique",
      formula: "\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}",
      options: ["3", "1", "0", "6"],
      correctOptionIndex: 0,
      difficulty: Difficulty.EASY,
    },
    {
      title: "Limite à l'infini (rationnelle)",
      formula: "\\lim_{x \\to +\\infty} \\frac{2x^2 + 1}{x^2 + 3}",
      options: ["2", "+\\infty", "1", "3"],
      correctOptionIndex: 0,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: "Limite exponentielle remarquable",
      formula: "\\lim_{x \\to +\\infty} \\left(1 + \\frac{1}{x}\\right)^x",
      options: ["e", "1", "0", "e^2"],
      correctOptionIndex: 0,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: "Continuité d'une fonction par morceaux",
      formula:
        "f(x) = \\begin{cases} x^2 + 1 & \\text{si } x \\le 2 \\\\ 5 & \\text{si } x > 2 \\end{cases}",
      options: ["Oui", "Non"],
      correctOptionIndex: 0,
      difficulty: Difficulty.HARD,
    },
    {
      title: "Limite d'un quotient polynomial",
      formula: "\\lim_{x \\to 1} \\frac{x^3 - 1}{x - 1}",
      options: ["3", "1", "0", "2"],
      correctOptionIndex: 0,
      difficulty: Difficulty.HARD,
    },
  ],
  "transformations-lentes-rapides": [
    {
      title: "Reconnaître une transformation rapide",
      formula: "",
      options: [
        "La combustion du gaz",
        "La rouille du fer",
        "La digestion des aliments",
        "La formation des stalactites",
      ],
      correctOptionIndex: 0,
      difficulty: Difficulty.EASY,
    },
    {
      title: "Dissolution plus rapide",
      formula: "",
      options: ["L'eau chaude", "L'eau froide", "Indifférent", "Aucune"],
      correctOptionIndex: 0,
      difficulty: Difficulty.EASY,
    },
    {
      title: "Unité de la vitesse de formation",
      formula: "v_f = \\frac{n_{\\text{formé}}}{\\Delta t}",
      options: ["mol·s⁻¹", "mol·L⁻¹", "s⁻¹", "L·mol⁻¹"],
      correctOptionIndex: 0,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: "Température et rapidité",
      formula: "\\Delta t",
      options: [
        "Augmente la vitesse de la transformation",
        "Diminue la vitesse",
        "Aucun effet",
        "Stoppe la réaction",
      ],
      correctOptionIndex: 0,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: "Calcul d'une vitesse moyenne",
      formula: "v = \\frac{C_1 - C_2}{\\Delta t}",
      options: ["mol·L⁻¹·min⁻¹", "mol·L⁻¹", "min", "mol·min⁻¹"],
      correctOptionIndex: 0,
      difficulty: Difficulty.HARD,
    },
    {
      title: "Rôle d'un catalyseur",
      formula: "A + B \\xrightarrow{\\text{catalyseur}} C",
      options: [
        "Accélère sans être consommé",
        "Augmente la concentration",
        "Change l'équilibre final",
        "Refroidit la réaction",
      ],
      correctOptionIndex: 0,
      difficulty: Difficulty.HARD,
    },
  ],
};

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const subjects = new Map<string, string>();
  for (const s of SUBJECTS) {
    const row = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name },
      create: s,
    });
    subjects.set(s.slug, row.id);
  }

  const levels = new Map<string, string>();
  for (const l of LEVELS) {
    const row = await prisma.schoolLevel.upsert({
      where: { slug: l.slug },
      update: { name: l.name, order: l.order },
      create: l,
    });
    levels.set(l.slug, row.id);
  }

  for (const c of CHAPTERS) {
    await prisma.chapter.upsert({
      where: {
        subjectId_levelId_slug: {
          subjectId: subjects.get(c.subjectSlug)!,
          levelId: levels.get(c.levelSlug)!,
          slug: c.slug,
        },
      },
      update: { title: c.title, order: c.order },
      create: {
        slug: c.slug,
        title: c.title,
        order: c.order,
        subjectId: subjects.get(c.subjectSlug)!,
        levelId: levels.get(c.levelSlug)!,
      },
    });
  }

  let seededQuestions = 0;
  for (const [chapterSlug, questions] of Object.entries(QUIZ_BANK)) {
    for (const q of questions) {
      await prisma.quizQuestion.upsert({
        where: { chapterSlug_title: { chapterSlug, title: q.title } },
        update: {
          formula: q.formula,
          options: q.options as Prisma.InputJsonValue,
          correctOptionIndex: q.correctOptionIndex,
          difficulty: q.difficulty,
          isTemplate: true,
        },
        create: {
          chapterSlug,
          title: q.title,
          formula: q.formula,
          options: q.options as Prisma.InputJsonValue,
          correctOptionIndex: q.correctOptionIndex,
          difficulty: q.difficulty,
          isTemplate: true,
        },
      });
      seededQuestions += 1;
    }
  }

  const profMath = await prisma.user.upsert({
    where: { email: "prof.math@coursbac.ma" },
    update: {
      name: "Prof. Mathématiques",
      passwordHash,
      professor: { update: { isApproved: true } },
    },
    create: {
      email: "prof.math@coursbac.ma",
      name: "Prof. Mathématiques",
      role: Role.PROFESSOR,
      passwordHash,
      professor: {
        create: {
          isApproved: true,
          subjects: { connect: [{ id: subjects.get("math")! }] },
          levels: {
            connect: [
              { id: levels.get("2bac")! },
              { id: levels.get("1bac")! },
            ],
          },
        },
      },
    },
  });

  const profPhysique = await prisma.user.upsert({
    where: { email: "prof.pc@coursbac.ma" },
    update: {
      name: "Prof. Physique-Chimie",
      passwordHash,
      professor: { update: { isApproved: true } },
    },
    create: {
      email: "prof.pc@coursbac.ma",
      name: "Prof. Physique-Chimie",
      role: Role.PROFESSOR,
      passwordHash,
      professor: {
        create: {
          isApproved: true,
          subjects: { connect: [{ id: subjects.get("physique")! }] },
          levels: { connect: [{ id: levels.get("2bac")! }] },
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "eleve@coursbac.ma" },
    update: { name: "Élève", passwordHash },
    create: {
      email: "eleve@coursbac.ma",
      name: "Élève",
      role: Role.STUDENT,
      passwordHash,
      student: {
        create: { currentLevelId: levels.get("2bac")! },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@coursbac.ma" },
    update: { name: "Administrateur", passwordHash },
    create: {
      email: "admin@coursbac.ma",
      name: "Administrateur",
      role: Role.ADMIN,
      passwordHash,
    },
  });

  console.log("seed ok:", {
    profMath: profMath.email,
    profPhysique: profPhysique.email,
    seededQuestions,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });