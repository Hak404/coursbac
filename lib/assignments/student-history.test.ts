import { describe, expect, it } from "vitest";
import {
  buildStudentHistory,
  filterHistoryAttempts,
  groupHistoryByProgress,
  historyActionLabel,
  isAttemptInProgress,
  type HistoryAssignmentRow,
  type HistoryAttemptRow,
  type HistorySourceRow,
} from "@/lib/assignments/student-history";

function assignmentRow(id: string, overrides: Partial<HistoryAssignmentRow> = {}) {
  return {
    id,
    title: "Devoir limites",
    subjectSlug: "math",
    levelSlug: "2bac",
    chapterSlug: "limites-continuite",
    status: "PUBLISHED",
    attemptLimit: 2,
    showFeedback: true,
    questions: [{ points: 10 }, { points: 10 }],
    ...overrides,
  };
}

function attemptRow(overrides: Partial<HistoryAttemptRow> = {}) {
  return {
    id: "att-1",
    assignmentId: "ass-1",
    attemptNumber: 1,
    status: "SUBMITTED",
    score: 14,
    startedAt: "2026-09-22T10:00:00Z",
    submittedAt: "2026-09-22T12:00:00Z",
    ...overrides,
  };
}

function row(
  attempt: HistoryAttemptRow,
  assignment: HistoryAssignmentRow = assignmentRow(attempt.assignmentId)
): HistorySourceRow {
  return { attempt, assignment };
}

describe("buildStudentHistory", () => {
  it("returns an empty payload for no rows", () => {
    expect(buildStudentHistory([])).toEqual({ assignments: [] });
  });

  it("groups attempts under their assignment and computes total points", () => {
    const payload = buildStudentHistory([
      row(attemptRow()),
      row(
        attemptRow({
          id: "att-2",
          attemptNumber: 2,
          score: 18,
          startedAt: "2026-09-23T10:00:00Z",
          submittedAt: "2026-09-23T12:00:00Z",
        })
      ),
    ]);
    expect(payload.assignments).toHaveLength(1);
    const assignment = payload.assignments[0];
    expect(assignment.assignmentId).toBe("ass-1");
    expect(assignment.totalPoints).toBe(20);
    expect(assignment.attempts).toHaveLength(2);
  });

  it("orders attempts most recent first", () => {
    const payload = buildStudentHistory([
      row(attemptRow()),
      row(
        attemptRow({
          id: "att-2",
          attemptNumber: 2,
          score: 18,
          startedAt: "2026-09-23T10:00:00Z",
        })
      ),
    ]);
    expect(payload.assignments[0].attempts.map((a) => a.attemptNumber)).toEqual([
      2, 1,
    ]);
  });

  it("computes the same percentage as the existing results rule", () => {
    const payload = buildStudentHistory([
      row(attemptRow({ score: 14 })),
      row(
        attemptRow({
          id: "att-2",
          attemptNumber: 2,
          score: 18,
          startedAt: "2026-09-23T10:00:00Z",
        })
      ),
    ]);
    expect(payload.assignments[0].attempts.map((a) => a.percentage)).toEqual([
      90, 70,
    ]);
  });

  it("leaves score and percentage null for in-progress attempts", () => {
    const payload = buildStudentHistory([
      row(
        attemptRow({
          id: "att-open",
          attemptNumber: 3,
          status: "IN_PROGRESS",
          score: null,
          submittedAt: null,
          startedAt: "2026-09-24T10:00:00Z",
        })
      ),
    ]);
    const attempt = payload.assignments[0].attempts[0];
    expect(attempt.score).toBeNull();
    expect(attempt.percentage).toBeNull();
  });

  it("combines each assignment's own attempts and merges nothing across assignments", () => {
    const payload = buildStudentHistory([
      row(
        attemptRow(),
        assignmentRow("ass-1", { questions: [{ points: 10 }, { points: 10 }] })
      ),
      row(
        attemptRow({
          id: "att-b1",
          assignmentId: "ass-2",
          attemptNumber: 1,
          score: 5,
          startedAt: "2026-09-24T10:00:00Z",
        }),
        assignmentRow("ass-2", { questions: [{ points: 2 }, { points: 1 }] })
      ),
    ]);
    expect(payload.assignments).toHaveLength(2);
    const byId = Object.fromEntries(
      payload.assignments.map((a) => [a.assignmentId, a])
    );
    expect(byId["ass-2"].totalPoints).toBe(3);
    expect(byId["ass-2"].attempts[0].percentage).toBe(167);
  });

  it("orders assignments by their most recent attempt", () => {
    const payload = buildStudentHistory([
      row(attemptRow()),
      row(
        attemptRow({
          id: "att-b1",
          assignmentId: "ass-2",
          attemptNumber: 1,
          status: "IN_PROGRESS",
          score: null,
          startedAt: "2026-09-25T10:00:00Z",
          submittedAt: null,
        }),
        assignmentRow("ass-2")
      ),
    ]);
    expect(payload.assignments.map((a) => a.assignmentId)).toEqual([
      "ass-2", "ass-1",
    ]);
  });

  it("exposes summary metadata only, never answer or correction data", () => {
    const payload = buildStudentHistory([
      row(attemptRow({ score: 14 })),
    ]);
    const body = JSON.stringify(payload);
    expect(body).not.toContain("correctOptionIndex");
    expect(body).not.toContain("sourceQuestionId");
    expect(body).not.toContain("selectedIndex");
    expect(body).not.toContain("answers");
  });
});

