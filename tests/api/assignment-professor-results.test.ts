import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    assignment: {
      findUnique: vi.fn(),
    },
    assignmentQuestion: {
      findMany: vi.fn(),
    },
    assignmentAttempt: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { GET as summaryGET } from "@/app/api/assignments/[id]/results/route";
import { GET as detailGET } from "@/app/api/assignments/[id]/results/[attemptId]/route";

const profA = { id: "prof-a", role: "PROFESSOR", isApproved: true };
const student = { id: "student-a", role: "STUDENT" };
const admin = { id: "admin-1", role: "ADMIN" };

const questions = [
  {
    id: "q1",
    index: 0,
    title: "Limite d'un quotient",
    formula: null,
    options: ["4", "2", "0", "n'existe pas"],
    correctOptionIndex: 0,
    difficulty: "EASY",
    points: 2,
    sourceQuestionId: "src1",
  },
  {
    id: "q2",
    index: 1,
    title: "Limite trigonométrique",
    formula: "",
    options: ["3", "1", "0", "6"],
    correctOptionIndex: 1,
    difficulty: "HARD",
    points: 1,
    sourceQuestionId: "src2",
  },
];

const students = {
  amend: { id: "stu-a", name: "Ahmed", email: "ahmed@coursbac.ma" },
  sara: { id: "stu-b", name: "Sara", email: "sara@coursbac.ma" },
  youssef: { id: "stu-c", name: "Youssef", email: "youssef@coursbac.ma" },
};

function assignment(overrides: Record<string, unknown> = {}) {
  return {
    id: "ass-1",
    accessCode: "ABC234",
    title: "Devoir limites",
    instructions: null,
    subjectSlug: "math",
    levelSlug: "2bac",
    chapterSlug: "limites-continuite",
    status: "PUBLISHED",
    createdById: "prof-a",
    dueDate: null,
    attemptLimit: 1,
    showFeedback: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    questions,
    ...overrides,
  };
}

function attempt(overrides: Record<string, unknown> = {}) {
  return {
    id: "att-1",
    assignmentId: "ass-1",
    studentId: "stu-a",
    attemptNumber: 1,
    status: "SUBMITTED",
    score: 3,
    startedAt: new Date("2026-01-10T10:00:00Z"),
    submittedAt: new Date("2026-01-10T11:00:00Z"),
    student: students.amend,
    answers: [
      { questionId: "q1", selectedIndex: 0 },
      { questionId: "q2", selectedIndex: 1 },
    ],
    ...overrides,
  };
}

const attemptsById = new Map<string, Record<string, unknown>>([
  ["att-sub", attempt({ id: "att-sub" })],
  [
    "att-mult-1",
    attempt({
      id: "att-mult-1",
      attemptNumber: 1,
      score: 2,
      submittedAt: new Date("2026-01-11T10:00:00Z"),
      answers: [{ questionId: "q1", selectedIndex: 0 }],
    }),
  ],
  [
    "att-mult-2",
    attempt({
      id: "att-mult-2",
      attemptNumber: 2,
      score: 0,
      submittedAt: new Date("2026-01-12T10:00:00Z"),
      answers: [{ questionId: "q1", selectedIndex: 2 }],
      student: students.amend,
    }),
  ],
  [
    "att-progress",
    attempt({
      id: "att-progress",
      studentId: "stu-b",
      student: students.sara,
      status: "IN_PROGRESS",
      score: null,
      submittedAt: null,
      answers: [],
    }),
  ],
  [
    "att-graded",
    attempt({
      id: "att-graded",
      studentId: "stu-c",
      student: students.youssef,
      status: "GRADED",
      score: 1,
      submittedAt: new Date("2026-01-13T10:00:00Z"),
      answers: [{ questionId: "q1", selectedIndex: 1 }],
    }),
  ],
  [
    "att-foreign",
    attempt({
      id: "att-foreign",
      assignmentId: "ass-9",
      student: students.sara,
    }),
  ],
]);

