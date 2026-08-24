import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import RouteGuard from "./components/auth/RouteGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shahad Alghamdi | Information Systems Portfolio",
  description:
    "Portfolio of Shahad Alghamdi, an Information Systems graduate focused on enterprise IT systems, infrastructure, IT support, Microsoft 365, Active Directory, SQL, and business technology solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <RouteGuard>{children}</RouteGuard>
      </body>
    </html>
  );
}
