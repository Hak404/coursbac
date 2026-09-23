import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    quizSession: { findUnique: vi.fn() },
    quizParticipant: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));

import { POST as submitPOST } from "@/app/api/quiz/sessions/[code]/submit/route";

const activeQuiz = {
  id: "quiz-1",
  code: "123456",
  status: "ACTIVE",
  chapterSlug: "limites-continuite",
  teacherId: "teacher-1",
  questions: [
    { id: "q1", questionText: "Q1", options: ["A", "B", "C", "D"], correctOptionIndex: 0 },
    { id: "q2", questionText: "Q2", options: ["A", "B", "C"], correctOptionIndex: 2 },
  ],
};

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/quiz/sessions/123456/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function submit(body: unknown) {
  const params = { params: Promise.resolve({ code: "123456" }) };
  return submitPOST(makeReq(body), params as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.quizParticipant.update.mockImplementation(async ({ data }: { data: { score: number; totalQuestions: number } }) => ({
    id: "p1",
    score: data.score,
    totalQuestions: data.totalQuestions,
  }));
});

describe("submit security", () => {
  it("rejects submit without an existing participant", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue(null);

    const res = await submit({ studentName: "Direct Submit", answers: [0, 2] });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("Participant introuvable");
    expect(mocks.prisma.quizParticipant.update).not.toHaveBeenCalled();
  });

  it("accepts submit when participant exists and is not yet submitted", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue({ id: "p1", submitted: false });

    const res = await submit({ studentName: "Smoke Student", answers: [0, 2] });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.score).toBe(2);
    expect(json.total).toBe(2);
    expect(json.details).toHaveLength(2);
    expect(mocks.prisma.quizParticipant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p1" },
        data: expect.objectContaining({ submitted: true, score: 2, totalQuestions: 2 }),
      })
    );
  });

  it("refuses a second submit from the same participant", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue({ id: "p1", submitted: true });

    const res = await submit({ studentName: "Smoke Student", answers: [0, 2] });
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("déjà soumis");
    expect(mocks.prisma.quizParticipant.update).not.toHaveBeenCalled();
  });

  it("rejects submit on a closed session", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue({ ...activeQuiz, status: "CLOSED" });
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue({ id: "p1", submitted: false });

    const res = await submit({ studentName: "Smoke Student", answers: [0, 2] });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("fermé");
    expect(mocks.prisma.quizParticipant.update).not.toHaveBeenCalled();
  });

  it("computes the score server-side regardless of the client payload", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue({ id: "p1", submitted: false });

    const res = await submit({ studentName: "Smoke Student", answers: [1, 1], claimedScore: 2 });
    const json = await res.json();
    expect(json.score).toBe(0);
    expect(mocks.prisma.quizParticipant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ score: 0 }),
      })
    );
  });

  it("rejects invalid answers payloads", async () => {
    mocks.prisma.quizSession.findUnique.mockResolvedValue(activeQuiz);
    mocks.prisma.quizParticipant.findUnique.mockResolvedValue({ id: "p1", submitted: false });

    for (const bad of [
      { studentName: "S", answers: [0, 2] },
      { studentName: "Smoke Student", answers: [0] },
      { studentName: "Smoke Student", answers: [0, 99] },
      { studentName: "Smoke Student", answers: ["0", 1] },
    ]) {
      const res = await submit(bad);
      expect([400, 404]).toContain(res.status);
    }
    expect(mocks.prisma.quizParticipant.update).not.toHaveBeenCalled();
  });
});