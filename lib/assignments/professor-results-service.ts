import { prisma } from "@/lib/db";
import {
  ApiError,
  assertTeacher,
  requireManageAccess,
  type SessionLike,
} from "@/lib/assignments/service";
import {
  buildQuestionResults,
  buildSummaryStats,
  computeScore,
  serializeAttemptRow,
  type QuestionResult,
  type SerializedAttemptRow,
  type SummaryStats,
} from "@/lib/assignments/professor-results";

type AssignmentWithQuestions = {
  id: string;
  title: string;
  accessCode: string;
  status: string;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  dueDate: Date | null;
  showFeedback: boolean;
  attemptLimit: number;
  createdAt: Date;
  createdById: string;
  questions: {
    id: string;
    index: number;
    title: string;
    formula: string | null;
    options: unknown;
    correctOptionIndex: number;
    points: number;
  }[];
};

function assertOwnedAssignment(
  assignment: AssignmentWithQuestions | null,
  session: SessionLike
): AssignmentWithQuestions {
  // assertTeacher first: anonymous -> 401, non-teacher (students) -> 403.
  assertTeacher(session);
  return requireManageAccess(assignment, session);
}

function totalPointsOf(assignment: AssignmentWithQuestions): number {
  return assignment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
}

export type ProfessorResultsPayload = {
  assignment: {
    id: string;
    title: string;
    accessCode: string;
    status: string;
    subjectSlug: string;
    levelSlug: string;
    chapterSlug: string;
    dueDate: Date | null;
    showFeedback: boolean;
    attemptLimit: number;
    createdAt: Date;
    questionCount: number;
    totalPoints: number;
  };
  summary: SummaryStats;
  attempts: SerializedAttemptRow[];
};

export async function getProfessorResults(
  assignmentId: string,
  session: SessionLike
): Promise<ProfessorResultsPayload> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: {
        orderBy: { index: "asc" },
        select: {
          id: true,
          index: true,
          title: true,
          formula: true,
          options: true,
          correctOptionIndex: true,
          points: true,
        },
      },
    },
  });
  if (!assignment) {
    assertTeacher(session);
    throw new ApiError(404, "Assignment introuvable.");
  }
  const owned = assertOwnedAssignment(assignment as AssignmentWithQuestions, session);
  const totalPoints = totalPointsOf(owned);

  const attempts = await prisma.assignmentAttempt.findMany({
    where: { assignmentId },
    orderBy: { startedAt: "desc" },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  const summary = buildSummaryStats(attempts, totalPoints);
  const rows = attempts.map((a) => serializeAttemptRow(a, totalPoints));

  return {
    assignment: {
      id: owned.id,
      title: owned.title,
      accessCode: owned.accessCode,
      status: owned.status,
      subjectSlug: owned.subjectSlug,
      levelSlug: owned.levelSlug,
      chapterSlug: owned.chapterSlug,
      dueDate: owned.dueDate,
      showFeedback: owned.showFeedback,
      attemptLimit: owned.attemptLimit,
      createdAt: owned.createdAt,
      questionCount: owned.questions.length,
      totalPoints,
    },
    summary,
    attempts: rows,
  };
}

export type ProfessorAttemptResultPayload = {
  assignment: {
    id: string;
    title: string;
    accessCode: string;
    status: string;
    showFeedback: boolean;
  };
  attempt: {
    id: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    percentage: number | null;
    startedAt: Date;
    submittedAt: Date | null;
    student: { id: string; name: string; email: string };
  };
  summary: { earnedPoints: number; totalPoints: number; percentage: number };
  questions: QuestionResult[];
};

export async function getProfessorAttemptResult(
  assignmentId: string,
  attemptId: string,
  session: SessionLike
): Promise<ProfessorAttemptResultPayload> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: {
        orderBy: { index: "asc" },
        select: {
          id: true,
          index: true,
          title: true,
          formula: true,
          options: true,
          correctOptionIndex: true,
          points: true,
        },
      },
    },
  });
  if (!assignment) {
    assertTeacher(session);
    throw new ApiError(404, "Assignment introuvable.");
  }
  const owned = assertOwnedAssignment(assignment as AssignmentWithQuestions, session);

  const attempt = await prisma.assignmentAttempt.findUnique({
    where: { id: attemptId, assignmentId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      answers: { select: { questionId: true, selectedIndex: true } },
    },
  });
  if (!attempt) throw new ApiError(404, "Tentative introuvable.");

  const totalPoints = totalPointsOf(owned);
  const summary = computeScore(owned.questions, attempt.answers);
  const questions = buildQuestionResults(owned.questions, attempt.answers);
  const percentage =
    attempt.score !== null
      ? totalPoints > 0
        ? Math.round((attempt.score / totalPoints) * 100)
        : 0
      : null;

  return {
    assignment: {
      id: owned.id,
      title: owned.title,
      accessCode: owned.accessCode,
      status: owned.status,
      showFeedback: owned.showFeedback,
    },
    attempt: {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      score: attempt.score,
      percentage,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      student: {
        id: attempt.student.id,
        name: attempt.student.name,
        email: attempt.student.email,
      },
    },
    summary,
    questions,
  };
}