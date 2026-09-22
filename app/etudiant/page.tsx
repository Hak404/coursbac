import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export const dynamic = "force-dynamic";

export default async function EtudiantPage() {
  const session = await auth();
  const current = toAppSession(session);
  if (
    current.kind !== "user" ||
    (current.user.role !== "STUDENT" && current.user.role !== "ADMIN")
  ) {
    redirect("/connexion");
  }
  return <StudentDashboard session={current} />;
}