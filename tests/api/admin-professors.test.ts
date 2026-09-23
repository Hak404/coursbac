import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    professorProfile: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  },
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { POST as adminPOST, GET as adminGET } from "@/app/api/admin/professors/route";

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/admin/professors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
});

describe("admin professors POST", () => {
  it("returns a controlled 404 for an unknown professorId", async () => {
    mocks.prisma.professorProfile.findUnique.mockResolvedValue(null);

    const res = await adminPOST(makeReq({ professorId: "nonexistent-id" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Professeur introuvable.");
    expect(mocks.prisma.professorProfile.update).not.toHaveBeenCalled();
  });

  it("approves an existing professor", async () => {
    mocks.prisma.professorProfile.findUnique.mockResolvedValue({ id: "p-1" });
    mocks.prisma.professorProfile.update.mockResolvedValue({
      id: "p-1",
      isApproved: true,
    });

    const res = await adminPOST(makeReq({ professorId: "p-1" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mocks.prisma.professorProfile.update).toHaveBeenCalledWith({
      where: { id: "p-1" },
      data: { isApproved: true },
    });
  });

  it("rejects non-admin users", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "t1", role: "PROFESSOR" } });

    const res = await adminPOST(makeReq({ professorId: "p-1" }));
    expect(res.status).toBe(403);
    expect(mocks.prisma.professorProfile.findUnique).not.toHaveBeenCalled();
  });

  it("rejects requests without professorId", async () => {
    const res = await adminPOST(makeReq({}));
    expect(res.status).toBe(400);
  });
});

describe("admin professors GET", () => {
  it("is allowed for admin", async () => {
    mocks.prisma.professorProfile.findMany.mockResolvedValue([]);

    const res = await adminGET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.professors).toEqual([]);
  });

  it("rejects non-admin users", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "t1", role: "PROFESSOR" } });

    const res = await adminGET();
    expect(res.status).toBe(403);
  });
});