export type SafeQuestion = {
  id: string;
  index: number;
  title: string;
  formula?: string | null;
  options: string[];
  difficulty: string;
  points: number;
};

export type AttemptInfo = {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  startedAt: string | null;
  submittedAt: string | null;
};

export type JoinAssignment = {
  id: string;
  title: string;
  instructions: string | null;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  dueDate: string | null;
  attemptLimit: number;
  showFeedback: boolean;
  questionCount: number;
  remainingAttempts: number;
};

export type QuestionFeedback = {
  id: string;
  index: number;
  title: string;
  points: number;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  correctOptionIndex: number | null;
};

export type ResultsPayload = {
  assignment: {
    id: string;
    title: string;
    showFeedback: boolean;
  };
  attempt: AttemptInfo;
  summary: {
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
  };
  questions: QuestionFeedback[];
};

export type AnswerMap = Record<string, number>;

export const EMPTY_ANSWERS: AnswerMap = {};

// Mirrors the server-side access code charset
// (ABCDEFGHJKLMNPQRSTUVWXYZ23456789, excluding 0, 1, I, O).
export const ACCESS_CODE_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

export function normalizeAccessCode(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidAccessCodeFormat(code: string): boolean {
  return ACCESS_CODE_RE.test(code);
}

export function answerQuestion(
  answers: AnswerMap,
  questionId: string,
  selectedIndex: number
): AnswerMap {
  return { ...answers, [questionId]: selectedIndex };
}

export function answeredQuestionIds(answers: AnswerMap): string[] {
  return Object.keys(answers);
}

export function countAnswered(answers: AnswerMap): number {
  return answeredQuestionIds(answers).length;
}

export function countUnanswered(questionCount: number, answered: number): number {
  return Math.max(0, questionCount - answered);
}

export function isAnswered(answers: AnswerMap, questionId: string): boolean {
  return answers[questionId] !== undefined;
}

export function buildSubmitPayload(
  answers: AnswerMap
): { answers: { questionId: string; selectedIndex: number }[] } {
  return {
    answers: answeredQuestionIds(answers).map((questionId) => ({
      questionId,
      selectedIndex: answers[questionId],
    })),
  };
}

export function optionLetter(index: number | null | undefined): string {
  if (index === null || index === undefined) return "—";
  if (!Number.isInteger(index) || index < 0) return "—";
  return String.fromCharCode(65 + index);
}

export function formatDateLabel(value: string | null | undefined): string {
  if (!value) return "Aucune date limite";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Aucune date limite";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function friendlyApiError(
  status: number,
  serverMessage: string | undefined,
  opts: { notFound?: string } = {}
): string {
  if (status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (status === 403) return "Accès non autorisé.";
  if (status === 404) {
    return opts.notFound ?? "L'élément demandé est introuvable.";
  }
  if (status === 409) {
    return serverMessage ?? "Cette action n'est plus disponible.";
  }
  if (status >= 500) return "Une erreur serveur est survenue. Réessayez plus tard.";
  return serverMessage ?? "Une erreur est survenue. Réessayez.";
}

const PREVIEW_KEY = "coursbac:travaux:preview";
const CURRENT_KEY = "coursbac:travaux:current";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveAssignmentPreview(data: unknown): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(PREVIEW_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota/security errors */
  }
}

export function loadAssignmentPreview(): { assignment: JoinAssignment } | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(PREVIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { assignment: JoinAssignment };
    if (!parsed?.assignment?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAssignmentPreview(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(PREVIEW_KEY);
  } catch {
    /* ignore */
  }
}

export function saveCurrentAttempt(data: {
  assignmentId: string;
  attemptId: string;
  title: string;
}): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(CURRENT_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function loadCurrentAttempt(): {
  assignmentId: string;
  attemptId: string;
  title: string;
} | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      assignmentId: string;
      attemptId: string;
      title: string;
    };
    if (!parsed?.attemptId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCurrentAttempt(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(CURRENT_KEY);
  } catch {
    /* ignore */
  }
}

const ANSWERS_PREFIX = "coursbac:travaux:answers:";

function answersKey(attemptId: string): string {
  return `${ANSWERS_PREFIX}${attemptId}`;
}

// Keeps only valid (non-negative integer) selections for still-live questions.
// Used to recover answers after a refresh without trusting malformed storage.
export function sanitizeAttemptAnswers(
  value: unknown,
  allowedQuestionIds: Set<string>
): AnswerMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const out: AnswerMap = {};
  for (const [questionId, selectedIndex] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (!allowedQuestionIds.has(questionId)) continue;
    if (
      typeof selectedIndex !== "number" ||
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 0
    ) {
      continue;
    }
    out[questionId] = selectedIndex;
  }
  return out;
}

export function saveAttemptAnswers(attemptId: string, answers: AnswerMap): void {
  const s = storage();
  if (!s || typeof attemptId !== "string" || attemptId.length === 0) return;
  try {
    s.setItem(answersKey(attemptId), JSON.stringify(answers));
  } catch {
    /* ignore quota/security errors */
  }
}

export function loadAttemptAnswers(
  attemptId: string,
  allowedQuestionIds: Set<string>
): AnswerMap {
  const s = storage();
  if (!s || typeof attemptId !== "string" || attemptId.length === 0) {
    return {};
  }
  try {
    const raw = s.getItem(answersKey(attemptId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeAttemptAnswers(parsed, allowedQuestionIds);
  } catch {
    return {};
  }
}

export function clearAttemptAnswers(attemptId: string): void {
  const s = storage();
  if (!s || typeof attemptId !== "string" || attemptId.length === 0) return;
  try {
    s.removeItem(answersKey(attemptId));
  } catch {
    /* ignore */
  }
}