import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "OptiNova — The Operating System for Creators",
    template: "%s | OptiNova",
  },
  description: "AI Writing, SEO, Image, PDF and Creator Tools — all inside one intelligent workspace. Built for creators worldwide.",
  keywords: ["AI tools", "SEO tools", "creator tools", "PDF tools", "image tools", "OptiNova", "Ram Dhingana"],
  authors: [{ name: "Ram Dhingana" }],
  creator: "Ram Dhingana",
  publisher: "OptiNova",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://optinova.com",
    siteName: "OptiNova",
    title: "OptiNova — The Operating System for Creators",
    description: "AI Writing, SEO, Image, PDF and Creator Tools — all inside one intelligent workspace.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OptiNova — Creator Operating System",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "OptiNova — The Operating System for Creators",
    description: "AI Writing, SEO, Image, PDF and Creator Tools in one workspace.",
    creator: "@ramdhingana",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-base text-text-base">
        {children}
      </body>
    </html>
  );
}
