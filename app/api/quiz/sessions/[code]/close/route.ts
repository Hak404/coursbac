import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(
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