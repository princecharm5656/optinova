"use client";

import Section from "@/components/wrapper/section";
import { 
  PenTool, Image as ImageIcon, FileText, 
  Search, Globe, PlayCircle, Megaphone,
  ArrowRight 
} from "lucide-react";

const categories = [
  {
    title: "AI Writing",
    description: "Generate content in seconds",
    tools: ["Caption Generator", "Blog Writer", "Email Writer", "Bio Generator", "Story Teller", "Ad Copy"],
    icon: PenTool,
    color: "from-cyan-500 to-blue-500",
    tools_count: "24 tools",
  },
  {
    title: "SEO Tools",
    description: "Rank #1 on Google",
    tools: ["Keyword Research", "Meta Generator", "SERP Checker", "Backlink Audit", "Speed Test", "Schema Gen"],
    icon: Search,
    color: "from-purple-500 to-pink-500",
    tools_count: "32 tools",
  },
  {
    title: "Image Studio",
    description: "Pixel-perfect in seconds",
    tools: ["Compress", "Resize", "Convert", "Remove BG", "Watermark", "Upscale"],
    icon: ImageIcon,
    color: "from-orange-500 to-red-500",
    tools_count: "18 tools",
  },
  {
    title: "PDF Workshop",
    description: "PDF mastery made simple",
    tools: ["Merge", "Split", "Compress", "Convert", "Lock/Unlock", "Watermark"],
    icon: FileText,
    color: "from-green-500 to-emerald-500",
    tools_count: "14 tools",
  },
  {
    title: "Creator Suite",
    description: "Optimize every platform",
    tools: ["YouTube SEO", "Instagram Caption", "TikTok Script", "LinkedIn Post", "Twitter Thread", "Hashtag Gen"],
    icon: Megaphone,
    color: "from-pink-500 to-rose-500",
    tools_count: "28 tools",
  },
  {
    title: "Website Tools",
    description: "Diagnose & optimize",
    tools: ["Audit", "Mobile Test", "SSL Check", "Whois", "DNS Lookup", "Headers"],
    icon: Globe,
    color: "from-indigo-500 to-purple-500",
    tools_count: "21 tools",
  },
];

export default function ToolCategories() {
  return (
    <Section 
      background="base"
      className="py-24 md:py-32 text-text-base"
    >
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <p className="uppercase tracking-[0.3em] text-cyan-accent text-sm font-semibold">
          Categories
        </p>
        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
          Built for every
          <span className="bg-gradient-to-r from-cyan-accent via-purple-400 to-cyan-accent bg-clip-text text-transparent">
            {" "}creator
          </span>
        </h2>
        <p className="text-lg text-text-muted">
          Explore tool categories crafted for content creators, marketers, and freelancers worldwide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-elevated/40 border border-base-color hover:border-cyan-accent/40 transition-all duration-300 overflow-hidden"
            >
              <div 
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${category.color}`}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-text-muted px-3 py-1 rounded-full border border-base-color">
                    {category.tools_count}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-text-base mb-2">
                    {category.title}
                  </h3>
                  <p className="text-text-muted">
                    {category.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-base-color">
                  {category.tools.map((tool, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 text-sm text-text-muted hover:text-cyan-accent transition-colors cursor-pointer group/tool"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover/tool:opacity-100 -ml-5 group-hover/tool:ml-0 transition-all" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>

                <button className="flex items-center gap-2 text-sm text-cyan-accent font-semibold pt-2 hover:gap-3 transition-all">
                  View all tools
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
