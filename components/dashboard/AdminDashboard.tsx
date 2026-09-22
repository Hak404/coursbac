"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { subjectTitle, levelLabel } from "@/lib/content/registry";

type ProfessorRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isApproved: boolean;
  subjects: string[];
  levels: string[];
};

export function AdminDashboard() {
  const [professors, setProfessors] = useState<ProfessorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/professors", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Impossible de charger la liste.");
      setProfessors([]);
    } else {
      setError(null);
      setProfessors(data.professors);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function approve(id: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/professors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professorId: id }),
      });
      if (!res.ok) {
        setError("Impossible d'approuver ce compte.");
      } else {
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  const pending = professors.filter((p) => !p.isApproved);
  const approved = professors.filter((p) => p.isApproved);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              Administration
            </div>
            <div className="text-sm font-medium text-slate-500">
              Gestion des comptes professeurs
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Administrateur
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Comptes professeurs <span aria-hidden>🛡️</span>
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Approuvez les nouveaux enseignants pour leur débloquer l&apos;accès à
            leur espace.
          </p>
        </motion.div>

        {loading && (
          <p className="mt-10 text-sm font-medium text-slate-400">
            Chargement…</p>
        )}
        {error && (
          <p className="mt-10 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-3xl font-extrabold text-amber-700">
              {pending.length}
            </div>
            <div className="mt-1 text-sm font-bold text-amber-800">
              En attente
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="text-3xl font-extrabold text-emerald-700">
              {approved.length}
            </div>
            <div className="mt-1 text-sm font-bold text-emerald-800">
              Approuvés
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="text-3xl font-extrabold text-slate-700">
              {professors.length}
            </div>
            <div className="mt-1 text-sm font-bold text-slate-500">Total</div>
          </div>
        </div>

        {!loading && pending.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-400">
            Aucun compte professeur en attente d&apos;approbation.
          </div>
        )}

        <div className="mt-8 grid max-w-3xl gap-6">
          {pending.map((p, i) => (
            <motion.section
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.08 }}
            >
              <div className="rounded-3xl border border-amber-200 bg-white p-7 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-slate-500">
                      {p.email}
                    </div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {p.subjects.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                        >
                          {subjectTitle(s)}
                        </span>
                      ))}
                      {p.levels.map((l) => (
                        <span
                          key={l}
                          className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700"
                        >
                          {levelLabel(l)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      En attente
                    </span>
                    <button
                      type="button"
                      disabled={busy === p.id}
                      onClick={() => approve(p.id)}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white shadow-lift transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busy === p.id ? "…" : "Approuver"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {approved.length > 0 && (
          <div className="mt-12 max-w-3xl">
            <h2 className="text-lg font-extrabold text-slate-900">
              Professeurs approuvés
            </h2>
            <div className="mt-3 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white shadow-card">
              {approved.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500">{p.email}</div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    ✓ Approuvé
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Ustadi · Administration
      </footer>
    </div>
  );
}