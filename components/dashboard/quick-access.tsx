"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const toolMap: Record<string, { name: string; href: string; emoji: string }> = {
  caption: { name: "AI Caption", href: "/tools/caption", emoji: "✨" },
  hashtag: { name: "AI Hashtag", href: "/tools/hashtag", emoji: "#️⃣" },
  bio: { name: "AI Bio", href: "/tools/bio", emoji: "�" },
  email: { name: "AI Email", href: "/tools/email", emoji: "📧" },
  story: { name: "AI Story", href: "/tools/story", emoji: "📖" },
  blog: { name: "AI Blog", href: "/tools/blog", emoji: "📝" },
  translator: { name: "AI Translator", href: "/tools/translator", emoji: "🌐" },
  summarizer: { name: "AI Summarizer", href: "/tools/summarizer", emoji: "📄" },
  rewriter: { name: "AI Rewriter", href: "/tools/rewriter", emoji: "✍️" },
  product: { name: "AI Product", href: "/tools/product", emoji: "🛍️" },
};

export default function QuickAccess({ userId }: { userId: string }) {
  const [recent, setRecent] = useState<{ tool: string; last_used: string }[]>([]);

  useEffect(() => {
    if (!userId) return;
    loadRecent();
  }, [userId]);

  const loadRecent = async () => {
    const supabase = createClient();

    const { data: activity } = await supabase
      .from("user_activity")
      .select("action, created_at")
      .eq("user_id", userId)
      .in("action", Object.keys(toolMap))
      .order("created_at", { ascending: false })
      .limit(20);

    if (!activity) return;

    const seen = new Set<string>();
    const unique: { tool: string; last_used: string }[] = [];

    for (const item of activity) {
      if (!seen.has(item.action)) {
        seen.add(item.action);
        unique.push({
          tool: item.action,
          last_used: item.created_at,
        });
      }
      if (unique.length >= 5) break;
    }

    setRecent(unique);
  };

  if (recent.length === 0) return null;

  return (
    <div className="bg-elevated border border-base-color rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-cyan-accent" />
        <h2 className="text-lg font-semibold">Recent Tools</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {recent.map((item) => {
          const tool = toolMap[item.tool];
          if (!tool) return null;
          return (
            <Link
              key={item.tool}
              href={tool.href}
              className="bg-base border border-base-color rounded-xl p-3 hover:border-cyan-accent/50 transition-all group"
            >
              <div className="text-2xl mb-1">{tool.emoji}</div>
              <p className="text-sm font-medium truncate">{tool.name}</p>
              <p className="text-xs text-text-muted">
                {new Date(item.last_used).toLocaleDateString()}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
