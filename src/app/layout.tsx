import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const DESCRIPTION =
  "Full-stack developer in Kathmandu. I build free, local alternatives to software you should not have to subscribe to.";

export const metadata: Metadata = {
  title: "Ishan Panta",
  description: DESCRIPTION,
  openGraph: {
    title: "Ishan Panta",
    description: DESCRIPTION,
    url: "https://ishanpanta.vercel.app",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* next/font has no japanese subset for DotGothic16, and the katakana needs it. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap"
        />
      </head>
      <body
        className={`${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
