"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserRound, BarChart3, History as HistoryIcon, ShieldCheck, Copy, Download, LogOut, ArrowLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import PlanBanner from "@/components/magic/plan-banner";
import PlanCard from "@/components/magic/plan-card";
import {
  EMPTY_PROFILE, PROFILE_MAX, fetchHistory, toDbProfile, validateProfile,
  type HistoryEntry, type HistoryType, type ProfileFields,
} from "@/lib/account";

type Supabase = ReturnType<typeof createClient>;
type User = { id: string; email: string };
type TabId = "profile" | "usage" | "history" | "security";

const TABS: { id: TabId; label: string; Icon: typeof UserRound }[] = [
  { id: "profile", label: "Profile", Icon: UserRound },
  { id: "usage", label: "Usage & plan", Icon: BarChart3 },
  { id: "history", label: "History", Icon: HistoryIcon },
  { id: "security", label: "Security & data", Icon: ShieldCheck },
];

const COUNTRIES = ["Pakistan", "India", "Bangladesh", "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain", "Turkey", "United Kingdom", "United States", "Canada", "Australia", "Germany"];

const input = "w-full rounded-lg border border-base-color bg-base px-4 py-2.5 text-text-base placeholder:text-text-muted/60 focus:border-cyan-accent focus:outline-none";
const card = "rounded-2xl border border-base-color bg-elevated p-6";
const primaryBtn = "inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60";
const ghostBtn = "inline-flex items-center justify-center gap-2 rounded-lg border border-base-color px-5 py-2.5 text-text-base transition-colors hover:border-cyan-accent/60 disabled:opacity-60";

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabId>("profile");

  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "") as TabId;
    if (TABS.some((t) => t.id === fromHash)) setTab(fromHash);
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data.user) router.push("/login");
        else setUser({ id: data.user.id, email: data.user.email || "" });
      })
      .catch(() => router.push("/login"));
  }, [supabase, router]);

  const selectTab = (id: TabId) => {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-cyan-accent">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base text-text-base">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My account</h1>
            <p className="mt-1 text-text-muted">{user.email}</p>
          </div>
          <button onClick={logout} className={ghostBtn}>
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>

        <PlanBanner />

        <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-base-color">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => selectTab(id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === id ? "border-cyan-accent text-cyan-accent" : "border-transparent text-text-muted hover:text-text-base"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === "profile" && <ProfileTab supabase={supabase} user={user} />}
        {tab === "usage" && <UsageTab />}
        {tab === "history" && <HistoryTab supabase={supabase} />}
        {tab === "security" && <SecurityTab supabase={supabase} user={user} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Profile */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-muted/70">{hint}</span>}
    </label>
  );
}

