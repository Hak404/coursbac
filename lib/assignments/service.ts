import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { Difficulty } from "@/lib/generated/prisma/client";
import {
  SUBJECTS_META,
  LEVELS_META,
  CHAPTERS_META,
} from "@/lib/content/registry";
import { generateAssignmentCode, isValidAssignmentCode } from "@/lib/assignments/code";
import {
  canTransitionAssignmentStatus,
  isValidAttemptLimit,
} from "@/lib/assignments/rules";
import { isValidPoints } from "@/lib/assignments/question";

export type SessionLike = {
  user?: {
    id?: string;
    role?: "ADMIN" | "PROFESSOR" | "STUDENT";
    isApproved?: boolean | null;
  } | null;
} | null;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isTeacherRole(session: SessionLike): boolean {
  const s = session?.user;
  if (!s?.id) return false;
  if (s.role === "ADMIN") return true;
  return s.role === "PROFESSOR" && s.isApproved === true;
}

export function canManageAssignment(
  assignment: { createdById: string },
  session: SessionLike
): boolean {
  const s = session?.user;
  if (!s?.id) return false;
  if (s.role === "ADMIN") return true;
  return assignment.createdById === s.id;
}

// Returns the authenticated user id or throws 401/403.
export function assertTeacher(session: SessionLike): string {
  const s = session?.user;
  if (!s?.id) throw new ApiError(401, "Authentification requise.");
  if (!isTeacherRole(session)) throw new ApiError(403, "Accès refusé.");
  return s.id;
}

export function toErrorResponse(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: e.status }
    );
  }
  console.error("[assignments]", e);
  return NextResponse.json(
    { ok: false, error: "Erreur serveur." },
    { status: 500 }
  );
}

type SafeMeta = {
  title: string;
  instructions: string | null;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  dueDate: Date | null;
  attemptLimit: number;
  showFeedback: boolean;
};

type QuestionEntry = {
  sourceQuestionId: string;
  index: number;
  points: number;
};

type SnapshotData = {
  index: number;
  title: string;
  formula: string | null;
  options: Prisma.InputJsonValue;
  correctOptionIndex: number;
  difficulty: Difficulty;
  points: number;
  sourceQuestionId: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function assertValidChapter(
  subjectSlug: string,
  levelSlug: string,
  chapterSlug: string
): void {
  if (!subjectSlug || !SUBJECTS_META[subjectSlug]) {
    throw new ApiError(400, "Matière invalide.");
  }
  if (!levelSlug || !LEVELS_META[levelSlug]) {
    throw new ApiError(400, "Niveau invalide.");
  }
  const chapter = CHAPTERS_META[chapterSlug];
  if (
    !chapter ||
    chapter.subjectSlug !== subjectSlug ||
    chapter.levelSlug !== levelSlug
  ) {
    throw new ApiError(400, "Chapitre invalide.");
  }
}

function parseDueDate(raw: unknown): Date | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "string" && typeof raw !== "number") {
    throw new ApiError(400, "Date d'échéance invalide.");
  }
  const date = new Date(raw as string | number);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Date d'échéance invalide.");
  }
  return date;
}

function parseQuestions(raw: unknown): QuestionEntry[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new ApiError(400, "Questions invalides.");
  const entries: QuestionEntry[] = raw.map((q) => {
    if (!q || typeof q !== "object" || Array.isArray(q)) {
      throw new ApiError(400, "Question invalide.");
    }
    const entry = q as Record<string, unknown>;
    const sourceQuestionId =
      typeof entry.sourceQuestionId === "string" ? entry.sourceQuestionId : "";
    if (!sourceQuestionId) {
      throw new ApiError(
        400,
        "sourceQuestionId obligatoire pour chaque question."
      );
    }
    const index = entry.index;
    if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
      throw new ApiError(400, "Index de question invalide.");
    }
    let points = 1;
    if (entry.points !== undefined) {
      if (typeof entry.points !== "number" || !isValidPoints(entry.points)) {
        throw new ApiError(400, "Points invalides.");
      }
      points = entry.points;
    }
    return { sourceQuestionId, index, points };
  });

  const seen = new Set<number>();
  for (const e of entries) {
    if (seen.has(e.index)) {
      throw new ApiError(400, "Index de question en double.");
    }
    seen.add(e.index);
  }
  return entries.sort((a, b) => a.index - b.index);
}

