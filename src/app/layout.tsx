import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sıfır Atık — İstün Üniversitesi",
  description:
    "İstün Sütlüce ve ADSM kampüslerinde sıfır atık kutusu takibi. QR okutun, toplama rotasını izleyin.",
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
          <p>İstün · Sıfır Atık · Sütlüce & ADSM</p>
        </footer>
      </body>
    </html>
  );
}