describe("status and action helpers", () => {
  it("recognizes in-progress status", () => {
    expect(isAttemptInProgress("IN_PROGRESS")).toBe(true);
    expect(isAttemptInProgress("SUBMITTED")).toBe(false);
    expect(isAttemptInProgress("GRADED")).toBe(false);
  });

  it.each([
    ["IN_PROGRESS", "Continuer"],
    ["SUBMITTED", "Voir le résultat"],
    ["GRADED", "Voir le résultat"],
  ] as const)("maps status %s to action %s", (status, label) => {
    expect(historyActionLabel(status)).toBe(label);
  });
});

describe("groupHistoryByProgress", () => {
  function payloadFor(statuses: string[]) {
    return buildStudentHistory(
      statuses.map((status, i) =>
        row(
          attemptRow({
            id: `att-${i}`,
            assignmentId: `ass-${i}`,
            attemptNumber: 1,
            status,
            score: status === "IN_PROGRESS" ? null : 10,
            startedAt: `2026-09-2${i}T10:00:00Z`,
          }),
          assignmentRow(`ass-${i}`)
        )
      )
    );
  }

  it("splits assignments with an open attempt into the in-progress section", () => {
    const { inProgress, completed } = groupHistoryByProgress(
      payloadFor(["IN_PROGRESS", "SUBMITTED"])
    );
    expect(inProgress.map((a) => a.assignmentId)).toEqual(["ass-0"]);
    expect(completed.map((a) => a.assignmentId)).toEqual(["ass-1"]);
  });

  it("keeps both sections empty for an empty payload", () => {
    const { inProgress, completed } = groupHistoryByProgress({
      assignments: [],
    });
    expect(inProgress).toEqual([]);
    expect(completed).toEqual([]);
  });
});

describe("filterHistoryAttempts", () => {
  function assignmentWith(statuses: string[]) {
    return buildStudentHistory(
      statuses.map((status, i) =>
        row(
          attemptRow({
            id: `att-${i}`,
            assignmentId: `ass-${i}`,
            attemptNumber: 1,
            status,
            score: status === "IN_PROGRESS" ? null : 10,
            startedAt: `2026-09-2${i}T10:00:00Z`,
          }),
          assignmentRow(`ass-${i}`)
        )
      )
    ).assignments;
  }

  it("returns everything for the 'all' filter", () => {
    const attempts = assignmentWith(["IN_PROGRESS", "SUBMITTED"]);
    expect(filterHistoryAttempts(attempts, "all")).toHaveLength(2);
  });

  it("keeps only in-progress attempts for 'in_progress'", () => {
    const attempts = assignmentWith(["IN_PROGRESS", "SUBMITTED"]);
    const filtered = filterHistoryAttempts(attempts, "in_progress");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].attempts[0].status).toBe("IN_PROGRESS");
  });

  it("keeps only submitted attempts for 'submitted'", () => {
    const attempts = assignmentWith(["IN_PROGRESS", "SUBMITTED", "GRADED"]);
    const filtered = filterHistoryAttempts(attempts, "submitted");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].attempts[0].status).toBe("SUBMITTED");
  });

  it("keeps only graded attempts for 'graded' and drops assignments without matches", () => {
    const attempts = assignmentWith(["IN_PROGRESS", "GRADED"]);
    const filtered = filterHistoryAttempts(attempts, "graded");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].attempts[0].status).toBe("GRADED");
  });
});