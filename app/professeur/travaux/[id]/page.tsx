import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toAppSession } from "@/lib/auth/session";
import { AssignmentDetail } from "@/components/assignments/AssignmentDetail";

export const dynamic = "force-dynamic";

export default async function ProfesseurTravauxDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
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
  const sp = await searchParams;
  const action = sp?.action === "publish" || sp?.action === "close" ? sp.action : null;
  return <AssignmentDetail id={id} session={current} initialAction={action} />;
}