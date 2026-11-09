"use client";

import { useEffect, useState } from "react";
import type { SubInfo } from "@/lib/subscription";

export type MySub = SubInfo & { memberSince: string | null };

/** The logged-in user's own plan (state, dates, days left). null while loading or when logged out. */
export function useSubscription(enabled = true): MySub | null {
  const [info, setInfo] = useState<MySub | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let off = false;
    fetch("/api/subscription", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => !off && j && setInfo(j as MySub))
      .catch(() => {});
    return () => {
      off = true;
    };
  }, [enabled]);
  return info;
}
