import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { PROJE_ADI, UNIVERSITE_ADI, UNIVERSITE_ETIKET } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: `${PROJE_ADI} — ${UNIVERSITE_ADI}`,
  description:
    "İstanbul Sağlık ve Teknoloji Üniversitesi Sütlüce ve ADSM kampüslerinde sıfır atık kutusu takibi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sıfır Atık",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-6 pb-16">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white/80 py-6 text-center text-xs text-slate-500 backdrop-blur print:hidden">
          <p>{UNIVERSITE_ETIKET} · Sütlüce & ADSM</p>
        </footer>
      </body>
    </html>
  );
}
