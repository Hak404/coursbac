import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  assertTeacher,
  createAssignment,
  listAssignments,
  parseCreateBody,
  serializeAssignment,
  toErrorResponse,
} from "@/lib/assignments/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = assertTeacher(session);
    const body = await req.json().catch(() => null);
    const { meta, questions } = parseCreateBody(body);
    const assignment = await createAssignment(userId, meta, questions);
    return NextResponse.json({ ok: true, assignment: serializeAssignment(assignment) });
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function GET() {
  try {
    const session = await auth();
    const assignments = await listAssignments(session);
    return NextResponse.json({
      ok: true,
      assignments: assignments.map(serializeAssignment),
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}