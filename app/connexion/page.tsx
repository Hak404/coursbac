"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function dashboardFor(user?: {
    role?: string | null;
    isApproved?: boolean | null;
  }) {
    if (user?.role === "STUDENT") return "/etudiant";
    if (user?.role === "PROFESSOR" && user.isApproved === false) {
      return "/en-attente";
    }
    return "/professeur";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email ou mot de passe incorrect.");
        return;
      }
      const session = await getSession();
      const redirectTo = searchParams.get("redirect");
      const from = searchParams.get("from");
      const target =
        redirectTo && redirectTo.startsWith("/")
          ? redirectTo
          : from && from.startsWith("/")
          ? from
          : dashboardFor(session?.user);
      router.push(target);
    });
  }

  const redirectTo = searchParams.get("redirect");
  const banner =
    redirectTo &&
    (redirectTo.startsWith("/cours/") || redirectTo.startsWith("/presentation/"));

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md">
        {banner && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            👋 Veuillez vous connecter pour accéder aux cours et au mode
            présentation.
          </div>
        )}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Connectez-vous pour accéder à votre espace enseignant ou élève.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-card"
        >
          <label className="block text-sm font-bold text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500"
            />
          </label>

          <label className="mt-4 block text-sm font-bold text-slate-700">
            Mot de passe
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full rounded-2xl bg-primary-600 px-6 py-3 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:opacity-50"
          >
            {isPending ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-bold text-primary-700">
            Créer un compte
          </Link>
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-center text-xs text-slate-500">
          Accès démo — <strong>prof.math@coursbac.ma</strong> /{" "}
          <strong>prof.pc@coursbac.ma</strong> / <strong>eleve@coursbac.ma</strong>
          <br />
          Mot de passe : <strong>password123</strong>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  );
}