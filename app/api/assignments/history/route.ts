import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStudentHistory } from "@/lib/assignments/student-service";
import { toErrorResponse } from "@/lib/assignments/service";

export async function GET() {
  try {
    const session = await auth();
    const history = await getStudentHistory(session);
    return NextResponse.json({ ok: true, ...history });
  } catch (e) {
    return toErrorResponse(e);
  }
}