import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAttempt } from "@/lib/assignments/student-service";
import { toErrorResponse } from "@/lib/assignments/service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const result = await createAttempt(id, session);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return toErrorResponse(e);
  }
}