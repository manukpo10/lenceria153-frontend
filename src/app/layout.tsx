import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { MockProvider } from "@/lib/mockContext";
import AppShell from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mercería 153 — Gestión",
  description: "Sistema de gestión y punto de venta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <AuthProvider>
          <MockProvider>
            <AppShell>{children}</AppShell>
          </MockProvider>
        </AuthProvider>
      </body>
    </html>
  );
}