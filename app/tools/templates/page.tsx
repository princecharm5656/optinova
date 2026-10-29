"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Copy, ArrowRight, BookOpen } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  category: string;
  tool: string;
  toolHref: string;
  emoji: string;
  title: string;
  prompt: string;
  popular?: boolean;
}

const templates: Template[] = [
  // Caption Templates
  {
    id: "t1",
    category: "Instagram",
    tool: "Caption",
    toolHref: "/tools/caption",
    emoji: "✨",
    title: "Product Launch Caption",
    prompt: "Launching our new eco-friendly water bottle! Made from sustainable materials. Join the movement.",
    popular: true,
  },
  {
    id: "t2",
    category: "Instagram",
    tool: "Caption",
    toolHref: "/tools/caption",
    emoji: "✨",
    title: "Behind the Scenes",
    prompt: "Behind the scenes of our photoshoot. The team worked 12 hours to capture this magic.",
  },
  {
    id: "t3",
    category: "Instagram",
    tool: "Caption",
    toolHref: "/tools/caption",
    emoji: "✨",
    title: "Motivational Monday",
    prompt: "Start your week with purpose. Every small step counts towards your big dream.",
  },

  // Hashtag Templates
  {
    id: "t4",
    category: "Instagram",
    tool: "Hashtag",
    toolHref: "/tools/hashtag",
    emoji: "#️⃣",
    title: "Fitness Post",
    prompt: "Workout motivation gym fitness",
    popular: true,
  },
  {
    id: "t5",
    category: "Instagram",
    tool: "Hashtag",
    toolHref: "/tools/hashtag",
    emoji: "#️⃣",
    title: "Food Photography",
    prompt: "Food photography restaurant dinner",
  },

  // Bio Templates
  {
    id: "t6",
    category: "Instagram",
    tool: "Bio",
    toolHref: "/tools/bio",
    emoji: "👤",
    title: "Photographer Bio",
    prompt: "Freelance photographer from Pakistan, specializing in portrait and product photography",
    popular: true,
  },
  {
    id: "t7",
    category: "Instagram",
    tool: "Bio",
    toolHref: "/tools/bio",
    emoji: "👤",
    title: "Developer Bio",
    prompt: "Full-stack developer building AI tools. Coffee enthusiast. Open source contributor.",
  },

  // Email Templates
  {
    id: "t8",
    category: "Email",
    tool: "Email",
    toolHref: "/tools/email",
    emoji: "📧",
    title: "Cold Outreach",
    prompt: "Reaching out to a potential client about freelance web development services",
    popular: true,
  },

  // Blog Templates
  {
    id: "t9",
    category: "Blog",
    tool: "Blog",
    toolHref: "/tools/blog",
    emoji: "📝",
    title: "How-to Guide",
    prompt: "How to start freelancing as a Pakistani developer in 2026",
  },
  {
    id: "t10",
    category: "Blog",
    tool: "Blog",
    toolHref: "/tools/blog",
    emoji: "📝",
    title: "Product Review",
    prompt: "Best AI tools for content creators in 2026 - Complete guide",
    popular: true,
  },

  // Story Templates
  {
    id: "t11",
    category: "Story",
    tool: "Story",
    toolHref: "/tools/story",
    emoji: "📖",
    title: "Adventure Story",
    prompt: "A traveler discovers a hidden café that exists between dimensions",
  },
  {
    id: "t12",
    category: "Story",
    tool: "Story",
    toolHref: "/tools/story",
    emoji: "📖",
    title: "Mystery Story",
    prompt: "A detective receives anonymous letters predicting crimes before they happen",
  },

  // Translator Templates
  {
    id: "t13",
    category: "Translator",
    tool: "Translator",
    toolHref: "/tools/translator",
    emoji: "🌐",
    title: "English → Urdu",
    prompt: "Welcome to our platform. We are excited to have you here.",
  },
  {
    id: "t14",
    category: "Translator",
    tool: "Translator",
    toolHref: "/tools/translator",
    emoji: "🌐",
    title: "English → Spanish",
    prompt: "Thank you for your purchase. Your order will arrive in 3-5 business days.",
  },

  // Product Description Templates
  {
    id: "t15",
    category: "Product",
    tool: "Product",
    toolHref: "/tools/product",
    emoji: "🛍️",
    title: "Tech Product",
    prompt: "Wireless earbuds with 24-hour battery and noise cancellation",
    popular: true,
  },
  {
    id: "t16",
    category: "Product",
    tool: "Product",
    toolHref: "/tools/product",
    emoji: "🛍️",
    title: "Fashion Item",
    prompt: "Premium leather handbag, handcrafted, perfect for daily use",
  },
];

const categories = ["All", "Instagram", "Email", "Blog", "Story", "Translator", "Product"];

export default function TemplatesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = filter === "All"
    ? templates
    : templates.filter((t) => t.category === filter);

  const copyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const useTemplate = (template: Template) => {
    // Store in localStorage to pre-fill the tool page
    if (typeof window !== "undefined") {
      localStorage.setItem("optinova-template", JSON.stringify(template));
    }
    router.push(template.toolHref);
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-sm">
            <BookOpen className="w-4 h-4" />
            Templates Library
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Ready-made{" "}
            <span className="bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">
              prompts
            </span>
          </h1>
          <p className="text-text-muted">
            {templates.length} templates to get you started instantly
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === cat
                  ? "bg-cyan-accent text-black"
                  : "bg-elevated text-text-muted hover:text-text-base border border-base-color"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="bg-elevated border border-base-color rounded-2xl p-6 hover:border-cyan-accent/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{template.emoji}</div>
                {template.popular && (
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-accent/20 text-cyan-accent border border-cyan-accent/30">
                    Popular
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold mb-2">{template.title}</h3>
              <p className="text-sm text-text-muted mb-4 line-clamp-3">
                {template.prompt}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => useTemplate(template)}
                  className="flex-1 px-3 py-2 bg-cyan-accent text-black rounded-lg hover:bg-cyan-accent/90 text-sm"
                >
                  Use Template →
                </button>
                <button
                  onClick={() => copyPrompt(template.prompt, template.id)}
                  className="px-3 py-2 bg-base border border-base-color rounded-lg hover:bg-elevated text-text-muted hover:text-cyan-accent"
                  title="Copy prompt"
                >
                  {copied === template.id ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
