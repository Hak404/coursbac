import { describe, it, expect } from "vitest";
import {
  MIN_ATTEMPT_LIMIT,
  isValidAttemptLimit,
  nextAttemptNumber,
  ASSIGNMENT_STATUS_TRANSITIONS,
  canTransitionAssignmentStatus,
  isValidAssignmentStatus,
} from "./rules";

describe("isValidAttemptLimit", () => {
  it("accepts positive integers", () => {
    expect(isValidAttemptLimit(1)).toBe(true);
    expect(isValidAttemptLimit(2)).toBe(true);
    expect(isValidAttemptLimit(3)).toBe(true);
  });

  it("rejects values below 1", () => {
    expect(isValidAttemptLimit(MIN_ATTEMPT_LIMIT - 1)).toBe(false);
    expect(isValidAttemptLimit(0)).toBe(false);
    expect(isValidAttemptLimit(-1)).toBe(false);
  });

  it("rejects non-integer and non-number values", () => {
    expect(isValidAttemptLimit(1.5)).toBe(false);
    expect(isValidAttemptLimit("2")).toBe(false);
    expect(isValidAttemptLimit(null)).toBe(false);
    expect(isValidAttemptLimit(undefined)).toBe(false);
    expect(isValidAttemptLimit(NaN)).toBe(false);
  });
});

describe("nextAttemptNumber", () => {
  it("starts at 1", () => {
    expect(nextAttemptNumber(0)).toBe(1);
  });

  it("increments by one", () => {
    expect(nextAttemptNumber(1)).toBe(2);
    expect(nextAttemptNumber(2)).toBe(3);
    expect(nextAttemptNumber(5)).toBe(6);
  });

  it("falls back to 1 for invalid input", () => {
    expect(nextAttemptNumber(-1)).toBe(1);
    expect(nextAttemptNumber(1.5)).toBe(1);
    expect(nextAttemptNumber(Number.NaN)).toBe(1);
  });
});

describe("assignment status lifecycle", () => {
  it("defines only forward transitions", () => {
    expect(ASSIGNMENT_STATUS_TRANSITIONS.DRAFT).toEqual(["PUBLISHED"]);
    expect(ASSIGNMENT_STATUS_TRANSITIONS.PUBLISHED).toEqual(["CLOSED"]);
    expect(ASSIGNMENT_STATUS_TRANSITIONS.CLOSED).toEqual([]);
  });

  it("allows DRAFT -> PUBLISHED -> CLOSED", () => {
    expect(canTransitionAssignmentStatus("DRAFT", "PUBLISHED")).toBe(true);
    expect(canTransitionAssignmentStatus("PUBLISHED", "CLOSED")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionAssignmentStatus("DRAFT", "CLOSED")).toBe(false);
    expect(canTransitionAssignmentStatus("PUBLISHED", "DRAFT")).toBe(false);
    expect(canTransitionAssignmentStatus("CLOSED", "PUBLISHED")).toBe(false);
    expect(canTransitionAssignmentStatus("DRAFT", "DRAFT")).toBe(false);
  });

  it("recognizes valid status values", () => {
    expect(isValidAssignmentStatus("DRAFT")).toBe(true);
    expect(isValidAssignmentStatus("PUBLISHED")).toBe(true);
    expect(isValidAssignmentStatus("CLOSED")).toBe(true);
    expect(isValidAssignmentStatus("OPEN")).toBe(false);
    expect(isValidAssignmentStatus("")).toBe(false);
    expect(isValidAssignmentStatus(null)).toBe(false);
  });
});