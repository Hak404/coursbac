import { describe, it, expect } from "vitest";
import {
  MIN_QCM_OPTIONS,
  isValidQuestionIndex,
  isValidPoints,
  validateQcmSnapshot,
  validateAttemptAnswers,
} from "./question";

describe("isValidQuestionIndex", () => {
  it("accepts integers inside the bounds", () => {
    expect(isValidQuestionIndex(0, 4)).toBe(true);
    expect(isValidQuestionIndex(3, 4)).toBe(true);
  });

  it("rejects out-of-bounds indices", () => {
    expect(isValidQuestionIndex(-1, 4)).toBe(false);
    expect(isValidQuestionIndex(4, 4)).toBe(false);
    expect(isValidQuestionIndex(0, 0)).toBe(false);
  });

  it("rejects non-integer indices", () => {
    expect(isValidQuestionIndex(1.5, 4)).toBe(false);
    expect(isValidQuestionIndex(Number.NaN, 4)).toBe(false);
  });
});

describe("isValidPoints", () => {
  it("accepts positive numbers", () => {
    expect(isValidPoints(1)).toBe(true);
    expect(isValidPoints(0.5)).toBe(true);
    expect(isValidPoints(2)).toBe(true);
  });

  it("rejects zero, negatives and non-finite values", () => {
    expect(isValidPoints(0)).toBe(false);
    expect(isValidPoints(-1)).toBe(false);
    expect(isValidPoints(Number.NaN)).toBe(false);
    expect(isValidPoints(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe("validateQcmSnapshot", () => {
  it("accepts a valid QCM snapshot", () => {
    expect(
      validateQcmSnapshot(["A", "B", "C", "D"], 0)
    ).toBe(true);
    expect(validateQcmSnapshot(["Oui", "Non"], 1)).toBe(true);
  });

  it("rejects fewer than the minimum options", () => {
    expect(validateQcmSnapshot(["A"], 0)).toBe(false);
    expect(validateQcmSnapshot([], 0)).toBe(false);
    expect(MIN_QCM_OPTIONS).toBe(2);
  });

  it("rejects invalid option entries", () => {
    expect(validateQcmSnapshot(["A", 42, "C"], 0)).toBe(false);
    expect(validateQcmSnapshot(["A", null, "C"], 0)).toBe(false);
    expect(validateQcmSnapshot(["A", "   ", "C"], 0)).toBe(false);
  });

  it("rejects a correctOptionIndex outside the options list", () => {
    expect(validateQcmSnapshot(["A", "B", "C"], 3)).toBe(false);
    expect(validateQcmSnapshot(["A", "B", "C"], -1)).toBe(false);
    expect(validateQcmSnapshot(["A", "B", "C"], 1.5)).toBe(false);
    expect(validateQcmSnapshot(["A", "B", "C"], "0")).toBe(false);
  });

  it("rejects non-array options", () => {
    expect(validateQcmSnapshot("nope", 0)).toBe(false);
    expect(validateQcmSnapshot(null, 0)).toBe(false);
    expect(validateQcmSnapshot(undefined, 0)).toBe(false);
  });
});

describe("validateAttemptAnswers", () => {
  it("accepts an array of non-negative integers of the right length", () => {
    expect(validateAttemptAnswers([0, 1, 2], 3)).toBe(true);
    expect(validateAttemptAnswers([], 0)).toBe(true);
  });

  it("rejects a wrong number of answers", () => {
    expect(validateAttemptAnswers([0, 1], 3)).toBe(false);
    expect(validateAttemptAnswers([0, 1, 2, 3], 3)).toBe(false);
  });

  it("rejects non-integer or negative answers", () => {
    expect(validateAttemptAnswers([0, "1", 2], 3)).toBe(false);
    expect(validateAttemptAnswers([0, -1, 2], 3)).toBe(false);
    expect(validateAttemptAnswers([0, 1.5, 2], 3)).toBe(false);
    expect(validateAttemptAnswers(null, 3)).toBe(false);
  });
});