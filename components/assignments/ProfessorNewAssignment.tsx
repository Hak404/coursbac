"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import type { Session } from "@/lib/auth/session";
import type { AssignmentPayload } from "@/lib/assignments/professor-ui";
import { friendlyApiError } from "@/lib/assignments/student-ui";

export function ProfessorNewAssignment({ session }: { session: Session }) {
  const router = useRouter();
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  async function createDraft(payload: AssignmentPayload): Promise<string | null> {
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        const err = friendlyApiError(res.status, data?.error);
        setFallbackError(err);
        return err;
      }
      router.push(`/professeur/travaux/${data.assignment.id}`);
      return null;
    } catch {
      return "Erreur réseau. Veuillez réessayer.";
    }
  }

  return (
    <>
      {fallbackError ? (
        <div className="mx-auto mt-6 w-full max-w-5xl px-5">
          <p
            role="alert"
            className="rounded-2xl bg-danger-50 px-4 py-3 text-sm font-bold text-danger-600"
          >
            {fallbackError}
          </p>
        </div>
      ) : null}
      <AssignmentForm
        mode="create"
        initial={null}
        session={session}
        onSave={createDraft}
        onPublish={async () => null}
      />
    </>
  );
}