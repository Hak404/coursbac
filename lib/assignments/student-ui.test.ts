import { describe, expect, it } from "vitest";
import {
  EMPTY_ANSWERS,
  answerQuestion,
  answeredQuestionIds,
  buildSubmitPayload,
  clearAttemptAnswers,
  countAnswered,
  countUnanswered,
  formatDateLabel,
  friendlyApiError,
  isAnswered,
  isValidAccessCodeFormat,
  loadAttemptAnswers,
  normalizeAccessCode,
  optionLetter,
  sanitizeAttemptAnswers,
  saveAttemptAnswers,
} from "./student-ui";

describe("normalizeAccessCode", () => {
  it("trims surrounding whitespace and uppercases", () => {
    expect(normalizeAccessCode("  abc234  ")).toBe("ABC234");
  });
  it("handles empty strings", () => {
    expect(normalizeAccessCode("")).toBe("");
  });
});

describe("isValidAccessCodeFormat", () => {
  it("accepts 6 characters from the server charset", () => {
    expect(isValidAccessCodeFormat("ABC234")).toBe(true);
    expect(isValidAccessCodeFormat("ABCDEF")).toBe(true);
  });
  it("rejects codes using excluded characters (0, 1, I, O)", () => {
    expect(isValidAccessCodeFormat("ABC123")).toBe(false);
    expect(isValidAccessCodeFormat("ABCD1F")).toBe(false);
    expect(isValidAccessCodeFormat("AB10EF")).toBe(false);
  });
  it("rejects wrong lengths", () => {
    expect(isValidAccessCodeFormat("ABC23")).toBe(false);
    expect(isValidAccessCodeFormat("ABC2345")).toBe(false);
    expect(isValidAccessCodeFormat("")).toBe(false);
  });
});

describe("answers map", () => {
  it("starts empty", () => {
    expect(countAnswered(EMPTY_ANSWERS)).toBe(0);
    expect(answeredQuestionIds(EMPTY_ANSWERS)).toEqual([]);
  });
  it("adds answers immutably", () => {
    const a1 = answerQuestion(EMPTY_ANSWERS, "q1", 0);
    expect(a1).not.toBe(EMPTY_ANSWERS);
    expect(countAnswered(EMPTY_ANSWERS)).toBe(0);
    expect(countAnswered(a1)).toBe(1);
    expect(isAnswered(a1, "q1")).toBe(true);
    expect(isAnswered(a1, "q2")).toBe(false);
  });
  it("updates an existing answer", () => {
    const a1 = answerQuestion(EMPTY_ANSWERS, "q1", 0);
    const a2 = answerQuestion(a1, "q1", 2);
    expect(countAnswered(a2)).toBe(1);
    expect(a2.q1).toBe(2);
  });
});

describe("countUnanswered", () => {
  it("never returns negative numbers", () => {
    expect(countUnanswered(3, 5)).toBe(0);
  });
  it("counts remaining questions", () => {
    expect(countUnanswered(5, 2)).toBe(3);
    expect(countUnanswered(5, 5)).toBe(0);
  });
});

describe("buildSubmitPayload", () => {
  it("only includes answered questions", () => {
    const answers = answerQuestion(answerQuestion(EMPTY_ANSWERS, "q1", 0), "q2", 3);
    const payload = buildSubmitPayload(answers);
    expect(payload.answers).toHaveLength(2);
    expect(payload.answers).toContainEqual({ questionId: "q1", selectedIndex: 0 });
    expect(payload.answers).toContainEqual({ questionId: "q2", selectedIndex: 3 });
  });
  it("produces an empty payload with no answers", () => {
    expect(buildSubmitPayload(EMPTY_ANSWERS)).toEqual({ answers: [] });
  });
});

describe("optionLetter", () => {
  it("maps indices to letters", () => {
    expect(optionLetter(0)).toBe("A");
    expect(optionLetter(3)).toBe("D");
  });
  it("returns an em dash for null, undefined, negative or non-integer values", () => {
    expect(optionLetter(null)).toBe("—");
    expect(optionLetter(undefined)).toBe("—");
    expect(optionLetter(-1)).toBe("—");
    expect(optionLetter(0.5)).toBe("—");
  });
});

describe("formatDateLabel", () => {
  it("formats a valid ISO date in French", () => {
    expect(formatDateLabel("2026-01-15T00:00:00.000Z")).toMatch(/janvier/);
  });
  it("handles missing or invalid dates", () => {
    expect(formatDateLabel(null)).toBe("Aucune date limite");
    expect(formatDateLabel(undefined)).toBe("Aucune date limite");
    expect(formatDateLabel("pas-une-date")).toBe("Aucune date limite");
  });
});

describe("sanitizeAttemptAnswers", () => {
  const allowed = new Set(["q1", "q2"]);
  it("keeps valid integer selections for allowed questions", () => {
    expect(sanitizeAttemptAnswers({ q1: 0, q2: 3 }, allowed)).toEqual({ q1: 0, q2: 3 });
  });
  it("drops answers for unknown questions", () => {
    expect(sanitizeAttemptAnswers({ q1: 0, stale: 2 }, allowed)).toEqual({ q1: 0 });
  });
  it("drops malformed selections", () => {
    expect(sanitizeAttemptAnswers({ q1: "a", q2: 1.5, q3: -2 }, allowed)).toEqual({});
    expect(sanitizeAttemptAnswers({ q1: null, q2: true }, allowed)).toEqual({});
  });
  it("handles malformed roots without crashing", () => {
    expect(sanitizeAttemptAnswers(null, allowed)).toEqual({});
    expect(sanitizeAttemptAnswers("nope", allowed)).toEqual({});
    expect(sanitizeAttemptAnswers([1, 2], allowed)).toEqual({});
  });
});

describe("attempt answers storage helpers", () => {
  it("no-op safely when sessionStorage is unavailable", () => {
    expect(() => saveAttemptAnswers("a1", { q1: 0 })).not.toThrow();
    expect(loadAttemptAnswers("a1", new Set(["q1"]))).toEqual({});
    expect(() => clearAttemptAnswers("a1")).not.toThrow();
  });
});

describe("friendlyApiError", () => {
  it("prefers specific messages for 404", () => {
    expect(friendlyApiError(404, undefined, { notFound: "Travail introuvable." })).toBe(
      "Travail introuvable."
    );
  });
  it("maps auth statuses", () => {
    expect(friendlyApiError(401, undefined)).toMatch(/session a expiré/);
    expect(friendlyApiError(403, undefined)).toBe("Accès non autorisé.");
  });
  it("keeps the server message for 409", () => {
    expect(friendlyApiError(409, "Tentative déjà soumise.")).toBe("Tentative déjà soumise.");
  });
  it("falls back to a generic message", () => {
    expect(friendlyApiError(201, "petit message")).toBe("petit message");
    expect(friendlyApiError(500, undefined)).toMatch(/erreur serveur/);
  });
});