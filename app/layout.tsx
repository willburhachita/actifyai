import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Actify - Secure Commerce",
  description:
    "Browse the eBay Mall, fund purchases with ACT, lock value in escrow, and govern what your WhatsApp agent is allowed to do.",
  keywords: [
    "Actify",
    "eBay Mall",
    "ACT token",
    "escrow commerce",
    "WhatsApp agent",
  ],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-deep text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
