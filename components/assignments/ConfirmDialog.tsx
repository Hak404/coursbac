"use client";

import type { ReactNode } from "react";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busyLabel,
  isBusy,
  error,
  onConfirm,
  onClose,
  cancelLabel = "Annuler",
}: {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  busyLabel: string;
  isBusy: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
  cancelLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-card"
      >
        <h2 id="confirm-title" className="text-xl font-extrabold text-slate-900">
          {title}
        </h2>
        <div className="mt-3 space-y-2 text-sm font-medium leading-relaxed text-slate-600">
          {description}
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-danger-50 px-4 py-3 text-sm font-bold text-danger-600"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="rounded-2xl bg-primary-600 px-6 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:opacity-40"
          >
            {isBusy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}