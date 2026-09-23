import { prisma } from "@/lib/db";
import { ApiError, type SessionLike } from "@/lib/assignments/service";
import {
  normalizeAssignmentCode,
  isValidAssignmentCode,
} from "@/lib/assignments/code";
import { nextAttemptNumber } from "@/lib/assignments/rules";
import {
  buildStudentHistory,
  type StudentHistoryPayload,
} from "@/lib/assignments/student-history";

type SafeQuestion = {
  id: string;
  index: number;
  title: string;
  formula: string | null;
  options: unknown;
  difficulty: string;
  points: number;
};

type AttemptHeader = {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  startedAt: Date;
  submittedAt: Date | null;
};

type ResultQuestion = {
  id: string;
  index: number;
  title: string;
  formula: string | null;
  options: unknown;
  correctOptionIndex: number;
  difficulty: string;
  points: number;
};

type AssignmentMeta = {
  id: string;
  title: string;
  showFeedback: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function isUniqueViolation(e: unknown): boolean {
  return (
    !!e &&
    typeof e === "object" &&
    "code" in e &&
    (e as { code?: unknown }).code === "P2002"
  );
}

// Student endpoints require the authenticated session role to be STUDENT.
// Administrators and professors are never silently treated as students.
export function assertStudent(session: SessionLike): string {
  const s = session?.user;
  if (!s?.id) throw new ApiError(401, "Authentification requise.");
  if (s.role !== "STUDENT") throw new ApiError(403, "Accès refusé.");
  return s.id;
}

function parseAccessCode(body: unknown): string {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Corps de requête invalide.");
  }
  const raw = (body as Record<string, unknown>).accessCode;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new ApiError(400, "Code d'accès invalide.");
  }
  const code = normalizeAssignmentCode(raw);
  if (!isValidAssignmentCode(code)) {
    // Do not reveal that a private assignment might exist under a bad code.
    throw new ApiError(404, "Assignment introuvable.");
  }
  return code;
}

type JoinResult = {
  assignment: {
    id: string;
    title: string;
    instructions: string | null;
    subjectSlug: string;
    levelSlug: string;
    chapterSlug: string;
    dueDate: Date | null;
    attemptLimit: number;
    showFeedback: boolean;
    questionCount: number;
    remainingAttempts: number;
  };
};

export async function joinAssignment(
  session: SessionLike,
  body: unknown
): Promise<JoinResult> {
  const studentId = assertStudent(session);
  const code = parseAccessCode(body);
  const assignment = await prisma.assignment.findUnique({
    where: { accessCode: code },
    select: {
      id: true,
      title: true,
      instructions: true,
      subjectSlug: true,
      levelSlug: true,
      chapterSlug: true,
      dueDate: true,
      attemptLimit: true,
      showFeedback: true,
      status: true,
      _count: { select: { questions: true } },
    },
  });
  if (!assignment || assignment.status !== "PUBLISHED") {
    throw new ApiError(404, "Assignment introuvable.");
  }
  const taken = await prisma.assignmentAttempt.count({
    where: { assignmentId: assignment.id, studentId },
  });
  return {
    assignment: {
      id: assignment.id,
      title: assignment.title,
      instructions: assignment.instructions,
      subjectSlug: assignment.subjectSlug,
      levelSlug: assignment.levelSlug,
      chapterSlug: assignment.chapterSlug,
      dueDate: assignment.dueDate,
      attemptLimit: assignment.attemptLimit,
      showFeedback: assignment.showFeedback,
      questionCount: assignment._count.questions,
      remainingAttempts: Math.max(0, assignment.attemptLimit - taken),
    },
  };
}

type AttemptRow = {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  startedAt: Date;
  submittedAt: Date | null;
};

export function serializeAttemptHeader(attempt: AttemptRow): AttemptHeader {
  return {
    id: attempt.id,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    score: attempt.score,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
  };
}

export function serializeSafeQuestion(q: {
  id: string;
  index: number;
  title: string;
  formula: string | null;
  options: unknown;
  difficulty: string;
  points: number;
}): SafeQuestion {
  return {
    id: q.id,
    index: q.index,
    title: q.title,
    formula: q.formula,
    options: q.options,
    difficulty: q.difficulty,
    points: q.points,
  };
}

export async function fetchSafeQuestions(
  assignmentId: string
): Promise<SafeQuestion[]> {
  const questions = await prisma.assignmentQuestion.findMany({
    where: { assignmentId },
    orderBy: { index: "asc" },
    select: {
      id: true,
      index: true,
      title: true,
      formula: true,
      options: true,
      difficulty: true,
      points: true,
    },
  });
  return questions.map(serializeSafeQuestion);
}

export type CreateAttemptResult = {
  attempt: AttemptHeader;
  questions: SafeQuestion[];
};

