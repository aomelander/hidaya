import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hidaya - Quranic Guidance & Reflection",
  description: "A contextual Quranic guidance and reflection platform providing verified Uthmani script, translations, classical tafsir, and AI synthesis.",
  openGraph: {
    title: "Hidaya - Quranic Guidance & Reflection",
    description: "A contextual Quranic guidance and reflection platform providing verified Uthmani script, translations, classical tafsir, and AI synthesis.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}
