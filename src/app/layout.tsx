import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireReady — AI Career Coach | Resume Analyzer & Interview Prep",
  description:
    "Get hire-ready with AI-powered resume analysis, career coaching, interview prep, and job matching. Upload your resume, find the gaps, and land your dream job.",
  keywords: [
    "resume analyzer",
    "AI career coach",
    "interview prep",
    "job matching",
    "resume builder",
    "ATS optimization",
  ],
  openGraph: {
    title: "HireReady — AI Career Coach",
    description:
      "AI-powered resume analysis, career coaching, and interview prep. Get hire-ready today.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireReady — AI Career Coach",
    description:
      "AI-powered resume analysis, career coaching, and interview prep.",
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
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground"
      >

        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#111118",
              border: "1px solid rgba(148,163,184,0.08)",
              color: "#F8FAFC",
            },
          }}
        />
      </body>
    </html>
  );
}