function assignmentById(id: string | undefined) {
  if (!id) return null;
  if (id === "ass-b") return assignment({ id: "ass-b", createdById: "prof-b" });
  if (id === "missing") return null;
  return assignment();
}

function param<T>(values: Record<string, string>) {
  return { params: Promise.resolve(values as T) };
}

function summary(id: string) {
  return summaryGET(
    new Request(`http://localhost/api/assignments/${id}/results`, {
      method: "GET",
    }),
    param<{ id: string }>({ id }) as never
  );
}

function detail(id: string, attemptId: string) {
  return detailGET(
    new Request(
      `http://localhost/api/assignments/${id}/results/${attemptId}`,
      { method: "GET" }
    ),
    param<{ id: string; attemptId: string }>({ id, attemptId }) as never
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ user: profA });
  mocks.prisma.assignment.findUnique.mockImplementation(
    async (args: { where?: { id?: string } }) => assignmentById(args?.where?.id)
  );
  mocks.prisma.assignmentAttempt.findMany.mockImplementation(
    async () => [...attemptsById.values()].filter((a) => a.assignmentId === "ass-1")
  );
  mocks.prisma.assignmentAttempt.findUnique.mockImplementation(
    async (args: { where?: { id?: string; assignmentId?: string } }) => {
      const where = args?.where ?? {};
      const found = attemptsById.get(where.id ?? "");
      if (!found) return null;
      if (where.assignmentId && found.assignmentId !== where.assignmentId) {
        return null;
      }
      return found;
    }
  );
});

