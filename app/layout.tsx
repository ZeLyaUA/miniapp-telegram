import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TelegramProvider } from "./providers";
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
  title: "Wellness | Медитация",
  description: "Медитация, дыхание и осознанность",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="flex flex-col">
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
