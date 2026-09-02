import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glostrup Cricket Club — Est. 1959",
  description:
    "Glostrup Cricket Club, founded 2 April 1959, plays out of Solvangsparken in Glostrup, Denmark. Two-time Danish champion.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-64.png", type: "image/png", sizes: "64x64" },
    ],
    apple: "/apple-touch-icon.png",
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
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,500..900&family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}