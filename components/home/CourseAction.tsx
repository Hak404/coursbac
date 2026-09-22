"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type CourseActionProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "course" | "presentation";
};

export function CourseAction({
  href,
  children,
  className,
  variant = "course",
}: CourseActionProps) {
  const router = useRouter();
  const { status } = useSession();

  function onClick() {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push(`/connexion?redirect=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {variant === "presentation" ? "▶ " : null}
      {children}
    </button>
  );
}