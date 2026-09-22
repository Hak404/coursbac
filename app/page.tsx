import Link from "next/link";
import {
  LEVELS_META,
  courseHref,
  presentationHref,
} from "@/lib/content/registry";
import { CourseAction } from "@/components/home/CourseAction";

const LEVEL_DETAILS: Record<
  string,
  { description: string; cta: { label: string; href: string } }
> = {
  "5eme": {
    description:
      "Les bases des mathématiques et des sciences pour la 5ème année primaire, expliquées simplement et pas à pas.",
    cta: { label: "Découvrir", href: "/inscription" },
  },
  "1bac": {
    description:
      "Approfondissez le programme de la 1ère année du baccalauréat sciences expérimentales avec des séances guidées.",
    cta: { label: "Découvrir", href: "/inscription" },
  },
  "2bac": {
    description:
      "Limites et continuité, transformations lentes et rapides : révisons les chapitres clés de l'examen national.",
    cta: {
      label: "Voir les cours",
      href: courseHref({
        subjectSlug: "math",
        levelSlug: "2bac",
        slug: "limites-continuite",
      }),
    },
  },
};

const FEATURES = [
  {
    title: "Leçons pas à pas",
    description:
      "Chaque chapitre est découpé en étapes : notions, propriétés, exemples — à votre rythme.",
    icon: "📖",
  },
  {
    title: "Graphes dynamiques",
    description:
      "Visualisez les fonctions et les transformations avec des graphiques interactifs en direct.",
    icon: "📈",
  },
  {
    title: "Exercices auto-corrigés",
    description:
      "Entraînez-vous avec des exercices intensifs et des corrections immédiates, étape par étape.",
    icon: "✏️",
  },
  {
    title: "Mode présentation",
    description:
      "Projetez vos séances en classe avec un mode diaporama conçu pour les enseignants.",
    icon: "🎬",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Ustadi
            </span>
            <span className="hidden text-xs font-semibold text-slate-400 sm:inline">
              Cours interactifs
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
            <a href="#niveaux" className="transition hover:text-primary-700">
              Niveaux
            </a>
            <a href="#fonctionnalites" className="transition hover:text-primary-700">
              Fonctionnalités
            </a>
            <a href="#enseignants" className="transition hover:text-primary-700">
              Professeurs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5">
        <section className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
                Mathématiques
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                Physique-Chimie
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                Programme officiel marocain
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
              Apprendre les sciences,{" "}
              <span className="text-primary-700">étape par étape</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Ustadi transforme les chapitres de mathématiques et de
              physique-chimie en séances interactives : explications guidées,
              graphes dynamiques, exercices auto-corrigés et mode présentation
              pour la classe.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CourseAction
                variant="course"
                href={courseHref({
                  subjectSlug: "math",
                  levelSlug: "2bac",
                  slug: "limites-continuite",
                })}
                className="rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
              >
                Explorer un chapitre
              </CourseAction>
              <CourseAction
                variant="presentation"
                href={presentationHref({
                  subjectSlug: "math",
                  levelSlug: "2bac",
                  slug: "limites-continuite",
                })}
                className="rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Mode présentation
              </CourseAction>
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="pb-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Conçu pour la réussite
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Tout le nécessaire pour apprendre en autonomie ou enseigner en
            classe, dans une seule plateforme.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  <span aria-hidden>{f.icon}</span>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="niveaux" className="pb-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Des programmes par niveau
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Du primaire au baccalauréat : choisissez votre niveau pour retrouver
            les chapitres du programme officiel.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {Object.entries(LEVELS_META).map(([slug, meta]) => {
              const detail = LEVEL_DETAILS[slug];
              return (
                <div
                  key={slug}
                  className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-card"
                >
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary-700">
                    {meta.short}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                    {meta.label}
                  </h3>
                  <div className="flex flex-1 flex-col">
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {detail?.description}
                    </p>
                    {detail?.cta.href.startsWith("/cours") ||
                    detail?.cta.href.startsWith("/presentation") ? (
                      <CourseAction
                        variant="course"
                        href={detail?.cta.href ?? "/inscription"}
                        className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-slate-800"
                      >
                        {detail?.cta.label ?? "Découvrir"}
                      </CourseAction>
                    ) : (
                      <Link
                        href={detail?.cta.href ?? "/inscription"}
                        className="mt-5 inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-slate-800"
                      >
                        {detail?.cta.label ?? "Découvrir"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="enseignants" className="pb-20">
          <div className="grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card">
              <h2 className="text-lg font-extrabold text-slate-900">
                Espace enseignant
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Gérez vos chapitres par matière et niveau, projetez vos séances
                interactives en classe et accédez aux outils de présentation.
              </p>
              <Link
                href="/connexion"
                className="mt-4 inline-block rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-primary-700"
              >
                Accéder à l&apos;espace
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card">
              <h2 className="text-lg font-extrabold text-slate-900">
                Espace élève
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Suivez les chapitres de votre niveau avec des exercices guidés,
                des quiz et des visualisations dynamiques.
              </p>
              <Link
                href="/inscription"
                className="mt-4 inline-block rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-sky-800"
              >
                Créer un compte élève
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row">
          <div className="text-sm font-extrabold tracking-tight text-slate-900">
            Ustadi
          </div>
          <p className="text-center text-xs text-slate-400">
            Programme officiel marocain · 5ème Année Primaire · 1ère Baccalauréat
            · 2ème Baccalauréat Sciences Physiques
          </p>
        </div>
      </footer>
    </div>
  );
}