import { describe, it, expect } from "vitest";
import {
  buildQuestionResults,
  buildSummaryStats,
  computeScore,
  filterAttemptsByGroup,
  formatPercentage,
  formatScore,
  isAttemptStatus,
  safePercentage,
  serializeAttemptRow,
  sortAttempts,
  statusGroup,
  statusIcon,
  statusLabel,
  type AttemptRowSource,
  type QuestionRow,
  type SerializedAttemptRow,
} from "./professor-results";

const QUESTIONS: QuestionRow[] = [
  {
    id: "q1",
    index: 0,
    title: "Limite d'un quotient",
    formula: null,
    options: ["4", "2", "0", "n'existe pas"],
    correctOptionIndex: 0,
    points: 2,
  },
  {
    id: "q2",
    index: 1,
    title: "Limite trigonométrique",
    formula: "",
    options: ["3", "1", "0", "6"],
    correctOptionIndex: 1,
    points: 1,
  },
  {
    id: "q3",
    index: 2,
    title: "Continuïte sur un intervalle",
    formula: null,
    options: ["oui", "non"],
    correctOptionIndex: 0,
    points: 3,
  },
];

function row(overrides: Partial<AttemptRowSource> = {}): AttemptRowSource {
  const student = { id: "s1", name: "Élève 1", email: "e1@coursbac.ma" };
  return {
    id: "att-1",
    attemptNumber: 1,
    status: "SUBMITTED",
    score: 3,
    startedAt: new Date("2026-01-10T10:00:00Z"),
    submittedAt: new Date("2026-01-10T11:00:00Z"),
    student,
    ...overrides,
  };
}

describe("status helpers", () => {
  it("classifies each attempt status group", () => {
    expect(statusGroup("IN_PROGRESS")).toBe("in_progress");
    expect(statusGroup("SUBMITTED")).toBe("submitted");
    expect(statusGroup("GRADED")).toBe("submitted");
  });

  it("labels statuses in French", () => {
    expect(statusLabel("IN_PROGRESS")).toBe("En cours");
    expect(statusLabel("SUBMITTED")).toBe("Soumis");
    expect(statusLabel("GRADED")).toBe("Corrigé");
    expect(statusLabel("WEIRD")).toBe("WEIRD");
  });

  it("isAttemptStatus guards values", () => {
    expect(isAttemptStatus("SUBMITTED")).toBe(true);
    expect(isAttemptStatus("IN_PROGRESS")).toBe(true);
    expect(isAttemptStatus("GRADED")).toBe(true);
    expect(isAttemptStatus("DRAFT")).toBe(false);
  });

  it("returns icons", () => {
    expect(statusIcon("SUBMITTED")).toBe("✓");
    expect(statusIcon("GRADED")).toBe("✓");
    expect(statusIcon("IN_PROGRESS")).toBe("•");
  });
});

describe("computeScore", () => {
  it("scores all correct answers", () => {
    const summary = computeScore(QUESTIONS, [
      { questionId: "q1", selectedIndex: 0 },
      { questionId: "q2", selectedIndex: 1 },
      { questionId: "q3", selectedIndex: 0 },
    ]);
    expect(summary).toEqual({ earnedPoints: 6, totalPoints: 6, percentage: 100 });
  });

  it("scores wrong answers as zero", () => {
    const summary = computeScore(QUESTIONS, [
      { questionId: "q1", selectedIndex: 2 },
      { questionId: "q2", selectedIndex: 0 },
    ]);
    expect(summary).toEqual({ earnedPoints: 0, totalPoints: 6, percentage: 0 });
  });

  it("scores a partial submission", () => {
    const summary = computeScore(QUESTIONS, [
      { questionId: "q1", selectedIndex: 0 },
    ]);
    expect(summary).toEqual({ earnedPoints: 2, totalPoints: 6, percentage: 33 });
  });

  it("treats unanswered questions as zero", () => {
    expect(computeScore(QUESTIONS, []).earnedPoints).toBe(0);
  });

  it("handles a zero total points edge case", () => {
    const summary = computeScore(
      QUESTIONS.map((q) => ({ ...q, points: 0 })),
      [{ questionId: "q1", selectedIndex: 0 }]
    );
    expect(summary).toEqual({ earnedPoints: 0, totalPoints: 0, percentage: 0 });
  });

  it("rounds percentages", () => {
    expect(safePercentage(1, 3)).toBe(33);
    expect(safePercentage(2, 3)).toBe(67);
    expect(safePercentage(3, 3)).toBe(100);
  });
});

describe("buildQuestionResults", () => {
  it("exposes selected, correct and earned per question", () => {
    const results = buildQuestionResults(QUESTIONS, [
      { questionId: "q1", selectedIndex: 0 },
      { questionId: "q2", selectedIndex: 0 },
    ]);
    expect(results[0]).toEqual({
      questionId: "q1",
      index: 0,
      title: "Limite d'un quotient",
      formula: null,
      options: ["4", "2", "0", "n'existe pas"],
      selectedIndex: 0,
      correctOptionIndex: 0,
      isCorrect: true,
      points: 2,
      earnedPoints: 2,
    });
    expect(results[1]).toMatchObject({
      selectedIndex: 0,
      correctOptionIndex: 1,
      isCorrect: false,
      earnedPoints: 0,
    });
    expect(results[2]).toMatchObject({
      selectedIndex: null,
      isCorrect: null,
      earnedPoints: 0,
    });
  });
});

