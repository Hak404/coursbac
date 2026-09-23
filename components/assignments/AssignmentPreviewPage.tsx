"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CHAPTERS_META, levelLabel, subjectTitle } from "@/lib/content/registry";
import type { JoinAssignment } from "@/lib/assignments/student-ui";
import {
  clearAssignmentPreview,
  formatDateLabel,
  friendlyApiError,
  loadAssignmentPreview,
  saveCurrentAttempt,
} from "@/lib/assignments/student-ui";

export function AssignmentPreviewPage({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [preview, setPreview] = useState<JoinAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const stored = loadAssignmentPreview();
      if (stored?.assignment?.id === assignmentId) {
        setPreview(stored.assignment);
      } else {
        setPreview(null);
      }
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  async function startAttempt() {
    if (!preview) return;
    setError(null);
    setStarting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(
          friendlyApiError(res.status, data?.error, {
            notFound: "Ce travail n’est plus disponible.",
          })
        );
        return;
      }
      saveCurrentAttempt({
        assignmentId,
        attemptId: data.attempt.id,
        title: preview.title,
      });
      clearAssignmentPreview();
      router.replace(`/etudiant/travaux/${assignmentId}/attempt/${data.attempt.id}`);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="h-6 w-40 animate-pulse-soft rounded-full bg-slate-200" />
        <div className="mt-6 h-64 animate-pulse-soft rounded-3xl bg-white shadow-card" />
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="text-lg font-extrabold text-slate-900">Travail introuvable</div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            Rejoignez un travail avec le code fourni par votre professeur pour afficher son aperçu.
          </p>
          <Link
            href="/etudiant/travaux/join"
            className="mt-6 inline-flex rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Rejoindre avec un code
          </Link>
        </div>
      </div>
    );
  }

  const chapter = CHAPTERS_META[preview.chapterSlug];
  const noAttemptsLeft = preview.remainingAttempts <= 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
      <Link
        href="/etudiant/travaux"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-primary-700"
      >
        <span aria-hidden>←</span> Retour aux travaux
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card"
      >
        <div className="border-b border-slate-100 px-7 py-5 sm:px-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary-700">
              {subjectTitle(preview.subjectSlug)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-600">
              {levelLabel(preview.levelSlug)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-600">
              {chapter?.title ?? preview.chapterSlug}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {preview.title}
          </h1>
          <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Questions
              </dt>
              <dd className="mt-1 text-xl font-extrabold text-slate-900">
                {preview.questionCount}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Tentatives restantes
              </dt>
              <dd className="mt-1 text-xl font-extrabold text-slate-900">
                {preview.remainingAttempts}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Date limite
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">
                {formatDateLabel(preview.dueDate)}
              </dd>
            </div>
          </dl>
        </div>

        {preview.instructions ? (
          <div className="px-7 py-5 sm:px-9">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Consignes
            </div>
            <div className="mt-2 whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-slate-700">
              {preview.instructions}
            </div>
          </div>
        ) : null}

        <div className="border-t border-slate-100 px-7 py-6 sm:px-9">
          {error ? (
            <p role="alert" className="mb-4 rounded-2xl bg-danger-50 px-4 py-3 text-sm font-bold text-danger-600">
              {error}
            </p>
          ) : null}

          {noAttemptsLeft ? (
            <div className="rounded-2xl bg-warn-50 px-5 py-4 text-sm font-bold text-warn-700">
              Vous avez utilisé toutes vos tentatives pour ce travail.
            </div>
          ) : (
            <button
              type="button"
              onClick={startAttempt}
              disabled={starting}
              className="w-full rounded-2xl bg-primary-600 px-6 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60"
            >
              {starting ? "Préparation du travail…" : "Commencer le travail"}
            </button>
          )}
          <p className="mt-3 text-center text-xs font-semibold text-slate-400">
            Vos réponses sont enregistrées localement jusqu’à leur envoi. Réponse incorrecte : 0
            point.
          </p>
        </div>
      </motion.div>
    </div>
  );
}