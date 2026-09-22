import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function redirectTo(req: { nextUrl: URL }, path: string, search = "") {
  const url = new URL(req.nextUrl.toString());
  url.pathname = path;
  url.search = search;
  return NextResponse.redirect(url);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (!user) {
    const from = encodeURIComponent(pathname + req.nextUrl.search);
    return redirectTo(req, "/connexion", `?from=${from}`);
  }

  const role = user.role;
  const pendingProfessor =
    role === "PROFESSOR" && user.isApproved === false;

  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") return redirectTo(req, "/");
    return NextResponse.next();
  }

  if (pathname.startsWith("/en-attente")) {
    if (pendingProfessor) return NextResponse.next();
    return redirectTo(req, role === "STUDENT" ? "/etudiant" : "/professeur");
  }

  if (
    pathname.startsWith("/professeur") &&
    role !== "PROFESSOR" &&
    role !== "ADMIN"
  ) {
    return redirectTo(req, "/etudiant");
  }
  if (pathname.startsWith("/professeur") && pendingProfessor) {
    return redirectTo(req, "/en-attente");
  }
  if (
    pathname.startsWith("/etudiant") &&
    role !== "STUDENT" &&
    role !== "ADMIN"
  ) {
    return redirectTo(req, "/professeur");
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/professeur/:path*",
    "/etudiant/:path*",
    "/admin/:path*",
    "/en-attente/:path*",
  ],
};