describe("buildSummaryStats", () => {
  it("returns zeros for no attempts", () => {
    const stats = buildSummaryStats([], 6);
    expect(stats).toEqual({
      totalAttempts: 0,
      submittedAttempts: 0,
      inProgressAttempts: 0,
      uniqueStudents: 0,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
    });
  });

  it("computes totals, unique students and scores", () => {
    const stats = buildSummaryStats(
      [
        { studentId: "s1", status: "SUBMITTED", score: 4 },
        { studentId: "s2", status: "SUBMITTED", score: 6 },
        { studentId: "s2", status: "IN_PROGRESS", score: null },
        { studentId: "s3", status: "GRADED", score: 2 },
      ],
      6
    );
    expect(stats).toEqual({
      totalAttempts: 4,
      submittedAttempts: 3,
      inProgressAttempts: 1,
      uniqueStudents: 3,
      averageScore: { earnedPoints: 4, percentage: 67 },
      highestScore: { earnedPoints: 6, percentage: 100 },
      lowestScore: { earnedPoints: 2, percentage: 33 },
    });
  });

  it("computes a zero percentage when total points are zero", () => {
    const stats = buildSummaryStats(
      [{ studentId: "s1", status: "SUBMITTED", score: 0 }],
      0
    );
    expect(stats.averageScore).toEqual({ earnedPoints: 0, percentage: 0 });
  });
});

describe("serializeAttemptRow", () => {
  it("computes the percentage from the stored score", () => {
    const serialized = serializeAttemptRow(row(), 5);
    expect(serialized.score).toBe(3);
    expect(serialized.percentage).toBe(60);
    expect(serialized.student).toEqual({
      id: "s1",
      name: "Élève 1",
      email: "e1@coursbac.ma",
    });
  });

  it("leaves percentage null for in-progress attempts", () => {
    const serialized = serializeAttemptRow(
      row({ status: "IN_PROGRESS", score: null }),
      5
    );
    expect(serialized.percentage).toBeNull();
  });

  it("handles a zero total edge case", () => {
    expect(serializeAttemptRow(row(), 0).percentage).toBe(0);
  });
});

function withId(r: Partial<SerializedAttemptRow>): SerializedAttemptRow {
  const base = serializeAttemptRow(row(), 6);
  return { ...base, ...r } as SerializedAttemptRow;
}

describe("sortAttempts", () => {
  it("sorts by score descending with nulls last", () => {
    const rows = [
      withId({ id: "a", score: 2, student: { id: "s1", name: "Y", email: "y@x" }, percentage: 33 }),
      withId({ id: "b", score: null, student: { id: "s2", name: "A", email: "a@x" }, percentage: null }),
      withId({ id: "c", score: 6, student: { id: "s3", name: "M", email: "m@x" }, percentage: 100 }),
    ];
    const sorted = sortAttempts(rows, "score", "desc");
    expect(sorted.map((r) => r.id)).toEqual(["c", "a", "b"]);
    const asc = sortAttempts(rows, "score", "asc");
    expect(asc.map((r) => r.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by name", () => {
    const rows = [
      withId({ id: "a", student: { id: "s1", name: "Zoé", email: "z@x" } }),
      withId({ id: "b", student: { id: "s2", name: "Ahmed", email: "a@x" } }),
    ];
    expect(sortAttempts(rows, "name", "asc").map((r) => r.id)).toEqual(["b", "a"]);
    expect(sortAttempts(rows, "name", "desc").map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("sorts by date using submittedAt when present", () => {
    const rows = [
      withId({
        id: "old",
        startedAt: new Date("2026-01-01T10:00:00Z"),
        submittedAt: new Date("2026-01-01T10:00:00Z"),
      }),
      withId({
        id: "recent",
        startedAt: new Date("2026-01-02T10:00:00Z"),
        submittedAt: new Date("2026-01-02T10:00:00Z"),
      }),
    ];
    expect(sortAttempts(rows, "date", "desc").map((r) => r.id)).toEqual([
      "recent",
      "old",
    ]);
  });
});

describe("filterAttemptsByGroup", () => {
  const rows = [
    withId({ id: "sub", status: "SUBMITTED" }),
    withId({ id: "graded", status: "GRADED" }),
    withId({ id: "ongoing", status: "IN_PROGRESS" }),
  ];
  it("returns everything for the all group", () => {
    expect(filterAttemptsByGroup(rows, "all")).toHaveLength(3);
  });
  it("keeps submitted attempts", () => {
    const filtered = filterAttemptsByGroup(rows, "submitted");
    expect(filtered.map((r) => r.id)).toEqual(["sub", "graded"]);
  });
  it("keeps in-progress attempts", () => {
    expect(filterAttemptsByGroup(rows, "in_progress").map((r) => r.id)).toEqual([
      "ongoing",
    ]);
  });
});

describe("formatting", () => {
  it("formats percentages", () => {
    expect(formatPercentage(80)).toBe("80 %");
    expect(formatPercentage(0)).toBe("0 %");
    expect(formatPercentage(null)).toBe("—");
    expect(formatPercentage(undefined)).toBe("—");
  });

  it("formats scores", () => {
    expect(formatScore(16)).toBe("16");
    expect(formatScore(13.4)).toBe("13.4");
    expect(formatScore(null)).toBe("—");
  });
});