function ProfileTab({ supabase, user }: { supabase: Supabase; user: User }) {
  const [form, setForm] = useState<ProfileFields>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notSetUp, setNotSetUp] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const metaName = typeof auth.user?.user_metadata?.full_name === "string" ? auth.user.user_metadata.full_name : "";
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, country, city, address, business_name, about")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("[account] profile load:", error.message);
        setNotSetUp(true);
      }
      const saved = Object.fromEntries(Object.entries(data ?? {}).map(([k, v]) => [k, (v as string | null) ?? ""])) as Partial<ProfileFields>;
      setForm({ ...EMPTY_PROFILE, full_name: metaName, ...saved });
      setLoading(false);
    })();
  }, [supabase, user.id]);

  const set = (key: keyof ProfileFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validateProfile(form);
    if (problem) return toast.error(problem);
    setSaving(true);
    const db = toDbProfile(form);
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...db, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      console.error("[account] profile save:", error.message);
      setSaving(false);
      return toast.error(
        error.code === "42P01" || /does not exist|schema cache/i.test(error.message)
          ? "Profile storage is not set up yet (run supabase/account.sql)."
          : "Could not save your profile. Please try again."
      );
    }
    await supabase.auth.updateUser({ data: { full_name: db.full_name ?? "" } }); // so the menu shows your name
    setSaving(false);
    toast.success("Profile saved");
  };

  if (loading) return <Loader2 className="mx-auto mt-10 animate-spin text-cyan-accent" />;

  return (
    <form onSubmit={save} className={`${card} space-y-5`}>
      {notSetUp && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Profile storage is not set up yet. Run <code>supabase/account.sql</code> in the Supabase SQL Editor, then reload this page.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name">
          <input className={input} value={form.full_name} onChange={set("full_name")} maxLength={PROFILE_MAX.full_name} placeholder="Your name" autoComplete="name" />
        </Field>
        <Field label="Email" hint="Your login email. It cannot be changed here.">
          <input className={`${input} opacity-60`} value={user.email} readOnly />
        </Field>
        <Field label="Phone number" hint="Example: +92 300 1234567">
          <input className={input} value={form.phone} onChange={set("phone")} maxLength={PROFILE_MAX.phone} placeholder="+92 300 1234567" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Business / brand name (optional)">
          <input className={input} value={form.business_name} onChange={set("business_name")} maxLength={PROFILE_MAX.business_name} placeholder="Your brand" />
        </Field>
        <Field label="Country">
          <input className={input} value={form.country} onChange={set("country")} maxLength={PROFILE_MAX.country} list="countries" placeholder="Pakistan" autoComplete="country-name" />
          <datalist id="countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="City">
          <input className={input} value={form.city} onChange={set("city")} maxLength={PROFILE_MAX.city} placeholder="Karachi" autoComplete="address-level2" />
        </Field>
      </div>
      <Field label="Address">
        <input className={input} value={form.address} onChange={set("address")} maxLength={PROFILE_MAX.address} placeholder="Street, area" autoComplete="street-address" />
      </Field>
      <Field label="About you (optional)" hint={`${form.about.length}/${PROFILE_MAX.about}`}>
        <textarea className={`${input} min-h-[90px]`} value={form.about} onChange={set("about")} maxLength={PROFILE_MAX.about} placeholder="What do you create or sell?" />
      </Field>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
        </button>
        <p className="text-xs text-text-muted">Only you can see this information.</p>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ Usage */

type UsageItem = { kind: "tool" | "image" | "magic"; used: number; max: number; remaining: number };
const USAGE_LABEL: Record<UsageItem["kind"], string> = {
  tool: "AI tools (captions, bios, blogs, emails...)",
  image: "Image generation",
  magic: "Business blueprints (Magic)",
};

function UsageTab() {
  const [data, setData] = useState<{ paid: boolean; items: UsageItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usage", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Could not load your usage.");
        setData(j);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-300">{error}</p>;
  if (!data) return <Loader2 className="mx-auto mt-10 animate-spin text-cyan-accent" />;

  return (
    <div className="space-y-6">
      <PlanCard paid={data.paid} />

      <div className={`${card} space-y-5`}>
        <h2 className="font-semibold">Today&apos;s usage</h2>
        {data.items.map((u) => {
          const pct = u.max > 0 ? Math.min(100, Math.round((u.used / u.max) * 100)) : 0;
          return (
            <div key={u.kind}>
              <div className="flex justify-between text-sm">
                <span>{USAGE_LABEL[u.kind]}</span>
                <span className="text-text-muted">{u.used} used &middot; {u.remaining} left of {u.max}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-base">
                <div className={`h-full ${pct >= 90 ? "bg-red-400" : "bg-cyan-400"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        <p className="text-xs text-text-muted">Limits use a rolling 24-hour window: each use frees up 24 hours after it happened.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- History */

const TYPES: ("All" | HistoryType)[] = ["All", "Caption", "Hashtag", "Bio", "Email", "Story", "Blueprint"];

function HistoryTab({ supabase }: { supabase: Supabase }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [filter, setFilter] = useState<"All" | HistoryType>("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHistory(supabase, 25).then(setEntries);
  }, [supabase]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (entries ?? []).filter(
      (e) => (filter === "All" || e.type === filter) && (!needle || e.title.toLowerCase().includes(needle) || e.text.toLowerCase().includes(needle))
    );
  }, [entries, filter, q]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy. Select the text and copy it manually.");
    }
  };

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (!entries) return <Loader2 className="mx-auto mt-10 animate-spin text-cyan-accent" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${filter === t ? "border-cyan-accent bg-cyan-accent/10 text-cyan-accent" : "border-base-color text-text-muted hover:text-text-base"}`}
          >
            {t}
          </button>
        ))}
        <input className={`${input} ml-auto max-w-[220px] !py-1.5 text-sm`} placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {shown.length === 0 ? (
        <div className={`${card} text-center text-text-muted`}>
          {entries.length === 0 ? "Nothing here yet. Use a tool and press Save to keep your results." : "No results match your filter."}
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((e) => {
            const key = `${e.type}-${e.id}`;
            const expanded = open.has(key);
            return (
              <li key={key} className={`${card} !p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-cyan-accent/10 px-2 py-0.5 font-semibold text-cyan-accent">{e.type}</span>
                      <span className="text-text-muted">{new Date(e.date).toLocaleString()}</span>
                    </div>
                    <p className="mt-1.5 font-medium">{e.title}</p>
                    {e.text && (
                      <p className={`mt-1 whitespace-pre-line text-sm text-text-muted ${expanded ? "" : "line-clamp-2"}`}>{e.text}</p>
                    )}
                    {e.text.length > 140 && (
                      <button onClick={() => toggle(key)} className="mt-1 text-xs text-cyan-accent hover:underline">
                        {expanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {e.href ? (
                      <Link href={e.href} className="rounded-lg border border-base-color px-3 py-1.5 text-sm hover:border-cyan-accent/60">Open</Link>
                    ) : (
                      <button onClick={() => copy(e.text)} aria-label="Copy" className="rounded-lg border border-base-color p-2 text-text-muted hover:border-cyan-accent/60 hover:text-cyan-accent">
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-sm text-text-muted">
        Need to delete items? Open the <Link href="/history" className="text-cyan-accent hover:underline">full history</Link> or{" "}
        <Link href="/magic/history" className="text-cyan-accent hover:underline">your blueprints</Link>.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- Security */

function SecurityTab({ supabase, user }: { supabase: Supabase; user: User }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Use at least 8 characters for your password.");
    if (pw !== pw2) return toast.error("The two passwords do not match.");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      console.error("[account] password:", error.message);
      return toast.error(error.message || "Could not change your password.");
    }
    setPw("");
    setPw2("");
    toast.success("Password changed");
  };

  const signOutOthers = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) return toast.error("Could not log out other devices.");
    toast.success("Logged out from all other devices");
  }, [supabase]);

  const exportData = async () => {
    setExporting(true);
    try {
      const [history, profile, blueprints] = await Promise.all([
        fetchHistory(supabase, 1000),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("blueprints").select("id, title, prompt, data, done, created_at").order("created_at", { ascending: false }).limit(1000),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        account: { email: user.email },
        profile: profile.data ?? null,
        history,
        blueprints: blueprints.data ?? [],
      };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `optinova-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.success("Your data was downloaded");
    } catch (e) {
      console.error("[account] export:", e);
      toast.error("Could not export your data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={changePassword} className={`${card} space-y-4`}>
        <h2 className="font-semibold">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password">
            <input type="password" className={input} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" minLength={8} />
          </Field>
          <Field label="Repeat new password">
            <input type="password" className={input} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" minLength={8} />
          </Field>
        </div>
        <button type="submit" disabled={saving || !pw} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Update password
        </button>
      </form>

      <div className={`${card} space-y-3`}>
        <h2 className="font-semibold">Devices</h2>
        <p className="text-sm text-text-muted">Logged in on a shared or lost device? Log out everywhere except this browser.</p>
        <button onClick={signOutOthers} className={ghostBtn}>
          <LogOut className="h-4 w-4" /> Log out other devices
        </button>
      </div>

      <div className={`${card} space-y-3`}>
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-text-muted">Download your profile, saved history and blueprints as one file.</p>
        <button onClick={exportData} disabled={exporting} className={ghostBtn}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download my data
        </button>
        <p className="text-xs text-text-muted">
          To delete your account, <Link href="/contact" className="text-cyan-accent hover:underline">contact us</Link>.
        </p>
      </div>
    </div>
  );
}
