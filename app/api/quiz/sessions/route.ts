import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  generateQuestions,
  randomQuizCode,
  supportsQuiz,
  type GeneratedQuestion,
} from "@/lib/quiz/generator";
import { CHAPTERS_META } from "@/lib/content/registry";

type CustomQuestion = {
  title?: string;
  formula?: string;
  options?: unknown[];
  correctOptionIndex?: number;
  difficulty?: string;
};

export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isApprovedProfessor =
    !!session && role === "PROFESSOR" && session.user.isApproved === true;
  if (!session?.user?.id || (!isAdmin && !isApprovedProfessor)) {
    return NextResponse.json(
      { ok: false, error: "Accès refusé." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const chapterSlug =
    typeof body?.chapterSlug === "string" ? body.chapterSlug : "";
  if (!chapterSlug || !CHAPTERS_META[chapterSlug]) {
    return NextResponse.json(
      { ok: false, error: "Chapitre invalide." },
      { status: 400 }
    );
  }

  const rawCustom = Array.isArray(body?.questions)
    ? (body.questions as CustomQuestion[])
    : [];
  const hasCustom = rawCustom.length > 0;
  if (!hasCustom && !supportsQuiz(chapterSlug)) {
    return NextResponse.json(
      { ok: false, error: "Chapitre non supporté par le générateur de quiz." },
      { status: 400 }
    );
  }

  let questions: (GeneratedQuestion & { formula: string | null })[];
  if (hasCustom) {
    questions = rawCustom.map((q, i) => {
      const options = Array.isArray(q.options)
        ? q.options
            .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
            .map((o) => o.trim())
        : [];
      const title =
        typeof q.title === "string" && q.title.trim().length > 0
          ? q.title.trim()
          : `Question ${i + 1}`;
      const formula =
        typeof q.formula === "string" && q.formula.trim().length > 0
          ? q.formula.trim()
          : null;
      return {
        chapterSlug,
        questionText: title,
        formula,
        options,
        correctOptionIndex:
          typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : -1,
        variableParams: {
          source: "bank",
          difficulty: typeof q.difficulty === "string" ? q.difficulty : "MEDIUM",
        },
      };
    });
    if (
      questions.some(
        (q) =>
          q.options.length < 2 ||
          q.correctOptionIndex < 0 ||
          q.correctOptionIndex >= q.options.length
      )
    ) {
      return NextResponse.json(
        { ok: false, error: "Questions personnalisées invalides." },
        { status: 400 }
      );
    }
  } else {
    const questionCount =
      typeof body?.questionCount === "number" ? body.questionCount : 5;
    questions = generateQuestions(chapterSlug, questionCount).map((q) => ({
      ...q,
      formula: null,
    }));
  }

  let code = randomQuizCode();
  let collision = await prisma.quizSession.findUnique({
    where: { code },
    select: { id: true },
  });
  for (let i = 0; i < 50 && collision; i++) {
    code = randomQuizCode();
    collision = await prisma.quizSession.findUnique({
      where: { code },
      select: { id: true },
    });
  }
  if (collision) {
    return NextResponse.json(
      { ok: false, error: "Impossible de générer un code unique." },
      { status: 500 }
    );
  }

  const created = await prisma.quizSession.create({
    data: {
      code,
      teacherId: session.user.id,
      chapterSlug,
      questions: {
        create: questions.map((q) => ({
          chapterSlug: q.chapterSlug,
          questionText: q.questionText,
          formula: q.formula,
          options: q.options as Prisma.InputJsonValue,
          correctOptionIndex: q.correctOptionIndex,
          variableParams: q.variableParams as Prisma.InputJsonValue,
        })),
      },
    },
    select: { id: true, code: true, status: true, chapterSlug: true },
  });

  return NextResponse.json({ ok: true, session: created });
}