import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { AssignmentAttemptPage } from "@/components/assignments/AssignmentAttemptPage";

export const dynamic = "force-dynamic";

export default async function EtudiantTravauxAttemptPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const session = await auth();
  const current = toAppSession(session);
  if (
    current.kind !== "user" ||
    (current.user.role !== "STUDENT" && current.user.role !== "ADMIN")
  ) {
    redirect("/connexion");
  }
  const { id, attemptId } = await params;
  return <AssignmentAttemptPage assignmentId={id} attemptId={attemptId} />;
}