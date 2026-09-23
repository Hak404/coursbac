export const ASSIGNMENT_CODE_LENGTH = 6;

// Uppercase alphanumeric, excluding ambiguous characters (0, 1, I, O).
export const ASSIGNMENT_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const ASSIGNMENT_CODE_PATTERN = new RegExp(
  `^[${ASSIGNMENT_CODE_CHARSET}]{${ASSIGNMENT_CODE_LENGTH}}$`
);

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomCodeChar(): string {
  return ASSIGNMENT_CODE_CHARSET[
    randomInt(0, ASSIGNMENT_CODE_CHARSET.length - 1)
  ];
}

export function generateAssignmentCode(
  existing: Set<string> = new Set()
): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    for (let i = 0; i < ASSIGNMENT_CODE_LENGTH; i++) {
      code += randomCodeChar();
    }
    if (!existing.has(code)) return code;
  }
  let fallback = "";
  for (let i = 0; i < ASSIGNMENT_CODE_LENGTH; i++) {
    fallback += randomCodeChar();
  }
  return fallback;
}

export function normalizeAssignmentCode(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase();
}

export function isValidAssignmentCode(code: string): boolean {
  return ASSIGNMENT_CODE_PATTERN.test(code);
}