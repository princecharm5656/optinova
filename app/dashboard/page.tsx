"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Search,
  Hash,
  User,
  Mail,
  BookOpen,
  FileSearch,
  RefreshCw,
  ShoppingBag,
  Languages,
  Mic,
  Wand2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PlanBanner from "@/components/magic/plan-banner";
import { Button } from "@/components/ui/button";
import WelcomeModal from "@/components/onboarding/welcome-modal";
import SearchBar from "@/components/dashboard/search-bar";
import QuickAccess from "@/components/dashboard/quick-access";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ name: string | null; isAdmin: boolean } | null>(null);
  const [usage, setUsage] = useState<{
    paid: boolean;
    items: { kind: string; used: number; max: number; remaining: number }[];
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        setUserId(data.user.id);
        setLoading(false);
        fetch("/api/me", { cache: "no-store" })
          .then((r) => r.json())
          .then((j) => j.loggedIn && setMe({ name: j.name ?? null, isAdmin: !!j.isAdmin }))
          .catch(() => {});
        fetch("/api/usage", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => j && setUsage(j))
          .catch(() => {});
      }
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-cyan-accent">Loading workspace...</div>
      </div>
    );
  }

  const toolUsage = usage?.items.find((i) => i.kind === "tool");
  const displayName = me?.name || user?.email?.split("@")[0] || "";
  const firstName = me?.name ? me.name.split(" ")[0] : "";
  const planLabel = me?.isAdmin ? "Admin" : usage?.paid ? "Pro Plan" : "Free Plan";

  const tools = [
    { icon: BookOpen, name: "Templates Library", category: "Resources", available: true, href: "/tools/templates" },
    { icon: Sparkles, name: "AI Caption Generator", category: "AI Writing", available: true, href: "/tools/caption" },
    { icon: Hash, name: "AI Hashtag Generator", category: "AI Writing", available: true, href: "/tools/hashtag" },
    { icon: User, name: "AI Bio Generator", category: "Profile", available: true, href: "/tools/bio" },
    { icon: Mail, name: "AI Email Writer", category: "Communication", available: true, href: "/tools/email" },
    { icon: BookOpen, name: "AI Story Generator", category: "Creative", available: true, href: "/tools/story" },
    { icon: FileText, name: "AI Blog Writer", category: "Long-form", available: true, href: "/tools/blog" },
    { icon: Languages, name: "AI Translator", category: "Multi-language", available: true, href: "/tools/translator" },
    { icon: FileSearch, name: "AI Summarizer", category: "Utility", available: true, href: "/tools/summarizer" },
    { icon: RefreshCw, name: "AI Rewriter", category: "Utility", available: true, href: "/tools/rewriter" },
    { icon: ShoppingBag, name: "AI Product Description", category: "E-commerce", available: true, href: "/tools/product" },
    { icon: Wand2, name: "AI Image Generator", category: "Visual", available: true, href: "/tools/image" },
    { icon: Mic, name: "AI Voice Transcription", category: "Audio", available: true, href: "/tools/transcribe" },
    { icon: Search, name: "Keyword Research", category: "SEO", available: true, href: "/tools/keyword" },
    { icon: ImageIcon, name: "Image Compress", category: "Image", available: true, href: "/tools/image-compress" },
    { icon: FileText, name: "PDF Merge", category: "PDF", available: true, href: "/tools/pdf-merge" },
  ];

  return (
    <div className="min-h-screen bg-base text-text-base">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-elevated border-r border-base-color p-6 flex flex-col">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent mb-8 block"
        >
          OptiNova
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Magic Blueprint", href: "/magic" },
            { label: "AI Tools", href: "/tools#writing" },
            { label: "SEO Tools", href: "/tools#seo" },
            { label: "Image Tools", href: "/tools#image" },
            { label: "PDF Tools", href: "/tools#pdf" },
            { label: "History", href: "/history" },
            { label: "My Blueprints", href: "/magic/history" },
            { label: "My Account", href: "/account" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors hover:bg-base hover:text-text-base ${
                item.href === "/dashboard" ? "bg-base text-text-base" : "text-text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {me?.isAdmin && (
            <Link
              href="/admin/upgrade"
              className="block px-4 py-2 rounded-lg text-purple-300 hover:bg-base hover:text-text-base transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="border-t border-base-color pt-4 space-y-2">
          <Link
            href="/account"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-base transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-accent to-purple-400 flex items-center justify-center text-black font-bold">
              {(displayName[0] || "?").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-text-muted truncate">{planLabel}</p>
            </div>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-text-muted"
          >
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
          <PlanBanner />
        <WelcomeModal />
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
              <p className="text-text-muted mt-1">
                Ready to build something extraordinary?
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SearchBar />

              <Link
                href="/account#usage"
                className="bg-elevated border border-base-color rounded-xl px-6 py-3 hover:border-cyan-accent/50 transition-colors"
              >
                <p className="text-xs text-text-muted">AI generations left today</p>
                <p className="text-2xl font-bold text-cyan-accent">
                  {toolUsage ? `${toolUsage.remaining}/${toolUsage.max}` : "-"}
                </p>
              </Link>
            </div>
          </div>

          {/* RECENT TOOLS SECTION - NEW */}
          <QuickAccess userId={userId} />

          {/* Quick Tools */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, i) => {
                const Icon = tool.icon;
                const card = (
                  <div className="bg-elevated border border-base-color rounded-xl p-6 hover:border-cyan-accent/50 transition-all cursor-pointer">
                    <div className="inline-flex p-2 rounded-lg bg-cyan-accent/10 mb-3">
                      <Icon className="w-5 h-5 text-cyan-accent" />
                    </div>
                    <h3 className="font-semibold mb-1">{tool.name}</h3>
                    <p className="text-xs text-text-muted mb-2">
                      {tool.category}
                    </p>
                    {!tool.available && (
                      <p className="text-xs text-text-muted">Coming soon</p>
                    )}
                  </div>
                );

                return tool.available ? (
                  <Link key={i} href={tool.href}>
                    {card}
                  </Link>
                ) : (
                  <div key={i}>{card}</div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="bg-elevated border border-base-color rounded-xl p-8 text-center text-text-muted">
              <p>No recent activity yet. Start by using a tool!</p>
              <Link href="/tools/caption">
                <Button className="mt-4 bg-cyan-accent text-black">
                  Try AI Caption Generator →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
