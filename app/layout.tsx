import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADV 281 Exam 2 — Study Website",
  description: "AI-powered practice and concept review for ADV 281 Exam 2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
          integrity="sha384-wcIxkf6xwBFeuGJcGZ6kTpsuRWpu9X6lzNN2O0oSbYqZ0zcKXqQyV2pA9c2jzE2G"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-white text-zinc-950`}
      >
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
