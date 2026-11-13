"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useSubscriptionState } from "@/lib/use-subscription";
import { formatDate, timeLeftText } from "@/lib/subscription";

const card = "rounded-2xl border border-base-color bg-elevated p-6";
const primaryBtn = "inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60";

/** "Your plan" box on the account page: plan, status, member since, start / end date, days left. */
export default function PlanCard({ paid }: { paid: boolean }) {
  const { info: sub, status } = useSubscriptionState();
  const running = sub?.state === "active" || sub?.state === "expiring";
  const planName = sub?.plan === "teams" ? "Teams" : "Pro";

  const rows: [string, string][] = sub
    ? [
        ["Member since", formatDate(sub.memberSince)],
        ...(sub.state !== "free"
          ? ([
              ["Plan started", formatDate(sub.startedAt)],
              [running ? "Ends on" : "Ended on", formatDate(sub.endsAt)],
              ...(running ? ([["Days left", String(sub.daysLeft)]] as [string, string][]) : []),
              ["Billing", sub.billingPeriod === "yearly" ? "Yearly" : "Monthly"],
            ] as [string, string][])
          : []),
      ]
    : [];

  // No badge until we really know. Never show "Pro" next to "Free plan".
  const badge =
    !sub ? null
    : sub.state === "expiring" ? { text: `Ends soon (${timeLeftText(sub).replace("ends ", "")})`, cls: "bg-amber-500/15 text-amber-200" }
    : sub.state === "expired" ? { text: "Expired", cls: "bg-red-500/15 text-red-200" }
    : running ? { text: "Active", cls: "bg-emerald-500/15 text-emerald-200" }
    : { text: "Free plan", cls: "bg-white/5 text-text-muted" };

  const title = sub ? (running || sub.state === "expired" ? planName : "Free") : paid ? "Pro" : "Free";

  return (
    <div className={`${card} space-y-5`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">Your plan</p>
          <p className="text-2xl font-bold">
            {title}
            {badge && <span className={`ml-3 rounded-full px-3 py-1 align-middle text-xs font-semibold ${badge.cls}`}>{badge.text}</span>}
          </p>
        </div>
        <Link href="/upgrade" className={primaryBtn}>
          <Sparkles className="h-4 w-4" />{" "}
          {running ? "Renew / extend" : sub?.state === "expired" ? `Renew ${planName}` : paid ? "Renew / extend" : "Upgrade to Pro"}
        </Link>
      </div>

      {status === "error" && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          We could not load your plan dates (start date, end date, days left). Please refresh the page. If this keeps happening, contact us.
        </p>
      )}

      {rows.length > 0 && (
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-base-color/60 pb-2 text-sm">
              <dt className="text-text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {sub?.state === "free" && (
        <p className="text-xs text-text-muted">Pro gives you 10x higher daily limits. Pay for one month at a time. Nothing renews automatically.</p>
      )}
    </div>
  );
}
