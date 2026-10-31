import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Same rule as proxy.ts: logged in + verified email + the admin email.
// trim() + quote-stripping: a stray space or "quotes" pasted into Vercel would otherwise break the match.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "ram@optinova.com").trim().replace(/^["']+|["']+$/g, "").toLowerCase();

const isAdminUser = (user: { email?: string | null; email_confirmed_at?: string | null }) =>
  !!user.email_confirmed_at && user.email?.toLowerCase() === ADMIN_EMAIL;

export type Me = { loggedIn: false } | { loggedIn: true; email: string; isAdmin: boolean };

/** Who is logged in right now (server-side), and are they the admin? Does NOT reveal the admin email. */
export async function getCurrentUser(): Promise<Me> {
  try {
    const supabase = await createServerClient();
    const res = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
    ]);
    const user = res?.data.user;
    if (!user) return { loggedIn: false };
    return { loggedIn: true, email: user.email || "", isAdmin: isAdminUser(user) };
  } catch {
    return { loggedIn: false };
  }
}

export type AdminCheck = { ok: true } | { ok: false; status: 401 | 403 | 503; error: string };

/** Verifies on the SERVER that the caller is the admin. Never trust the browser. */
export async function requireAdmin(): Promise<AdminCheck> {
  try {
    const supabase = await createServerClient();
    const res = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
    ]);
    if (!res) return { ok: false, status: 503, error: "Login service is not responding." };
    const user = res.data.user;
    if (!user) {
      if (res.error && (res.error.status === 0 || /fetch/i.test(res.error.message))) {
        return { ok: false, status: 503, error: "Login service is not reachable." };
      }
      return { ok: false, status: 401, error: "Please log in." };
    }
    if (!isAdminUser(user)) {
      return { ok: false, status: 403, error: "Admin access only." };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[admin] check failed:", e?.message || e);
    return { ok: false, status: 503, error: "Could not verify admin access." };
  }
}

/**
 * Service-role client: bypasses row-level security. Use ONLY in server code AFTER requireAdmin().
 * SUPABASE_SERVICE_ROLE_KEY must NOT have a NEXT_PUBLIC_ prefix (it would leak to every visitor).
 */
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set on the server.");
  return createAdminClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type AdminDb = ReturnType<typeof adminDb>;

export async function listAllUsers(db: AdminDb) {
  const perPage = 1000;
  const users: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < perPage) break;
  }
  return users;
}

/** Supabase returns max 1000 rows per request, so page through the table (capped at 50k rows). */
export async function fetchAll(db: AdminDb, table: string, columns: string) {
  const size = 1000;
  const rows: any[] = [];
  for (let i = 0; i < 50; i++) {
    const { data, error } = await db.from(table).select(columns).range(i * size, i * size + size - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < size) break;
  }
  return rows;
}
