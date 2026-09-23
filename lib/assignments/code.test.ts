import { describe, it, expect } from "vitest";
import {
  ASSIGNMENT_CODE_CHARSET,
  ASSIGNMENT_CODE_LENGTH,
  ASSIGNMENT_CODE_PATTERN,
  generateAssignmentCode,
  normalizeAssignmentCode,
  isValidAssignmentCode,
} from "./code";

describe("generateAssignmentCode", () => {
  it("generates a code of the expected length", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateAssignmentCode()).toHaveLength(ASSIGNMENT_CODE_LENGTH);
    }
  });

  it("generates only uppercase allowed characters", () => {
    const allowed = new Set(ASSIGNMENT_CODE_CHARSET.split(""));
    for (let i = 0; i < 200; i++) {
      const code = generateAssignmentCode();
      expect(code).toBe(code.toUpperCase());
      for (const ch of code) {
        expect(allowed.has(ch)).toBe(true);
      }
    }
  });

  it("generates codes matching the pattern", () => {
    for (let i = 0; i < 200; i++) {
      expect(ASSIGNMENT_CODE_PATTERN.test(generateAssignmentCode())).toBe(true);
    }
  });

  it("avoids codes present in the existing set", () => {
    const existing = new Set(["7K4P92", "ABCDEF"]);
    for (let i = 0; i < 200; i++) {
      const code = generateAssignmentCode(existing);
      expect(existing.has(code)).toBe(false);
    }
  });

  it("never uses ambiguous characters (0, 1, I, O)", () => {
    const ambiguous = new Set(["0", "1", "I", "O"]);
    expect(ASSIGNMENT_CODE_CHARSET.includes("0")).toBe(false);
    expect(ASSIGNMENT_CODE_CHARSET.includes("1")).toBe(false);
    expect(ASSIGNMENT_CODE_CHARSET.includes("I")).toBe(false);
    expect(ASSIGNMENT_CODE_CHARSET.includes("O")).toBe(false);
    for (let i = 0; i < 200; i++) {
      const code = generateAssignmentCode();
      for (const ch of code) {
        expect(ambiguous.has(ch)).toBe(false);
      }
    }
  });
});

describe("normalizeAssignmentCode", () => {
  it("trims and uppercases input", () => {
    expect(normalizeAssignmentCode("  7k4p92  ")).toBe("7K4P92");
    expect(normalizeAssignmentCode("abc def")).toBe("ABC DEF");
  });

  it("returns empty string for non-string values", () => {
    expect(normalizeAssignmentCode(null)).toBe("");
    expect(normalizeAssignmentCode(42)).toBe("");
    expect(normalizeAssignmentCode(undefined)).toBe("");
  });
});

describe("isValidAssignmentCode", () => {
  it("accepts well-formed codes", () => {
    expect(isValidAssignmentCode("7K4P92")).toBe(true);
    expect(isValidAssignmentCode("ABCDEF")).toBe(true);
  });

  it("rejects wrong lengths", () => {
    expect(isValidAssignmentCode("7K4P9")).toBe(false);
    expect(isValidAssignmentCode("7K4P92A")).toBe(false);
    expect(isValidAssignmentCode("")).toBe(false);
  });

  it("rejects ambiguous or excluded characters", () => {
    expect(isValidAssignmentCode("7K4P0Z")).toBe(false);
    expect(isValidAssignmentCode("7K4P1Z")).toBe(false);
    expect(isValidAssignmentCode("7K4PIZ")).toBe(false);
    expect(isValidAssignmentCode("7K4POZ")).toBe(false);
  });

  it("rejects lowercase or mixed case", () => {
    expect(isValidAssignmentCode("7k4p92")).toBe(false);
    expect(isValidAssignmentCode("7K4p92")).toBe(false);
  });
});