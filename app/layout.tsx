import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FitMirror",
  description: "O seu espelho do futuro. Acompanhe dieta, treinos e veja suas projeções corporais.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitMirror",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { BottomTabBar } from "@/components/nav/bottom-tab-bar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="antialiased font-sans bg-background text-foreground safe-area-pt pb-safe-bottom min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col mb-16">
          {children}
        </main>
        <BottomTabBar />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
