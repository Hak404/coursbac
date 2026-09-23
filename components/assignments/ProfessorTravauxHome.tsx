"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import type { Assignment } from "@/lib/assignments/professor-ui";
import {
  chapterOptionTitle,
  copyTextToClipboard,
  formatDate,
  formatDueDate,
  levelOptionTitle,
  subjectOptionTitle,
} from "@/lib/assignments/professor-ui";
import { friendlyApiError } from "@/lib/assignments/student-ui";

export function ProfessorTravauxHome() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const res = await fetch("/api/assignments");
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setError(friendlyApiError(res.status, data?.error));
          return;
        }
        setAssignments(data.assignments);
      } catch {
        if (!cancelled) setError("Erreur réseau. Veuillez réessayer.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function copyCode(id: string, accessCode: string) {
    const ok = await copyTextToClipboard(accessCode);
    if (ok) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Mes Travaux
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Créez, composez et publiez des travaux pour vos étudiants.
          </p>
        </div>
        <Link
          href="/professeur/travaux/nouveau"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
        >
          <span aria-hidden>+</span> Créer un travail
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm font-bold text-danger-600">{error}</p>
          <button
            type="button"
            onClick={() => setReload((n) => n + 1)}
            className="mt-4 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Réessayer
          </button>
        </div>
      ) : assignments === null ? (
        <div className="mt-8 space-y-4">
          <div className="h-40 animate-pulse-soft rounded-3xl bg-white shadow-card" />
          <div className="h-40 animate-pulse-soft rounded-3xl bg-white shadow-card" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="text-lg font-extrabold text-slate-700">Aucun travail pour le moment</div>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Créez votre premier travail, choisissez les questions de la banque et publiez-le avec
            un code d'accès.
          </p>
          <Link
            href="/professeur/travaux/nouveau"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            <span aria-hidden>+</span> Créer un travail
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid max-w-4xl gap-5">
          {assignments.map((assignment, i) => (
            <motion.section
              key={assignment.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wide text-slate-400">
                      {subjectOptionTitle(assignment.subjectSlug)} ·{" "}
                      {levelOptionTitle(assignment.levelSlug)}
                    </div>
                    <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                      {assignment.title}
                    </h2>
                    <div className="mt-1 text-sm font-semibold text-slate-500">
                      {chapterOptionTitle(assignment.chapterSlug)}
                    </div>
                  </div>
                  <AssignmentStatusBadge status={assignment.status} />
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Questions
                    </dt>
                    <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                      {assignment.questions.length}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Date limite
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-700">
                      {formatDueDate(assignment.dueDate)}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Créé le
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-700">
                      {formatDate(assignment.createdAt)}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Code d'accès
                    </dt>
                    <dd className="mt-0.5 font-mono text-lg font-extrabold text-slate-900">
                      {assignment.accessCode}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {assignment.status === "DRAFT" ? (
                    <>
                      <Link
                        href={`/professeur/travaux/${assignment.id}`}
                        className="rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/professeur/travaux/${assignment.id}?action=publish`}
                        className="rounded-2xl bg-success-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-success-700"
                      >
                        Publier
                      </Link>
                    </>
                  ) : assignment.status === "PUBLISHED" ? (
                    <>
                      <Link
                        href={`/professeur/travaux/${assignment.id}`}
                        className="rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        Voir
                      </Link>
                      <button
                        type="button"
                        onClick={() => copyCode(assignment.id, assignment.accessCode)}
                        className="rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-50"
                      >
                        {copiedId === assignment.id ? "Code copié ✓" : "Copier le code"}
                      </button>
                      <Link
                        href={`/professeur/travaux/${assignment.id}/resultats`}
                        className="rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
                      >
                        Voir les résultats
                      </Link>
                      <Link
                        href={`/professeur/travaux/${assignment.id}?action=close`}
                        className="rounded-2xl bg-danger-50 px-5 py-2.5 text-sm font-extrabold text-danger-600 ring-1 ring-danger-200 transition hover:bg-danger-100"
                      >
                        Fermer
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/professeur/travaux/${assignment.id}`}
                        className="rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/professeur/travaux/${assignment.id}/resultats`}
                        className="rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
                      >
                        Voir les résultats
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}