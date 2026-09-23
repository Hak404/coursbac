import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { AssignmentPreviewPage } from "@/components/assignments/AssignmentPreviewPage";

export const dynamic = "force-dynamic";

export default async function EtudiantTravauxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const current = toAppSession(session);
  if (
    current.kind !== "user" ||
    (current.user.role !== "STUDENT" && current.user.role !== "ADMIN")
  ) {
    redirect("/connexion");
  }
  const { id } = await params;
  return <AssignmentPreviewPage assignmentId={id} />;
}