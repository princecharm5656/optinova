"use client";

import Section from "@/components/wrapper/section";
import Container from "@/components/shared/container";
import { 
  Sparkles, 
  Search, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  BarChart3,
  ArrowUpRight 
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Writing Hub",
    description: "Captions, blogs, emails, bios, scripts — all powered by smart AI that understands your voice.",
    color: "from-cyan-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.3)",
  },
  {
    icon: Search,
    title: "SEO Toolkit",
    description: "Keywords, meta tags, speed tests, audits — everything to rank #1 on Google.",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(192, 132, 252, 0.3)",
  },
  {
    icon: ImageIcon,
    title: "Image Studio",
    description: "Compress, resize, convert, remove backgrounds — pixel-perfect in seconds.",
    color: "from-orange-500 to-red-500",
    glowColor: "rgba(249, 115, 22, 0.3)",
  },
  {
    icon: FileText,
    title: "PDF Workshop",
    description: "Merge, split, compress, lock, convert — PDF mastery at your fingertips.",
    color: "from-green-500 to-emerald-500",
    glowColor: "rgba(34, 197, 94, 0.3)",
  },
  {
    icon: Video,
    title: "Creator Hub",
    description: "YouTube, Instagram, TikTok optimization — titles, hashtags, SEO scores all in one.",
    color: "from-pink-500 to-rose-500",
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
  {
    icon: BarChart3,
    title: "Growth Analytics",
    description: "Track followers, traffic, keyword rankings — visualize your growth journey.",
    color: "from-indigo-500 to-purple-500",
    glowColor: "rgba(99, 102, 241, 0.3)",
  },
];

export default function Features() {
  return (
    <Section 
      background="base"
      className="py-24 md:py-32 text-text-base"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <p className="uppercase tracking-[0.3em] text-cyan-accent text-sm font-semibold">
          What You Get
        </p>
        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
          Everything you need.
          <br />
          <span className="bg-gradient-to-r from-cyan-accent via-purple-400 to-cyan-accent bg-clip-text text-transparent">
            One workspace.
          </span>
        </h2>
        <p className="text-lg text-text-muted">
          From AI-powered writing to deep SEO tools — OptiNova brings every creator tool under one intelligent roof.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group relative p-8 rounded-2xl border border-base-color bg-elevated/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-accent/50 hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              {/* Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${feature.glowColor} 0%, transparent 70%)`,
                }}
              />

              {/* Content */}
              <div className="relative z-10 space-y-4">
                {/* Icon Container */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title + Arrow */}
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-text-base">
                    {feature.title}
                  </h3>
                  <ArrowUpRight 
                    className="w-5 h-5 text-text-muted group-hover:text-cyan-accent group-hover:rotate-45 transition-all duration-300" 
                  />
                </div>

                {/* Description */}
                <p className="text-text-muted leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom Line */}
                <div className="pt-2 flex items-center gap-2 text-sm text-cyan-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore tools</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <p className="text-text-muted">
          And <span className="text-cyan-accent font-semibold">500+ more tools</span> coming soon
        </p>
      </div>
    </Section>
  );
}
