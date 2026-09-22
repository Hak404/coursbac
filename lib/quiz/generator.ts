export type GeneratedQuestion = {
  chapterSlug: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  variableParams: Record<string, number | string>;
};

type VariableParams = Record<string, number | string>;

type Template = () => {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  variableParams: VariableParams;
};

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function optionize(
  correctValue: string,
  distractors: string[]
): { options: string[]; correctOptionIndex: number } {
  const uniqueDistractors = Array.from(
    new Set([correctValue, ...distractors])
  ).filter((v) => v !== correctValue);
  const options = shuffle([correctValue, ...uniqueDistractors]);
  return { options, correctOptionIndex: options.indexOf(correctValue) };
}

function fmt(n: number): string {
  return `${Math.round(n * 100) / 100}`;
}

const MATH_TEMPLATES: Template[] = [
  () => {
    const a = randInt(2, 6);
    const correct = `${2 * a}`;
    const { options, correctOptionIndex } = optionize(correct, [
      `${a}`,
      `${a * a}`,
      "2",
    ]);
    return {
      questionText: `Calculer lim x→${a} (x² − ${a * a}) / (x − ${a}).`,
      options,
      correctOptionIndex,
      variableParams: { kind: "quotient", a },
    };
  },
  () => {
    const a = randInt(1, 5);
    const b = randInt(1, 9);
    const c = randInt(1, 5);
    const d = randInt(1, 9);
    const correct = `${a}/${c}`;
    const { options, correctOptionIndex } = optionize(correct, [
      `${a}/${c + 1}`,
      `${a + 1}/${c}`,
      "0",
    ]);
    return {
      questionText: `Calculer lim x→+∞ (${a}x² + ${b}) / (${c}x² + ${d}).`,
      options,
      correctOptionIndex,
      variableParams: { kind: "infini-rationnel", a, b, c, d },
    };
  },
  () => {
    const k = randInt(1, 5);
    const correct = `${k}`;
    const { options, correctOptionIndex } = optionize(correct, [
      "1",
      `${k * k}`,
      "0",
    ]);
    return {
      questionText: `Calculer lim x→0 sin(${k}x) / x.`,
      options,
      correctOptionIndex,
      variableParams: { kind: "sinus", k },
    };
  },
  () => {
    const k = randInt(3, 7);
    const correct = `${k}`;
    const { options, correctOptionIndex } = optionize(correct, [
      `${k - 1}`,
      `${k + 1}`,
      "1",
    ]);
    return {
      questionText: `Calculer lim x→+∞ (${k} − 5/x).`,
      options,
      correctOptionIndex,
      variableParams: { kind: "polynome-infini", k },
    };
  },
  () => {
    const k = randInt(2, 5);
    const correct = `e^${k}`;
    const { options, correctOptionIndex } = optionize(correct, [
      `${k}`,
      "1",
      "e",
    ]);
    return {
      questionText: `Calculer lim x→+∞ (1 + ${k}/x)^x.`,
      options,
      correctOptionIndex,
      variableParams: { kind: "limite-exponentielle", k },
    };
  },
  () => {
    const c = randInt(1, 4);
    const continuous = Math.random() < 0.5;
    const d = continuous ? 9 - c : 9 - c + 1;
    const correct = continuous ? "Oui" : "Non";
    const { options, correctOptionIndex } = optionize(correct, [
      continuous ? "Non" : "Oui",
    ]);
    return {
      questionText: `La fonction f définie par f(x) = x² − ${c} si x ≤ 3 et f(x) = ${d} si x > 3 est-elle continue en 3 ?`,
      options,
      correctOptionIndex,
      variableParams: { kind: "continuite", c, d },
    };
  },
];

