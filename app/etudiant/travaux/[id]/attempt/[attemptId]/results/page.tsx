import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { AssignmentResultsPage } from "@/components/assignments/AssignmentResultsPage";

export const dynamic = "force-dynamic";

export default async function EtudiantTravauxResultsPage({
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
  return <AssignmentResultsPage assignmentId={id} attemptId={attemptId} />;
}