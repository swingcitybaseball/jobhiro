import type { Metadata } from "next";
import { Noto_Serif, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const notoSerif = Noto_Serif({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobHiro — AI Job Application Tool",
  description:
    "Paste a job posting and your resume. Get a tailored resume, cover letter, interview prep, and company intel in 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${notoSerif.variable} ${inter.variable} h-full antialiased`}
      >
        <head>
          {/* Material Symbols icon font */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          />
        </head>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