export function parseCreateBody(body: unknown): {
  meta: SafeMeta;
  questions: QuestionEntry[];
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Corps de requête invalide.");
  }
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) throw new ApiError(400, "Le titre est obligatoire.");

  const instructions =
    typeof b.instructions === "string" && b.instructions.trim().length > 0
      ? b.instructions.trim()
      : null;
  const subjectSlug = typeof b.subjectSlug === "string" ? b.subjectSlug : "";
  const levelSlug = typeof b.levelSlug === "string" ? b.levelSlug : "";
  const chapterSlug = typeof b.chapterSlug === "string" ? b.chapterSlug : "";
  assertValidChapter(subjectSlug, levelSlug, chapterSlug);

  const attemptLimit = b.attemptLimit === undefined ? 1 : b.attemptLimit;
  if (!isValidAttemptLimit(attemptLimit)) {
    throw new ApiError(400, "attemptLimit invalide.");
  }
  const showFeedback =
    b.showFeedback === undefined ? true : b.showFeedback;
  if (typeof showFeedback !== "boolean") {
    throw new ApiError(400, "showFeedback invalide.");
  }

  const dueDate = parseDueDate(b.dueDate);
  const questions = parseQuestions(b.questions);

  return {
    meta: {
      title,
      instructions,
      subjectSlug,
      levelSlug,
      chapterSlug,
      dueDate,
      attemptLimit,
      showFeedback,
    },
    questions,
  };
}

export function parseUpdateBody(body: unknown): {
  meta: Partial<SafeMeta>;
  questions: QuestionEntry[] | undefined;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Corps de requête invalide.");
  }
  const b = body as Record<string, unknown>;
  const meta: Partial<SafeMeta> = {};

  if (b.title !== undefined) {
    const title = typeof b.title === "string" ? b.title.trim() : "";
    if (!title) throw new ApiError(400, "Le titre est obligatoire.");
    meta.title = title;
  }
  if (b.instructions !== undefined) {
    meta.instructions =
      typeof b.instructions === "string" && b.instructions.trim().length > 0
        ? b.instructions.trim()
        : null;
  }
  const hasChapterField =
    b.subjectSlug !== undefined ||
    b.levelSlug !== undefined ||
    b.chapterSlug !== undefined;
  if (hasChapterField) {
    const subjectSlug = b.subjectSlug;
    const levelSlug = b.levelSlug;
    const chapterSlug = b.chapterSlug;
    if (
      typeof subjectSlug !== "string" ||
      typeof levelSlug !== "string" ||
      typeof chapterSlug !== "string"
    ) {
      throw new ApiError(
        400,
        "subjectSlug, levelSlug et chapterSlug doivent être mis à jour ensemble."
      );
    }
    assertValidChapter(subjectSlug, levelSlug, chapterSlug);
    meta.subjectSlug = subjectSlug;
    meta.levelSlug = levelSlug;
    meta.chapterSlug = chapterSlug;
  }
  if (b.dueDate !== undefined) {
    meta.dueDate = parseDueDate(b.dueDate);
  }
  if (b.attemptLimit !== undefined) {
    if (!isValidAttemptLimit(b.attemptLimit)) {
      throw new ApiError(400, "attemptLimit invalide.");
    }
    meta.attemptLimit = b.attemptLimit;
  }
  if (b.showFeedback !== undefined) {
    if (typeof b.showFeedback !== "boolean") {
      throw new ApiError(400, "showFeedback invalide.");
    }
    meta.showFeedback = b.showFeedback;
  }

  let questions: QuestionEntry[] | undefined;
  if (b.questions !== undefined) {
    questions = parseQuestions(b.questions);
  }

  return { meta, questions };
}

