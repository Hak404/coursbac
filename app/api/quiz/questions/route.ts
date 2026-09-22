import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { CHAPTERS_META } from "@/lib/content/registry";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
type DifficultyValue = (typeof DIFFICULTIES)[number];

function isTeacher(session: { user: { role?: string | null; isApproved?: boolean | null } } | null) {
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  return session.user.role === "PROFESSOR" && session.user.isApproved === true;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!isTeacher(session)) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const chapterSlug = searchParams.get("chapterSlug") ?? "";
  if (!chapterSlug || !CHAPTERS_META[chapterSlug]) {
    return NextResponse.json(
      { ok: false, error: "Chapitre invalide." },
      { status: 400 }
    );
  }
  const bank = await prisma.quizQuestion.findMany({
    where: { chapterSlug },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({
    ok: true,
    questions: bank.map((q) => ({
      id: q.id,
      chapterSlug: q.chapterSlug,
      title: q.title,
      formula: q.formula,
      options: (q.options as unknown as string[]).map((o) => String(o)),
      correctOptionIndex: q.correctOptionIndex,
      difficulty: q.difficulty,
      isTemplate: q.isTemplate,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isTeacher(session)) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const chapterSlug =
    typeof body?.chapterSlug === "string" ? body.chapterSlug : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const formula = typeof body?.formula === "string" ? body.formula.trim() : "";
  const options = Array.isArray(body?.options)
    ? (body.options as unknown[]).filter((o): o is string => typeof o === "string").map((o) => o.trim())
    : [];
  const correctOptionIndex = body?.correctOptionIndex;
  const difficulty = body?.difficulty ?? "MEDIUM";
  const isTemplate = body?.isTemplate === true;
  const id = typeof body?.id === "string" ? body.id : null;

  if (!chapterSlug || !CHAPTERS_META[chapterSlug]) {
    return NextResponse.json(
      { ok: false, error: "Chapitre invalide." },
      { status: 400 }
    );
  }
  if (title.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Le titre de la question doit contenir au moins 3 caractères." },
      { status: 400 }
    );
  }
  if (options.length < 2 || options.length > 6 || options.some((o) => o.length === 0)) {
    return NextResponse.json(
      { ok: false, error: "La question doit contenir entre 2 et 6 propositions non vides." },
      { status: 400 }
    );
  }
  if (
    typeof correctOptionIndex !== "number" ||
    correctOptionIndex < 0 ||
    correctOptionIndex >= options.length
  ) {
    return NextResponse.json(
      { ok: false, error: "Index de la bonne réponse invalide." },
      { status: 400 }
    );
  }
  if (!DIFFICULTIES.includes(difficulty)) {
    return NextResponse.json(
      { ok: false, error: "Difficulté invalide." },
      { status: 400 }
    );
  }

  const data = {
    chapterSlug,
    title,
    formula,
    options: options as Prisma.InputJsonValue,
    correctOptionIndex,
    difficulty: difficulty as DifficultyValue,
    isTemplate,
  };

  let saved;
  if (id) {
    const existing = await prisma.quizQuestion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Question introuvable." },
        { status: 404 }
      );
    }
    saved = await prisma.quizQuestion.update({ where: { id }, data });
  } else {
    try {
      saved = await prisma.quizQuestion.create({ data });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Une question portant ce titre existe déjà pour ce chapitre." },
        { status: 409 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    question: {
      id: saved.id,
      chapterSlug: saved.chapterSlug,
      title: saved.title,
      formula: saved.formula,
      options: (saved.options as unknown as string[]).map((o) => String(o)),
      correctOptionIndex: saved.correctOptionIndex,
      difficulty: saved.difficulty,
      isTemplate: saved.isTemplate,
    },
  });
}