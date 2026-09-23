import { statusIcon, statusLabel } from "@/lib/assignments/professor-ui";

function statusScheme(status: string): string {
  if (status === "PUBLISHED") {
    return "bg-success-50 text-success-700 ring-success-200";
  }
  if (status === "CLOSED") {
    return "bg-slate-100 text-slate-500 ring-slate-200";
  }
  return "bg-warn-50 text-warn-700 ring-warn-200";
}

export function AssignmentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ring-1 ${statusScheme(status)}`}
    >
      <span aria-hidden>{statusIcon(status)}</span>
      <span>{statusLabel(status)}</span>
    </span>
  );
}