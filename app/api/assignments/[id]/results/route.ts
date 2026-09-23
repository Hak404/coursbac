import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProfessorResults } from "@/lib/assignments/professor-results-service";
import { toErrorResponse } from "@/lib/assignments/service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const result = await getProfessorResults(id, session);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return toErrorResponse(e);
  }
}