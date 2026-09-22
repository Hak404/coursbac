"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function PendingApproval() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">
          <span aria-hidden>⏳</span>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
          Compte en cours de vérification
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Votre compte professeur est en cours de vérification par
          l&apos;administration. Vous recevrez l&apos;accès à votre espace dès
          son approbation.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block w-full rounded-2xl bg-primary-600 px-6 py-3 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
        >
          Retour à l&apos;accueil
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}