import type { Metadata } from "next";
import { Press_Start_2P, Nunito, VT323 } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const retroFont = VT323({
  variable: "--font-retro",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Work//Tracker",
  description: "Track your hustle. Get paid right.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelFont.variable} ${bodyFont.variable} ${retroFont.variable} min-h-screen bg-pixel-grid font-body text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
