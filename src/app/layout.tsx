import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Hidaya - Quranic Guidance & Reflection",
  description: "A contextual Quranic guidance and reflection platform providing verified Uthmani script, translations, classical tafsir, and AI synthesis.",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  themeColor: "#065F46",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hidaya",
  },
  openGraph: {
    title: "Hidaya - Quranic Guidance & Reflection",
    description: "A contextual Quranic guidance and reflection platform providing verified Uthmani script, translations, classical tafsir, and AI synthesis.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('hidaya_dark_mode');if(m==='false'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#061B16" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <ServiceWorkerRegistration />
      </head>
      <body className="min-h-screen bg-stone-950 text-stone-100 antialiased dark:bg-stone-950 dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}
