import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JLPT-GAME",
  description: "Zen-Modern Kanji Mastery",
  icons: {
    icon: [
      { url: (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
