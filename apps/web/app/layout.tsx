import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "CodeUnicorn",
  description: "CodeUnicorn is a GitHub Intelligence Platform combining intelligent PR reviews, codebase understanding, and developer analytics to enhance workflows and code quality.",
  icons: {
    icon: "/codeUnicorn-logo.png",
    shortcut: "/codeUnicorn-logo.png",
    apple: "/codeUnicorn-logo.png",
  },
  openGraph: {
    title: "CodeUnicorn",
    description: "CodeUnicorn is a GitHub Intelligence Platform combining intelligent PR reviews, codebase understanding, and developer analytics to enhance workflows and code quality.",
    url: "https://codeunicorn.vercel.app",
    siteName: "CodeUnicorn",
    images: [
      {
        url: "/code-logo-bg.png",
        width: 1200,
        height: 630,
        alt: "CodeUnicorn Background",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeUnicorn",
    description: "CodeUnicorn is a GitHub Intelligence Platform combining intelligent PR reviews, codebase understanding, and developer analytics to enhance workflows and code quality.",
    images: ["/code-logo-bg.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="dark">
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute={"class"}
              defaultTheme="dark"
              forcedTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <Analytics />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
