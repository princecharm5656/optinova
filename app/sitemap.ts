import type { MetadataRoute } from "next";

// Set NEXT_PUBLIC_SITE_URL in Vercel when you attach a real domain (e.g. https://optinova.com).
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://optinova-black.vercel.app").replace(/\/$/, "");

const pages: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/pricing", priority: 0.8 },
  { path: "/tools", priority: 0.8 },
  { path: "/magic", priority: 0.8 },
  { path: "/contact", priority: 0.4 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  ...["caption", "hashtag", "bio", "email", "story", "blog", "translator", "summarizer", "rewriter", "product", "image", "transcribe", "keyword", "image-compress", "pdf-merge", "templates"].map(
    (t) => ({ path: `/tools/${t}`, priority: 0.6 })
  ),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${SITE}${p.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p.priority,
  }));
}
