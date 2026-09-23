import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    assignmentAttempt: {
      findMany: vi.fn(),
    },
  },
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { GET as historyGET } from "@/app/api/assignments/history/route";

const studentA = { id: "student-a", role: "STUDENT" };
const studentB = { id: "student-b", role: "STUDENT" };
const professor = { id: "prof-a", role: "PROFESSOR", isApproved: true };
const admin = { id: "admin-1", role: "ADMIN" };

function assignmentFor(id: string) {
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
  };
}

function historyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "att-1",
    studentId: "student-a",
    assignmentId: "ass-1",
    attemptNumber: 1,
    status: "SUBMITTED",
    score: 14,
    startedAt: new Date("2026-09-22T10:00:00Z"),
    submittedAt: new Date("2026-09-22T12:00:00Z"),
    assignment: assignmentFor("ass-1"),
    ...overrides,
  };
}

const studentARows = [
  historyRow(),
  historyRow({
    id: "att-open",
    assignmentId: "ass-2",
    attemptNumber: 1,
    status: "IN_PROGRESS",
    score: null,
    startedAt: new Date("2026-09-24T09:00:00Z"),
    submittedAt: null,
    assignment: assignmentFor("ass-2"),
  }),
  historyRow({
    id: "att-2",
    assignmentId: "ass-1",
    attemptNumber: 2,
    status: "SUBMITTED",
    score: 18,
    startedAt: new Date("2026-09-23T10:00:00Z"),
    submittedAt: new Date("2026-09-23T12:00:00Z"),
  }),
  historyRow({
    id: "att-graded",
    assignmentId: "ass-3",
    attemptNumber: 1,
    status: "GRADED",
    score: 10,
    startedAt: new Date("2026-09-21T10:00:00Z"),
    submittedAt: new Date("2026-09-21T12:00:00Z"),
    assignment: assignmentFor("ass-3"),
  }),
];

const studentBRows = [
  historyRow({
    id: "att-b",
    studentId: "student-b",
    assignmentId: "ass-9",
    attemptNumber: 1,
    status: "SUBMITTED",
    score: 5,
    startedAt: new Date("2026-09-20T10:00:00Z"),
    submittedAt: new Date("2026-09-20T12:00:00Z"),
    assignment: {
      ...assignmentFor("ass-9"),
      title: "Devoir privé B",
    },
  }),
];

function historyGet(url = "http://localhost/api/assignments/history") {
  const handler: (req?: Request) => ReturnType<typeof historyGET> = historyGET;
  return handler(new Request(url, { method: "GET" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ user: studentA });
  mocks.prisma.assignmentAttempt.findMany.mockImplementation(
    async (args: { where?: Record<string, unknown> }) => {
      const studentId = args?.where?.studentId;
      const all = [...studentARows, ...studentBRows];
      return all.filter((row) => row.studentId === studentId);
    }
  );
});

describe("GET /api/assignments/history — authentication", () => {
  it("returns 401 for anonymous", async () => {
    mocks.auth.mockResolvedValue(null);
    const res = await historyGet();
    expect(res.status).toBe(401);
  });

  it("returns 403 for a professor", async () => {
    mocks.auth.mockResolvedValue({ user: professor });
    const res = await historyGet();
    expect(res.status).toBe(403);
  });

  it("returns 403 for an admin (no impersonation)", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await historyGet();
    expect(res.status).toBe(403);
  });

  it("returns the history for a student", async () => {
    const res = await historyGet();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.assignments)).toBe(true);
  });
});

