import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// The one typeface on the page, close to the reel's Helvetica; a single variable file.
const ui = Inter({ subsets: ["latin"], variable: "--font-ui" });

const DESCRIPTION =
  "Full-stack developer in Kathmandu. I build free, local alternatives to software you should not have to subscribe to.";

// Bump ?v when og.png changes: link previews cache the image by its URL.
const IMAGE = { url: "/og.png?v=2", width: 1200, height: 630, alt: "Ishan Panta, full-stack developer" };

export const metadata: Metadata = {
  metadataBase: new URL("https://ishanpanta.com.np"),
  title: "Ishan Panta",
  description: DESCRIPTION,
  openGraph: {
    title: "Ishan Panta",
    description: DESCRIPTION,
    url: "/",
    type: "website",
    images: [IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishan Panta",
    description: DESCRIPTION,
    creator: "@1shanpanta",
    images: [IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${ui.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
