import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function denied() {
  return NextResponse.json(
    { ok: false, error: "Accès refusé." },
    { status: 403 }
  );
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return denied();

  const professors = await prisma.professorProfile.findMany({
    include: {
      user: { select: { id: true, email: true, name: true, createdAt: true } },
      subjects: { select: { slug: true, name: true } },
      levels: { select: { slug: true, name: true } },
    },
    orderBy: { user: { createdAt: "asc" } },
  });

  const sorted = [...professors].sort(
    (a, b) =>
      new Date(a.user.createdAt).getTime() - new Date(b.user.createdAt).getTime()
  );

  return NextResponse.json({
    ok: true,
    professors: sorted.map((p) => ({
      id: p.id,
      email: p.user.email,
      name: p.user.name,
      createdAt: p.user.createdAt,
      isApproved: p.isApproved,
      subjects: p.subjects.map((s) => s.slug),
      levels: p.levels.map((l) => l.slug),
    })),
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return denied();

    const body = await req.json().catch(() => null);
    const professorId =
      typeof body?.professorId === "string" ? body.professorId : "";
    if (!professorId) {
      return NextResponse.json(
        { ok: false, error: "Identifiant professeur manquant." },
        { status: 400 }
      );
    }

    const existing = await prisma.professorProfile.findUnique({
      where: { id: professorId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Professeur introuvable." },
        { status: 404 }
      );
    }

    await prisma.professorProfile.update({
      where: { id: professorId },
      data: { isApproved: true },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}