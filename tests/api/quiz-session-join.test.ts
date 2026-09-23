import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    quizSession: { findUnique: vi.fn() },
    quizParticipant: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));

import { POST as joinPOST } from "@/app/api/quiz/sessions/[code]/join/route";

const activeQuiz = {
  id: "quiz-1",
  code: "123456",
  status: "ACTIVE",
  chapterSlug: "limites-continuite",
  teacherId: "teacher-1",
  questions: [
    { id: "q1", questionText: "Q1", formula: "\\lim_{x \\to 0} \\frac{\\sin x}{x}", options: ["1", "0", "∞", "2"] },
    { id: "q2", questionText: "Q2", formula: null, options: ["Oui", "Non"] },
  ],
};

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/quiz/sessions/123456/join", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function join(body: unknown) {
  const params = { params: Promise.resolve({ code: "123456" }) };
  return joinPOST(makeReq(body), params as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.quizParticipant.upsert.mockResolvedValue({ id: "p1" });
});

describe("join security", () => {
  it("creates the participant and never leaks correctOptionIndex", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue(null);

    const res = await join({ studentName: "Smoke Student" });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.questions).toHaveLength(2);
    expect(json.questions[0].formula).toContain("\\lim");
    for (const q of json.questions) {
      expect(q).not.toHaveProperty("correctOptionIndex");
    }
    expect(mocks.prisma.quizParticipant.upsert).toHaveBeenCalled();
  });

  it("rejoins an existing participant who has not submitted yet", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue({ id: "p1", submitted: false });

    const res = await join({ studentName: "Smoke Student" });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mocks.prisma.quizParticipant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ totalQuestions: 2 }),
      })
    );
  });

  it("refuses a join for a participant who already submitted", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue({ id: "p1", submitted: true });

    const res = await join({ studentName: "Smoke Student" });
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("déjà soumis");
    expect(mocks.prisma.quizParticipant.upsert).not.toHaveBeenCalled();
  });

  it("rejects join on a closed session", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue({ ...activeQuiz, status: "CLOSED" });

    const res = await join({ studentName: "Un Autre Eleve" });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("fermé");
    expect(mocks.prisma.quizParticipant.upsert).not.toHaveBeenCalled();
  });

  it("rejects an unknown code", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(null);

    const res = await join({ studentName: "Smoke Student" });
    expect(res.status).toBe(404);
  });
});