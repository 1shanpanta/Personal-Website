import type { Metadata, Viewport } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const ui = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ui",
});

const DESCRIPTION =
  "Full-stack developer in Kathmandu. I build free, local alternatives to software you should not have to subscribe to.";

export const metadata: Metadata = {
  title: "Ishan Panta",
  description: DESCRIPTION,
  openGraph: {
    title: "Ishan Panta",
    description: DESCRIPTION,
    url: "https://ishanpanta.com.np",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#141312",
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
