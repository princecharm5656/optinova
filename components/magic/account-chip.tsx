"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck, ChevronDown, UserCog, History as HistoryIcon, LayoutDashboard, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/lib/use-subscription";
import { formatDate } from "@/lib/subscription";

type Me = { loggedIn: false } | { loggedIn: true; email: string; name?: string | null; isAdmin: boolean };
type UsageItem = { kind: "tool" | "image" | "magic"; used: number; max: number; remaining: number };
type Usage = { paid: boolean; items: UsageItem[] } | null;

// Pages that already have their own navbar / account area: the GLOBAL chip stays hidden there.
const HIDE_EXACT = new Set(["/", "/login", "/signup", "/pricing", "/contact", "/privacy", "/terms", "/tools", "/dashboard"]);
const HIDE_PREFIX = ["/magic", "/admin", "/auth"]; // /magic and /admin pages render their own chip

const LABEL: Record<UsageItem["kind"], string> = {
  tool: "AI tools (captions, bios, blogs...)",
  image: "Images",
  magic: "Business blueprints",
};

/**
 * Small account menu (top right): who is logged in, plan, how much of today's limit is left,
 * quick links and log out. <AccountChip global /> in the root layout shows it on every tool page.
 */
export default function AccountChip({ global = false }: { global?: boolean }) {
  const pathname = usePathname() || "/";
  const [me, setMe] = useState<Me | null>(null);
  const [usage, setUsage] = useState<Usage>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const sub = useSubscription(open);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      setMe((await res.json()) as Me);
    } catch {
      setMe({ loggedIn: false });
    }
  }, []);

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage", { cache: "no-store" });
      setUsage(res.ok ? ((await res.json()) as Usage) : null);
    } catch {
      setUsage(null);
    }
  }, []);

  useEffect(() => {
    loadMe();
    // Browsers share one login between tabs: re-check when you come back to this tab.
    const onVisible = () => document.visibilityState === "visible" && loadMe();
    window.addEventListener("focus", loadMe);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", loadMe);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadMe]);

  // Fresh numbers every time the menu opens
  useEffect(() => {
    if (open) loadUsage();
  }, [open, loadUsage]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const logout = async () => {
    try {
      await createClient().auth.signOut();
    } catch {}
    window.location.href = "/login";
  };

  if (global && (HIDE_EXACT.has(pathname) || HIDE_PREFIX.some((p) => pathname.startsWith(p)))) return null;
  if (!me) return null;

  const shell = "fixed top-3 right-4 z-50 print:hidden";

  if (!me.loggedIn) {
    return (
      <div className={`${shell} rounded-full border border-white/10 bg-[#0f0f0f]/90 backdrop-blur px-3.5 py-1.5 text-sm shadow-lg`}>
        <Link href="/login" className="text-purple-300 hover:text-white underline">Not logged in. Log in</Link>
      </div>
    );
  }

  const label = me.name || me.email.split("@")[0] || "Account";
  const initial = (label[0] || "?").toUpperCase();
  const planBadge = me.isAdmin ? "Admin" : usage?.paid ? "Pro" : null;

  return (
    <div ref={box} className={shell}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f0f0f]/90 backdrop-blur pl-1.5 pr-3 py-1 text-sm text-gray-200 shadow-lg hover:border-purple-500/50 transition-colors"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 text-xs font-bold text-black">{initial}</span>
        <span className="hidden sm:inline max-w-[160px] truncate">{label}</span>
        {me.isAdmin && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-600/30 border border-purple-500/40 px-2 py-0.5 text-xs font-semibold text-purple-200">
            <ShieldCheck size={12} /> Admin
          </span>
        )}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0f0f14] shadow-2xl p-4 text-sm">
          <div className="pb-3 border-b border-white/10">
            <p className="font-semibold text-white truncate">{me.name || label}</p>
            <p className="text-gray-400 truncate" title={me.email}>{me.email}</p>
            <p className="mt-1 text-xs">
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-gray-300">
                {planBadge === "Admin" ? "Admin account" : planBadge === "Pro" ? "Pro plan" : "Free plan"}
              </span>
              {sub && (sub.state === "active" || sub.state === "expiring") && (
                <span className={`ml-2 ${sub.state === "expiring" ? "text-amber-300" : "text-gray-400"}`}>
                  {sub.state === "expiring" ? `${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left` : `until ${formatDate(sub.endsAt)}`}
                </span>
              )}
              {sub?.state === "expired" && <span className="ml-2 text-red-300">expired {formatDate(sub.endsAt)}</span>}
            </p>
          </div>

          <div className="py-3 space-y-3 border-b border-white/10">
            <p className="text-xs uppercase tracking-wide text-gray-500">Left today</p>
            {usage ? (
              usage.items.map((u) => {
                const pct = u.max > 0 ? Math.min(100, Math.round((u.used / u.max) * 100)) : 0;
                return (
                  <div key={u.kind}>
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>{LABEL[u.kind]}</span>
                      <span>{u.remaining} / {u.max}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full ${pct >= 90 ? "bg-red-400" : "bg-cyan-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500">Loading...</p>
            )}
            {usage && !usage.paid && !me.isAdmin && (
              <Link href="/upgrade" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white">
                <Sparkles size={12} /> Upgrade for higher limits
              </Link>
            )}
          </div>

          <nav className="py-2 space-y-0.5">
            {[
              { href: "/dashboard", text: "Dashboard", Icon: LayoutDashboard },
              { href: "/account", text: "My account", Icon: UserCog },
              { href: "/account#history", text: "My history", Icon: HistoryIcon },
            ].map(({ href, text, Icon }) => (
              <Link key={href} href={href} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-gray-200 hover:bg-white/5">
                <Icon size={15} className="text-gray-400" /> {text}
              </Link>
            ))}
            {me.isAdmin && (
              <Link href="/admin/upgrade" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-purple-200 hover:bg-white/5">
                <ShieldCheck size={15} /> Admin panel
              </Link>
            )}
          </nav>

          <button onClick={logout} role="menuitem" className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-gray-300 hover:bg-white/5 hover:text-white">
            <LogOut size={15} className="text-gray-400" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
