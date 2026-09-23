"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { QuestionBank } from "@/components/assignments/QuestionBank";
import { SelectedQuestions } from "@/components/assignments/SelectedQuestions";
import { ConfirmDialog } from "@/components/assignments/ConfirmDialog";
import { visibleChapters } from "@/lib/auth/session";
import { CHAPTERS_META } from "@/lib/content/registry";
import type { Session } from "@/lib/auth/session";
import {
  EMPTY_FORM,
  allChapterOptions,
  buildAssignmentPayload,
  chaptersForSelection,
  draftHasChanges,
  draftToForm,
  draftToSelected,
  distinctSubjects,
  formIsValid,
  levelOptionTitle,
  levelsForSubject,
  subjectOptionTitle,
  toggleQuestion,
  validateForm,
} from "@/lib/assignments/professor-ui";
import type {
  Assignment,
  AssignmentFormState,
  AssignmentPayload,
  BankQuestion,
  FormErrors,
  SelectedQuestionEntry,
} from "@/lib/assignments/professor-ui";

type SaveFn = (payload: AssignmentPayload) => Promise<string | null>;
type PublishFn = () => Promise<string | null>;

export function AssignmentForm({
  mode,
  initial,
  session,
  autoOpenPublish = false,
  onSave,
  onPublish,
}: {
  mode: "create" | "edit";
  initial: Assignment | null;
  session: Session;
  autoOpenPublish?: boolean;
  onSave: SaveFn;
  onPublish: PublishFn;
}) {
  const [form, setForm] = useState<AssignmentFormState>(() =>
    initial ? draftToForm(initial) : EMPTY_FORM
  );
  const [selected, setSelected] = useState<SelectedQuestionEntry[]>(() =>
    initial ? draftToSelected(initial) : []
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const didAutoPublish = useRef(false);

  const chapterOptionsAll = useMemo(() => {
    const visible = visibleChapters(Object.values(CHAPTERS_META), session);
    const allowed = new Set(visible.map((c) => c.slug));
    const scoped = allChapterOptions().filter((o) => allowed.has(o.slug));
    return scoped.length > 0 ? scoped : allChapterOptions();
  }, [session]);

  const subjects = useMemo(
    () => distinctSubjects(chapterOptionsAll),
    [chapterOptionsAll]
  );
  const levels = useMemo(
    () => levelsForSubject(chapterOptionsAll, form.subjectSlug),
    [chapterOptionsAll, form.subjectSlug]
  );
  const chapterOptions = useMemo(
    () => chaptersForSelection(chapterOptionsAll, form.subjectSlug, form.levelSlug),
    [chapterOptionsAll, form.subjectSlug, form.levelSlug]
  );

  const dirty =
    mode === "edit" && initial ? draftHasChanges(initial, form, selected) : false;

  useEffect(() => {
    if (mode !== "edit") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, mode]);

  useEffect(() => {
    if (form.subjectSlug && !form.levelSlug && levels.length === 1) {
      setForm((f) => ({ ...f, levelSlug: levels[0] }));
    }
  }, [form.subjectSlug, form.levelSlug, levels]);

  useEffect(() => {
    if (form.subjectSlug && form.levelSlug && !form.chapterSlug && chapterOptions.length === 1) {
      setForm((f) => ({ ...f, chapterSlug: chapterOptions[0].slug }));
    }
  }, [form.subjectSlug, form.levelSlug, form.chapterSlug, chapterOptions]);

  useEffect(() => {
    if (
      !didAutoPublish.current &&
      autoOpenPublish &&
      mode === "edit"
    ) {
      didAutoPublish.current = true;
      setPublishOpen(true);
    }
  }, [autoOpenPublish, mode]);

  function onToggleQuestion(question: BankQuestion) {
    setSelected((prev) => toggleQuestion(prev, question));
  }

  function validate(): boolean {
    const errs = validateForm(form);
    setErrors(errs);
    return formIsValid(errs);
  }

  async function handleSave() {
    if (!validate()) return;
    setServerError(null);
    setIsSaving(true);
    const err = await onSave(buildAssignmentPayload(form, selected));
    setIsSaving(false);
    if (err) setServerError(err);
  }

  async function openPublish() {
    setServerError(null);
    if (selected.length === 0) {
      setServerError("Ajoutez au moins une question avant de publier.");
      return;
    }
    if (!validate()) return;
    if (mode === "edit" && dirty) {
      // Ensure the draft is saved before publishing it.
      setIsSaving(true);
      const err = await onSave(buildAssignmentPayload(form, selected));
      setIsSaving(false);
      if (err) {
        setServerError(err);
        return;
      }
    }
    setPublishOpen(true);
  }

  async function confirmPublish() {
    setPublishError(null);
    setIsPublishing(true);
    const err = await onPublish();
    setIsPublishing(false);
    if (err) {
      setPublishError(err);
      return;
    }
    setPublishOpen(false);
  }

  const inputClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:opacity-60";
  const fieldError = (key: keyof FormErrors) =>
    errors[key] ? (
      <p role="alert" className="mt-1.5 text-sm font-bold text-danger-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold uppercase tracking-wide text-primary-700">
            {mode === "edit" ? "Modifier le travail" : "Nouveau travail"}
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {mode === "edit" ? form.title || "Travail sans titre" : "Créer un travail"}
          </h1>
        </div>
        {mode === "edit" && initial ? (
          <AssignmentStatusBadge status={initial.status} />
        ) : null}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start"
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
            <h3 className="text-lg font-extrabold text-slate-900">Travail</h3>

            <div className="mt-5">
              <label htmlFor="assignment-title" className="text-sm font-bold text-slate-700">
                Titre *
              </label>
              <input
                id="assignment-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Devoir sur les limites"
                className={`${inputClass} mt-2`}
              />
              {fieldError("title")}
            </div>

            <div className="mt-4">
              <label htmlFor="assignment-instructions" className="text-sm font-bold text-slate-700">
                Instructions
              </label>
              <textarea
                id="assignment-instructions"
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                placeholder="Consignes à donner aux étudiants"
                className={`${inputClass} mt-2 resize-y`}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="assignment-subject" className="text-sm font-bold text-slate-700">
                  Matière *
                </label>
                <select
                  id="assignment-subject"
                  value={form.subjectSlug}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      subjectSlug: e.target.value,
                      levelSlug: "",
                      chapterSlug: "",
                    }))
                  }
                  className={`${inputClass} mt-2`}
                >
                  <option value="">Choisir…</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {subjectOptionTitle(s)}
                    </option>
                  ))}
                </select>
                {fieldError("subject")}
              </div>

              <div>
                <label htmlFor="assignment-level" className="text-sm font-bold text-slate-700">
                  Niveau *
                </label>
                <select
                  id="assignment-level"
                  value={form.levelSlug}
                  disabled={!form.subjectSlug}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      levelSlug: e.target.value,
                      chapterSlug: "",
                    }))
                  }
                  className={`${inputClass} mt-2`}
                >
                  <option value="">Choisir…</option>
                  {levels.map((l) => (
                    <option key={l} value={l}>
                      {levelOptionTitle(l)}
                    </option>
                  ))}
                </select>
                {fieldError("level")}
              </div>

              <div>
                <label htmlFor="assignment-chapter" className="text-sm font-bold text-slate-700">
                  Chapitre *
                </label>
                <select
                  id="assignment-chapter"
                  value={form.chapterSlug}
                  disabled={!form.subjectSlug || !form.levelSlug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, chapterSlug: e.target.value }))
                  }
                  className={`${inputClass} mt-2`}
                >
                  <option value="">Choisir…</option>
                  {chapterOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {fieldError("chapter")}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="assignment-due-date" className="text-sm font-bold text-slate-700">
                  Date limite
                </label>
                <input
                  id="assignment-due-date"
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className={`${inputClass} mt-2`}
                />
              </div>
              <div>
                <label
                  htmlFor="assignment-attempt-limit"
                  className="text-sm font-bold text-slate-700"
                >
                  Nombre de tentatives maximum *
                </label>
                <input
                  id="assignment-attempt-limit"
                  type="number"
                  min={1}
                  step={1}
                  value={Number.isInteger(form.attemptLimit) ? form.attemptLimit : ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setForm((f) => ({ ...f, attemptLimit: NaN }));
                    } else {
                      const v = Number(raw);
                      if (Number.isFinite(v)) setForm((f) => ({ ...f, attemptLimit: v }));
                    }
                  }}
                  className={`${inputClass} mt-2`}
                />
                {fieldError("attemptLimit")}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <input
                    type="checkbox"
                    checked={form.showFeedback}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, showFeedback: e.target.checked }))
                    }
                    className="h-5 w-5 accent-primary-600"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Afficher les corrections
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
            <QuestionBank
              chapterSlug={form.chapterSlug}
              selected={selected}
              onToggle={onToggleQuestion}
            />
          </section>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card lg:sticky lg:top-6">
          <SelectedQuestions selected={selected} onChange={setSelected} />

          {serverError ? (
            <p
              role="alert"
              className="mt-5 rounded-2xl bg-danger-50 px-4 py-3 text-sm font-bold text-danger-600"
            >
              {serverError}
            </p>
          ) : null}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isPublishing}
              className="w-full rounded-2xl bg-primary-600 px-6 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60"
            >
              {isSaving
                ? "Sauvegarde…"
                : mode === "edit"
                  ? "Sauvegarder le brouillon"
                  : "Créer le brouillon"}
            </button>
            {mode === "edit" ? (
              <button
                type="button"
                onClick={openPublish}
                disabled={isSaving || isPublishing}
                className="w-full rounded-2xl bg-success-600 px-6 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-success-700 focus:outline-none focus:ring-4 focus:ring-success-200 disabled:opacity-60"
              >
                {isPublishing ? "Publication…" : "Publier le travail"}
              </button>
            ) : null}
            {dirty ? (
              <p className="text-center text-xs font-semibold text-warn-600">
                Modifications non enregistrées.
              </p>
            ) : null}
          </div>
        </aside>
      </motion.div>

      {publishOpen ? (
        <ConfirmDialog
          title="Publier ce travail ?"
          description={
            <>
              <p>
                Après publication, le contenu du travail ne pourra plus être modifié.
              </p>
              <p>
                <strong className="text-slate-900">{selected.length}</strong> question
                {selected.length > 1 ? "s" : ""} ·{" "}
                <strong className="text-slate-900">{form.attemptLimit}</strong> tentative
                {form.attemptLimit > 1 ? "s" : ""} maximum
              </p>
            </>
          }
          confirmLabel="Publier"
          busyLabel="Publication…"
          isBusy={isPublishing}
          error={publishError}
          onConfirm={confirmPublish}
          onClose={() => {
            setPublishOpen(false);
            setPublishError(null);
          }}
        />
      ) : null}
    </div>
  );
}