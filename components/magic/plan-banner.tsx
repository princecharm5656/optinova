"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, AlertTriangle, X } from "lucide-react";
import { useSubscription } from "@/lib/use-subscription";
import { formatDate, timeLeftText } from "@/lib/subscription";

/**
 * Shows ONLY when a paid plan is about to end (3 days or less) or has just ended.
 * Free users and healthy plans see nothing. Can be closed for the rest of the browser session.
 */
export default function PlanBanner() {
  const info = useSubscription();
  const [closed, setClosed] = useState(false);
  const key = info ? `planbanner:${info.state}:${info.endsAt}` : "";

  useEffect(() => {
    if (!key) return;
    try {
      setClosed(sessionStorage.getItem(key) === "1");
    } catch {}
  }, [key]);

  if (!info || closed || (info.state !== "expiring" && info.state !== "expired")) return null;

  const expired = info.state === "expired";
  const Icon = expired ? AlertTriangle : Clock;
  const planName = info.plan === "teams" ? "Teams" : "Pro";

  return (
    <div
      role="status"
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
        expired ? "border-red-500/40 bg-red-500/10 text-red-100" : "border-amber-500/40 bg-amber-500/10 text-amber-100"
      }`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${expired ? "text-red-400" : "text-amber-400"}`} />
      <div className="flex-1">
        {expired ? (
          <p>
            <strong>Your {planName} plan ended on {formatDate(info.endsAt)}.</strong> You are back on the Free plan (fewer daily
            generations). Your saved work is safe.
          </p>
        ) : (
          <p>
            <strong>Your {planName} plan {timeLeftText(info)} ({formatDate(info.endsAt)}).</strong> Renew now to keep your higher
            daily limits. If you renew early, the new period is added to the end of your current plan, so you lose no days.
          </p>
        )}
        <Link
          href="/upgrade"
          className="mt-2 inline-block rounded-lg bg-cyan-400 px-4 py-1.5 font-semibold text-black hover:bg-cyan-300 transition-colors"
        >
          Renew {planName}
        </Link>
      </div>
      <button
        onClick={() => {
          setClosed(true);
          try {
            sessionStorage.setItem(key, "1");
          } catch {}
        }}
        aria-label="Dismiss"
        className="text-gray-400 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
