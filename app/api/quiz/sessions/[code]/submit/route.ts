import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  computeScoreAndDetails,
  validateAnswers,
  type AnswerDetail,
} from "@/lib/quiz/scoring";

export type { AnswerDetail };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
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

    const invalid = validateAnswers(answers, quiz.questions);
    if (invalid) {
      return NextResponse.json({ ok: false, error: invalid }, { status: 400 });
    }

    const participant = await prisma.quizParticipant.findUnique({
      where: { sessionId_studentName: { sessionId: quiz.id, studentName } },
      select: { id: true, submitted: true },
    });
    if (!participant) {
      return NextResponse.json(
        { ok: false, error: "Participant introuvable. Rejoignez d'abord le quiz." },
        { status: 400 }
      );
    }
    if (participant.submitted) {
      return NextResponse.json(
        { ok: false, error: "Ce participant a déjà soumis ses réponses." },
        { status: 409 }
      );
    }

    const total = quiz.questions.length;
    const { score, details } = computeScoreAndDetails(
      quiz.questions,
      answers as number[]
    );

    const updated = await prisma.quizParticipant.update({
      where: { id: participant.id },
      data: { score, totalQuestions: total, submitted: true, submittedAt: new Date() },
      select: { id: true, score: true, totalQuestions: true },
    });

    return NextResponse.json({
      ok: true,
      score: updated.score,
      total: updated.totalQuestions,
      details,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur. Réessayez." },
      { status: 500 }
    );
  }
}