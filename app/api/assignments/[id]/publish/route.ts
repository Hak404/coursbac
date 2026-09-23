import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  publishAssignment,
  serializeAssignment,
  toErrorResponse,
} from "@/lib/assignments/service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const assignment = await publishAssignment(id, session);
    return NextResponse.json({
      ok: true,
      assignment: serializeAssignment(assignment),
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}