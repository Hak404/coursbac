import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CHAPTERS_META } from "@/lib/content/registry";

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json().catch(() => null);
    const studentName =
      typeof body?.studentName === "string" ? body.studentName.trim() : "";

    if (studentName.length < 2 || studentName.length > 60) {
      return NextResponse.json(
        { ok: false, error: "Veuillez saisir votre nom et prénom." },
        { status: 400 }
      );
    }

    const quiz = await prisma.quizSession.findUnique({
      where: { code },
      include: {
        questions: {
          select: { id: true, questionText: true, formula: true, options: true },
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
        { ok: false, error: "Ce quiz est fermé. Contactez votre professeur." },
        { status: 400 }
      );
    }
    const total = quiz.questions.length;
    if (total === 0) {
      return NextResponse.json(
        { ok: false, error: "Ce quiz ne contient aucune question." },
        { status: 400 }
      );
    }

    const existing = await prisma.quizParticipant.findUnique({
      where: { sessionId_studentName: { sessionId: quiz.id, studentName } },
      select: { id: true, submitted: true },
    });
    if (existing?.submitted) {
      return NextResponse.json(
        { ok: false, error: "Ce participant a déjà soumis ses réponses." },
        { status: 409 }
      );
    }

    const participant = await prisma.quizParticipant.upsert({
      where: { sessionId_studentName: { sessionId: quiz.id, studentName } },
      create: {
        sessionId: quiz.id,
        studentName,
        score: 0,
        totalQuestions: total,
      },
      update: { totalQuestions: total },
      select: { id: true },
    });

    return NextResponse.json({
      ok: true,
      sessionId: quiz.id,
      code: quiz.code,
      chapterTitle: CHAPTERS_META[quiz.chapterSlug]?.title ?? quiz.chapterSlug,
      total,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        formula: q.formula ?? "",
        options: asStringList(q.options),
      })),
      participantId: participant.id,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur. Réessayez." },
      { status: 500 }
    );
  }
}