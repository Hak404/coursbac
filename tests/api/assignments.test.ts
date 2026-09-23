import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    assignment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    assignmentQuestion: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    quizQuestion: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { POST as createPOST, GET as listGET } from "@/app/api/assignments/route";
import {
  GET as oneGET,
  PATCH as updatePATCH,
} from "@/app/api/assignments/[id]/route";
import { POST as publishPOST } from "@/app/api/assignments/[id]/publish/route";
import { POST as closePOST } from "@/app/api/assignments/[id]/close/route";

const profA = { id: "prof-a", role: "PROFESSOR", isApproved: true };
const unapproved = { id: "prof-x", role: "PROFESSOR", isApproved: false };
const student = { id: "student-1", role: "STUDENT" };
const admin = { id: "admin-1", role: "ADMIN" };

const sourceQuestions = [
  {
    id: "q1",
    chapterSlug: "limites-continuite",
    title: "Limite d'un quotient",
    formula: "\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}",
    options: ["4", "2", "0", "n'existe pas"],
    correctOptionIndex: 0,
    difficulty: "EASY",
  },
  {
    id: "q2",
    chapterSlug: "limites-continuite",
    title: "Limite trigonométrique",
    formula: "",
    options: ["3", "1", "0", "6"],
    correctOptionIndex: 1,
    difficulty: "HARD",
  },
];

function draftAssignment(overrides: Record<string, unknown> = {}) {
  return {
    id: "ass-1",
    accessCode: "ABC234",
    title: "Travail limites",
    instructions: null,
    subjectSlug: "math",
    levelSlug: "2bac",
    chapterSlug: "limites-continuite",
    status: "DRAFT",
    createdById: "prof-a",
    dueDate: null,
    attemptLimit: 1,
    showFeedback: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    questions: [
      {
        id: "saq1",
        index: 0,
        title: "Limite d'un quotient",
        formula: null,
        options: ["4", "2", "0", "n'existe pas"],
        correctOptionIndex: 0,
        difficulty: "EASY",
        points: 1,
        sourceQuestionId: "q1",
      },
      {
        id: "saq2",
        index: 1,
        title: "Limite trigonométrique",
        formula: null,
        options: ["3", "1", "0", "6"],
        correctOptionIndex: 1,
        difficulty: "HARD",
        points: 2,
        sourceQuestionId: "q2",
      },
    ],
    ...overrides,
  };
}

const validCreateBody = {
  title: "Devoir limites",
  instructions: "À rendre avant vendredi.",
  subjectSlug: "math",
  levelSlug: "2bac",
  chapterSlug: "limites-continuite",
  attemptLimit: 1,
  showFeedback: true,
  questions: [
    { sourceQuestionId: "q1", index: 0, points: 1 },
    { sourceQuestionId: "q2", index: 1, points: 2 },
  ],
};

function param<T>(id: string) {
  return { params: Promise.resolve({ id } as T) };
}

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/assignments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function create(body: unknown) {
  return createPOST(makeReq(body));
}

async function publish(id: string) {
  return publishPOST(
    new Request(`http://localhost/api/assignments/${id}/publish`, {
      method: "POST",
    }),
    param<{ id: string }>(id) as never
  );
}

async function close(id: string) {
  return closePOST(
    new Request(`http://localhost/api/assignments/${id}/close`, {
      method: "POST",
    }),
    param<{ id: string }>(id) as never
  );
}

async function patch(id: string, body: unknown) {
  return updatePATCH(makeReq(body), param<{ id: string }>(id) as never);
}

