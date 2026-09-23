export const MIN_ATTEMPT_LIMIT = 1;

export function isValidAttemptLimit(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_ATTEMPT_LIMIT
  );
}

// 1-based attempt numbering, as specified by the domain rules.
export function nextAttemptNumber(previousAttempts: number): number {
  if (!Number.isInteger(previousAttempts) || previousAttempts < 0) return 1;
  return previousAttempts + 1;
}

export type AssignmentStatusValue = "DRAFT" | "PUBLISHED" | "CLOSED";

// Lifecycle: DRAFT -> PUBLISHED -> CLOSED. No downgrades or skips.
export const ASSIGNMENT_STATUS_TRANSITIONS: Record<
  AssignmentStatusValue,
  AssignmentStatusValue[]
> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["CLOSED"],
  CLOSED: [],
};

export function canTransitionAssignmentStatus(
  from: AssignmentStatusValue,
  to: AssignmentStatusValue
): boolean {
  return ASSIGNMENT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isValidAssignmentStatus(value: unknown): value is AssignmentStatusValue {
  return (
    value === "DRAFT" || value === "PUBLISHED" || value === "CLOSED"
  );
}