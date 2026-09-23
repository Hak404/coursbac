import { safePercentage } from "@/lib/assignments/professor-results";

export type HistoryAttempt = {
  attemptId: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  percentage: number | null;
  startedAt: Date | string;
  submittedAt: Date | string | null;
};

export type HistoryAssignment = {
  assignmentId: string;
  title: string;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  status: string;
  attemptLimit: number;
  showFeedback: boolean;
  totalPoints: number;
  attempts: HistoryAttempt[];
};

export type StudentHistoryPayload = {
  assignments: HistoryAssignment[];
};

export type HistoryQuestionRow = { points: number };

export type HistoryAssignmentRow = {
  id: string;
  title: string;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  status: string;
  attemptLimit: number;
  showFeedback: boolean;
  questions: HistoryQuestionRow[];
};

export type HistoryAttemptRow = {
  id: string;
  assignmentId: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  startedAt: Date | string;
  submittedAt: Date | string | null;
};

export type HistorySourceRow = {
  attempt: HistoryAttemptRow;
  assignment: HistoryAssignmentRow;
};

function toTime(value: Date | string): number {
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

// Groups attempts under their assignment and produces the summary payload.
// Percentage reuses the established server-side rounding rules. Attempts are
// ordered most recent first, and assignments are ordered by their most recent
// attempt.
export function buildStudentHistory(
  rows: HistorySourceRow[]
): StudentHistoryPayload {
  const byAssignment = new Map<string, HistoryAssignment>();
  for (const { attempt, assignment } of rows) {
    let entry = byAssignment.get(assignment.id);
    if (!entry) {
      const totalPoints = (assignment.questions ?? []).reduce(
        (sum, q) => sum + (Number(q.points) || 0),
        0
      );
      entry = {
        assignmentId: assignment.id,
        title: assignment.title,
        subjectSlug: assignment.subjectSlug,
        levelSlug: assignment.levelSlug,
        chapterSlug: assignment.chapterSlug,
        status: assignment.status,
        attemptLimit: assignment.attemptLimit,
        showFeedback: assignment.showFeedback,
        totalPoints,
        attempts: [],
      };
      byAssignment.set(assignment.id, entry);
    }
    entry.attempts.push({
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      score: attempt.score,
      percentage:
        attempt.score !== null && attempt.score !== undefined
          ? safePercentage(attempt.score, entry.totalPoints)
          : null,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    });
  }

  const assignments = [...byAssignment.values()].map((assignment) => ({
    ...assignment,
    attempts: [...assignment.attempts].sort(
      (a, b) => toTime(b.startedAt) - toTime(a.startedAt)
    ),
  }));
  assignments.sort(
    (a, b) => toTime(b.attempts[0]?.startedAt) - toTime(a.attempts[0]?.startedAt)
  );
  return { assignments };
}

export type HistoryFilter = "all" | "in_progress" | "submitted" | "graded";

export function isAttemptInProgress(status: string): boolean {
  return status === "IN_PROGRESS";
}

export function historyActionLabel(status: string): string {
  return status === "IN_PROGRESS" ? "Continuer" : "Voir le résultat";
}

export function groupHistoryByProgress(
  payload: StudentHistoryPayload
): { inProgress: HistoryAssignment[]; completed: HistoryAssignment[] } {
  const inProgress: HistoryAssignment[] = [];
  const completed: HistoryAssignment[] = [];
  for (const assignment of payload.assignments) {
    const open = assignment.attempts.some((attempt) =>
      isAttemptInProgress(attempt.status)
    );
    (open ? inProgress : completed).push(assignment);
  }
  return { inProgress, completed };
}

export function filterHistoryAttempts(
  assignments: HistoryAssignment[],
  filter: HistoryFilter
): HistoryAssignment[] {
  if (filter === "all") return assignments;
  const allowed = new Set(
    filter === "in_progress"
      ? ["IN_PROGRESS"]
      : filter === "submitted"
        ? ["SUBMITTED"]
        : ["GRADED"]
  );
  return assignments
    .map((assignment) => ({
      ...assignment,
      attempts: assignment.attempts.filter((attempt) => allowed.has(attempt.status)),
    }))
    .filter((assignment) => assignment.attempts.length > 0);
}