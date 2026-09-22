import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Course } from "@/components/course/Course";
import { findChapterByPath } from "@/lib/content/registry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ subject: string; level: string; slug: string }>;
  searchParams: Promise<{ section?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, level, slug } = await params;
  const chapter = findChapterByPath(subject, level, slug);
  if (!chapter) return { title: "Chapitre introuvable" };
  return {
    title: `${chapter.title} · ${chapter.subjectLabel} ${chapter.levelShort}`,
  };
}

export default async function CoursPage({ params, searchParams }: Props) {
  const { subject, level, slug } = await params;
  const chapter = findChapterByPath(subject, level, slug);
  if (!chapter) notFound();
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user) {
    const base = `/cours/${subject}/${level}/${slug}`;
    const target = sp.section
      ? `${base}?section=${encodeURIComponent(sp.section)}`
      : base;
    redirect(`/connexion?redirect=${encodeURIComponent(target)}`);
  }
  return <Course subject={subject} level={level} slug={slug} initialId={sp.section} />;
}