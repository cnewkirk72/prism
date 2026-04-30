import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Prism — Creator analytics & planning",
    template: "%s · Prism",
  },
  description:
    "Aggregate your TikTok and Instagram performance, plan content, and run your creator business — all in one dark-mode workspace.",
};

export const viewport: Viewport = {
  themeColor: "#07040E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} dark`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