export async function generateUniqueAccessCode(): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const code = generateAssignmentCode();
    const existing = await prisma.assignment.findUnique({
      where: { accessCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new ApiError(500, "Impossible de générer un code unique.");
}

async function buildSnapshots(
  entries: QuestionEntry[]
): Promise<SnapshotData[]> {
  if (entries.length === 0) return [];
  const ids = entries.map((e) => e.sourceQuestionId);
  const sources = await prisma.quizQuestion.findMany({
    where: { id: { in: ids } },
  });
  const byId = new Map(sources.map((q) => [q.id, q]));
  return entries.map((e) => {
    const src = byId.get(e.sourceQuestionId);
    if (!src) {
      throw new ApiError(
        400,
        `Question source introuvable : ${e.sourceQuestionId}`
      );
    }
    const options = asStringArray(src.options);
    if (
      options.length < 2 ||
      !Number.isInteger(src.correctOptionIndex) ||
      src.correctOptionIndex < 0 ||
      src.correctOptionIndex >= options.length
    ) {
      throw new ApiError(400, "Question source invalide.");
    }
    return {
      index: e.index,
      title: src.title,
      formula:
        typeof src.formula === "string" && src.formula.trim().length > 0
          ? src.formula
          : null,
      options: options as Prisma.InputJsonValue,
      correctOptionIndex: src.correctOptionIndex,
      difficulty: src.difficulty,
      points: e.points,
      sourceQuestionId: src.id,
    };
  });
}

export async function createAssignment(
  userId: string,
  meta: SafeMeta,
  entries: QuestionEntry[]
) {
  const snapshots = await buildSnapshots(entries);
  const accessCode = await generateUniqueAccessCode();
  const [assignment] = await prisma.$transaction([
    prisma.assignment.create({
      data: {
        accessCode,
        title: meta.title,
        instructions: meta.instructions,
        subjectSlug: meta.subjectSlug,
        levelSlug: meta.levelSlug,
        chapterSlug: meta.chapterSlug,
        createdById: userId,
        dueDate: meta.dueDate,
        attemptLimit: meta.attemptLimit,
        showFeedback: meta.showFeedback,
        questions: snapshots.length > 0 ? { create: snapshots } : undefined,
      },
      include: { questions: { orderBy: { index: "asc" } } },
    }),
  ]);
  return assignment;
}

export async function listAssignments(session: SessionLike) {
  const s = session?.user;
  if (!s?.id) throw new ApiError(401, "Authentification requise.");
  if (!isTeacherRole(session)) throw new ApiError(403, "Accès refusé.");
  const where = s.role === "ADMIN" ? {} : { createdById: s.id };
  return prisma.assignment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { questions: { orderBy: { index: "asc" } } },
  });
}

export async function fetchAssignment(id: string) {
  return prisma.assignment.findUnique({
    where: { id },
    include: { questions: { orderBy: { index: "asc" } } },
  });
}

export function requireManageAccess<T extends { id: string; createdById: string }>(
  assignment: T | null,
  session: SessionLike
): T {
  if (!assignment) throw new ApiError(404, "Assignment introuvable.");
  if (!canManageAssignment(assignment, session)) {
    throw new ApiError(403, "Accès refusé.");
  }
  return assignment;
}

export async function getAssignment(id: string, session: SessionLike) {
  const assignment = await fetchAssignment(id);
  return requireManageAccess(assignment, session);
}

