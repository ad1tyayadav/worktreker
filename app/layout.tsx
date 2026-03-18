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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Work Treker",
    template: "%s | Work//Treker",
  },
  description: "Track your hustle. Get paid right.",
  applicationName: "Work//Treker",
  keywords: [
    "work tracking",
    "time tracking",
    "client billing",
    "invoicing",
    "freelance",
    "project tracking",
  ],
  authors: [{ name: "Work//Treker" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    title: "Work//Treker",
    description: "Track your hustle. Get paid right.",
    url: "/",
    siteName: "Work//Treker",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Work//Treker logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work//Treker",
    description: "Track your hustle. Get paid right.",
    images: ["/logo.png"],
  },
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
