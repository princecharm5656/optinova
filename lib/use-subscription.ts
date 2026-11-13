"use client";

import { useEffect, useState } from "react";
import type { SubInfo } from "@/lib/subscription";

export type MySub = SubInfo & { memberSince: string | null };
export type SubStatus = "loading" | "ready" | "error";

/** Your plan, plus whether loading worked. Lets the UI say "could not load" instead of guessing. */
export function useSubscriptionState(enabled = true): { info: MySub | null; status: SubStatus } {
  const [state, setState] = useState<{ info: MySub | null; status: SubStatus }>({ info: null, status: "loading" });
  useEffect(() => {
    if (!enabled) return;
    let off = false;
    fetch("/api/subscription", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return (await r.json()) as MySub;
      })
      .then((j) => !off && setState({ info: j, status: "ready" }))
      .catch(() => !off && setState({ info: null, status: "error" }));
    return () => {
      off = true;
    };
  }, [enabled]);
  return state;
}

/** The logged-in user's own plan (state, dates, days left). null while loading, on error, or when logged out. */
export function useSubscription(enabled = true): MySub | null {
  return useSubscriptionState(enabled).info;
}
