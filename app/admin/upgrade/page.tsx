"use client";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";
import AccountChip from "@/components/magic/account-chip";
import { toast } from "@/lib/toast";
import { formatDate, nextPeriod, type BillingPeriod, type SubInfo } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type AdminUser = SubInfo & { id: string; email: string; created_at: string; canceled: boolean };

const ORDER: Record<string, number> = { expiring: 0, expired: 1, active: 2, free: 3 };

export default function AdminUpgradePage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
      setUsers(json.users as AdminUser[]);
    } catch (e: any) {
      console.error("Load users error:", e);
      toast.error(e?.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  // Plans that need attention (ending soon / ended) come first, then running plans, then free users.
  const sorted = useMemo(
    () => [...users].sort((a, b) => ORDER[a.state] - ORDER[b.state] || +new Date(b.created_at) - +new Date(a.created_at)),
    [users]
  );
  const count = (s: string) => users.filter((u) => u.state === s).length;

  const send = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(
        res.status === 403
          ? "The account you are logged in with right now is not the admin. Check the account shown at the top right."
          : res.status === 404 || res.status === 405
          ? "The server file for this action is missing or in the wrong folder (app/api/admin/subscription/route.ts must export POST). Run: node scripts/check-routes.mjs"
          : json.error || `Failed (${res.status})`
      );
      return false;
    }
    return true;
  };

  const grant = async (u: AdminUser, period: BillingPeriod) => {
    const running = u.state === "active" || u.state === "expiring";
    const row = u.state === "free" ? null : { plan: u.plan, status: "active", started_at: u.startedAt, current_period_end: u.endsAt, billing_period: u.billingPeriod };
    const { endsAt } = nextPeriod(row, period);
    const label = period === "yearly" ? "1 year" : "1 month";
    if (!confirm(`${running ? "Extend" : "Give"} Pro by ${label} for ${u.email}?\n\nNew end date: ${formatDate(endsAt)}`)) return;
    setBusy(u.id);
    if (await send({ userId: u.id, action: "grant", plan: "pro", period })) {
      toast.success(`${u.email}: Pro until ${formatDate(endsAt)}`);
      await loadUsers();
    }
    setBusy(null);
  };

  const cancel = async (u: AdminUser) => {
    if (!confirm(`End ${u.email}'s Pro plan right now? They go back to Free immediately.`)) return;
    setBusy(u.id);
    if (await send({ userId: u.id, action: "cancel" })) {
      toast.success("Plan ended");
      await loadUsers();
    }
    setBusy(null);
  };

  if (loading) {
    return (
      <Section background="base" className="py-12 min-h-screen text-text-base">
        <AccountChip />
        <Container>
          <p className="text-center text-cyan-accent py-20">Loading...</p>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <AccountChip />
      <Container>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin: Manage Subscriptions</h1>
            <p className="text-text-muted">Give or extend Pro after you have verified the bank transfer.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              ["Running", count("active") + count("expiring"), "text-emerald-300"],
              ["Ending in 3 days", count("expiring"), "text-amber-300"],
              ["Expired", count("expired"), "text-red-300"],
              ["Free users", count("free"), "text-text-muted"],
            ].map(([label, n, tone]) => (
              <div key={label as string} className="rounded-xl border border-base-color bg-elevated p-3">
                <p className={`text-2xl font-bold ${tone}`}>{n}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {sorted.map((u) => {
              const running = u.state === "active" || u.state === "expiring";
              const disabled = busy === u.id;
              const badge =
                u.state === "expiring" ? { text: `Pro · ends in ${u.daysLeft} day${u.daysLeft === 1 ? "" : "s"}`, cls: "bg-amber-500/15 text-amber-300" }
                : u.state === "active" ? { text: `Pro · ${u.daysLeft} days left`, cls: "bg-emerald-500/15 text-emerald-300" }
                : u.state === "expired" ? { text: "Pro · expired", cls: "bg-red-500/15 text-red-300" }
                : { text: u.canceled ? "Free (canceled)" : "Free", cls: "bg-white/5 text-text-muted" };
              return (
                <div key={u.id} className="bg-elevated border border-base-color rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{u.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className={`rounded-full px-2.5 py-0.5 font-semibold ${badge.cls}`}>{badge.text}</span>
                      <span className="text-text-muted">Joined {formatDate(u.created_at)}</span>
                      {u.state !== "free" && (
                        <span className="text-text-muted">
                          Started {formatDate(u.startedAt)} · {running ? "Ends" : "Ended"} {formatDate(u.endsAt)}
                          {u.billingPeriod ? ` · ${u.billingPeriod}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button size="sm" disabled={disabled} onClick={() => grant(u, "monthly")} className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold">
                      {running ? "+1 month" : u.state === "expired" ? "Renew 1 month" : "Give Pro 1 month"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={disabled} onClick={() => grant(u, "yearly")}>
                      {running ? "+1 year" : u.state === "expired" ? "Renew 1 year" : "Give Pro 1 year"}
                    </Button>
                    {running && (
                      <Button size="sm" variant="outline" disabled={disabled} onClick={() => cancel(u)} className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                        End plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {users.length === 0 && <p className="text-center text-text-muted py-10">No users yet.</p>}
          </div>

          <div className="bg-elevated border border-base-color rounded-xl p-5 text-sm text-text-muted space-y-1">
            <p className="font-semibold text-text-base">How it works</p>
            <p>1. The user pays and sends you the proof. 2. You verify it in your bank app. 3. Press &quot;Give Pro 1 month&quot; (or +1 month).</p>
            <p>A plan ends by itself on its end date, and the user goes back to Free. Nothing renews automatically.</p>
            <p>If a user pays before the end date, the new month is added after the current end, so they lose no days.</p>
            <p>1 month = 30 days, 1 year = 365 days.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
