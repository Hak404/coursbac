import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            professor: { include: { subjects: true, levels: true } },
            student: { include: { currentLevel: true } },
          },
        });

        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const subjectSlugs =
          user.professor?.subjects.map((s) => s.slug) ?? undefined;
        const levelSlugs =
          user.professor?.levels.map((l) => l.slug) ?? undefined;
        const studentLevelSlug =
          user.student?.currentLevel?.slug ?? null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          image: user.image,
          subjectSlugs,
          levelSlugs,
          studentLevelSlug,
          isApproved:
            user.role === "PROFESSOR" ? user.professor?.isApproved ?? false : null,
        };
      },
    }),
  ],
});