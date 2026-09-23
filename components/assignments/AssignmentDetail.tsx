"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Formula } from "@/components/ui/TeX";
import { AccessCodeCard } from "@/components/assignments/AccessCodeCard";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { ConfirmDialog } from "@/components/assignments/ConfirmDialog";
import type { Assignment, AssignmentPayload } from "@/lib/assignments/professor-ui";
import {
  chapterOptionTitle,
  formatDueDate,
  levelOptionTitle,
  subjectOptionTitle,
} from "@/lib/assignments/professor-ui";
import { friendlyApiError, optionLetter } from "@/lib/assignments/student-ui";
import type { Session } from "@/lib/auth/session";

export function AssignmentDetail({
  id,
  session,
  initialAction,
}: {
  id: string;
  session: Session;
  initialAction?: "publish" | "close" | null;
}) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/assignments/${id}`);
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setLoadError(
            friendlyApiError(res.status, data?.error, {
              notFound: "Travail introuvable.",
            })
          );
          return;
        }
        setAssignment(data.assignment);
        if (initialAction === "close" && data.assignment.status === "PUBLISHED") {
          setCloseOpen(true);
        }
      } catch {
        if (!cancelled) setLoadError("Erreur réseau. Veuillez réessayer.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, initialAction]);

  async function saveDraft(payload: AssignmentPayload): Promise<string | null> {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        return friendlyApiError(res.status, data?.error, {
          notFound: "Travail introuvable.",
        });
      }
      setAssignment(data.assignment);
      return null;
    } catch {
      return "Erreur réseau. Veuillez réessayer.";
    }
  }

  async function publishNow(): Promise<string | null> {
    try {
      const res = await fetch(`/api/assignments/${id}/publish`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        return friendlyApiError(res.status, data?.error, {
          notFound: "Travail introuvable.",
        });
      }
      setAssignment(data.assignment);
      return null;
    } catch {
      return "Erreur réseau. Veuillez réessayer.";
    }
  }

  async function closeNow() {
    setCloseError(null);
    setIsClosing(true);
    try {
      const res = await fetch(`/api/assignments/${id}/close`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setCloseError(
          friendlyApiError(res.status, data?.error, {
            notFound: "Travail introuvable.",
          })
        );
        return;
      }
      setAssignment(data.assignment);
      setCloseOpen(false);
    } catch {
      setCloseError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsClosing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="h-6 w-56 animate-pulse-soft rounded-full bg-slate-200" />
        <div className="mt-6 h-72 animate-pulse-soft rounded-3xl bg-white shadow-card" />
      </div>
    );
  }

  if (loadError || !assignment) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
          <div className="text-lg font-extrabold text-slate-900">
            {loadError ?? "Travail introuvable."}
          </div>
          <Link
            href="/professeur/travaux"
            className="mt-6 inline-flex rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Retour aux travaux
          </Link>
        </div>
      </div>
    );
  }

  if (assignment.status === "DRAFT") {
    return (
      <>
        <AssignmentForm
          mode="edit"
          initial={assignment}
          session={session}
          autoOpenPublish={initialAction === "publish"}
          onSave={saveDraft}
          onPublish={publishNow}
        />
      </>
    );
  }

  if (assignment.status === "PUBLISHED" || assignment.status === "CLOSED") {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-primary-700">
              {subjectOptionTitle(assignment.subjectSlug)} ·{" "}
              {levelOptionTitle(assignment.levelSlug)}
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {assignment.title}
            </h1>
            <div className="mt-1 text-sm font-semibold text-slate-500">
              {chapterOptionTitle(assignment.chapterSlug)}
            </div>
          </div>
          <AssignmentStatusBadge status={assignment.status} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 space-y-6"
        >
          <AccessCodeCard assignment={assignment} />

          <Link
            href={`/professeur/travaux/${assignment.id}/resultats`}
            className="inline-flex rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Voir les résultats
          </Link>

          {assignment.status === "PUBLISHED" ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <div>
                <div className="text-base font-extrabold text-slate-900">Fermer le travail ?</div>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Les étudiants ne pourront plus commencer de nouvelles tentatives.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCloseOpen(true)}
                className="rounded-2xl bg-danger-600 px-6 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-danger-700"
              >
                Fermer le travail
              </button>
            </div>
          ) : (
            <p className="rounded-3xl bg-slate-100 px-6 py-4 text-sm font-bold text-slate-500">
              Ce travail est fermé : les étudiants ne peuvent plus le démarrer.
            </p>
          )}

          {assignment.instructions ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Consignes
              </div>
              <div className="mt-2 whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-slate-700">
                {assignment.instructions}
              </div>
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Questions
                </dt>
                <dd className="mt-1 text-xl font-extrabold text-slate-900">
                  {assignment.questions.length}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Tentatives
                </dt>
                <dd className="mt-1 text-xl font-extrabold text-slate-900">
                  {assignment.attemptLimit}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Date limite
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">
                  {formatDueDate(assignment.dueDate)}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Corrections
                </dt>
                <dd className="mt-1 text-sm font-extrabold text-slate-900">
                  {assignment.showFeedback ? "Activées" : "Désactivées"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">Questions</h2>
              <span className="text-sm font-semibold text-slate-500">
                {assignment.questions.length} question
                {assignment.questions.length > 1 ? "s" : ""}
              </span>
            </div>
            <ol className="mt-5 space-y-4">
              {assignment.questions.map((q) => (
                <li key={q.id} className="rounded-3xl border border-slate-200 bg-slate-50/50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-slate-400">
                        {q.index + 1}.
                      </span>
                      <h3 className="text-base font-extrabold leading-snug text-slate-900">
                        {q.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200">
                      {q.points} point{q.points > 1 ? "s" : ""}
                    </span>
                  </div>
                  {q.formula ? (
                    <div className="mt-2 overflow-x-auto rounded-2xl bg-white px-3 py-2">
                      <Formula className="text-slate-900">{q.formula}</Formula>
                    </div>
                  ) : null}
                  <ol className="mt-3 space-y-1.5">
                    {(q.options ?? []).map((option, i) => {
                      const isCorrect = i === q.correctOptionIndex;
                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                            isCorrect
                              ? "bg-success-100 text-success-800"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          <span className="font-extrabold">{optionLetter(i)}</span>
                          <span className="flex-1">{option}</span>
                          {isCorrect ? (
                            <span className="text-xs font-extrabold uppercase text-success-700">
                              Bonne réponse
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex justify-end">
            <Link
              href="/professeur/travaux"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Retour aux travaux
            </Link>
          </div>
        </motion.div>

        {closeOpen ? (
          <ConfirmDialog
            title="Fermer ce travail ?"
            description={
              <p>Les étudiants ne pourront plus commencer de nouvelles tentatives.</p>
            }
            confirmLabel="Fermer"
            busyLabel="Fermeture…"
            isBusy={isClosing}
            error={closeError}
            onConfirm={closeNow}
            onClose={() => {
              setCloseOpen(false);
              setCloseError(null);
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
        <div className="text-lg font-extrabold text-slate-900">Statut inconnu.</div>
        <Link
          href="/professeur/travaux"
          className="mt-6 inline-flex rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
        >
          Retour aux travaux
        </Link>
      </div>
    </div>
  );
}