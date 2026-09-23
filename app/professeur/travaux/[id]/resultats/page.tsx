import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { ProfessorResults } from "@/components/assignments/ProfessorResults";

export const dynamic = "force-dynamic";

export default async function ProfesseurTravauxResultatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
  const { id } = await params;
  return <ProfessorResults id={id} />;
}