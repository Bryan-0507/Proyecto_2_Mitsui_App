import type { Metadata } from "next";
import { AppShell } from "@/features/shell/components/AppShell";
import copy from "@/i18n/es.json";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: copy.brand.name, template: `%s | ${copy.brand.name}` },
  description: "Proyecto académico de exploración y predicción de retornos relativos entre instrumentos financieros.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-GT" className="h-full">
      <body className="min-h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
