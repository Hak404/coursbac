import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.subjectSlugs = user.subjectSlugs;
        token.levelSlugs = user.levelSlugs;
        token.studentLevelSlug = user.studentLevelSlug;
        token.isApproved = user.isApproved;
      }
      return token;
    },
    session({ session, token }) {
      if (token.role) {
        session.user.id = (token.sub as string | undefined) ?? session.user.id ?? "";
        session.user.role = token.role;
        session.user.subjectSlugs = token.subjectSlugs ?? [];
        session.user.levelSlugs = token.levelSlugs ?? [];
        session.user.studentLevelSlug = token.studentLevelSlug ?? null;
        session.user.isApproved = token.isApproved ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;