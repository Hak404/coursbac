import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { ProfessorNewAssignment } from "@/components/assignments/ProfessorNewAssignment";

export const dynamic = "force-dynamic";

export default async function ProfesseurTravauxNouveauPage() {
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
  return <ProfessorNewAssignment session={current} />;
}