const PHYSIQUE_TEMPLATES: Template[] = [
  () => {
    const c1 = randInt(3, 8);
    const c2 = randInt(1, c1 - 1);
    const dt = randInt(2, 10);
    const correct = fmt((c1 - c2) / dt);
    const { options, correctOptionIndex } = optionize(correct, [
      fmt(c1 - c2),
      fmt((c1 - c2) / dt / 2),
      fmt(dt),
    ]);
    return {
      questionText: `La concentration d'un réactif passe de ${c1} mol·L⁻¹ à ${c2} mol·L⁻¹ en ${dt} min. Calculez la vitesse moyenne de disparition (mol·L⁻¹·min⁻¹).`,
      options,
      correctOptionIndex,
      variableParams: { kind: "vitesse-moyenne", c1, c2, dt },
    };
  },
  () => {
    const v = randInt(1, 5);
    const dt = randInt(2, 6);
    const dC = v * dt;
    const correct = `${dt}`;
    const { options, correctOptionIndex } = optionize(correct, [
      `${v}`,
      `${dC}`,
      `${dC * 2}`,
    ]);
    return {
      questionText: `La vitesse moyenne vaut ${v} mol·L⁻¹·min⁻¹ et la variation de concentration du réactif est de ${dC} mol·L⁻¹. Quelle est la durée de la transformation (min) ?`,
      options,
      correctOptionIndex,
      variableParams: { kind: "duree", v, dt, dC },
    };
  },
  () => {
    const correct = "La combustion du gaz";
    const { options, correctOptionIndex } = optionize(correct, [
      "La rouille du fer",
      "La digestion des aliments",
      "La formation des stalactites",
    ]);
    return {
      questionText:
        "Parmi ces transformations chimiques, laquelle est rapide ?",
      options,
      correctOptionIndex,
      variableParams: { kind: "rapide" },
    };
  },
  () => {
    const correct = "L'eau chaude";
    const { options, correctOptionIndex } = optionize(correct, [
      "L'eau froide",
    ]);
    return {
      questionText:
        "Dans quelle eau le sucre se dissout-il le plus rapidement ?",
      options,
      correctOptionIndex,
      variableParams: { kind: "dissolution" },
    };
  },
  () => {
    const n = randInt(2, 8);
    const t = randInt(2, 10);
    const correct = fmt(n / t);
    const { options, correctOptionIndex } = optionize(correct, [
      fmt(n),
      fmt(t),
      fmt(n * t),
    ]);
    return {
      questionText: `Une quantité de matière ${n} mol d'un produit se forme en ${t} s. Calculez la vitesse de formation (mol·s⁻¹).`,
      options,
      correctOptionIndex,
      variableParams: { kind: "vitesse-formation", n, t },
    };
  },
  () => {
    const correct = "L'abandon de la catalyse";
    const { options, correctOptionIndex } = optionize(correct, [
      "L'augmentation de la température",
      "L'augmentation de la concentration",
      "L'augmentation de la surface de contact",
    ]);
    return {
      questionText:
        "Lequel de ces facteurs ne permet PAS d'accélérer une transformation chimique ?",
      options,
      correctOptionIndex,
      variableParams: { kind: "facteurs-rapidite" },
    };
  },
];

const GENERIC_TEMPLATES: Template[] = [
  () => {
    const a = randInt(2, 6);
    const correct = `${a * 2}`;
    const { options, correctOptionIndex } = optionize(correct, [
      `${a}`,
      `${a * a}`,
      "3",
    ]);
    return {
      questionText: `Double de ${a} ?`,
      options,
      correctOptionIndex,
      variableParams: { kind: "generique" },
    };
  },
];

const TEMPLATES: Record<string, Template[]> = {
  "limites-continuite": MATH_TEMPLATES,
  "transformations-lentes-rapides": PHYSIQUE_TEMPLATES,
};

export const QUIZ_CHAPTER_SLUGS = Object.keys(TEMPLATES);

export function supportsQuiz(chapterSlug: string): boolean {
  return chapterSlug in TEMPLATES;
}

export function generateQuestions(
  chapterSlug: string,
  count: number
): GeneratedQuestion[] {
  const templates = TEMPLATES[chapterSlug] ?? GENERIC_TEMPLATES;
  const safeCount = Math.max(1, Math.min(10, Math.round(count)));
  const list: GeneratedQuestion[] = [];
  for (let i = 0; i < safeCount; i++) {
    const template = templates[i % templates.length];
    const q = template();
    list.push({ ...q, chapterSlug });
  }
  return list;
}

export function randomQuizCode(existing: Set<string> = new Set()): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const code = `${randInt(100000, 999999)}`;
    if (!existing.has(code)) return code;
  }
  return `${randInt(100000, 999999)}`;
}