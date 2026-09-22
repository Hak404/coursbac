import type { DefaultSession, DefaultUser } from "@auth/core/types";
import type { Role } from "@/lib/auth/session";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: Role;
      subjectSlugs?: string[];
      levelSlugs?: string[];
      studentLevelSlug?: string | null;
      isApproved?: boolean | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: Role;
    subjectSlugs?: string[];
    levelSlugs?: string[];
    studentLevelSlug?: string | null;
    isApproved?: boolean | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    subjectSlugs?: string[];
    levelSlugs?: string[];
    studentLevelSlug?: string | null;
    isApproved?: boolean | null;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      subjectSlugs?: string[];
      levelSlugs?: string[];
      studentLevelSlug?: string | null;
      isApproved?: boolean | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    subjectSlugs?: string[];
    levelSlugs?: string[];
    studentLevelSlug?: string | null;
    isApproved?: boolean | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    subjectSlugs?: string[];
    levelSlugs?: string[];
    studentLevelSlug?: string | null;
    isApproved?: boolean | null;
  }
}