export async function createAttempt(
  assignmentId: string,
  session: SessionLike
): Promise<CreateAttemptResult> {
  const studentId = assertStudent(session);
  const now = new Date();
  let attempt: AttemptRow;
  try {
    attempt = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findUnique({
        where: { id: assignmentId },
        select: { id: true, status: true, attemptLimit: true, dueDate: true },
      });
      if (!assignment || assignment.status !== "PUBLISHED") {
        throw new ApiError(404, "Assignment introuvable.");
      }
      if (assignment.dueDate && assignment.dueDate.getTime() < now.getTime()) {
        throw new ApiError(409, "Date d'échéance dépassée.");
      }
      const existing = await tx.assignmentAttempt.count({
        where: { assignmentId, studentId },
      });
      if (existing >= assignment.attemptLimit) {
        throw new ApiError(409, "Nombre maximal de tentatives atteint.");
      }
      return tx.assignmentAttempt.create({
        data: {
          assignmentId,
          studentId,
          attemptNumber: nextAttemptNumber(existing),
          status: "IN_PROGRESS",
          startedAt: now,
        },
        select: {
          id: true,
          attemptNumber: true,
          status: true,
          score: true,
          startedAt: true,
          submittedAt: true,
        },
      });
    });
  } catch (e) {
    // Unique (assignmentId, studentId, attemptNumber) raced: another request
    // created the same attempt number concurrently. Treat it as limit reached.
    if (isUniqueViolation(e)) {
      throw new ApiError(409, "Nombre maximal de tentatives atteint.");
    }
    throw e;
  }
  const questions = await fetchSafeQuestions(assignmentId);
  return { attempt: serializeAttemptHeader(attempt), questions };
}

export type GetAttemptResult = {
  attempt: AttemptHeader;
  questions: SafeQuestion[];
};

export async function getStudentAttempt(
  assignmentId: string,
  attemptId: string,
  session: SessionLike
): Promise<GetAttemptResult> {
  const studentId = assertStudent(session);
  const attempt = await prisma.assignmentAttempt.findUnique({
    where: { id: attemptId, assignmentId, studentId },
    select: {
      id: true,
      attemptNumber: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
    },
  });
  if (!attempt) throw new ApiError(404, "Tentative introuvable.");
  const questions = await fetchSafeQuestions(assignmentId);
  return { attempt: serializeAttemptHeader(attempt), questions };
}

type SubmitAnswer = {
  questionId: string;
  selectedIndex: number;
};

function parseSubmitBody(body: unknown): { answers: SubmitAnswer[] } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Corps de requête invalide.");
  }
  const b = body as Record<string, unknown>;
  if (b.answers === undefined) {
    throw new ApiError(400, "Réponses manquantes.");
  }
  if (!Array.isArray(b.answers)) {
    throw new ApiError(400, "Réponses invalides.");
  }
  const answers: SubmitAnswer[] = b.answers.map((a) => {
    if (!a || typeof a !== "object" || Array.isArray(a)) {
      throw new ApiError(400, "Réponse invalide.");
    }
    const entry = a as Record<string, unknown>;
    const questionId =
      typeof entry.questionId === "string" && entry.questionId.trim().length > 0
        ? entry.questionId
        : "";
    if (!questionId) throw new ApiError(400, "questionId obligatoire.");
    const selectedIndex = entry.selectedIndex;
    if (
      typeof selectedIndex !== "number" ||
      !Number.isInteger(selectedIndex)
    ) {
      throw new ApiError(400, "selectedIndex invalide.");
    }
    return { questionId, selectedIndex };
  });
  const seen = new Set<string>();
  for (const a of answers) {
    if (seen.has(a.questionId)) {
      throw new ApiError(400, "Question en double.");
    }
    seen.add(a.questionId);
  }
  return { answers };
}

export type ResultsPayload = {
  assignment: AssignmentMeta;
  attempt: AttemptHeader;
  summary: {
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
  };
  questions: {
    id: string;
    index: number;
    title: string;
    points: number;
    selectedIndex: number | null;
    isCorrect: boolean | null;
    correctOptionIndex: number | null;
  }[];
};

export function buildResults(
  assignment: AssignmentMeta,
  attempt: AttemptHeader,
  questions: ResultQuestion[],
  answers: { questionId: string; selectedIndex: number }[]
): ResultsPayload {
  const answered = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = questions.reduce((sum, q) => {
    const selectedIndex = answered.get(q.id);
    if (selectedIndex === undefined) return sum;
    return sum + (selectedIndex === q.correctOptionIndex ? q.points : 0);
  }, 0);
  const percentage =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const showCorrect = assignment.showFeedback;
  const questionResults = questions.map((q) => {
    const selectedIndex = answered.get(q.id) ?? null;
    const isCorrect =
      showCorrect && selectedIndex !== null
        ? selectedIndex === q.correctOptionIndex
        : null;
    return {
      id: q.id,
      index: q.index,
      title: q.title,
      points: q.points,
      selectedIndex,
      isCorrect,
      correctOptionIndex: showCorrect ? q.correctOptionIndex : null,
    };
  });
  return {
    assignment: {
      id: assignment.id,
      title: assignment.title,
      showFeedback: assignment.showFeedback,
    },
    attempt: {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      score: attempt.score,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    },
    summary: { earnedPoints, totalPoints, percentage },
    questions: questionResults,
  };
}

