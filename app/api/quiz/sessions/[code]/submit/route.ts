import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export type AnswerDetail = {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  userAnswer: number;
  isCorrect: boolean;
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => null);
  const studentName =
    typeof body?.studentName === "string" ? body.studentName.trim() : "";
  const answers = Array.isArray(body?.answers) ? body.answers : null;

  if (studentName.length < 2 || studentName.length > 60) {
    return NextResponse.json(
      { ok: false, error: "Nom invalide." },
      { status: 400 }
    );
  }

  const quiz = await prisma.quizSession.findUnique({
    where: { code },
    include: {
      questions: {
        select: {
          id: true,
          questionText: true,
          options: true,
          correctOptionIndex: true,
        },
      },
    },
  });
  if (!quiz) {
    return NextResponse.json(
      { ok: false, error: "Ce code de quiz est introuvable." },
      { status: 404 }
    );
  }
  if (quiz.status !== "ACTIVE") {
    return NextResponse.json(
      { ok: false, error: "Ce quiz est fermé." },
      { status: 400 }
    );
  }
  if (
    !answers ||
    answers.length !== quiz.questions.length ||
    answers.some((a: unknown) => typeof a !== "number")
  ) {
    return NextResponse.json(
      { ok: false, error: "Réponses invalides." },
      { status: 400 }
    );
  }

  let score = 0;
  const total = quiz.questions.length;
  const details: AnswerDetail[] = quiz.questions.map((q, i) => {
    const opts = asStringList(q.options);
    const isCorrect = answers[i] === q.correctOptionIndex;
    if (isCorrect) score += 1;
    return {
      questionText: q.questionText,
      options: opts,
      correctOptionIndex: q.correctOptionIndex,
      userAnswer: answers[i],
      isCorrect,
    };
  });

  const participant = await prisma.quizParticipant.upsert({
    where: { sessionId_studentName: { sessionId: quiz.id, studentName } },
    create: {
      sessionId: quiz.id,
      studentName,
      score,
      totalQuestions: total,
    },
    update: { score, totalQuestions: total },
    select: { id: true, score: true, totalQuestions: true },
  });

  return NextResponse.json({
    ok: true,
    score: participant.score,
    total: participant.totalQuestions,
    details,
  });
}