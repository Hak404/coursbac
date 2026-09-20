import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Limites et continuité — 2BAC Sciences Physiques",
  description:
    "Cours interactif et animé de mathématiques : Limites et continuité. Programme officiel du 2ème Baccalauréat Sciences Physiques (Maroc).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  );
}