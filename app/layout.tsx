import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#08080F",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://optinova-black.vercel.app"),

  title: {
    default: "OptiNova — 10+ Free AI Tools for Creators | Founder: Ram Dhingana",
    template: "%s | OptiNova",
  },

  description: "Free AI-powered workspace for content creators. Generate Instagram captions, hashtags, bios, emails, stories, blogs in seconds. Save history automatically. Built by Ram Dhingana.",
  
  keywords: [
    "AI tools", "caption generator", "hashtag generator", 
    "AI writer", "free AI", "creator tools", "OptiNova",
    "Ram Dhingana", "social media AI", "content creator",
    "AI image generator", "voice transcription",
  ],

  authors: [{ name: "Ram Dhingana", url: "https://optinova-black.vercel.app" }],
  creator: "Ram Dhingana",
  publisher: "OptiNova",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://optinova-black.vercel.app",
    siteName: "OptiNova",
    title: "OptiNova — 10+ Free AI Tools for Creators",
    description: "Generate captions, hashtags, bios, emails, and more with AI. All in one free workspace.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "OptiNova — AI Tools for Creators",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OptiNova — 10+ Free AI Tools for Creators",
    description: "Free AI workspace for creators",
    creator: "@ramdhingana",
    images: ["/og-image.svg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  manifest: "/manifest.webmanifest",

  alternates: {
    canonical: "https://optinova-black.vercel.app",
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
