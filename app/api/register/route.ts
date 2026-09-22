import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";
import { SUBJECTS_META, LEVELS_META } from "@/lib/content/registry";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const role =
      body?.role === "PROFESSOR" || body?.role === "STUDENT" ? body.role : null;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { ok: false, error: "Champs requis manquants." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (role === "PROFESSOR") {
      const subjects = Array.isArray(body?.subjects) ? body.subjects : [];
      const levels = Array.isArray(body?.levels) ? body.levels : [];
      if (subjects.length === 0 || levels.length === 0) {
        return NextResponse.json(
          { ok: false, error: "Sélectionnez au moins une matière et un niveau." },
          { status: 400 }
        );
      }
      for (const s of subjects) {
        if (!SUBJECTS_META[s]) {
          return NextResponse.json(
            { ok: false, error: `Matière inconnue : ${s}` },
            { status: 400 }
          );
        }
      }
      for (const l of levels) {
        if (!LEVELS_META[l]) {
          return NextResponse.json(
            { ok: false, error: `Niveau inconnu : ${l}` },
            { status: 400 }
          );
        }
      }

      const subjectIds = await prisma.subject.findMany({
        where: { slug: { in: subjects } },
        select: { id: true },
      });
      const levelIds = await prisma.schoolLevel.findMany({
        where: { slug: { in: levels } },
        select: { id: true },
      });

      await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: Role.PROFESSOR,
          professor: {
            create: {
              subjects: {
                connect: subjectIds.map((s) => ({ id: s.id })),
              },
              levels: { connect: levelIds.map((l) => ({ id: l.id })) },
            },
          },
        },
      });
    } else {
      const studentLevelSlug =
        typeof body?.studentLevel === "string" ? body.studentLevel : null;
      const level =
        studentLevelSlug && LEVELS_META[studentLevelSlug]
          ? await prisma.schoolLevel.findUnique({
              where: { slug: studentLevelSlug },
              select: { id: true },
            })
          : null;

      await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: Role.STUDENT,
          student: {
            create: { currentLevelId: level?.id ?? null },
          },
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur lors de l'inscription." },
      { status: 500 }
    );
  }
}