describe("GET /api/assignments/[id]/results — authentication and ownership", () => {
  it("returns 401 for an anonymous user", async () => {
    mocks.auth.mockResolvedValue(null);
    const res = await summary("ass-1");
    expect(res.status).toBe(401);
    expect(mocks.prisma.assignmentAttempt.findMany).not.toHaveBeenCalled();
  });

  it("returns 403 for a student", async () => {
    mocks.auth.mockResolvedValue({ user: student });
    const res = await summary("ass-1");
    expect(res.status).toBe(403);
  });

  it("returns 404 for an unknown assignment", async () => {
    const res = await summary("missing");
    expect(res.status).toBe(404);
  });

  it("allows the owner professor", async () => {
    const res = await summary("ass-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("allows an admin", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await summary("ass-b");
    expect(res.status).toBe(200);
  });

  it("denies a professor who does not own the assignment (IDOR)", async () => {
    const res = await summary("ass-b");
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(mocks.prisma.assignmentAttempt.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/assignments/[id]/results — summary", () => {
  it("returns assignment metadata, summary and attempts", async () => {
    const res = await summary("ass-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignment).toMatchObject({
      id: "ass-1",
      title: "Devoir limites",
      accessCode: "ABC234",
      status: "PUBLISHED",
      questionCount: 2,
      totalPoints: 3,
    });
    expect(json.summary).toEqual({
      totalAttempts: 5,
      submittedAttempts: 4,
      inProgressAttempts: 1,
      uniqueStudents: 3,
      averageScore: { earnedPoints: 1.5, percentage: 50 },
      highestScore: { earnedPoints: 3, percentage: 100 },
      lowestScore: { earnedPoints: 0, percentage: 0 },
    });
    expect(json.attempts).toHaveLength(5);
  });

  it("includes per-attempt rows with student and percentage", async () => {
    const res = await summary("ass-1");
    const json = await res.json();
    const submitted = json.attempts.find((a: { id: string }) => a.id === "att-sub");
    expect(submitted).toMatchObject({
      attemptNumber: 1,
      status: "SUBMITTED",
      score: 3,
      percentage: 100,
      student: { id: "stu-a", name: "Ahmed", email: "ahmed@coursbac.ma" },
    });
    expect(submitted.submittedAt).toBeDefined();
    const progress = json.attempts.find(
      (a: { id: string }) => a.id === "att-progress"
    );
    expect(progress).toMatchObject({
      status: "IN_PROGRESS",
      score: null,
      percentage: null,
      submittedAt: null,
    });
  });

  it("does not leak question corrections in the summary", async () => {
    const res = await summary("ass-1");
    const body = JSON.stringify(await res.json());
    expect(body).not.toContain("correctOptionIndex");
    expect(body).not.toContain("sourceQuestionId");
    expect(body).not.toContain("passwordHash");
  });
});

describe("GET /api/assignments/[id]/results/[attemptId] — authentication and ownership", () => {
  it("returns 401 for an anonymous user", async () => {
    mocks.auth.mockResolvedValue(null);
    const res = await detail("ass-1", "att-sub");
    expect(res.status).toBe(401);
    expect(mocks.prisma.assignmentAttempt.findUnique).not.toHaveBeenCalled();
  });

  it("returns 403 for a student", async () => {
    mocks.auth.mockResolvedValue({ user: student });
    const res = await detail("ass-1", "att-sub");
    expect(res.status).toBe(403);
  });

  it("returns 404 for an unknown assignment", async () => {
    const res = await detail("missing", "att-sub");
    expect(res.status).toBe(404);
  });

  it("allows the owner professor and an admin", async () => {
    for (const user of [profA, admin]) {
      mocks.auth.mockResolvedValue({ user });
      const res = await detail("ass-1", "att-sub");
      expect(res.status).toBe(200);
    }
  });

  it("denies a professor who does not own the assignment (IDOR)", async () => {
    const res = await detail("ass-b", "att-dummy");
    expect(res.status).toBe(403);
  });

  it("returns 404 for an unknown attempt", async () => {
    const res = await detail("ass-1", "att-unknown");
    expect(res.status).toBe(404);
  });

  it("returns 404 for an attempt belonging to another assignment", async () => {
    const res = await detail("ass-1", "att-foreign");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/assignments/[id]/results/[attemptId] — attempt detail", () => {
  it("exposes the correction to the professor", async () => {
    const res = await detail("ass-1", "att-sub");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attempt).toMatchObject({
      id: "att-sub",
      attemptNumber: 1,
      status: "SUBMITTED",
      score: 3,
      percentage: 100,
      student: { id: "stu-a", name: "Ahmed" },
    });
    expect(json.summary).toEqual({
      earnedPoints: 3,
      totalPoints: 3,
      percentage: 100,
    });
    expect(json.questions).toEqual([
      expect.objectContaining({
        questionId: "q1",
        index: 0,
        correctOptionIndex: 0,
        selectedIndex: 0,
        isCorrect: true,
        points: 2,
        earnedPoints: 2,
      }),
      expect.objectContaining({
        questionId: "q2",
        correctOptionIndex: 1,
        selectedIndex: 1,
        isCorrect: true,
        points: 1,
        earnedPoints: 1,
      }),
    ]);
  });

  it("shows wrong answers as zero points", async () => {
    const res = await detail("ass-1", "att-mult-2");
    const json = await res.json();
    expect(json.questions[0]).toMatchObject({
      selectedIndex: 2,
      correctOptionIndex: 0,
      isCorrect: false,
      earnedPoints: 0,
    });
  });

  it("shows in-progress attempts with unanswered questions", async () => {
    const res = await detail("ass-1", "att-progress");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attempt).toMatchObject({ status: "IN_PROGRESS", score: null });
    expect(json.summary.earnedPoints).toBe(0);
    for (const q of json.questions as { selectedIndex: unknown }[]) {
      expect(q.selectedIndex).toBeNull();
    }
  });

  it("recomputes scores and never trusts a stored score shape mismatch", async () => {
    // att-graded stores 1 point but only answered q1 wrong; recompute = 0.
    const res = await detail("ass-1", "att-graded");
    const json = await res.json();
    expect(json.summary).toEqual({
      earnedPoints: 0,
      totalPoints: 3,
      percentage: 0,
    });
  });
});