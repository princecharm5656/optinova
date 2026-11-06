import type { createClient } from "@/lib/supabase/client";

type Supabase = ReturnType<typeof createClient>;

// ---------------- profile ----------------
export type ProfileFields = {
  full_name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  business_name: string;
  about: string;
};

export const EMPTY_PROFILE: ProfileFields = {
  full_name: "", phone: "", country: "", city: "", address: "", business_name: "", about: "",
};

// Must match the CHECK limits in supabase/account.sql
export const PROFILE_MAX: Record<keyof ProfileFields, number> = {
  full_name: 80, phone: 30, country: 60, city: 60, address: 200, business_name: 80, about: 300,
};

const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,19}$/;

/** Returns a human-readable error, or null if the profile is fine. */
export function validateProfile(p: ProfileFields): string | null {
  for (const key of Object.keys(PROFILE_MAX) as (keyof ProfileFields)[]) {
    if (p[key].trim().length > PROFILE_MAX[key]) {
      return `${key.replace("_", " ")} is too long (max ${PROFILE_MAX[key]} characters).`;
    }
  }
  if (p.phone.trim() && !PHONE_RE.test(p.phone.trim())) {
    return "Phone number looks wrong. Use digits only, for example +92 300 1234567.";
  }
  return null;
}

/** Trims everything; empty strings become null so the database stays clean. */
export function toDbProfile(p: ProfileFields) {
  const t = (v: string, multiline = false) => {
    const s = multiline ? v.replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").trim() : v.replace(/\s+/g, " ").trim();
    return s === "" ? null : s;
  };
  return {
    full_name: t(p.full_name),
    phone: t(p.phone),
    country: t(p.country),
    city: t(p.city),
    address: t(p.address),
    business_name: t(p.business_name),
    about: t(p.about, true),
  };
}

// ---------------- history ----------------
export type HistoryType = "Caption" | "Hashtag" | "Bio" | "Email" | "Story" | "Blueprint";

export type HistoryEntry = {
  id: string;
  type: HistoryType;
  title: string;
  text: string; // what "Copy" copies
  date: string;
  href?: string; // blueprints open on their own page
};

/** Turns whatever a history column holds (string, JSON string, array, object) into readable text. */
export function toText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const s = value.trim();
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        return toText(JSON.parse(s));
      } catch {
        /* plain text that only looks like JSON */
      }
    }
    return s;
  }
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join("\n\n");
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(toText).filter(Boolean).join("\n");
  return String(value);
}

const clip = (s: string, n = 80) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export const HISTORY_SOURCES: { type: HistoryType; table: string; select: string; map: (r: any) => HistoryEntry }[] = [
  { type: "Caption", table: "captions_history", select: "id, topic, captions, created_at",
    map: (r) => ({ id: r.id, type: "Caption", title: clip(toText(r.topic) || "Caption"), text: toText(r.captions), date: r.created_at }) },
  { type: "Hashtag", table: "hashtags_history", select: "id, topic, hashtags, created_at",
    map: (r) => ({ id: r.id, type: "Hashtag", title: clip(toText(r.topic) || "Hashtags"), text: toText(r.hashtags), date: r.created_at }) },
  { type: "Bio", table: "bios_history", select: "id, about, bios, created_at",
    map: (r) => ({ id: r.id, type: "Bio", title: clip(toText(r.about) || "Bio"), text: toText(r.bios), date: r.created_at }) },
  { type: "Email", table: "emails_history", select: "id, subject, context, body, created_at",
    map: (r) => ({ id: r.id, type: "Email", title: clip(toText(r.subject) || toText(r.context) || "Email"),
      text: [toText(r.subject), toText(r.body)].filter(Boolean).join("\n\n"), date: r.created_at }) },
  { type: "Story", table: "stories_history", select: "id, title, topic, content, created_at",
    map: (r) => ({ id: r.id, type: "Story", title: clip(toText(r.title) || toText(r.topic) || "Story"),
      text: [toText(r.title), toText(r.content)].filter(Boolean).join("\n\n"), date: r.created_at }) },
  { type: "Blueprint", table: "blueprints", select: "id, title, prompt, created_at",
    map: (r) => ({ id: r.id, type: "Blueprint", title: clip(toText(r.title) || "Business blueprint"), text: toText(r.prompt), date: r.created_at, href: `/magic/${r.id}` }) },
];

/** Reads all history tables (own rows only, enforced by row-level security). One failing table never blanks the rest. */
export async function fetchHistory(supabase: Supabase, perTable: number): Promise<HistoryEntry[]> {
  const parts = await Promise.all(
    HISTORY_SOURCES.map(async (src) => {
      try {
        const { data, error } = await supabase
          .from(src.table)
          .select(src.select)
          .order("created_at", { ascending: false })
          .limit(perTable);
        if (error) {
          console.error(`[account] ${src.table}:`, error.message);
          return [];
        }
        return ((data as unknown as any[]) || []).map(src.map);
      } catch (e) {
        console.error(`[account] ${src.table} crashed:`, e);
        return [];
      }
    })
  );
  return parts.flat().sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