describe("GET /api/assignments/history — identity", () => {
  it("uses the session student id", async () => {
    await historyGet();
    expect(mocks.prisma.assignmentAttempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: "student-a" } })
    );
  });

  it("ignores a studentId query parameter (IDOR)", async () => {
    const res = await historyGet(
      "http://localhost/api/assignments/history?studentId=student-b"
    );
    expect(res.status).toBe(200);
    expect(mocks.prisma.assignmentAttempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: "student-a" } })
    );
    const body = JSON.stringify(await res.json());
    expect(body).not.toContain("att-b");
    expect(body).not.toContain("Devoir privé B");
  });

  it("returns only the current student's attempts", async () => {
    const res = await historyGet();
    const json = (await res.json()) as {
      assignments: { attempts: { attemptId: string }[] }[];
    };
    const ids = json.assignments.flatMap((a) =>
      a.attempts.map((t) => t.attemptId)
    );
    expect(ids).not.toContain("att-b");
    expect(ids).toEqual(["att-open", "att-2", "att-1", "att-graded"]);
  });

  it("sees only its own history when another student is authenticated", async () => {
    mocks.auth.mockResolvedValue({ user: studentB });
    const res = await historyGet();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignments).toHaveLength(1);
    expect(json.assignments[0].assignmentId).toBe("ass-9");
    expect(json.assignments[0].attempts[0].attemptId).toBe("att-b");
  });
});

describe("GET /api/assignments/history — data", () => {
  it("supports multiple assignments and multiple attempts", async () => {
    const res = await historyGet();
    const json = await res.json();
    expect(
      json.assignments.map((a: { assignmentId: string }) => a.assignmentId)
    ).toEqual(["ass-2", "ass-1", "ass-3"]);
    const ass1 = json.assignments.find(
      (a: { assignmentId: string }) => a.assignmentId === "ass-1"
    );
    expect(ass1.attempts.map((t: { attemptNumber: number }) => t.attemptNumber)).toEqual([
      2, 1,
    ]);
  });

  it("orders assignments by their most recent attempt", async () => {
    const res = await historyGet();
    const json = await res.json();
    expect(
      json.assignments.map((a: { assignmentId: string }) => a.assignmentId)
    ).toEqual(["ass-2", "ass-1", "ass-3"]);
  });

  it("computes the score, percentage and total for submitted attempts", async () => {
    const res = await historyGet();
    const json = await res.json();
    const ass1 = json.assignments.find(
      (a: { assignmentId: string }) => a.assignmentId === "ass-1"
    );
    expect(ass1.totalPoints).toBe(20);
    expect(ass1.attempts[0]).toMatchObject({
      attemptId: "att-2",
      attemptNumber: 2,
      status: "SUBMITTED",
      score: 18,
      percentage: 90,
    });
    expect(ass1.attempts[1]).toMatchObject({
      attemptId: "att-1",
      attemptNumber: 1,
      score: 14,
      percentage: 70,
    });
    expect(ass1.attempts[0].submittedAt).not.toBeNull();
  });

  it("represents a graded attempt with its score", async () => {
    const res = await historyGet();
    const json = await res.json();
    const graded = json.assignments.find(
      (a: { assignmentId: string }) => a.assignmentId === "ass-3"
    );
    expect(graded.attempts[0]).toMatchObject({
      status: "GRADED",
      score: 10,
      percentage: 50,
    });
  });

  it("returns null score and percentage for an in-progress attempt", async () => {
    const res = await historyGet();
    const json = await res.json();
    const inProgress = json.assignments.find(
      (a: { assignmentId: string }) => a.assignmentId === "ass-2"
    );
    expect(inProgress.attempts[0]).toMatchObject({
      status: "IN_PROGRESS",
      score: null,
      percentage: null,
      submittedAt: null,
    });
  });

  it("returns an empty history when the student has no attempts", async () => {
    mocks.prisma.assignmentAttempt.findMany.mockResolvedValue([]);
    const res = await historyGet();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignments).toEqual([]);
  });
});

describe("GET /api/assignments/history — leak prevention", () => {
  it("exposes summary metadata only", async () => {
    const res = await historyGet();
    const body = JSON.stringify(await res.json());
    expect(body).not.toContain("correctOptionIndex");
    expect(body).not.toContain("sourceQuestionId");
    expect(body).not.toContain("selectedIndex");
    expect(body).not.toContain("answers");
  });

  it("keeps assignment context fields used by the UI", async () => {
    const res = await historyGet();
    const json = await res.json();
    expect(json.assignments[1]).toMatchObject({
      assignmentId: "ass-1",
      title: "Devoir limites",
      subjectSlug: "math",
      levelSlug: "2bac",
      chapterSlug: "limites-continuite",
      status: "PUBLISHED",
      attemptLimit: 2,
      showFeedback: true,
    });
  });
});