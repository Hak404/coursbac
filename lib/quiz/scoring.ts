export type AnswerDetail = {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  userAnswer: number;
  isCorrect: boolean;
};

export type ScoringQuestion = {
  id: string;
  questionText: string;
  options: unknown;
  correctOptionIndex: number;
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function validateAnswers(
  answers: unknown,
  questions: ScoringQuestion[]
): string | null {
  if (!Array.isArray(answers)) return "Réponses invalides.";
  if (answers.length !== questions.length) return "Réponses invalides.";
  const invalid = questions.some((q, i) => {
    const a = answers[i];
    if (typeof a !== "number" || !Number.isInteger(a)) return true;
    const count = Array.isArray(q.options) ? q.options.length : 0;
    return a < 0 || a >= count;
  });
  return invalid ? "Réponses invalides." : null;
}

export function computeScoreAndDetails(
  questions: ScoringQuestion[],
  answers: number[]
): { score: number; details: AnswerDetail[] } {
  let score = 0;
  const details: AnswerDetail[] = questions.map((q, i) => {
    const opts = asStringList(q.options);
    const isCorrect = answers[i] === q.correctOptionIndex;
    if (isCorrect) score += 1;
    return {
      questionText: q.questionText,
      options: opts,
      correctOptionIndex: q.correctOptionIndex,
      userAnswer: answers[i],
      isCorrect,
    };
  });
  return { score, details };
}