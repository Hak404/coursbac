import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { StudentTravauxHome } from "@/components/assignments/StudentTravauxHome";

export const dynamic = "force-dynamic";

export default async function EtudiantTravauxPage() {
  const session = await auth();
  const current = toAppSession(session);
  if (
    current.kind !== "user" ||
    (current.user.role !== "STUDENT" && current.user.role !== "ADMIN")
  ) {
    redirect("/connexion");
  }
  return <StudentTravauxHome />;
}