"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  chapterOptionTitle,
  formatDate,
  levelOptionTitle,
  subjectOptionTitle,
} from "@/lib/assignments/professor-ui";
import {
  formatPercentage,
  formatScore,
} from "@/lib/assignments/professor-results";
import {
  filterHistoryAttempts,
  groupHistoryByProgress,
  historyActionLabel,
  isAttemptInProgress,
  type HistoryAssignment,
  type HistoryFilter,
  type StudentHistoryPayload,
} from "@/lib/assignments/student-history";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { AttemptStatusBadge } from "@/components/assignments/AttemptStatusBadge";

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "in_progress", label: "En cours" },
  { value: "submitted", label: "Soumis" },
  { value: "graded", label: "Corrigé" },
];

type LoadState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "ready"; payload: StudentHistoryPayload };

function attemptDate(value: Date | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return formatDate(typeof value === "string" ? value : value.toISOString());
}

export function StudentAssignmentHistory() {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const load = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/assignments/history", { cache: "no-store" });
      const json = (await res.json()) as {
        ok?: boolean;
        assignments?: StudentHistoryPayload["assignments"];
      };
      if (!res.ok || !json || json.ok !== true || !Array.isArray(json.assignments)) {
        throw new Error("invalid history response");
      }
      setState({ phase: "ready", payload: { assignments: json.assignments } });
    } catch {
      setState({ phase: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          Historique de mes travaux
        </h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                filter === f.value
                  ? "bg-primary-600 text-white shadow-lift"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {state.phase === "loading" && <LoadingState />}
      {state.phase === "error" && <ErrorState onRetry={() => void load()} />}
      {state.phase === "ready" && (
        <ReadyState payload={state.payload} filter={filter} />
      )}
    </div>
  );
}

function ReadyState({
  payload,
  filter,
}: {
  payload: StudentHistoryPayload;
  filter: HistoryFilter;
}) {
  if (filter !== "all") {
    const assignments = filterHistoryAttempts(payload.assignments, filter);
    if (assignments.length === 0) return <EmptyState />;
    const label = FILTERS.find((f) => f.value === filter)?.label ?? "Résultats";
    return (
      <Section title={label}>
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
        ))}
      </Section>
    );
  }

  const { inProgress, completed } = groupHistoryByProgress(payload);
  if (inProgress.length === 0 && completed.length === 0) return <EmptyState />;
  return (
    <>
      {inProgress.length > 0 && (
        <Section title="Travaux en cours">
          {inProgress.map((assignment) => (
            <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
          ))}
        </Section>
      )}
      {completed.length > 0 && (
        <Section title="Travaux terminés">
          {completed.map((assignment) => (
            <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
          ))}
        </Section>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="mt-4 space-y-5">{children}</div>
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: HistoryAssignment }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wide text-primary-700">
            {subjectOptionTitle(assignment.subjectSlug)} ·{" "}
            {levelOptionTitle(assignment.levelSlug)}
          </div>
          <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
            {assignment.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Chapitre : {chapterOptionTitle(assignment.chapterSlug)}
          </p>
        </div>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      <div className="mt-5 space-y-3">
        {assignment.attempts.map((attempt) => {
          const inProgress = isAttemptInProgress(attempt.status);
          const href = inProgress
            ? `/etudiant/travaux/${assignment.assignmentId}/attempt/${attempt.attemptId}`
            : `/etudiant/travaux/${assignment.assignmentId}/attempt/${attempt.attemptId}/results`;
          const score =
            attempt.score !== null && attempt.score !== undefined
              ? `${formatScore(attempt.score)} / ${formatScore(assignment.totalPoints)}`
              : "—";
          return (
            <div
              key={attempt.attemptId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
                  Tentative #{attempt.attemptNumber}
                </span>
                <AttemptStatusBadge status={attempt.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="font-extrabold text-slate-900">{score}</span>
                <span className="text-slate-500">{formatPercentage(attempt.percentage)}</span>
                <span className="text-slate-500">
                  {attemptDate(attempt.submittedAt ?? attempt.startedAt)}
                </span>
                <Link
                  href={href}
                  className="inline-flex items-center rounded-2xl bg-primary-600 px-4 py-2 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
                >
                  {historyActionLabel(attempt.status)}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="mt-6 space-y-4" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
        >
          <div className="h-3 w-36 rounded bg-slate-200" />
          <div className="mt-3 h-5 w-72 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-48 rounded bg-slate-200" />
          <div className="mt-5 h-16 rounded-2xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="text-base font-bold text-slate-700">
        Impossible de charger l’historique.
      </div>
      <p className="mt-2 text-sm font-medium text-slate-400">
        Veuillez réessayer dans un instant.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
      >
        Réessayer
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="text-base font-bold text-slate-700">
        Aucun travail effectué pour le moment.
      </div>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
        Rejoignez un travail avec son code d’accès.
      </p>
      <Link
        href="/etudiant/travaux/join"
        className="mt-5 inline-flex items-center rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
      >
        Rejoindre un travail
      </Link>
    </div>
  );
}