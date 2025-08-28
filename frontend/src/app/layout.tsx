import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Rental Tracking System",
  description: "Fleet, health, usage, forecast, and customers dashboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Providers>
          <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <Link href="/" className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Fleet Dashboard</Link>
                <Link href="/health" className="hover:text-blue-600 transition-colors">Health</Link>
                <Link href="/usage" className="hover:text-green-600 transition-colors">Usage</Link>
                <Link href="/forecast" className="hover:text-purple-600 transition-colors">Forecast</Link>
                <Link href="/customers" className="hover:text-orange-600 transition-colors">Customers</Link>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Role: FleetManager</span>
              </div>
            </div>
          </nav>
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