async function getOne(id: string) {
  return oneGET(
    new Request(`http://localhost/api/assignments/${id}`, { method: "GET" }),
    param<{ id: string }>(id) as never
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ user: profA });

  mocks.prisma.$transaction.mockImplementation(async (ops: Promise<unknown>[]) =>
    Promise.all(ops)
  );
  mocks.prisma.assignment.findUnique.mockImplementation(
    async (args: { where?: { id?: string; accessCode?: string } }) => {
      if (args?.where?.accessCode) return null;
      if (!args?.where?.id) return null;
      if (args.where.id === "missing") return null;
      if (args.where.id === "ass-b") return draftAssignment({ createdById: "prof-b" });
      if (args.where.id === "ass-published") {
        return draftAssignment({ status: "PUBLISHED" });
      }
      if (args.where.id === "ass-closed") {
        return draftAssignment({ status: "CLOSED" });
      }
      if (args.where.id === "ass-noq") return draftAssignment({ questions: [] });
      if (args.where.id === "ass-badslug") {
        return draftAssignment({ subjectSlug: "nope" });
      }
      return draftAssignment();
    }
  );
  mocks.prisma.assignment.create.mockImplementation(
    async ({ data }: { data: Record<string, unknown> }) => ({
      id: "ass-new",
      ...data,
      status: "DRAFT",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      questions: [],
    })
  );
  mocks.prisma.assignment.update.mockImplementation(
    async ({ data }: { data: Record<string, unknown> }) => ({
      ...draftAssignment(),
      ...data,
    })
  );
  mocks.prisma.assignment.findMany.mockResolvedValue([draftAssignment()]);
  mocks.prisma.assignmentQuestion.deleteMany.mockResolvedValue({ count: 2 });
  mocks.prisma.assignmentQuestion.createMany.mockResolvedValue({ count: 2 });
  mocks.prisma.quizQuestion.findMany.mockImplementation(
    async ({ where }: { where?: { id?: { in?: string[] } } }) => {
      const ids = where?.id?.in ?? [];
      return sourceQuestions.filter((q) => ids.includes(q.id));
    }
  );
});

const CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

describe("POST /api/assignments", () => {
  it("returns 401 when unauthenticated", async () => {
    mocks.auth.mockResolvedValue(null);
    const res = await create(validCreateBody);
    expect(res.status).toBe(401);
    expect(mocks.prisma.assignment.create).not.toHaveBeenCalled();
  });

  it("returns 403 for a student", async () => {
    mocks.auth.mockResolvedValue({ user: student });
    const res = await create(validCreateBody);
    expect(res.status).toBe(403);
    expect(mocks.prisma.assignment.create).not.toHaveBeenCalled();
  });

  it("returns 403 for an unapproved professor", async () => {
    mocks.auth.mockResolvedValue({ user: unapproved });
    const res = await create(validCreateBody);
    expect(res.status).toBe(403);
    expect(mocks.prisma.assignment.create).not.toHaveBeenCalled();
  });

  it("creates a draft for an approved professor", async () => {
    const res = await create(validCreateBody);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.assignment.status).toBe("DRAFT");
    expect(json.assignment.createdById).toBe("prof-a");
    expect(CODE_PATTERN.test(json.assignment.accessCode)).toBe(true);
  });

  it("creates a draft for an admin", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await create(validCreateBody);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.assignment.status).toBe("DRAFT");
  });

  it("ignores createdById from the body", async () => {
    const res = await create({ ...validCreateBody, createdById: "prof-b" });
    expect(res.status).toBe(200);
    const call = mocks.prisma.assignment.create.mock.calls[0][0];
    expect(call.data.createdById).toBe("prof-a");
  });

  it("ignores status from the body (always DRAFT)", async () => {
    const res = await create({ ...validCreateBody, status: "PUBLISHED" });
    const json = await res.json();
    expect(json.assignment.status).toBe("DRAFT");
    const call = mocks.prisma.assignment.create.mock.calls[0][0];
    expect(call.data.status).toBeUndefined();
  });

  it("ignores accessCode from the body", async () => {
    const res = await create({ ...validCreateBody, accessCode: "HACKME1" });
    expect(res.status).toBe(200);
    const call = mocks.prisma.assignment.create.mock.calls[0][0];
    expect(call.data.accessCode).not.toBe("HACKME1");
    expect(CODE_PATTERN.test(call.data.accessCode)).toBe(true);
  });

  it("ignores tampered question text and snapshots DB values", async () => {
    const body = {
      ...validCreateBody,
      questions: [
        {
          sourceQuestionId: "q1",
          index: 0,
          points: 3,
          title: "HACKED TITLE",
          correctOptionIndex: 2,
          options: ["WRONG", "ANSWER", "LIST"],
        },
      ],
    };
    const res = await create(body);
    expect(res.status).toBe(200);
    const call = mocks.prisma.assignment.create.mock.calls[0][0];
    const created = call.data.questions.create;
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      title: "Limite d'un quotient",
      correctOptionIndex: 0,
      points: 3,
      sourceQuestionId: "q1",
    });
    expect(created[0].options).toEqual(["4", "2", "0", "n'existe pas"]);
    expect(created[0].title).not.toBe("HACKED TITLE");
  });

  it("rejects duplicate question indexes", async () => {
    const body = {
      ...validCreateBody,
      questions: [
        { sourceQuestionId: "q1", index: 0, points: 1 },
        { sourceQuestionId: "q2", index: 0, points: 1 },
      ],
    };
    const res = await create(body);
    expect(res.status).toBe(400);
    expect(mocks.prisma.assignment.create).not.toHaveBeenCalled();
  });

  it("rejects invalid or missing sourceQuestionId", async () => {
    const body = {
      ...validCreateBody,
      questions: [{ sourceQuestionId: "unknown-id", index: 0, points: 1 }],
    };
    const res = await create(body);
    expect([400, 404]).toContain(res.status);
    expect(mocks.prisma.assignment.create).not.toHaveBeenCalled();
  });

  it("does not create anything when a question snapshot fails (rollback)", async () => {
    const body = {
      ...validCreateBody,
      questions: [
        { sourceQuestionId: "q1", index: 0, points: 1 },
        { sourceQuestionId: "unknown-id", index: 1, points: 1 },
      ],
    };
    const res = await create(body);
    expect([400, 404]).toContain(res.status);
    expect(mocks.prisma.assignment.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid attemptLimit", async () => {
    const res = await create({ ...validCreateBody, attemptLimit: 0 });
    expect(res.status).toBe(400);
  });

  it("rejects a missing title", async () => {
    const res = await create({ ...validCreateBody, title: "   " });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid chapter slug", async () => {
    const res = await create({ ...validCreateBody, chapterSlug: "nope" });
    expect(res.status).toBe(400);
  });

  it("allows a DRAFT with zero questions", async () => {
    const res = await create({ ...validCreateBody, questions: undefined });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignment.status).toBe("DRAFT");
    const call = mocks.prisma.assignment.create.mock.calls[0][0];
    expect(call.data.questions).toBeUndefined();
  });
});

