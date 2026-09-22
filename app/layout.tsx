import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Ustadi — Cours interactifs de Maths & Physique-Chimie",
    template: "%s · Ustadi",
  },
  description:
    "Ustadi, la plateforme éducative interactive : leçons pas à pas, graphes dynamiques, exercices auto-corrigés et mode présentation pour les enseignants. 5ème, 1ère et 2ème Baccalauréat — programme officiel marocain.",
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
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}