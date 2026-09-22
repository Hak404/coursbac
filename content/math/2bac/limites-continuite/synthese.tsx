import { useState } from "react";
import type { CourseSection } from "./types";
import { ReminderBox, WarningBox } from "@/components/ui/Boxes";
import { TeX } from "@/components/ui/TeX";
import { motion } from "framer-motion";
import { Step, TeacherNote } from "@/components/presentation/presentation";

type Card = {
  front: string;
  icon: string;
  color: string;
  back: React.ReactNode;
};

function FlipCard({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className={`rounded-2xl p-4 shadow-card ring-1 ${card.color} cursor-pointer`}
      onClick={() => setOpen(!open)}
      whileTap={{ scale: 0.98 }}
    >
      {!open ? (
        <div className="text-center">
          <div className="text-3xl">{card.icon}</div>
          <div className="mt-2 text-sm font-bold text-slate-800">{card.front}</div>
          <button type="button" className="mt-2 text-xs font-semibold text-slate-400">
            Clique pour déplier →
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-2 text-sm font-bold text-slate-800">
            {card.icon} {card.front}
          </div>
          <div className="space-y-2 text-[13.5px] leading-relaxed text-slate-700">
            {card.back}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function SyntheseSection() {
  const cards: Card[] = [
    {
      icon: "🎯",
      front: "Définitions clés",
      color: "bg-sky-50 ring-sky-200",
      back: (
        <div className="space-y-1.5">
          <div>
            <TeX>{`\\lim_{x\\to a} f(x) = L`}</TeX> : <TeX>{"f(x)"}</TeX> se rapproche de{" "}
            <TeX>{"L"}</TeX> quand <TeX>{"x"}</TeX> se rapproche de <TeX>{"a"}</TeX> (sans
            lui demander la valeur en <TeX>{"a"}</TeX>).
          </div>
          <div>
            <TeX>{`\\lim_{x\\to a} f(x) = f(a)`}</TeX> ⟺ <TeX>{"f"}</TeX> continue en{" "}
            <TeX>{"a"}</TeX>.
          </div>
          <div>
            <TeX>{`\\lim_{x\\to a^{-}} = \\lim_{x\\to a^{+}} = L`}</TeX> ⟺ limite en{" "}
            <TeX>{"a"}</TeX> vaut <TeX>{"L"}</TeX>.
          </div>
        </div>
      ),
    },
    {
      icon: "♾️",
      front: "Limites infinies",
      color: "bg-violet-50 ring-violet-200",
      back: (
        <div className="space-y-1">
          <div>
            <TeX>{`f(x) \\to 0^{+} \\Rightarrow \\frac{1}{f} \\to +\\infty`}</TeX>
          </div>
          <div>
            <TeX>{`\\lim = +\\infty`}</TeX> en un point ⟺ asymptote verticale.
          </div>
          <div>
            <TeX>{`\\lim_{x\\to\\pm\\infty} f = L`}</TeX> finie ⟺ asymptote horizontale{" "}
            <TeX>{"y=L"}</TeX>.
          </div>
        </div>
      ),
    },
    {
      icon: "🚨",
      front: "Formes indéterminées",
      color: "bg-amber-50 ring-amber-200",
      back: (
        <div className="space-y-1">
          <div>
            Les quatre : <TeX>{`\\infty-\\infty`}</TeX>, <TeX>{`\\dfrac{\\infty}{\\infty}`}</TeX>,{" "}
            <TeX>{`\\dfrac{0}{0}`}</TeX>, <TeX>{`0\\times\\infty`}</TeX>.
          </div>
          <div>Transformation : factorisation (terme dominant), quantité conjuguée, même dénominateur.</div>
          <div className="font-semibold text-amber-700">Une FI ne « vaut » jamais rien.</div>
        </div>
      ),
    },
    {
      icon: "🧮",
      front: "Limites à l'infini (quotients)",
      color: "bg-emerald-50 ring-emerald-200",
      back: (
        <div className="space-y-1">
          <div>
            <TeX>{`\\deg P < \\deg Q`}</TeX> ⟹ <TeX>{`0`}</TeX>
          </div>
          <div>
            <TeX>{`\\deg P = \\deg Q`}</TeX> ⟹ rapport des termes dominants
          </div>
          <div>
            <TeX>{`\\deg P > \\deg Q`}</TeX> ⟹ <TeX>{`\\pm\\infty`}</TeX>
          </div>
        </div>
      ),
    },
    {
      icon: "🪄",
      front: "Continuité & prolongement",
      color: "bg-indigo-50 ring-indigo-200",
      back: (
        <div className="space-y-1">
          <div>Continue en a : définie en a + limite = valeur.</div>
          <div>
            Trou en <TeX>{"a"}</TeX> mais limite finie <TeX>{"L"}</TeX> ⟹ prolonger avec{" "}
            <TeX>{`g(a) = L`}</TeX>.
          </div>
          <div>Limite infinie ⟹ pas de prolongement possible.</div>
        </div>
      ),
    },
    {
      icon: "⚖️",
      front: "TVI & unicité",
      color: "bg-teal-50 ring-teal-200",
      back: (
        <div className="space-y-1">
          <div>
            <TeX>{"f"}</TeX> continue, <TeX>{`k`}</TeX> entre <TeX>{`f(a)`}</TeX> et{" "}
            <TeX>{`f(b)`}</TeX> ⟹ solution de <TeX>{`f(x)=k`}</TeX>.
          </div>
          <div>
            + stricte monotonie ⟹ solution unique.
          </div>
          <div>Dichotomie : on divise la largeur par 2 à chaque étape.</div>
        </div>
      ),
    },
    {
      icon: "🔁",
      front: "Bijection",
      color: "bg-emerald-50 ring-emerald-200",
      back: (
        <div className="space-y-1">
          <div>Continue + strictement monotone sur I ⟹ bijection I → f(I).</div>
          <div>
            Réciproque <TeX>{`f^{-1}`}</TeX> continue, même sens de monotonie.
          </div>
          <div>Courbes symétriques par rapport à <TeX>{"y=x"}</TeX>.</div>
        </div>
      ),
    },
    {
      icon: "🌰",
      front: "Racine n-ième & Arctan",
      color: "bg-sky-50 ring-sky-200",
      back: (
        <div className="space-y-1">
          <div>
            <TeX>{`\\sqrt[n]{\\ }, n \\in \\mathbb{N}^*`}</TeX> : réciproque de{" "}
            <TeX>{`x \\mapsto x^n`}</TeX> sur <TeX>{`\\mathbb{R}^+`}</TeX>.
          </div>
          <div>
            <TeX>{`\\arctan`}</TeX> : réciproque de <TeX>{"\\tan"}</TeX> sur{" "}
            <TeX>{`]-\\frac{\\pi}{2}\\,;\\,\\frac{\\pi}{2}[`}</TeX>.
          </div>
          <div>
            <TeX>{`\\lim_{x\\to\\pm\\infty} \\arctan x = \\pm\\frac{\\pi}{2}`}</TeX>.
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <Step id="sy-definitions" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Une fiche à retenir cliquable : clique sur chaque carte pour déplier son contenu.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.slice(0, 2).map((c) => (
            <FlipCard key={c.front} card={c} />
          ))}
        </div>
      </Step>
      <Step id="sy-risques" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.slice(2, 4).map((c) => (
            <FlipCard key={c.front} card={c} />
          ))}
        </div>
      </Step>
      <Step id="sy-continuite" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.slice(4, 6).map((c) => (
            <FlipCard key={c.front} card={c} />
          ))}
        </div>
      </Step>
      <Step id="sy-fonctions" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.slice(6, 8).map((c) => (
            <FlipCard key={c.front} card={c} />
          ))}
        </div>
      </Step>
      <Step id="sy-bac" className="space-y-4">
        <ReminderBox>
          <p>
            Sur l'épreuve du Bac : l'analyse représente plus de la moitié des points.
            Maîtrise les limites (formes indéterminées, méthode du terme dominant) et la
            continuité (TVI, bijection) pour sécuriser la note.
          </p>
        </ReminderBox>
        <TeacherNote>
          Bilan de séance : demander aux élèves de « goûter » une carte chacun et de la
          reformuler avec leurs mots.
        </TeacherNote>
      </Step>
    </div>
  );
}

type Trap = {
  titre: string;
  erreur: React.ReactNode;
  pourquoi: React.ReactNode;
  correction: React.ReactNode;
  question: React.ReactNode;
  reposes: React.ReactNode[];
  bonIndex: number;
  explication: React.ReactNode;
};

function TrapCard({ trap }: { trap: Trap }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200">
      <div className="mb-2 text-sm font-bold text-slate-800">{trap.titre}</div>
      <div className="space-y-2 text-[14px] leading-relaxed">
        <div className="rounded-xl bg-red-50 px-3 py-2 text-red-800 ring-1 ring-red-200">
          <span className="font-bold">❌ L'erreur :</span> {trap.erreur}
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700 ring-1 ring-slate-200">
          <span className="font-bold">💡 Pourquoi :</span> {trap.pourquoi}
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900 ring-1 ring-emerald-200">
          <span className="font-bold">✅ La correction :</span> {trap.correction}
        </div>
        <div className="pt-1">
          <div className="mb-1.5 text-xs font-bold text-slate-500">Mini-question</div>
          <div className="mb-2 text-[14px]">{trap.question}</div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {trap.reposes.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sel === null && setSel(i)}
                className={`rounded-lg px-3 py-2 text-left text-[13px] ring-1 transition ${
                  sel === null
                    ? "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                    : i === trap.bonIndex
                      ? "bg-emerald-50 font-semibold text-emerald-800 ring-emerald-300"
                      : i === sel
                        ? "bg-red-50 text-red-700 ring-red-300"
                        : "bg-white text-slate-400 ring-slate-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {sel !== null && (
            <div
              className={`mt-2 rounded-lg px-3 py-2 text-[13px] ${
                sel === trap.bonIndex ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
              }`}
            >
              {sel === trap.bonIndex ? "✔ Bien vu ! " : "✘ Attention ! "}
              {trap.explication}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TRAPS: Trap[] = [
  {
    titre: "Piège 1 — Confondre limite et valeur de la fonction",
    erreur: (
      <>
        Dire que la limite en <TeX>{"a"}</TeX> vaut <TeX>{`\\lim_{x\\to a} f(x) = f(a)`}</TeX>{" "}
        à tous les coups.
      </>
    ),
    pourquoi: (
      <>
        La limite ne tient pas compte de <TeX>{`f(a)`}</TeX> : <TeX>{"f"}</TeX> peut même
        ne pas être définie en <TeX>{"a"}</TeX>.
      </>
    ),
    correction: (
      <>
        Calculer la limite d'abord, comparer ensuite à <TeX>{`f(a)`}</TeX>. L'égalité{" "}
        <TeX>{`\\lim f = f(a)`}</TeX> exprime justement la continuité : ce n'est pas
        automatique !
      </>
    ),
    question: (
      <>
        Une fonction <TeX>{"f"}</TeX> telle que <TeX>{`\\lim_{x\\to a} f(x) = 5`}</TeX> et{" "}
        <TeX>{`f(a) = 3`}</TeX>…
      </>
    ),
    reposes: [
      <>…est continue en a</>,
      <>…n'est pas continue en a</>,
      <>…n'a pas de limite en a</>,
    ],
    bonIndex: 1,
    explication: (
      <>
        La limite existe (5) mais diffère de la valeur (3) : le saut rend la fonction
        discontinue en <TeX>{"a"}</TeX>.
      </>
    ),
  },
  {
    titre: "Piège 2 — Donner une valeur à une forme indéterminée",
    erreur: <>
      Écrire <TeX>{`\\infty - \\infty = 0`}</TeX> ou <TeX>{`\\dfrac{\\infty}{\\infty} = 1`}</TeX>.
    </>,
    pourquoi: (
      <>
        <TeX>{`+\\infty`}</TeX> n'est pas un nombre : ces écritures n'ont aucun sens.
      </>
    ),
    correction: (
      <>
        Identifier la FI, puis transformer (factorisation, conjuguée, même dénominateur…)
        avant de convoler.
      </>
    ),
    question: (
      <>
        <TeX>{`\\lim_{x\\to +\\infty} \\big(\\sqrt{x+1} - \\sqrt{x}\\big)`}</TeX> vaut…
      </>
    ),
    reposes: [<>0</>, <><TeX>{`+\\infty`}</TeX></>, <>indéterminée (∞−∞)</>],
    bonIndex: 0,
    explication: (
      <>
        C'est une FI <TeX>{`\\infty-\\infty`}</TeX>, mais après avoir multiplié par la
        quantité conjuguée on trouve <TeX>{`\\dfrac{1}{\\sqrt{x+1}+\\sqrt{x}} \\to 0`}</TeX>.
      </>
    ),
  },
  {
    titre: "Piège 3 — Oublier les limites latérales",
    erreur: (
      <>
        Conclure <TeX>{`\\lim_{x\\to a} f(x)`}</TeX> sans regarder gauche et droite pour
        une fonction définie par morceaux.
      </>
    ),
    pourquoi: (
      <>
        En <TeX>{"a"}</TeX>, une fonction par morceaux change de formule : les deux côtés
        peuvent ne pas concorder.
      </>
    ),
    correction: (
      <>
        <TeX>{`\\lim_{x\\to a^{-}} f(x)`}</TeX> et <TeX>{`\\lim_{x\\to a^{+}} f(x)`}</TeX>{" "}
        séparément, puis comparaison.
      </>
    ),
    question: (
      <>
        <TeX>{`f(x) = \\begin{cases} x & x < 1 \\\\ x+1 & x \\geq 1 \\end{cases}`}</TeX>. En 1…
      </>
    ),
    reposes: [
      <>les deux limites latérales sont égales</>,
      <>gauche = 1, droite = 2 : pas de limite</>,
      <>gauche = 2, droite = 1 : pas de limite</>,
    ],
    bonIndex: 1,
    explication: (
      <>
        À gauche <TeX>{`x \\to 1^{-}`}</TeX> donne 1 ; à droite <TeX>{`x \\to 1^{+}`}</TeX>{" "}
        donne 2. Différence ⟹ pas de limite en 1.
      </>
    ),
  },
  {
    titre: "Piège 4 — Utiliser une propriété sans ses conditions",
    erreur: (
      <>
        Appliquer <TeX>{`\\dfrac{L}{0}`}</TeX> ou la règle du quotient alors que le
        dénominateur s'annule, ou <TeX>{`\\sqrt{g}`}</TeX> avec <TeX>{`g < 0`}</TeX>.
      </>
    ),
    pourquoi: (
      <>
        Les règles sur les limites exigent que les limites d'entrée existent et que les
        dénominateurs ne s'annulent pas.
      </>
    ),
    correction: (
      <>
        Vérifier d'abord le signe du dénominateur, le domaine de définition et la forme
        indéterminée, puis seulement appliquer la règle.
      </>
    ),
    question: (
      <>
        <TeX>{`\\lim_{x\\to 2} \\dfrac{x+1}{x-2}`}</TeX> vaut…
      </>
    ),
    reposes: [<>3/0 = 0</>, <><TeX>{`\\pm\\infty`}</TeX> selon le côté</>, <><TeX>{`\\infty`}</TeX> toujours</>],
    bonIndex: 1,
    explication: (
      <>
        À gauche dénominateur → <TeX>{`0^{-}`}</TeX> ⟹ limite <TeX>{`-\\infty`}</TeX> ; à
        droite <TeX>{`0^{+}`}</TeX> ⟹ <TeX>{`+\\infty`}</TeX>. La limite n'existe pas !
      </>
    ),
  },
  {
    titre: "Piège 5 — Conclure à la continuité sans vérifier la limite",
    erreur: (
      <>
        Dire « f est définie en a donc elle est continue en a ».
      </>
    ),
    pourquoi: (
      <>
        Être définie n'empêche pas un trou ou un saut en <TeX>{"a"}</TeX>.
      </>
    ),
    correction: (
      <>
        Vérifier que <TeX>{`\\lim_{x\\to a} f(x)`}</TeX> existe ET vaut <TeX>{`f(a)`}</TeX> :
        conditions 2 et 3 de la continuité.
      </>
    ),
    question: (
      <>
        <TeX>{`f(x) = \\begin{cases} x^2 & x \\neq 3 \\\\ 10 & x = 3 \\end{cases}`}</TeX> en 3…
      </>
    ),
    reposes: [
      <>est continue (définie en 3)</>,
      <>n'est pas continue car limite 9 ≠ f(3) = 10</>,
      <>est discontinue car non définie</>,
    ],
    bonIndex: 1,
    explication: (
      <>
        <TeX>{`\\lim = 9`}</TeX> mais <TeX>{`f(3) = 10`}</TeX> : l'égalité est violée, il y a
        un trou « décalé ».
      </>
    ),
  },
];

function PiegesSection() {
  return (
    <div className="space-y-5">
      <Step id="pg-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Les cinq erreurs les plus fréquentes le jour de l'examen. Entraîne-toi à les
          reconnaître : lire un piège, c'est déjà éviter de tomber dedans.
        </p>
      </Step>
      <Step id="pg-cards" className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-2">
          {TRAPS.map((t) => (
            <TrapCard key={t.titre} trap={t} />
          ))}
        </div>
      </Step>
      <Step id="pg-memo" className="space-y-4">
        <WarningBox>
          <p>
            Au Bac, une limite « piégeuse » rapporte souvent 2 à 3 points. Répète ces
            réflexes : identifier, transformer, vérifier les conditions.
          </p>
        </WarningBox>
        <TeacherNote>
          Projeter un piège à la fois et organiser un vote à main levée : les élèves
          expliquent ensuite pourquoi la bonne réponse est correcte.
        </TeacherNote>
      </Step>
    </div>
  );
}

export const syntheseSection: CourseSection = {
  id: "synthese",
  number: 19,
  title: "Synthèse : fiches à retenir",
  category: "fonctions",
  Component: SyntheseSection,
};

export const piegesSection: CourseSection = {
  id: "pieges",
  number: 20,
  title: "Pièges à éviter",
  category: "entrainement",
  Component: PiegesSection,
};