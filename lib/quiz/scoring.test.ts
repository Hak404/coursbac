import { describe, it, expect } from "vitest";
import { validateAnswers, computeScoreAndDetails } from "./scoring";

const questions = [
  { id: "q1", questionText: "Q1", options: ["A", "B", "C", "D"], correctOptionIndex: 0 },
  { id: "q2", questionText: "Q2", options: ["A", "B", "C"], correctOptionIndex: 2 },
  { id: "q3", questionText: "Q3", options: ["Oui", "Non"], correctOptionIndex: 1 },
];

describe("validateAnswers", () => {
  it("rejects a non-array payload", () => {
    expect(validateAnswers(null, questions)).toBe("Réponses invalides.");
    expect(validateAnswers("nope", questions)).toBe("Réponses invalides.");
  });

  it("rejects a wrong number of answers", () => {
    expect(validateAnswers([0, 1], questions)).toBe("Réponses invalides.");
    expect(validateAnswers([0, 1, 1, 1], questions)).toBe("Réponses invalides.");
  });

  it("rejects non-numeric answers", () => {
    expect(validateAnswers(["0", 1, 1], questions)).toBe("Réponses invalides.");
    expect(validateAnswers([0, null, 1], questions)).toBe("Réponses invalides.");
  });

  it("rejects non-integer answers", () => {
    expect(validateAnswers([0, 0.5, 1], questions)).toBe("Réponses invalides.");
  });

  it("rejects answers out of range per question", () => {
    expect(validateAnswers([4, 0, 0], questions)).toBe("Réponses invalides.");
    expect(validateAnswers([0, -1, 0], questions)).toBe("Réponses invalides.");
    expect(validateAnswers([0, 3, 0], questions)).toBe("Réponses invalides.");
  });

  it("accepts valid integer index answers", () => {
    expect(validateAnswers([0, 2, 1], questions)).toBeNull();
    expect(validateAnswers([3, 2, 0], questions)).toBeNull();
  });
});

describe("computeScoreAndDetails", () => {
  it("scores fully correct answers and returns details", () => {
    const { score, details } = computeScoreAndDetails(questions, [0, 2, 1]);
    expect(score).toBe(3);
    expect(details).toHaveLength(3);
    expect(details.every((d, i) => d.isCorrect === (i === 0 || i === 1 || i === 2))).toBe(true);
  });

  it("scores wrong answers as 0", () => {
    const { score } = computeScoreAndDetails(questions, [1, 0, 0]);
    expect(score).toBe(0);
  });

  it("marks userAnswer and isCorrect per question", () => {
    const { details } = computeScoreAndDetails(questions, [0, 0, 1]);
    expect(details[0]).toMatchObject({ correctOptionIndex: 0, userAnswer: 0, isCorrect: true });
    expect(details[1]).toMatchObject({ correctOptionIndex: 2, userAnswer: 0, isCorrect: false });
    expect(details[2]).toMatchObject({ correctOptionIndex: 1, userAnswer: 1, isCorrect: true });
  });

  it("sanitizes options to string lists", () => {
    const weird = [
      { id: "q1", questionText: "Q1", options: ["A", 42, null, "D"], correctOptionIndex: 0 },
    ];
    const { details } = computeScoreAndDetails(weird, [0]);
    expect(details[0].options).toEqual(["A", "D"]);
  });
});