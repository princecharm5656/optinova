"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Copy, Check, History as HistoryIcon } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface HistoryItem {
  id: string;
  topic?: string;
  platform?: string;
  created_at: string;
  type: string;
  data: any;
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const results: HistoryItem[] = [];

    // Captions
    const { data: captions } = await supabase
      .from("captions_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    captions?.forEach((c) =>
      results.push({
        id: c.id,
        topic: c.topic,
        platform: c.platform,
        created_at: c.created_at,
        type: "Caption",
        data: c.captions,
      })
    );

    // Hashtags
    const { data: hashtags } = await supabase
      .from("hashtags_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    hashtags?.forEach((h) =>
      results.push({
        id: h.id,
        topic: h.topic,
        platform: h.platform,
        created_at: h.created_at,
        type: "Hashtag",
        data: h.hashtags,
      })
    );

    // Bios
    const { data: bios } = await supabase
      .from("bios_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    bios?.forEach((b) =>
      results.push({
        id: b.id,
        topic: b.about,
        platform: b.platform,
        created_at: b.created_at,
        type: "Bio",
        data: b.bios,
      })
    );

    // Emails
    const { data: emails } = await supabase
      .from("emails_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    emails?.forEach((e) =>
      results.push({
        id: e.id,
        topic: e.subject || e.context?.substring(0, 50) || "Email",
        platform: e.type,
        created_at: e.created_at,
        type: "Email",
        data: { subject: e.subject || "", body: e.body || "" },
      })
    );

    // Stories
    const { data: stories } = await supabase
      .from("stories_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    stories?.forEach((s) =>
      results.push({
        id: s.id,
        topic: s.title || s.topic,
        platform: s.style,
        created_at: s.created_at,
        type: "Story",
        data: { title: s.title || "", content: s.content || "" },
      })
    );

    // Sort by date desc
    results.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setItems(results);
    setLoading(false);
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("Delete this item?")) return;

    const supabase = createClient();
    const tableMap: Record<string, string> = {
      Caption: "captions_history",
      Hashtag: "hashtags_history",
      Bio: "bios_history",
      Email: "emails_history",
      Story: "stories_history",
    };

    const table = tableMap[type];
    if (!table) {
      alert("Cannot delete: unknown type");
      return;
    }
    
    await supabase.from(table).delete().eq("id", id);
    loadHistory();
  };

  const handleCopy = (item: HistoryItem) => {
    let text = "";
    try {
      if (item.type === "Caption" || item.type === "Bio") {
        text = Array.isArray(item.data) ? item.data.join("\n\n") : String(item.data);
      } else if (item.type === "Hashtag") {
        const tags = Array.isArray(item.data) ? item.data : [];
        text = tags.map((t: string) => `#${t}`).join(" ");
      } else if (item.type === "Email") {
        text = `${item.data.subject || ""}\n\n${item.data.body || ""}`;
      } else if (item.type === "Story") {
        text = `${item.data.title || ""}\n\n${item.data.content || ""}`;
      }
      navigator.clipboard.writeText(text);
      setCopied(item.id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Copy error:", err);
      alert("Failed to copy");
    }
  };

  const renderData = (item: HistoryItem) => {
    try {
      if (item.type === "Caption" || item.type === "Bio") {
        const arr = Array.isArray(item.data) ? item.data : [];
        if (arr.length === 0 || typeof arr[0] !== "string") {
          return <p className="text-sm text-text-muted">Content unavailable</p>;
        }
        return (
          <div className="space-y-2">
            {arr.slice(0, 3).map((text: string, i: number) => (
              <p key={i} className="text-sm text-text-base line-clamp-2">
                {text}
              </p>
            ))}
          </div>
        );
      }
      if (item.type === "Hashtag") {
        const tags = Array.isArray(item.data) ? item.data.slice(0, 8) : [];
        return (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag: string, i: number) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-base border border-base-color">
                #{tag}
              </span>
            ))}
          </div>
        );
      }
      if (item.type === "Email") {
        return (
          <div>
            <p className="text-sm font-semibold">{item.data.subject || "No subject"}</p>
            <p className="text-sm text-text-muted mt-1 line-clamp-3">
              {item.data.body || ""}
            </p>
          </div>
        );
      }
      if (item.type === "Story") {
        return (
          <div>
            <p className="text-sm font-semibold">{item.data.title || "Untitled"}</p>
            <p className="text-sm text-text-muted mt-1 line-clamp-3">
              {item.data.content || ""}
            </p>
          </div>
        );
      }
      return <p className="text-sm text-text-muted">Preview unavailable</p>;
    } catch {
      return <p className="text-sm text-text-muted">Error loading preview</p>;
    }
  };

  if (loading) {
    return (
      <Section background="base" className="py-12 min-h-screen text-text-base">
        <Container>
          <div className="text-center text-text-muted">Loading history...</div>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-sm">
            <HistoryIcon className="w-4 h-4" />
            Your History
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Your saved{" "}
            <span className="bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">
              creations
            </span>
          </h1>
          <p className="text-text-muted">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-16 text-center">
            <HistoryIcon className="w-16 h-16 mx-auto text-text-muted mb-4" />
            <h3 className="text-xl font-semibold mb-2">No saved items yet</h3>
            <p className="text-text-muted mb-6">
              Use any tool and click Save to keep your results
            </p>
            <Link href="/dashboard">
              <Button className="bg-cyan-accent text-black">
                Explore Tools →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-elevated/50 border border-base-color rounded-xl p-5 hover:border-cyan-accent/50 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/30">
                      {item.type}
                    </span>
                    {item.platform && (
                      <span className="text-xs text-text-muted">
                        {item.platform}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-sm font-medium text-text-muted mb-3 line-clamp-2">
                  {item.topic?.substring(0, 80) || "Untitled"}
                  {item.topic && item.topic.length > 80 ? "..." : ""}
                </p>

                <div className="mb-4">{renderData(item)}</div>

                <div className="flex gap-2 pt-3 border-t border-base-color">
                  <Button
                    onClick={() => handleCopy(item)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {copied === item.id ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    {copied === item.id ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id, item.type)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
