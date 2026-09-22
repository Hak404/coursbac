import type { ChapterMeta } from "@/lib/content/types";

export type Role = "PROFESSOR" | "STUDENT" | "ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentLevelSlug?: string | null;
  isApproved?: boolean | null;
};

export type ProfessorAccess = {
  subjectSlugs: string[];
  levelSlugs: string[];
};

export type Session =
  | { kind: "guest" }
  | { kind: "user"; user: SessionUser; access: ProfessorAccess | null };

export const GUEST_SESSION: Session = { kind: "guest" };

export const DEMO_SESSIONS: Record<
  string,
  { label: string; session: Session }
> = {
  "prof.math": {
    label: "Prof. Mathématiques",
    session: {
      kind: "user",
      user: {
        id: "demo-prof-math",
        email: "prof.math@coursbac.ma",
        name: "Prof. Mathématiques",
        role: "PROFESSOR",
        isApproved: true,
      },
      access: { subjectSlugs: ["math"], levelSlugs: ["2bac", "1bac"] },
    },
  },
  "prof.physique": {
    label: "Prof. Physique-Chimie",
    session: {
      kind: "user",
      user: {
        id: "demo-prof-physique",
        email: "prof.physique@coursbac.ma",
        name: "Prof. Physique-Chimie",
        role: "PROFESSOR",
        isApproved: true,
      },
      access: { subjectSlugs: ["physique"], levelSlugs: ["2bac"] },
    },
  },
  "eleve": {
    label: "Élève 2BAC",
    session: {
      kind: "user",
      user: {
        id: "demo-eleve",
        email: "eleve@coursbac.ma",
        name: "Élève",
        role: "STUDENT",
      },
      access: null,
    },
  },
  admin: {
    label: "Administrateur",
    session: {
      kind: "user",
      user: {
        id: "demo-admin",
        email: "admin@coursbac.ma",
        name: "Administrateur",
        role: "ADMIN",
      },
      access: null,
    },
  },
};

export function demoSessionById(sessionKey: string): Session {
  return DEMO_SESSIONS[sessionKey]?.session ?? GUEST_SESSION;
}

export function sessionDisplayName(session: Session): string {
  if (session.kind === "guest") return "Invité";
  return session.user.name;
}

export function toAppSession(
  nextSession: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: Role;
      subjectSlugs?: string[];
      levelSlugs?: string[];
      studentLevelSlug?: string | null;
      isApproved?: boolean | null;
    } | null;
  } | null
): Session {
  const raw = nextSession?.user;
  if (!raw?.role || !raw.email) return GUEST_SESSION;
  const access =
    raw.role === "PROFESSOR"
      ? {
          subjectSlugs: raw.subjectSlugs ?? [],
          levelSlugs: raw.levelSlugs ?? [],
        }
      : null;
  return {
    kind: "user",
    user: {
      id: raw.id ?? "",
      name: raw.name ?? "",
      email: raw.email,
      role: raw.role,
      studentLevelSlug: raw.studentLevelSlug ?? null,
      isApproved: raw.isApproved ?? null,
    },
    access,
  };
}

export function isProfessor(session: Session): boolean {
  return (
    session.kind === "user" &&
    session.user.role === "PROFESSOR" &&
    session.access !== null
  );
}

export function resolveChapterAccess(
  chapter: ChapterMeta,
  session: Session
): boolean {
  if (session.kind === "guest") return true;
  if (session.user.role === "ADMIN") return true;
  if (session.user.role !== "PROFESSOR") return true;
  if (!session.access) return false;
  return (
    session.access.subjectSlugs.includes(chapter.subjectSlug) &&
    session.access.levelSlugs.includes(chapter.levelSlug)
  );
}

export function visibleChapters(
  chapters: ChapterMeta[],
  session: Session
): ChapterMeta[] {
  return chapters.filter((c) => resolveChapterAccess(c, session));
}

export function availableSubjectSlugs(session: Session): string[] {
  return isProfessor(session) && session.kind === "user" && session.access
    ? [...session.access.subjectSlugs]
    : [];
}

export function availableLevelSlugs(session: Session): string[] {
  return isProfessor(session) && session.kind === "user" && session.access
    ? [...session.access.levelSlugs]
    : [];
}