import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { submitAttempt } from "@/lib/assignments/student-service";
import { toErrorResponse } from "@/lib/assignments/service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { id, attemptId } = await params;
    const session = await auth();
    const body = await req.json().catch(() => null);
    const result = await submitAttempt(id, attemptId, session, body);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return toErrorResponse(e);
  }
}