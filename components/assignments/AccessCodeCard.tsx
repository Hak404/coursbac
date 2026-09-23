"use client";

import { useState } from "react";
import type { Assignment } from "@/lib/assignments/professor-ui";
import {
  copyTextToClipboard,
  formatDueDate,
} from "@/lib/assignments/professor-ui";

export function AccessCodeCard({ assignment }: { assignment: Assignment }) {
  const [copied, setCopied] = useState(false);
  const isClosed = assignment.status === "CLOSED";

  async function copy() {
    const ok = await copyTextToClipboard(assignment.accessCode);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-success-200 bg-white shadow-card">
      <div className="bg-success-50 px-7 py-5 sm:px-9">
        <div className="text-sm font-extrabold uppercase tracking-wide text-success-700">
          {isClosed ? "Travail fermé ✕" : "Travail publié ✓"}
        </div>
        <div className="mt-1 text-lg font-extrabold text-slate-900">
          {isClosed
            ? "Les étudiants ne peuvent plus démarrer ce travail."
            : "Partagez ce code avec vos étudiants."}
        </div>
      </div>

      <div className="px-7 py-6 sm:px-9">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Code d'accès
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-4 font-mono text-3xl font-extrabold tracking-[0.25em] text-slate-900">
            {assignment.accessCode}
          </div>
          <button
            type="button"
            onClick={copy}
            className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
          >
            {copied ? "Code copié ✓" : "Copier le code"}
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
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
        </dl>
      </div>
    </div>
  );
}