export async function updateAssignment(
  id: string,
  session: SessionLike,
  body: unknown
) {
  assertTeacher(session);
  const current = await prisma.assignment.findUnique({
    where: { id },
    select: { id: true, status: true, createdById: true, accessCode: true },
  });
  const owned = requireManageAccess(current, session);
  if (owned.status !== "DRAFT") {
    throw new ApiError(409, "Seuls les travaux en brouillon sont modifiables.");
  }

  const { meta, questions } = parseUpdateBody(body);
  const data = { ...meta } as Prisma.AssignmentUpdateInput;

  const ops: Prisma.PrismaPromise<unknown>[] = [];
  if (questions !== undefined) {
    const snapshots = await buildSnapshots(questions);
    ops.push(
      prisma.assignmentQuestion.deleteMany({
        where: { assignmentId: id },
      })
    );
    ops.push(
      prisma.assignmentQuestion.createMany({
        data: snapshots.map((s) => ({ ...s, assignmentId: id })),
      })
    );
  }
  ops.push(
    prisma.assignment.update({
      where: { id },
      data,
      include: { questions: { orderBy: { index: "asc" } } },
    })
  );

  const results = await prisma.$transaction(ops);
  const updated = results[results.length - 1];
  return updated as Prisma.AssignmentGetPayload<{
    include: { questions: true };
  }>;
}

export async function publishAssignment(id: string, session: SessionLike) {
  assertTeacher(session);
  const assignment = await fetchAssignment(id);
  const owned = requireManageAccess(assignment, session);

  if (!canTransitionAssignmentStatus(owned.status, "PUBLISHED")) {
    throw new ApiError(409, "Transition de statut invalide.");
  }
  if (!owned.title.trim()) throw new ApiError(400, "Titre invalide.");
  assertValidChapter(owned.subjectSlug, owned.levelSlug, owned.chapterSlug);
  if (!isValidAssignmentCode(owned.accessCode)) {
    throw new ApiError(400, "Code d'accès invalide.");
  }
  if (owned.questions.length === 0) {
    throw new ApiError(400, "Ajoutez au moins une question avant de publier.");
  }
  for (const q of owned.questions) {
    const options = asStringArray(q.options);
    if (
      options.length < 2 ||
      !Number.isInteger(q.correctOptionIndex) ||
      q.correctOptionIndex < 0 ||
      q.correctOptionIndex >= options.length
    ) {
      throw new ApiError(400, "Question invalide dans le travail.");
    }
    if (!isValidPoints(q.points)) {
      throw new ApiError(400, "Points invalides.");
    }
  }

  return prisma.assignment.update({
    where: { id },
    data: { status: "PUBLISHED" },
    include: { questions: { orderBy: { index: "asc" } } },
  });
}

export async function closeAssignment(id: string, session: SessionLike) {
  assertTeacher(session);
  const current = await prisma.assignment.findUnique({
    where: { id },
    select: { id: true, status: true, createdById: true },
  });
  const owned = requireManageAccess(current, session);
  if (!canTransitionAssignmentStatus(owned.status, "CLOSED")) {
    throw new ApiError(409, "Transition de statut invalide.");
  }
  return prisma.assignment.update({
    where: { id },
    data: { status: "CLOSED" },
    include: { questions: { orderBy: { index: "asc" } } },
  });
}

export function serializeAssignment(assignment: {
  id: string;
  accessCode: string;
  title: string;
  instructions: string | null;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  status: string;
  createdById: string;
  dueDate: Date | null;
  attemptLimit: number;
  showFeedback: boolean;
  createdAt: Date;
  updatedAt: Date;
  questions?: {
    id: string;
    index: number;
    title: string;
    formula: string | null;
    options: unknown;
    correctOptionIndex: number;
    difficulty: string;
    points: number;
    sourceQuestionId: string | null;
  }[];
}) {
  return {
    id: assignment.id,
    accessCode: assignment.accessCode,
    title: assignment.title,
    instructions: assignment.instructions,
    subjectSlug: assignment.subjectSlug,
    levelSlug: assignment.levelSlug,
    chapterSlug: assignment.chapterSlug,
    status: assignment.status,
    createdById: assignment.createdById,
    dueDate: assignment.dueDate,
    attemptLimit: assignment.attemptLimit,
    showFeedback: assignment.showFeedback,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    questions: (assignment.questions ?? []).map((q) => ({
      id: q.id,
      index: q.index,
      title: q.title,
      formula: q.formula,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      difficulty: q.difficulty,
      points: q.points,
      sourceQuestionId: q.sourceQuestionId,
    })),
  };
}