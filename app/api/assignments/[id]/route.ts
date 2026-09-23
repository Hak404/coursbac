import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAssignment,
  serializeAssignment,
  toErrorResponse,
  updateAssignment,
} from "@/lib/assignments/service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const assignment = await getAssignment(id, session);
    return NextResponse.json({
      ok: true,
      assignment: serializeAssignment(assignment),
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const body = await req.json().catch(() => null);
    const updated = await updateAssignment(id, session, body);
    return NextResponse.json({
      ok: true,
      assignment: serializeAssignment(updated),
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}