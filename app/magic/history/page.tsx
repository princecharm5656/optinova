"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; title: string | null; prompt: string; created_at: string };

export default function BlueprintHistoryPage() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "loggedout" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!auth.user) {
          setStatus("loggedout");
          return;
        }
        const { data, error } = await supabase
          .from("blueprints")
          .select("id, title, prompt, created_at")
          .order("created_at", { ascending: false })
          .limit(50);
        if (cancelled) return;
        if (error) {
          console.error("[blueprints] list failed:", error.message);
          setStatus("error");
          return;
        }
        setItems((data as Item[]) || []);
        setStatus("ready");
      } catch (e) {
        console.error("[blueprints] list crashed:", e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this blueprint? This cannot be undone.")) return;
    const { error } = await supabase.from("blueprints").delete().eq("id", id);
    if (error) {
      console.error("[blueprints] delete failed:", error.message);
      window.alert("Could not delete. Please try again.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 p-6 font-sans text-base leading-relaxed">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="text-purple-500" /> My Blueprints
          </h1>
          <Link href="/magic" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-full px-5 py-2.5 transition-colors">
            New blueprint
          </Link>
        </div>

        {status === "loading" && (
          <div className="flex justify-center py-24 text-purple-300">
            <Loader2 className="animate-spin" size={36} />
          </div>
        )}

        {status === "loggedout" && (
          <div className="text-center py-20 space-y-3">
            <p className="text-xl text-white">Please log in to see your blueprints.</p>
            <Link href="/login" className="inline-block font-semibold text-white underline">Log in</Link>
          </div>
        )}

        {status === "error" && (
          <p className="text-center py-20 text-red-200">Could not load your blueprints. Please try again.</p>
        )}

        {status === "ready" && items.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-xl text-white">No blueprints yet.</p>
            <p className="text-gray-300">Generate your first one and it will appear here.</p>
          </div>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.id} className="bg-[#0f0f0f] border border-white/10 hover:border-purple-500/50 rounded-3xl p-5 flex items-start justify-between gap-4 transition-colors">
                <Link href={`/magic/${i.id}`} className="flex-1 min-w-0">
                  <p className="text-xl font-semibold text-white">{i.title || "Untitled blueprint"}</p>
                  <p className="text-gray-300 mt-1 line-clamp-2">{i.prompt}</p>
                  <p className="text-sm text-gray-400 mt-2">{new Date(i.created_at).toLocaleString()}</p>
                </Link>
                <button
                  onClick={() => remove(i.id)}
                  aria-label="Delete blueprint"
                  className="shrink-0 p-2.5 rounded-full text-gray-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
