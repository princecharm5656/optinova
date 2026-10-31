"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import BlueprintView, { useDoneState } from "@/components/magic/blueprint-view";
import { createClient } from "@/lib/supabase/client";
import type { Blueprint } from "@/lib/magic/types";

type Row = { id: string; prompt: string; data: Blueprint; done: Record<string, boolean> | null };

export default function SavedBlueprintPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);
  const [row, setRow] = useState<Row | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const { done, toggle, replace } = useDoneState(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("blueprints")
          .select("id, prompt, data, done")
          .eq("id", id)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error("[blueprints] load failed:", error.message);
          setStatus("error");
        } else if (!data) {
          setStatus("missing"); // not found, or it belongs to someone else / you are logged out
        } else {
          setRow(data as Row);
          replace(Object.fromEntries(Object.entries(data.done || {}).map(([k, v]) => [Number(k), !!v])));
          setStatus("ready");
        }
      } catch (e) {
        console.error("[blueprints] load crashed:", e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, supabase]);

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 p-6 font-sans text-base leading-relaxed">
      <div className="max-w-7xl mx-auto pt-10 pb-6 px-4 flex items-center justify-between">
        <Link href="/magic/history" className="text-purple-300 hover:text-white underline text-sm">
          ← My blueprints
        </Link>
        <Link href="/magic" className="text-sm text-purple-300 hover:text-white underline">
          New blueprint
        </Link>
      </div>

      {status === "loading" && (
        <div className="flex justify-center py-32 text-purple-300">
          <Loader2 className="animate-spin" size={36} />
        </div>
      )}

      {(status === "missing" || status === "error") && (
        <div className="max-w-xl mx-auto text-center py-24 space-y-4">
          <p className="text-xl text-white">
            {status === "missing" ? "Blueprint not found." : "Could not load this blueprint."}
          </p>
          <p className="text-gray-300">
            {status === "missing"
              ? "It may have been deleted, or you may need to log in with the account that created it."
              : "Please check your connection and try again."}
          </p>
          <Link href="/login" className="inline-block font-semibold text-white underline">
            Log in
          </Link>
        </div>
      )}

      {status === "ready" && row && (
        <BlueprintView
          result={row.data}
          prompt={row.prompt}
          runKey={row.id}
          done={done}
          onToggleDone={toggle}
          autoStartImages={false}
        />
      )}
    </div>
  );
}
