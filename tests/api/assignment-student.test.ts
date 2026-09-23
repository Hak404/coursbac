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
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    assignmentAnswer: {
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { POST as joinPOST } from "@/app/api/assignments/join/route";
import { POST as createAttemptPOST } from "@/app/api/assignments/[id]/attempts/route";
import { GET as attemptGET } from "@/app/api/assignments/[id]/attempts/[attemptId]/route";
import { POST as submitPOST } from "@/app/api/assignments/[id]/attempts/[attemptId]/submit/route";
import { GET as resultsGET } from "@/app/api/assignments/[id]/attempts/[attemptId]/results/route";

const studentA = { id: "student-a", role: "STUDENT" };
const professor = { id: "prof-a", role: "PROFESSOR", isApproved: true };
const admin = { id: "admin-1", role: "ADMIN" };

function publishedAssignment(overrides: Record<string, unknown> = {}) {
  return {
    id: "ass-1",
    accessCode: "ABC234",
    title: "Devoir limites",
    instructions: "À rendre avant vendredi.",
    subjectSlug: "math",
    levelSlug: "2bac",
    chapterSlug: "limites-continuite",
    status: "PUBLISHED",
    createdById: "prof-a",
    dueDate: null,
    attemptLimit: 1,
    showFeedback: true,
    _count: { questions: 2 },
    ...overrides,
  };
}

const questions = [
  {
    id: "q1",
    assignmentId: "ass-1",
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
    assignmentId: "ass-1",
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

function attemptFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "att-1",
    assignmentId: "ass-1",
    studentId: "student-a",
    attemptNumber: 1,
    status: "IN_PROGRESS",
    score: null,
    startedAt: new Date("2026-01-10T10:00:00Z"),
    submittedAt: null,
    createdAt: new Date("2026-01-10T10:00:00Z"),
    updatedAt: new Date("2026-01-10T10:00:00Z"),
    ...overrides,
  };
}

const attemptsById = new Map<string, Record<string, unknown>>([
  [
    "att-1",
    attemptFixture(),
  ],
  [
    "att-b",
    attemptFixture({ id: "att-b", studentId: "student-b" }),
  ],
  [
    "att-submitted",
    attemptFixture({
      id: "att-submitted",
      status: "SUBMITTED",
      score: 5,
      submittedAt: new Date("2026-01-10T11:00:00Z"),
    }),
  ],
  [
    "att-graded",
    attemptFixture({
      id: "att-graded",
      status: "GRADED",
      score: 2,
      submittedAt: new Date("2026-01-10T11:00:00Z"),
    }),
  ],
]);

function assignmentById(id: string | undefined) {
  if (!id) return null;
  switch (id) {
    case "ass-1":
      return publishedAssignment();
    case "ass-draft":
      return publishedAssignment({ status: "DRAFT" });
    case "ass-closed":
      return publishedAssignment({ status: "CLOSED" });
    case "ass-due":
      return publishedAssignment({ dueDate: new Date("2020-01-01T00:00:00Z") });
    case "ass-limit2":
      return publishedAssignment({ attemptLimit: 2 });
    case "ass-nofb":
      return publishedAssignment({ showFeedback: false });
    default:
      return null;
  }
}

function assignmentByCode(code: string | undefined) {
  if (code === "ABC234") return publishedAssignment();
  if (code === "DRFT45") return publishedAssignment({ status: "DRAFT" });
  if (code === "CLSED7") return publishedAssignment({ status: "CLOSED" });
  return null;
}

function param<T>(values: Record<string, string>) {
  return { params: Promise.resolve(values as T) };
}

function join(body: unknown) {
  return joinPOST(
    new Request("http://localhost/api/assignments/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

function createAttempt(id: string) {
  return createAttemptPOST(
    new Request(`http://localhost/api/assignments/${id}/attempts`, {
      method: "POST",
    }),
    param<{ id: string }>({ id }) as never
  );
}

function getAttempt(id: string, attemptId: string) {
  return attemptGET(
    new Request(
      `http://localhost/api/assignments/${id}/attempts/${attemptId}`,
      { method: "GET" }
    ),
    param<{ id: string; attemptId: string }>({ id, attemptId }) as never
  );
}

function submit(id: string, attemptId: string, body: unknown) {
  return submitPOST(
    new Request(
      `http://localhost/api/assignments/${id}/attempts/${attemptId}/submit`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    ),
    param<{ id: string; attemptId: string }>({ id, attemptId }) as never
  );
}

function results(id: string, attemptId: string) {
  return resultsGET(
    new Request(
      `http://localhost/api/assignments/${id}/attempts/${attemptId}/results`,
      { method: "GET" }
    ),
    param<{ id: string; attemptId: string }>({ id, attemptId }) as never
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ user: studentA });

  mocks.prisma.$transaction.mockImplementation(
    async (fn: (tx: unknown) => Promise<unknown>) => fn(mocks.prisma)
  );
  mocks.prisma.assignment.findUnique.mockImplementation(
    async (args: { where?: { id?: string; accessCode?: string } }) => {
      if (args?.where?.accessCode) return assignmentByCode(args.where.accessCode);
      return assignmentById(args?.where?.id);
    }
  );
  mocks.prisma.assignmentQuestion.findMany.mockResolvedValue(questions);
  mocks.prisma.assignmentAttempt.findUnique.mockImplementation(
    async (args: { where?: Record<string, string> }) => {
      const where = args?.where ?? {};
      const attempt = attemptsById.get(where.id);
      if (!attempt) return null;
      if (where.assignmentId && attempt.assignmentId !== where.assignmentId) {
        return null;
      }
      if (where.studentId && attempt.studentId !== where.studentId) return null;
      return attempt;
    }
  );
  mocks.prisma.assignmentAttempt.count.mockResolvedValue(0);
  mocks.prisma.assignmentAttempt.create.mockImplementation(
    async ({ data }: { data: Record<string, unknown> }) =>
      attemptFixture({
        id: "att-new",
        attemptNumber: data.attemptNumber,
        status: "IN_PROGRESS",
        startedAt: data.startedAt,
      })
  );
  mocks.prisma.assignmentAttempt.update.mockImplementation(
    async ({ data }: { data: Record<string, unknown> }) =>
      attemptFixture({
        id: "att-1",
        status: "SUBMITTED",
        score: data.score,
        submittedAt: new Date("2026-01-10T11:00:00Z"),
        answers: [],
      })
  );
  mocks.prisma.assignmentAnswer.createMany.mockImplementation(
    async ({ data }: { data: { questionId: string; selectedIndex: number }[] }) => ({
      count: data.length,
    })
  );
  mocks.prisma.assignmentAnswer.findMany.mockResolvedValue([]);
});

describe("authentication and role security", () => {
  it.each([
    ["join", async () => join({ accessCode: "ABC234" })],
    ["create attempt", async () => createAttempt("ass-1")],
    [
      "get attempt",
      async () => getAttempt("ass-1", "att-1"),
    ],
    [
      "submit",
      async () => submit("ass-1", "att-1", { answers: [] }),
    ],
    [
      "results",
      async () => results("ass-1", "att-1"),
    ],
  ] as const)("returns 401 for anonymous %s", async (_label, call) => {
    mocks.auth.mockResolvedValue(null);
    const res = await call();
    expect(res.status).toBe(401);
  });

  it.each([
    ["join", async () => join({ accessCode: "ABC234" })],
    ["create attempt", async () => createAttempt("ass-1")],
    ["get attempt", async () => getAttempt("ass-1", "att-1")],
    ["submit", async () => submit("ass-1", "att-1", { answers: [] })],
    ["results", async () => results("ass-1", "att-1")],
  ] as const)("returns 403 for a professor %s", async (_label, call) => {
    mocks.auth.mockResolvedValue({ user: professor });
    const res = await call();
    expect(res.status).toBe(403);
  });

  it.each([
    ["join", async () => join({ accessCode: "ABC234" })],
    ["create attempt", async () => createAttempt("ass-1")],
    ["get attempt", async () => getAttempt("ass-1", "att-1")],
    ["submit", async () => submit("ass-1", "att-1", { answers: [] })],
    ["results", async () => results("ass-1", "att-1")],
  ] as const)(
    "returns 403 for an admin (no impersonation) %s",
    async (_label, call) => {
      mocks.auth.mockResolvedValue({ user: admin });
      const res = await call();
      expect(res.status).toBe(403);
    }
  );
});

describe("POST /api/assignments/join", () => {
  it("joins a PUBLISHED assignment with a valid code", async () => {
    const res = await join({ accessCode: "abc234" });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.assignment).toMatchObject({
      id: "ass-1",
      title: "Devoir limites",
      attemptLimit: 1,
      showFeedback: true,
      questionCount: 2,
      remainingAttempts: 1,
    });
    expect(json.assignment.accessCode).toBeUndefined();
    expect(json.assignment.createdById).toBeUndefined();
  });

  it("returns 400 for a missing access code", async () => {
    const res = await join({});
    expect(res.status).toBe(400);
  });

  it("returns 404 for an invalid format code", async () => {
    const res = await join({ accessCode: "!!!" });
    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown code", async () => {
    const res = await join({ accessCode: "ZZZZZZ" });
    expect(res.status).toBe(404);
  });

  it("returns 404 for a DRAFT assignment", async () => {
    const res = await join({ accessCode: "DRFT45" });
    expect(res.status).toBe(404);
  });

  it("returns 404 for a CLOSED assignment", async () => {
    const res = await join({ accessCode: "CLSED7" });
    expect(res.status).toBe(404);
  });

  it("does not leak correct answers or internal data", async () => {
    const res = await join({ accessCode: "ABC234" });
    const body = JSON.stringify(await res.json());
    expect(body).not.toContain("correctOptionIndex");
    expect(body).not.toContain("sourceQuestionId");
    expect(body).not.toContain("createdById");
    expect(body).not.toContain("accessCode");
  });
});

describe("POST /api/assignments/[id]/attempts", () => {
  it("creates attempt number 1 for a student", async () => {
    const res = await createAttempt("ass-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.attempt).toMatchObject({ attemptNumber: 1, status: "IN_PROGRESS" });
    expect(json.questions).toHaveLength(2);
    expect(json.questions[0].correctOptionIndex).toBeUndefined();
    expect(json.questions[0].sourceQuestionId).toBeUndefined();
  });

  it("uses the session studentId, never the body", async () => {
    const res = await createAttemptPOST(
      new Request("http://localhost/api/assignments/ass-1/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studentId: "student-b" }),
      }),
      param<{ id: string }>({ id: "ass-1" }) as never
    );
    expect(res.status).toBe(200);
    const call = mocks.prisma.assignmentAttempt.create.mock.calls[0][0];
    expect(call.data.studentId).toBe("student-a");
  });

  it("refuses a second attempt when attemptLimit is 1", async () => {
    mocks.prisma.assignmentAttempt.count.mockResolvedValue(1);
    const res = await createAttempt("ass-1");
    expect(res.status).toBe(409);
    expect(mocks.prisma.assignmentAttempt.create).not.toHaveBeenCalled();
  });

  it("allows a second attempt when attemptLimit is 2", async () => {
    mocks.prisma.assignmentAttempt.count.mockResolvedValue(1);
    const res = await createAttempt("ass-limit2");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attempt.attemptNumber).toBe(2);
    const call = mocks.prisma.assignmentAttempt.create.mock.calls[0][0];
    expect(call.data.attemptNumber).toBe(2);
  });

  it("refuses a new attempt after the due date", async () => {
    const res = await createAttempt("ass-due");
    expect(res.status).toBe(409);
    expect(mocks.prisma.assignmentAttempt.create).not.toHaveBeenCalled();
  });

  it("allows a new attempt when there is no due date", async () => {
    const res = await createAttempt("ass-1");
    expect(res.status).toBe(200);
  });

  it("refuses a DRAFT assignment", async () => {
    const res = await createAttempt("ass-draft");
    expect(res.status).toBe(404);
  });

  it("refuses a CLOSED assignment", async () => {
    const res = await createAttempt("ass-closed");
    expect(res.status).toBe(404);
  });

  it("refuses when the assignment does not exist", async () => {
    const res = await createAttempt("missing");
    expect(res.status).toBe(404);
  });

  it("maps a unique-constraint race to 409", async () => {
    mocks.prisma.assignmentAttempt.create.mockRejectedValue(
      Object.assign(new Error("unique"), { code: "P2002" })
    );
    const res = await createAttempt("ass-1");
    expect(res.status).toBe(409);
  });
});

