import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProfessorAttemptResult } from "@/lib/assignments/professor-results-service";
import { toErrorResponse } from "@/lib/assignments/service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { id, attemptId } = await params;
    const session = await auth();
    const result = await getProfessorAttemptResult(id, attemptId, session);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return toErrorResponse(e);
  }
}