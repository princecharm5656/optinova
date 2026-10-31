"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Me = { loggedIn: false } | { loggedIn: true; email: string; isAdmin: boolean };

/** Small fixed tag (top right): which account is logged in, admin or not, and a log out button. */
export default function AccountChip() {
  const [me, setMe] = useState<Me | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      setMe((await res.json()) as Me);
    } catch {
      setMe({ loggedIn: false });
    }
  }, []);

  useEffect(() => {
    load();
    // Browsers share one login between tabs. Re-check when you come back to this tab,
    // so a login/logout done in another tab is reflected here.
    const onVisible = () => document.visibilityState === "visible" && load();
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const logout = async () => {
    try {
      await createClient().auth.signOut();
    } catch {}
    window.location.href = "/login";
  };

  if (!me) return null;

  return (
    <div className="fixed top-3 right-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#0f0f0f]/90 backdrop-blur px-3.5 py-1.5 text-sm text-gray-200 shadow-lg print:hidden">
      {me.loggedIn ? (
        <>
          <User size={14} className="text-purple-300 shrink-0" />
          <span className="max-w-[150px] sm:max-w-[240px] truncate" title={me.email}>{me.email}</span>
          {me.isAdmin ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/30 border border-purple-500/40 px-2 py-0.5 text-xs font-semibold text-purple-200">
              <ShieldCheck size={12} /> Admin
            </span>
          ) : (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-400">User</span>
          )}
          <button onClick={logout} aria-label="Log out" className="ml-1 text-gray-400 hover:text-white transition-colors">
            <LogOut size={14} />
          </button>
        </>
      ) : (
        <Link href="/login" className="text-purple-300 hover:text-white underline">Not logged in. Log in</Link>
      )}
    </div>
  );
}
