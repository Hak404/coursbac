"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { AttemptStatusBadge } from "@/components/assignments/AttemptStatusBadge";
import {
  chapterOptionTitle,
  formatDateTime,
  levelOptionTitle,
  subjectOptionTitle,
} from "@/lib/assignments/professor-ui";
import {
  filterAttemptsByGroup,
  formatPercentage,
  formatScore,
  sortAttempts,
  type AttemptGroup,
  type SerializedAttemptRow,
  type SortDir,
  type SortKey,
  type SummaryStats,
} from "@/lib/assignments/professor-results";
import { friendlyApiError } from "@/lib/assignments/student-ui";

type ResultsPayload = {
  assignment: {
    id: string;
    title: string;
    accessCode: string;
    status: string;
    subjectSlug: string;
    levelSlug: string;
    chapterSlug: string;
    dueDate: string | null;
    showFeedback: boolean;
    attemptLimit: number;
    createdAt: string;
    questionCount: number;
    totalPoints: number;
  };
  summary: SummaryStats;
  attempts: SerializedAttemptRow[];
};

type ScoreStat = { earnedPoints: number; percentage: number };

function StatCard({
  label,
  value,
  sub,
  tone = "slate",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "slate" | "success" | "warn" | "primary";
}) {
  const tones: Record<string, string> = {
    slate: "text-slate-900",
    success: "text-success-700",
    warn: "text-warn-700",
    primary: "text-primary-700",
  };
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-3xl font-extrabold tracking-tight ${tones[tone]}`}>
        {value}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-500">{sub}</div>
    </div>
  );
}

function formatStat(
  stat: ScoreStat | null,
  totalPoints: number
): { value: string; sub: string } {
  if (!stat) {
    return { value: "—", sub: "aucune note" };
  }
  return {
    value: `${formatScore(stat.earnedPoints)} / ${formatScore(totalPoints)}`,
    sub: formatPercentage(stat.percentage),
  };
}

export function ProfessorResults({ id }: { id: string }) {
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [group, setGroup] = useState<AttemptGroup>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const res = await fetch(`/api/assignments/${id}/results`);
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !json?.ok) {
          setError(
            friendlyApiError(res.status, json?.error, {
              notFound: "Travail introuvable.",
            })
          );
          return;
        }
        setData(json as ResultsPayload);
      } catch {
        if (!cancelled) setError("Erreur réseau. Veuillez réessayer.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, reload]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return filterAttemptsByGroup(data.attempts, group);
  }, [data, group]);

  const sorted = useMemo(
    () => sortAttempts(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <Link
        href="/professeur/travaux"
        className="text-sm font-bold text-primary-700 transition hover:text-primary-800"
      >
        ← Retour aux travaux
      </Link>

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
      ) : !data ? (
        <div className="mt-8 space-y-5">
          <div className="h-40 animate-pulse-soft rounded-3xl bg-white shadow-card" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse-soft rounded-3xl bg-white shadow-card" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold uppercase tracking-wide text-slate-400">
                  {subjectOptionTitle(data.assignment.subjectSlug)} ·{" "}
                  {levelOptionTitle(data.assignment.levelSlug)}
                </div>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {data.assignment.title}
                </h1>
                <div className="mt-1 text-sm font-semibold text-slate-500">
                  {chapterOptionTitle(data.assignment.chapterSlug)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-extrabold tracking-widest text-primary-700">
                  {data.assignment.accessCode}
                </span>
                <AssignmentStatusBadge status={data.assignment.status} />
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Questions
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                  {data.assignment.questionCount}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Total de points
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                  {formatScore(data.assignment.totalPoints)}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Tentatives max
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                  {data.assignment.attemptLimit}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Date limite
                </dt>
                <dd className="mt-0.5 text-sm font-bold text-slate-700">
                  {formatDateTime(data.assignment.dueDate)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Étudiants"
              value={String(data.summary.uniqueStudents)}
              sub={`${data.summary.totalAttempts} tentative${
                data.summary.totalAttempts > 1 ? "s" : ""
              } au total`}
            />
            <StatCard
              label="Soumis"
              value={String(data.summary.submittedAttempts)}
              sub={`${data.summary.inProgressAttempts} en cours`}
              tone="success"
            />
            <StatCard
              label="En cours"
              value={String(data.summary.inProgressAttempts)}
              sub={`${data.summary.submittedAttempts} soumis`}
              tone="warn"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {(() => {
              const avg = formatStat(data.summary.averageScore, data.assignment.totalPoints);
              const max = formatStat(data.summary.highestScore, data.assignment.totalPoints);
              const min = formatStat(data.summary.lowestScore, data.assignment.totalPoints);
              return (
                <>
                  <StatCard label="Moyenne" value={avg.value} sub={avg.sub} tone="primary" />
                  <StatCard label="Maximum" value={max.value} sub={max.sub} tone="success" />
                  <StatCard label="Minimum" value={min.value} sub={min.sub} />
                </>
              );
            })()}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-extrabold text-slate-900">
                Résultats des étudiants
              </h2>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par statut">
                {(
                  [
                    ["all", "Tous"],
                    ["submitted", "Soumis"],
                    ["in_progress", "En cours"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGroup(value)}
                    aria-pressed={group === value}
                    className={`rounded-2xl px-4 py-2 text-sm font-extrabold transition ${
                      group === value
                        ? "bg-primary-600 text-white shadow-lift"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                Trier
                <select
                  value={`${sortKey}:${sortDir}`}
                  onChange={(e) => {
                    const [key, dir] = e.target.value.split(":") as [SortKey, SortDir];
                    setSortKey(key);
                    setSortDir(dir);
                  }}
                  className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                >
                  <option value="date:desc">Date récente</option>
                  <option value="date:asc">Date ancienne</option>
                  <option value="score:desc">Score décroissant</option>
                  <option value="score:asc">Score croissant</option>
                  <option value="name:asc">Nom (A → Z)</option>
                  <option value="name:desc">Nom (Z → A)</option>
                </select>
              </label>
            </div>

            {sorted.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-lg font-extrabold text-slate-700">
                  Aucune tentative ici
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {data.attempts.length === 0
                    ? "Aucun étudiant n'a commencé ce travail pour le moment."
                    : "Aucune tentative ne correspond à ce filtre."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      <th className="px-6 py-3">Étudiant</th>
                      <th className="px-4 py-3">Tentative</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">%</th>
                      <th className="px-4 py-3">Rendu le</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sorted.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-3">
                          <div className="font-extrabold text-slate-900">
                            {a.student.name}
                          </div>
                          <div className="text-xs font-medium text-slate-400">
                            {a.student.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-600">
                          #{a.attemptNumber}
                        </td>
                        <td className="px-4 py-3">
                          <AttemptStatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">
                          {a.score !== null
                            ? `${formatScore(a.score)} / ${formatScore(data.assignment.totalPoints)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-600">
                          {formatPercentage(a.percentage)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-500">
                          {formatDateTime((a.submittedAt ?? a.startedAt) as string)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Link
                            href={`/professeur/travaux/${id}/resultats/${a.id}`}
                            className="rounded-2xl bg-primary-50 px-4 py-2 text-sm font-extrabold text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-100"
                          >
                            Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}