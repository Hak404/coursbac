"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  friendlyApiError,
  isValidAccessCodeFormat,
  normalizeAccessCode,
  saveAssignmentPreview,
} from "@/lib/assignments/student-ui";

export function StudentAssignmentJoin() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onCodeChange(value: string) {
    setError(null);
    setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const clean = normalizeAccessCode(code);
    if (!isValidAccessCodeFormat(clean)) {
      setError("Code invalide. Le code contient 6 caractères (lettres et chiffres, sans 0 ni 1).");
      return;
    }
    setJoining(true);
    try {
      const res = await fetch("/api/assignments/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: clean }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(
          friendlyApiError(res.status, data?.error, {
            notFound:
              "Aucun travail ne correspond à ce code. Vérifiez le code entré ou demandez-le à votre professeur.",
          })
        );
        return;
      }
      saveAssignmentPreview(data);
      router.push(`/etudiant/travaux/${data.assignment.id}`);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-10 sm:pt-14">
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
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9"
      >
        <div className="text-sm font-bold uppercase tracking-wide text-primary-700">
          Rejoindre un travail
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Saisissez le code
        </h1>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-600">
          Entrez le code à 6 caractères fourni par votre professeur pour voir le travail et le
          commencer.
        </p>

        <form onSubmit={onSubmit} className="mt-7" noValidate>
          <label htmlFor="access-code" className="sr-only">
            Code du travail
          </label>
          <input
            id="access-code"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="EX : ABC234"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            disabled={joining}
            className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-mono text-2xl font-extrabold tracking-[0.4em] text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-60"
          />

          {error ? (
            <p role="alert" className="mt-3 rounded-2xl bg-danger-50 px-4 py-3 text-sm font-bold text-danger-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={joining}
            className="mt-6 w-full rounded-2xl bg-primary-600 px-6 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60"
          >
            {joining ? "Vérification…" : "Rejoindre le travail"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}