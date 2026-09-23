import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { ProfessorTravauxHome } from "@/components/assignments/ProfessorTravauxHome";

export const dynamic = "force-dynamic";

export default async function ProfesseurTravauxPage() {
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
  return <ProfessorTravauxHome />;
}