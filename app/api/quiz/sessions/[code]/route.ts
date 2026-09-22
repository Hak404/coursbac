import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CHAPTERS_META } from "@/lib/content/registry";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }

  const quiz = await prisma.quizSession.findUnique({
    where: { code },
    include: {
      participants: {
        orderBy: { submittedAt: "asc" },
        select: {
          id: true,
          studentName: true,
          score: true,
          totalQuestions: true,
          submittedAt: true,
        },
      },
      _count: { select: { questions: true } },
    },
  });
  if (!quiz) {
    return NextResponse.json(
      { ok: false, error: "Ce code de quiz est introuvable." },
      { status: 404 }
    );
  }
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && quiz.teacherId !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    session: {
      id: quiz.id,
      code: quiz.code,
      status: quiz.status,
      chapterSlug: quiz.chapterSlug,
      chapterTitle: CHAPTERS_META[quiz.chapterSlug]?.title ?? quiz.chapterSlug,
      totalQuestions: quiz._count.questions,
      createdAt: quiz.createdAt,
      participants: quiz.participants.map((p) => ({
        id: p.id,
        studentName: p.studentName,
        score: p.score,
        totalQuestions: p.totalQuestions,
        submittedAt: p.submittedAt,
      })),
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }
  const quiz = await prisma.quizSession.findUnique({ where: { code } });
  if (!quiz) {
    return NextResponse.json(
      { ok: false, error: "Ce code de quiz est introuvable." },
      { status: 404 }
    );
  }
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && quiz.teacherId !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }
  const closed = await prisma.quizSession.update({
    where: { id: quiz.id },
    data: { status: "CLOSED" },
    select: { id: true, code: true, status: true },
  });

  return NextResponse.json({ ok: true, session: closed });
}