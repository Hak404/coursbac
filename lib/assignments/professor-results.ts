export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

export type AttemptGroup = "all" | "submitted" | "in_progress";

export function isAttemptStatus(value: string): value is AttemptStatus {
  return (
    value === "IN_PROGRESS" ||
    value === "SUBMITTED" ||
    value === "GRADED"
  );
}

export function statusGroup(status: string): Exclude<AttemptGroup, "all"> {
  return status === "IN_PROGRESS" ? "in_progress" : "submitted";
}

export function statusLabel(status: string): string {
  if (status === "IN_PROGRESS") return "En cours";
  if (status === "SUBMITTED") return "Soumis";
  if (status === "GRADED") return "Corrigé";
  return status;
}

export function statusIcon(status: string): string {
  if (status === "SUBMITTED") return "✓";
  if (status === "GRADED") return "✓";
  return "•";
}

export type QuestionRow = {
  id: string;
  index: number;
  title: string;
  formula: string | null;
  options: unknown;
  correctOptionIndex: number;
  points: number;
};

export type StoredAnswer = {
  questionId: string;
  selectedIndex: number;
};

export type ScoreSummary = {
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
};

export type QuestionResult = {
  questionId: string;
  index: number;
  title: string;
  formula: string | null;
  options: unknown;
  selectedIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean | null;
  points: number;
  earnedPoints: number;
};

// Recomputes the score server-side. Never trust a client-provided score.
export function computeScore(
  questions: { id: string; correctOptionIndex: number; points: number }[],
  answers: StoredAnswer[]
): ScoreSummary {
  const answered = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const earnedPoints = questions.reduce((sum, q) => {
    const selectedIndex = answered.get(q.id);
    if (selectedIndex === undefined) return sum;
    return sum + (selectedIndex === q.correctOptionIndex ? q.points : 0);
  }, 0);
  return {
    earnedPoints,
    totalPoints,
    percentage: safePercentage(earnedPoints, totalPoints),
  };
}

export function safePercentage(earnedPoints: number, totalPoints: number): number {
  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
}

export function buildQuestionResults(
  questions: QuestionRow[],
  answers: StoredAnswer[]
): QuestionResult[] {
  const answered = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
  return questions.map((q) => {
    const selectedIndex = answered.get(q.id) ?? null;
    const isCorrect =
      selectedIndex !== null ? selectedIndex === q.correctOptionIndex : null;
    const earnedPoints = isCorrect ? q.points : 0;
    return {
      questionId: q.id,
      index: q.index,
      title: q.title,
      formula: q.formula,
      options: q.options,
      selectedIndex,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect,
      points: q.points,
      earnedPoints,
    };
  });
}

export type SummaryStats = {
  totalAttempts: number;
  submittedAttempts: number;
  inProgressAttempts: number;
  uniqueStudents: number;
  averageScore: { earnedPoints: number; percentage: number } | null;
  highestScore: { earnedPoints: number; percentage: number } | null;
  lowestScore: { earnedPoints: number; percentage: number } | null;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function buildSummaryStats(
  attempts: { studentId: string; status: string; score: number | null }[],
  totalPoints: number
): SummaryStats {
  const submitted = attempts.filter(
    (a) => statusGroup(a.status) === "submitted" && typeof a.score === "number"
  );
  const earnedScores = submitted.map((a) => a.score as number);
  let averageScore: SummaryStats["averageScore"] = null;
  let highestScore: SummaryStats["highestScore"] = null;
  let lowestScore: SummaryStats["lowestScore"] = null;
  if (earnedScores.length > 0) {
    const average = earnedScores.reduce((s, n) => s + n, 0) / earnedScores.length;
    const highest = Math.max(...earnedScores);
    const lowest = Math.min(...earnedScores);
    averageScore = {
      earnedPoints: round1(average),
      percentage: safePercentage(round1(average), totalPoints),
    };
    highestScore = {
      earnedPoints: highest,
      percentage: safePercentage(highest, totalPoints),
    };
    lowestScore = {
      earnedPoints: lowest,
      percentage: safePercentage(lowest, totalPoints),
    };
  }
  return {
    totalAttempts: attempts.length,
    submittedAttempts: submitted.length,
    inProgressAttempts: attempts.length - submitted.length,
    uniqueStudents: new Set(attempts.map((a) => a.studentId)).size,
    averageScore,
    highestScore,
    lowestScore,
  };
}

export type AttemptRowSource = {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  startedAt: Date | string;
  submittedAt: Date | string | null;
  student: { id: string; name: string; email: string };
};

export type SerializedAttemptRow = {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  percentage: number | null;
  startedAt: Date | string;
  submittedAt: Date | string | null;
  student: { id: string; name: string; email: string };
};

export function serializeAttemptRow(
  attempt: AttemptRowSource,
  totalPoints: number
): SerializedAttemptRow {
  const percentage =
    attempt.score !== null ? safePercentage(attempt.score, totalPoints) : null;
  return {
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
  };
}

export type SortKey = "score" | "name" | "date";
export type SortDir = "asc" | "desc";

function rowTimestamp(a: SerializedAttemptRow): number {
  const value = a.submittedAt ?? a.startedAt;
  const date = typeof value === "string" ? new Date(value) : value;
  return date.getTime();
}

// Sorts attempts in place; in-progress rows (no score) always end up last
// when sorting by score, regardless of direction.
export function sortAttempts(
  rows: SerializedAttemptRow[],
  key: SortKey,
  dir: SortDir
): SerializedAttemptRow[] {
  return [...rows].sort((a, b) => {
    if (key === "score") {
      const as = a.score ?? -1;
      const bs = b.score ?? -1;
      if (as === -1 && bs === -1) return 0;
      if (as === -1) return 1;
      if (bs === -1) return -1;
      const cmp = as - bs;
      return dir === "asc" ? cmp : -cmp;
    }
    if (key === "name") {
      const cmp = a.student.name.localeCompare(b.student.name, "fr");
      return dir === "asc" ? cmp : -cmp;
    }
    const cmp = rowTimestamp(a) - rowTimestamp(b);
    return dir === "asc" ? cmp : -cmp;
  });
}

export function filterAttemptsByGroup(
  rows: SerializedAttemptRow[],
  group: AttemptGroup
): SerializedAttemptRow[] {
  if (group === "all") return rows;
  return rows.filter((r) => statusGroup(r.status) === group);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value} %`;
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : String(value);
}