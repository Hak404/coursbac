import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { joinAssignment } from "@/lib/assignments/student-service";
import { toErrorResponse } from "@/lib/assignments/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => null);
    const result = await joinAssignment(session, body);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return toErrorResponse(e);
  }
}