describe("GET /api/assignments", () => {
  it("lets a professor see only their own assignments", async () => {
    const res = await listGET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.assignments).toHaveLength(1);
    expect(mocks.prisma.assignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { createdById: "prof-a" },
      })
    );
  });

  it("lets an admin see all assignments", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await listGET();
    expect(res.status).toBe(200);
    expect(mocks.prisma.assignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it("blocks a student", async () => {
    mocks.auth.mockResolvedValue({ user: student });
    const res = await listGET();
    expect(res.status).toBe(403);
    expect(mocks.prisma.assignment.findMany).not.toHaveBeenCalled();
  });

  it("blocks an unapproved professor", async () => {
    mocks.auth.mockResolvedValue({ user: unapproved });
    const res = await listGET();
    expect(res.status).toBe(403);
  });
});

describe("GET /api/assignments/[id]", () => {
  it("returns the owner's assignment", async () => {
    const res = await getOne("ass-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignment.id).toBe("ass-1");
    expect(json.assignment.questions).toHaveLength(2);
  });

  it("denies a professor who does not own the assignment (IDOR)", async () => {
    const res = await getOne("ass-b");
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it("allows an admin to view any assignment", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await getOne("ass-b");
    expect(res.status).toBe(200);
  });

  it("returns 404 for a missing assignment", async () => {
    const res = await getOne("missing");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/assignments/[id]", () => {
  it("lets the owner edit a DRAFT", async () => {
    const res = await patch("ass-1", { title: "Nouveau titre" });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignment.title).toBe("Nouveau titre");
    expect(mocks.prisma.assignment.update).toHaveBeenCalled();
  });

  it("denies another professor (IDOR)", async () => {
    const res = await patch("ass-b", { title: "Attaque" });
    expect(res.status).toBe(403);
    expect(mocks.prisma.assignment.update).not.toHaveBeenCalled();
  });

  it("denies a student", async () => {
    mocks.auth.mockResolvedValue({ user: student });
    const res = await patch("ass-1", { title: "Attaque" });
    expect(res.status).toBe(403);
    expect(mocks.prisma.assignment.update).not.toHaveBeenCalled();
  });

  it("cannot change createdById", async () => {
    const res = await patch("ass-1", { createdById: "prof-b", title: "OK" });
    expect(res.status).toBe(200);
    const call = mocks.prisma.assignment.update.mock.calls[0][0];
    expect(call.data.createdById).toBeUndefined();
    expect(call.data.title).toBe("OK");
  });

  it("cannot change accessCode", async () => {
    const res = await patch("ass-1", { accessCode: "ZZZ999" });
    expect(res.status).toBe(200);
    const call = mocks.prisma.assignment.update.mock.calls[0][0];
    expect(call.data.accessCode).toBeUndefined();
  });

  it("cannot force a status change through PATCH", async () => {
    const res = await patch("ass-1", { status: "PUBLISHED" });
    expect(res.status).toBe(200);
    const call = mocks.prisma.assignment.update.mock.calls[0][0];
    expect(call.data.status).toBeUndefined();
  });

  it("rejects editing a PUBLISHED assignment", async () => {
    const res = await patch("ass-published", { title: "Trop tard" });
    expect(res.status).toBe(409);
    expect(mocks.prisma.assignmentQuestion.deleteMany).not.toHaveBeenCalled();
  });

  it("rejects editing a CLOSED assignment", async () => {
    const res = await patch("ass-closed", { title: "Historique" });
    expect(res.status).toBe(409);
  });

  it("replaces the questions atomically for a DRAFT", async () => {
    const res = await patch("ass-1", {
      title: "Mise à jour",
      questions: [{ sourceQuestionId: "q2", index: 0, points: 2 }],
    });
    expect(res.status).toBe(200);
    expect(mocks.prisma.assignmentQuestion.deleteMany).toHaveBeenCalledWith({
      where: { assignmentId: "ass-1" },
    });
    expect(mocks.prisma.assignmentQuestion.createMany).toHaveBeenCalled();
    const createCall = mocks.prisma.assignmentQuestion.createMany.mock.calls[0][0];
    expect(createCall.data).toHaveLength(1);
    expect(createCall.data[0]).toMatchObject({
      assignmentId: "ass-1",
      index: 0,
      points: 2,
      sourceQuestionId: "q2",
    });
    expect(mocks.prisma.assignment.update).toHaveBeenCalledTimes(1);
  });

  it("rejects tampered question values on replacement", async () => {
    const res = await patch("ass-1", {
      questions: [
        {
          sourceQuestionId: "q2",
          index: 0,
          points: 1,
          correctOptionIndex: 99,
        },
      ],
    });
    expect(res.status).toBe(200);
    const createCall = mocks.prisma.assignmentQuestion.createMany.mock.calls[0][0];
    expect(createCall.data[0].correctOptionIndex).toBe(1);
  });
});

describe("POST /api/assignments/[id]/publish", () => {
  it("publishes a valid DRAFT owned by the professor", async () => {
    const res = await publish("ass-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignment.status).toBe("PUBLISHED");
    expect(mocks.prisma.assignment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "PUBLISHED" } })
    );
  });

  it("lets an admin publish", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await publish("ass-1");
    expect(res.status).toBe(200);
  });

  it("denies another professor (IDOR)", async () => {
    const res = await publish("ass-b");
    expect(res.status).toBe(403);
    expect(mocks.prisma.assignment.update).not.toHaveBeenCalled();
  });

  it("denies a student", async () => {
    mocks.auth.mockResolvedValue({ user: student });
    const res = await publish("ass-1");
    expect(res.status).toBe(403);
  });

  it("rejects PUBLISHED -> PUBLISHED", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await publish("ass-published");
    expect(res.status).toBe(409);
  });

  it("rejects CLOSED -> PUBLISHED", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await publish("ass-closed");
    expect(res.status).toBe(409);
  });

  it("rejects publishing a DRAFT without questions", async () => {
    const res = await publish("ass-noq");
    expect(res.status).toBe(400);
  });

  it("rejects publishing with invalid metadata", async () => {
    const res = await publish("ass-badslug");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/assignments/[id]/close", () => {
  it("closes a PUBLISHED assignment owned by the professor", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await close("ass-published");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignment.status).toBe("CLOSED");
  });

  it("lets an admin close", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await close("ass-published");
    expect(res.status).toBe(200);
  });

  it("denies another professor (IDOR)", async () => {
    const res = await close("ass-b");
    expect(res.status).toBe(403);
  });

  it("denies a student", async () => {
    mocks.auth.mockResolvedValue({ user: student });
    const res = await close("ass-published");
    expect(res.status).toBe(403);
  });

  it("rejects DRAFT -> CLOSED", async () => {
    const res = await close("ass-1");
    expect(res.status).toBe(409);
  });

  it("rejects CLOSED -> CLOSED", async () => {
    mocks.auth.mockResolvedValue({ user: admin });
    const res = await close("ass-closed");
    expect(res.status).toBe(409);
  });
});