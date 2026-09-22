import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PresentationView } from "@/components/presentation/PresentationView";
import { findChapterByPath } from "@/lib/content/registry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ subject: string; level: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, level, slug } = await params;
  const chapter = findChapterByPath(subject, level, slug);
  if (!chapter) return { title: "Chapitre introuvable" };
  return {
    title: `${chapter.title} · Présentation · ${chapter.subjectLabel} ${chapter.levelShort}`,
  };
}

export default async function PresentationPage({ params }: Props) {
  const { subject, level, slug } = await params;
  const chapter = findChapterByPath(subject, level, slug);
  if (!chapter) notFound();
  const session = await auth();
  if (!session?.user) {
    redirect(
      `/connexion?redirect=${encodeURIComponent(
        `/presentation/${subject}/${level}/${slug}`
      )}`
    );
  }
  return <PresentationView subject={subject} level={level} slug={slug} />;
}