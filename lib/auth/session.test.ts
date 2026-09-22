import { describe, expect, it } from "vitest";
import { CHAPTERS_META } from "@/lib/content/registry";
import {
  demoSessionById,
  GUEST_SESSION,
  isProfessor,
  resolveChapterAccess,
  visibleChapters,
  availableSubjectSlugs,
  availableLevelSlugs,
  toAppSession,
} from "./session";

const all = Object.values(CHAPTERS_META);
const maths = CHAPTERS_META["limites-continuite"];
const physique = CHAPTERS_META["transformations-lentes-rapides"];

describe("filtrage par rôle", () => {
  it("un invité (visiteur non connecté) voit tous les chapitres", () => {
    expect(visibleChapters(all, GUEST_SESSION)).toHaveLength(2);
    expect(resolveChapterAccess(maths, GUEST_SESSION)).toBe(true);
    expect(resolveChapterAccess(physique, GUEST_SESSION)).toBe(true);
  });

  it("un administrateur voit tous les chapitres", () => {
    const admin = demoSessionById("admin");
    expect(visibleChapters(all, admin)).toHaveLength(2);
  });

  it("un élève voit tous les chapitres", () => {
    const eleve = demoSessionById("eleve");
    expect(visibleChapters(all, eleve)).toHaveLength(2);
  });

  it("le professeur de Mathématiques (2BAC + 1BAC) voit uniquement Limites et continuité", () => {
    const profMath = demoSessionById("prof.math");
    expect(isProfessor(profMath)).toBe(true);
    const visible = visibleChapters(all, profMath);
    expect(visible.map((c) => c.slug)).toEqual(["limites-continuite"]);
    expect(resolveChapterAccess(maths, profMath)).toBe(true);
    expect(resolveChapterAccess(physique, profMath)).toBe(false);
  });

  it("le professeur de Physique-Chimie (2BAC) voit uniquement Transformations lentes et rapides", () => {
    const profPhysique = demoSessionById("prof.physique");
    const visible = visibleChapters(all, profPhysique);
    expect(visible.map((c) => c.slug)).toEqual([
      "transformations-lentes-rapides",
    ]);
    expect(resolveChapterAccess(physique, profPhysique)).toBe(true);
    expect(resolveChapterAccess(maths, profPhysique)).toBe(false);
  });

  it("expose aux professeurs uniquement leurs sujets et niveaux assignés", () => {
    const profMath = demoSessionById("prof.math");
    expect(availableSubjectSlugs(profMath)).toEqual(["math"]);
    expect(availableLevelSlugs(profMath)).toEqual(["2bac", "1bac"]);

    const profPhysique = demoSessionById("prof.physique");
    expect(availableSubjectSlugs(profPhysique)).toEqual(["physique"]);
    expect(availableLevelSlugs(profPhysique)).toEqual(["2bac"]);
  });

  it("un invité ou un admin n'a pas de périmètre de professeur", () => {
    expect(availableSubjectSlugs(GUEST_SESSION)).toEqual([]);
    expect(availableLevelSlugs(GUEST_SESSION)).toEqual([]);
    expect(availableSubjectSlugs(demoSessionById("admin"))).toEqual([]);
  });
});

describe("toAppSession (adaptateur NextAuth)", () => {
  it("sans session NextAuth, renvoie une session invitée", () => {
    expect(toAppSession(null)).toEqual(GUEST_SESSION);
    expect(toAppSession({ user: null })).toEqual(GUEST_SESSION);
    expect(toAppSession({ user: { role: "PROFESSOR" as const } })).toEqual(
      GUEST_SESSION
    );
  });

  it("mappe un professeur NextAuth avec son périmètre", () => {
    const s = toAppSession({
      user: {
        id: "u1",
        name: "Prof. Mathématiques",
        email: "prof.math@coursbac.ma",
        role: "PROFESSOR",
        subjectSlugs: ["math"],
        levelSlugs: ["2bac", "1bac"],
        studentLevelSlug: null,
      },
    });
    expect(s.kind).toBe("user");
    if (s.kind === "user") {
      expect(s.user.role).toBe("PROFESSOR");
      expect(s.access).toEqual({
        subjectSlugs: ["math"],
        levelSlugs: ["2bac", "1bac"],
      });
    }
  });

  it("mappe un élève NextAuth avec son niveau", () => {
    const s = toAppSession({
      user: {
        id: "u2",
        name: "Élève",
        email: "eleve@coursbac.ma",
        role: "STUDENT",
        studentLevelSlug: "2bac",
      },
    });
    expect(s.kind).toBe("user");
    if (s.kind === "user") {
      expect(s.user.studentLevelSlug).toBe("2bac");
      expect(s.access).toBeNull();
    }
  });
});