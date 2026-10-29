"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const tools = [
  { name: "AI Caption Generator", href: "/tools/caption" },
  { name: "AI Hashtag Generator", href: "/tools/hashtag" },
  { name: "AI Bio Generator", href: "/tools/bio" },
  { name: "AI Email Writer", href: "/tools/email" },
  { name: "AI Story Generator", href: "/tools/story" },
  { name: "AI Blog Writer", href: "/tools/blog" },
  { name: "AI Translator", href: "/tools/translator" },
  { name: "AI Summarizer", href: "/tools/summarizer" },
  { name: "AI Rewriter", href: "/tools/rewriter" },
  { name: "AI Product Description", href: "/tools/product" },
  { name: "AI Image Generator", href: "/tools/image" },
  { name: "AI Voice Transcription", href: "/tools/transcribe" },
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = tools.filter((tool) =>
    tool.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools..."
          className="w-full pl-10 pr-4 py-2 bg-elevated border border-base-color rounded-lg text-text-base focus:border-cyan-accent focus:outline-none"
        />
      </div>

      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-elevated border border-base-color rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((tool) => (
              <button
                key={tool.href}
                onClick={() => {
                  router.push(tool.href);
                  setQuery("");
                }}
                className="w-full text-left px-4 py-2 hover:bg-base text-text-base text-sm"
              >
                {tool.name}
              </button>
            ))
          ) : (
            <p className="p-4 text-text-muted text-sm">No tools found</p>
          )}
        </div>
      )}
    </div>
  );
}