describe("GET /api/assignments/[id]/attempts/[attemptId]", () => {
  it("returns the student's own attempt with safe questions", async () => {
    const res = await getAttempt("ass-1", "att-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attempt.id).toBe("att-1");
    expect(json.attempt.status).toBe("IN_PROGRESS");
    const body = JSON.stringify(json);
    expect(body).not.toContain("correctOptionIndex");
    expect(body).not.toContain("sourceQuestionId");
  });

  it("refuses another student's attempt (IDOR)", async () => {
    const res = await getAttempt("ass-1", "att-b");
    expect(res.status).toBe(404);
  });

  it("refuses when the assignment id does not match the attempt", async () => {
    const res = await getAttempt("ass-other", "att-1");
    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown attempt", async () => {
    const res = await getAttempt("ass-1", "missing");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/assignments/[id]/attempts/[attemptId]/submit", () => {
  const fullCorrect = {
    answers: [
      { questionId: "q1", selectedIndex: 0 },
      { questionId: "q2", selectedIndex: 1 },
    ],
  };

  it("submits and scores correctly (both correct)", async () => {
    mocks.prisma.assignmentAnswer.createMany.mockImplementation(
      async ({ data }: { data: unknown }) => {
        const list = data as { questionId: string; selectedIndex: number }[];
        const updated = attemptFixture({
          status: "SUBMITTED",
          score: 3,
          submittedAt: new Date("2026-01-10T11:00:00Z"),
          answers: list,
        });
        mocks.prisma.assignmentAttempt.update.mockResolvedValue(
          updated as never
        );
        return { count: list.length };
      }
    );
    const res = await submit("ass-1", "att-1", fullCorrect);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attempt.status).toBe("SUBMITTED");
    expect(json.attempt.score).toBe(3);
    expect(json.summary).toEqual({
      earnedPoints: 3,
      totalPoints: 3,
      percentage: 100,
    });
    expect(json.questions).toHaveLength(2);
    expect(json.questions[0]).toMatchObject({
      selectedIndex: 0,
      isCorrect: true,
      correctOptionIndex: 0,
    });
    expect(json.questions[1]).toMatchObject({
      selectedIndex: 1,
      isCorrect: true,
    });
  });

  it("scores wrong answers as zero", async () => {
    mocks.prisma.assignmentAnswer.createMany.mockImplementation(
      async ({ data }: { data: unknown }) => {
        const list = data as { questionId: string; selectedIndex: number }[];
        mocks.prisma.assignmentAttempt.update.mockResolvedValue(
          attemptFixture({
            status: "SUBMITTED",
            score: 0,
            submittedAt: new Date("2026-01-10T11:00:00Z"),
            answers: list,
          }) as never
        );
        return { count: list.length };
      }
    );
    const res = await submit("ass-1", "att-1", {
      answers: [
        { questionId: "q1", selectedIndex: 2 },
        { questionId: "q2", selectedIndex: 0 },
      ],
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary).toEqual({
      earnedPoints: 0,
      totalPoints: 3,
      percentage: 0,
    });
    expect(json.questions[0]).toMatchObject({ isCorrect: false });
  });

  it("accepts a partial submission (missing answers score zero)", async () => {
    mocks.prisma.assignmentAnswer.createMany.mockImplementation(
      async ({ data }: { data: unknown }) => {
        const list = data as { questionId: string; selectedIndex: number }[];
        mocks.prisma.assignmentAttempt.update.mockResolvedValue(
          attemptFixture({
            status: "SUBMITTED",
            score: 2,
            submittedAt: new Date("2026-01-10T11:00:00Z"),
            answers: list,
          }) as never
        );
        return { count: list.length };
      }
    );
    const res = await submit("ass-1", "att-1", {
      answers: [{ questionId: "q1", selectedIndex: 0 }],
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary.earnedPoints).toBe(2);
    expect(json.summary.totalPoints).toBe(3);
    expect(json.questions[1]).toMatchObject({
      selectedIndex: null,
      isCorrect: null,
    });
  });

  it("accepts an empty answers array (score 0)", async () => {
    const res = await submit("ass-1", "att-1", { answers: [] });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary.earnedPoints).toBe(0);
    expect(mocks.prisma.assignmentAnswer.createMany).not.toHaveBeenCalled();
  });

  it("rejects a non-integer selectedIndex", async () => {
    const res = await submit("ass-1", "att-1", {
      answers: [{ questionId: "q1", selectedIndex: "2" }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects a negative selectedIndex", async () => {
    const res = await submit("ass-1", "att-1", {
      answers: [{ questionId: "q1", selectedIndex: -1 }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects a selectedIndex out of range", async () => {
    const res = await submit("ass-1", "att-1", {
      answers: [{ questionId: "q1", selectedIndex: 999 }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown questionId", async () => {
    const res = await submit("ass-1", "att-1", {
      answers: [{ questionId: "nope", selectedIndex: 0 }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects a questionId belonging to another assignment", async () => {
    const res = await submit("ass-1", "att-1", {
      answers: [{ questionId: "q-foreign", selectedIndex: 0 }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate questionIds", async () => {
    const res = await submit("ass-1", "att-1", {
      answers: [
        { questionId: "q1", selectedIndex: 1 },
        { questionId: "q1", selectedIndex: 2 },
      ],
    });
    expect(res.status).toBe(400);
  });

  it("refuses submitting an attempt owned by another student (IDOR)", async () => {
    const res = await submit("ass-1", "att-b", fullCorrect);
    expect(res.status).toBe(404);
    expect(mocks.prisma.assignmentAnswer.createMany).not.toHaveBeenCalled();
    expect(mocks.prisma.assignmentAttempt.update).not.toHaveBeenCalled();
  });

  it("refuses a second submit (409)", async () => {
    const res = await submit("ass-1", "att-submitted", fullCorrect);
    expect(res.status).toBe(409);
    expect(mocks.prisma.assignmentAnswer.createMany).not.toHaveBeenCalled();
  });

  it("allows submit after due date for an already-started attempt", async () => {
    mocks.prisma.assignmentAttempt.findUnique.mockResolvedValue(
      attemptFixture({
        assignmentId: "ass-due",
      }) as never
    );
    mocks.prisma.assignmentAnswer.createMany.mockImplementation(
      async ({ data }: { data: unknown }) => {
        const list = data as { questionId: string; selectedIndex: number }[];
        mocks.prisma.assignmentAttempt.update.mockResolvedValue(
          attemptFixture({
            status: "SUBMITTED",
            score: 3,
            submittedAt: new Date("2026-01-10T11:00:00Z"),
            answers: list,
          }) as never
        );
        return { count: list.length };
      }
    );
    const res = await submit("ass-due", "att-1", fullCorrect);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attempt.status).toBe("SUBMITTED");
  });

  it("ignores a client-provided score", async () => {
    mocks.prisma.assignmentAnswer.createMany.mockImplementation(
      async ({ data }: { data: unknown }) => {
        const list = data as { questionId: string; selectedIndex: number }[];
        mocks.prisma.assignmentAttempt.update.mockResolvedValue(
          attemptFixture({
            status: "SUBMITTED",
            score: 3,
            submittedAt: new Date("2026-01-10T11:00:00Z"),
            answers: list,
          }) as never
        );
        return { count: list.length };
      }
    );
    const res = await submit("ass-1", "att-1", {
      score: 100,
      answers: [
        { questionId: "q1", selectedIndex: 0 },
        { questionId: "q2", selectedIndex: 1 },
      ],
    });
    const json = await res.json();
    expect(json.attempt.score).toBe(3);
    expect(json.summary.earnedPoints).toBe(3);
  });

  it("rolls back everything when answer persistence fails", async () => {
    mocks.prisma.$transaction.mockImplementation(
      async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
        const tx = {
          ...mocks.prisma,
          assignmentAnswer: {
            ...mocks.prisma.assignmentAnswer,
            createMany: vi
              .fn()
              .mockRejectedValue(new Error("database unavailable")),
          },
        };
        return fn(tx);
      }
    );
    const res = await submit("ass-1", "att-1", fullCorrect);
    expect(res.status).toBe(500);
    expect(mocks.prisma.assignmentAttempt.update).not.toHaveBeenCalled();
  });
});

describe("GET /api/assignments/[id]/attempts/[attemptId]/results", () => {
  function seedSubmittedResults() {
    mocks.prisma.assignment.findUnique.mockImplementation(
      async (args: { where?: Record<string, string> }) =>
        assignmentById(args?.where?.id)
    );
    mocks.prisma.assignmentAttempt.findUnique.mockResolvedValue(
      attemptFixture({
        status: "SUBMITTED",
        score: 3,
        submittedAt: new Date("2026-01-10T11:00:00Z"),
        answers: [
          { questionId: "q1", selectedIndex: 0 },
          { questionId: "q2", selectedIndex: 1 },
        ],
      }) as never
    );
  }

  it("returns the owner's results with score, total and percentage", async () => {
    seedSubmittedResults();
    const res = await results("ass-1", "att-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attempt).toMatchObject({
      id: "att-1",
      attemptNumber: 1,
      status: "SUBMITTED",
      score: 3,
    });
    expect(json.summary).toEqual({
      earnedPoints: 3,
      totalPoints: 3,
      percentage: 100,
    });
    expect(json.assignment).toMatchObject({ id: "ass-1", title: "Devoir limites" });
  });

  it("refuses results before submission", async () => {
    const res = await results("ass-1", "att-1");
    expect(res.status).toBe(409);
  });

  it("refuses another student's results (IDOR)", async () => {
    const res = await results("ass-1", "att-b");
    expect(res.status).toBe(404);
  });

  it("refuses when the assignment id does not match", async () => {
    seedSubmittedResults();
    const res = await results("ass-other", "att-1");
    expect(res.status).toBe(404);
  });

  it("exposes the correction when showFeedback is true", async () => {
    seedSubmittedResults();
    const res = await results("ass-1", "att-1");
    const json = await res.json();
    expect(json.questions[0]).toMatchObject({
      selectedIndex: 0,
      isCorrect: true,
      correctOptionIndex: 0,
    });
  });

  it("hides the correction when showFeedback is false", async () => {
    seedSubmittedResults();
    const res = await results("ass-nofb", "att-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary.earnedPoints).toBe(3);
    expect(json.summary.percentage).toBe(100);
    for (const q of json.questions) {
      expect(q.correctOptionIndex).toBeNull();
      expect(q.isCorrect).toBeNull();
    }
  });
});