export async function submitAttempt(
  assignmentId: string,
  attemptId: string,
  session: SessionLike,
  body: unknown
): Promise<ResultsPayload> {
  const studentId = assertStudent(session);
  const { answers } = parseSubmitBody(body);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, title: true, showFeedback: true },
  });
  if (!assignment) throw new ApiError(404, "Assignment introuvable.");

  const questions = await prisma.assignmentQuestion.findMany({
    where: { assignmentId },
    orderBy: { index: "asc" },
  });
  const questionsById = new Map(questions.map((q) => [q.id, q]));
  for (const a of answers) {
    const q = questionsById.get(a.questionId);
    if (!q) throw new ApiError(400, "Question inconnue.");
    const options = asStringArray(q.options);
    if (a.selectedIndex < 0 || a.selectedIndex >= options.length) {
      throw new ApiError(400, "Réponse invalide.");
    }
  }

  const earnedPoints = answers.reduce((sum, a) => {
    const q = questionsById.get(a.questionId);
    if (!q) return sum;
    return sum + (a.selectedIndex === q.correctOptionIndex ? q.points : 0);
  }, 0);

  const submitted = await prisma.$transaction(async (tx) => {
    const attempt = await tx.assignmentAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        assignmentId: true,
        studentId: true,
        status: true,
      },
    });
    if (
      !attempt ||
      attempt.assignmentId !== assignmentId ||
      attempt.studentId !== studentId
    ) {
      throw new ApiError(404, "Tentative introuvable.");
    }
    if (attempt.status !== "IN_PROGRESS") {
      throw new ApiError(409, "Tentative déjà soumise.");
    }
    if (answers.length > 0) {
      await tx.assignmentAnswer.createMany({
        data: answers.map((a) => ({
          attemptId,
          questionId: a.questionId,
          selectedIndex: a.selectedIndex,
        })),
      });
    }
    return tx.assignmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        score: earnedPoints,
        submittedAt: new Date(),
      },
      include: {
        answers: { select: { questionId: true, selectedIndex: true } },
      },
    });
  });

  return buildResults(assignment, submitted, questions, submitted.answers);
}

export async function getAttemptResults(
  assignmentId: string,
  attemptId: string,
  session: SessionLike
): Promise<ResultsPayload> {
  const studentId = assertStudent(session);
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, title: true, showFeedback: true },
  });
  if (!assignment) throw new ApiError(404, "Assignment introuvable.");

  const attempt = await prisma.assignmentAttempt.findUnique({
    where: { id: attemptId, assignmentId, studentId },
    include: {
      answers: { select: { questionId: true, selectedIndex: true } },
    },
  });
  if (!attempt) throw new ApiError(404, "Tentative introuvable.");
  if (attempt.status === "IN_PROGRESS") {
    throw new ApiError(409, "Tentative non soumise.");
  }

  const questions = await prisma.assignmentQuestion.findMany({
    where: { assignmentId },
    orderBy: { index: "asc" },
  });
  return buildResults(assignment, attempt, questions, attempt.answers);
}

export async function getStudentHistory(
  session: SessionLike
): Promise<StudentHistoryPayload> {
  const studentId = assertStudent(session);
  const rows = await prisma.assignmentAttempt.findMany({
    where: { studentId },
    select: {
      id: true,
      assignmentId: true,
      attemptNumber: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      assignment: {
        select: {
          id: true,
          title: true,
          subjectSlug: true,
          levelSlug: true,
          chapterSlug: true,
          status: true,
          attemptLimit: true,
          showFeedback: true,
          questions: { select: { points: true } },
        },
      },
    },
  });
  return buildStudentHistory(
    rows.map((row) => ({
      attempt: {
        id: row.id,
        assignmentId: row.assignmentId,
        attemptNumber: row.attemptNumber,
        status: row.status,
        score: row.score,
        startedAt: row.startedAt,
        submittedAt: row.submittedAt,
      },
      assignment: {
        id: row.assignment.id,
        title: row.assignment.title,
        subjectSlug: row.assignment.subjectSlug,
        levelSlug: row.assignment.levelSlug,
        chapterSlug: row.assignment.chapterSlug,
        status: row.assignment.status,
        attemptLimit: row.assignment.attemptLimit,
        showFeedback: row.assignment.showFeedback,
        questions: row.assignment.questions,
      },
    }))
  );
}