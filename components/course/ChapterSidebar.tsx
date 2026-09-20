"use client";

import type { CourseSection } from "@/content/limites/types";
import { CATEGORIES } from "@/content/limites/types";

type Props = {
  sections: CourseSection[];
  currentId: string;
  visited: string[];
  onSelect: (id: string) => void;
};

export function ChapterSidebar({ sections, currentId, visited, onSelect }: Props) {
  return (
    <nav className="space-y-5">
      {CATEGORIES.map((cat) => {
        const items = sections.filter((s) => s.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key}>
            <div className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {cat.label}
            </div>
            <ul className="space-y-0.5">
              {items.map((s) => {
                const active = s.id === currentId;
                const done = visited.includes(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium transition ${
                        active
                          ? "bg-primary-100/70 text-primary-800 ring-1 ring-primary-200"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          done
                            ? "bg-emerald-100 text-emerald-700"
                            : active
                              ? "bg-primary-600 text-white"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {done ? "✓" : s.number}
                      </span>
                      <span className="leading-snug">{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}