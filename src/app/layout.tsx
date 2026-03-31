import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "OLA CLOUD | Premium Cloud Platform",
  description: "Manage your Next.js, Node.js, Python, and Docker apps with ease on our premium infrastructure.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        {children}
      </body>
    </html>
  );
}
/**
 * OLA CLOUD - Root Layout
 * Global provider for Inter font and base styling applied. Force dark mode locally.
 */
