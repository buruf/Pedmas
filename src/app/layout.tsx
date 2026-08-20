import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEDMAS — Master Math. One Skill at a Time.",
  description:
    "PEDMAS finds what you know, identifies what you need to learn, and gives you the right mathematics practice until you master it. Adaptive K-12 math for Grades 1-12.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
