"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { SUBJECTS_META, LEVELS_META } from "@/lib/content/registry";

type FormRole = "PROFESSOR" | "STUDENT";

export default function InscriptionPage() {
  const router = useRouter();
  const [role, setRole] = useState<FormRole>("PROFESSOR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subjects, setSubjects] = useState<string[]>(["math"]);
  const [levels, setLevels] = useState<string[]>(["2bac"]);
  const [studentLevel, setStudentLevel] = useState("2bac");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(
      list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const body =
        role === "PROFESSOR"
          ? { name, email, password, role, subjects, levels }
          : { name, email, password, role, studentLevel };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Erreur lors de l'inscription.");
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      const session = await getSession();
      const u = session?.user;
      if (u?.role === "PROFESSOR" && u.isApproved === false) {
        router.push("/en-attente");
      } else {
        router.push(u?.role === "STUDENT" ? "/etudiant" : "/professeur");
      }
    });
  }

  const roleTab = (value: FormRole, label: string) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
        role === value
          ? "bg-primary-600 text-white shadow-lift"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Inscription
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Rejoignez la plateforme en tant qu'enseignant ou élève.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-card"
        >
          <div className="flex gap-2">{roleTab("PROFESSOR", "Professeur")}{roleTab("STUDENT", "Élève")}</div>

          <label className="mt-5 block text-sm font-bold text-slate-700">
            Nom complet
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500"
            />
          </label>

          <label className="mt-4 block text-sm font-bold text-slate-700">
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500"
            />
          </label>

          {role === "PROFESSOR" ? (
            <>
              <fieldset className="mt-5">
                <legend className="text-sm font-bold text-slate-700">Matières enseignées</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(SUBJECTS_META).map(([slug, meta]) => (
                    <label key={slug} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subjects.includes(slug)}
                        onChange={() => toggle(subjects, slug, setSubjects)}
                        className="peer sr-only"
                      />
                      <span className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-800">
                        {meta.title}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-4">
                <legend className="text-sm font-bold text-slate-700">Niveaux enseignés</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(LEVELS_META).map(([slug, meta]) => (
                    <label key={slug} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={levels.includes(slug)}
                        onChange={() => toggle(levels, slug, setLevels)}
                        className="peer sr-only"
                      />
                      <span className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-800">
                        {meta.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          ) : (
            <label className="mt-5 block text-sm font-bold text-slate-700">
              Niveau scolaire
              <select
                value={studentLevel}
                onChange={(e) => setStudentLevel(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500"
              >
                {Object.entries(LEVELS_META).map(([slug, meta]) => (
                  <option key={slug} value={slug}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
          )}

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
            {isPending ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-bold text-primary-700">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}