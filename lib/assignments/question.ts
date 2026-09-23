export type QcmOptions = unknown;

export const MIN_QCM_OPTIONS = 2;

export function isValidQuestionIndex(index: number, count: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < count;
}

export function isValidPoints(points: number): boolean {
  return typeof points === "number" && Number.isFinite(points) && points > 0;
}

// A snapshot QCM is valid when its options are a string list of length >= 2
// (non-empty) and correctOptionIndex points inside the list.
export function validateQcmSnapshot(
  options: QcmOptions,
  correctOptionIndex: unknown
): boolean {
  if (!Array.isArray(options)) return false;
  if (options.length < MIN_QCM_OPTIONS) return false;
  if (options.some((o) => typeof o !== "string" || o.trim().length === 0)) {
    return false;
  }
  return typeof correctOptionIndex === "number"
    ? isValidQuestionIndex(correctOptionIndex, options.length)
    : false;
}

export function validateAttemptAnswers(
  answers: unknown,
  questionCount: number
): boolean {
  if (!Array.isArray(answers)) return false;
  if (answers.length !== questionCount) return false;
  return answers.every(
    (a) => typeof a === "number" && Number.isInteger(a) && a >= 0
  );
}