import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Set ADMIN_EMAIL in .env.local / Vercel (server-only, no NEXT_PUBLIC_ prefix).
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "ram@optinova.com").toLowerCase();

// If Supabase is slow or unreachable, don't hold every request for ~25s.
const AUTH_TIMEOUT_MS = 4000;
const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([p, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() verifies the session with Supabase (unlike a plain cookie, it can't be forged).
  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith("/dashboard") || path.startsWith("/admin");

  // Public tool APIs (and image proxy) don't need the user: skip the Supabase round-trip entirely.
  if (!isProtected && path.startsWith("/api/tools/")) return supabaseResponse;

  // Fails closed: on timeout/error `user` is null, so protected routes redirect to /login.
  let user = null;
  try {
    const result = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
    user = result?.data.user ?? null;
  } catch {
    user = null;
  }

  // Redirect, but keep any refreshed session cookies.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  // Protect dashboard routes
  if (path.startsWith("/dashboard") && !user) {
    return redirectTo("/login");
  }

  // Protect admin routes: must be logged in, email verified, and the admin email.
  if (path.startsWith("/admin")) {
    if (!user) return redirectTo("/login");
    const isAdmin = !!user.email_confirmed_at && user.email?.toLowerCase() === ADMIN_EMAIL;
    if (!isAdmin) return redirectTo("/dashboard");
  }

  return supabaseResponse;
}
