import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { PendingApproval } from "@/components/dashboard/PendingApproval";

export const dynamic = "force-dynamic";

export default async function EnAttentePage() {
  const session = await auth();
  const current = toAppSession(session);
  if (current.kind !== "user") {
    redirect("/connexion");
  }
  const pendingProfessor =
    current.user.role === "PROFESSOR" && current.user.isApproved !== true;
  if (!pendingProfessor) {
    redirect(current.user.role === "STUDENT" ? "/etudiant" : "/professeur");
  }
  return <PendingApproval />;
}