import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MHM Digital Equity | Regional Network Explorer",
  description: "Find and compare MHM grantees and partner organizations, explore recorded regional partnerships, and understand digital equity funding and reach in context.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${openSans.variable} h-dvh bg-background font-sans antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </body>
    </html>
  );
}
