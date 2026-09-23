"use client";

import type { SelectedQuestionEntry } from "@/lib/assignments/professor-ui";
import {
  moveSelected,
  removeSelected,
  setSelectedPoints,
} from "@/lib/assignments/professor-ui";

export function SelectedQuestions({
  selected,
  onChange,
}: {
  selected: SelectedQuestionEntry[];
  onChange: (next: SelectedQuestionEntry[]) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-extrabold text-slate-900">Questions sélectionnées</h3>
        {selected.length > 0 ? (
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary-700">
            {selected.length} sélectionnée{selected.length > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {selected.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-medium text-slate-400">
          Aucune question sélectionnée pour le moment.
        </div>
      ) : (
        <ol className="mt-4 space-y-3">
          {selected.map((entry, index) => (
            <li
              key={entry.bankQuestionId}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-extrabold leading-snug text-slate-900">
                    {entry.title}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onChange(moveSelected(selected, index, -1))}
                    disabled={index === 0}
                    aria-label={`Monter la question ${index + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(moveSelected(selected, index, 1))}
                    disabled={index === selected.length - 1}
                    aria-label={`Descendre la question ${index + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(removeSelected(selected, entry.bankQuestionId))}
                    aria-label={`Retirer la question ${index + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-50 text-danger-600 ring-1 ring-danger-200 transition hover:bg-danger-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label
                  htmlFor={`points-${entry.bankQuestionId}`}
                  className="text-sm font-bold text-slate-600"
                >
                  Points
                </label>
                <input
                  id={`points-${entry.bankQuestionId}`}
                  type="number"
                  min={1}
                  step={0.5}
                  value={entry.points}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v >= 1) {
                      onChange(setSelectedPoints(selected, entry.bankQuestionId, v));
                    }
                  }}
                  className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}