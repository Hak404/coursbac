import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { ProfessorAttemptResult } from "@/components/assignments/ProfessorAttemptResult";

export const dynamic = "force-dynamic";

export default async function ProfesseurTravauxResultatsAttemptPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const session = await auth();
  const current = toAppSession(session);
  if (
    current.kind !== "user" ||
    (current.user.role !== "PROFESSOR" && current.user.role !== "ADMIN")
  ) {
    redirect("/connexion");
  }
  if (
    current.kind === "user" &&
    current.user.role === "PROFESSOR" &&
    current.user.isApproved !== true
  ) {
    redirect("/en-attente");
  }
  const { id, attemptId } = await params;
  return <ProfessorAttemptResult id={id} attemptId={attemptId} />;
}