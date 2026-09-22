import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  generateQuestions,
  randomQuizCode,
  supportsQuiz,
} from "@/lib/quiz/generator";
import { CHAPTERS_META } from "@/lib/content/registry";

export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isApprovedProfessor =
    !!session && role === "PROFESSOR" && session.user.isApproved === true;
  if (!session?.user?.id || (!isAdmin && !isApprovedProfessor)) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const chapterSlug =
    typeof body?.chapterSlug === "string" ? body.chapterSlug : "";
  if (!chapterSlug || !CHAPTERS_META[chapterSlug] || !supportsQuiz(chapterSlug)) {
    return NextResponse.json(
      { ok: false, error: "Chapitre non supporté par le générateur de quiz." },
      { status: 400 }
    );
  }
  const questionCount =
    typeof body?.questionCount === "number" ? body.questionCount : 5;

  const questions = generateQuestions(chapterSlug, questionCount);

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