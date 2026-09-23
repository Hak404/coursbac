import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStudentAttempt } from "@/lib/assignments/student-service";
import { toErrorResponse } from "@/lib/assignments/service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { id, attemptId } = await params;
    const session = await auth();
    const result = await getStudentAttempt(id, attemptId, session);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return toErrorResponse(e);
  }
}