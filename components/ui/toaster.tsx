"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { TOAST_EVENT, type ToastDetail } from "@/lib/toast";

type Item = ToastDetail & { id: number };

const STYLE = {
  success: { Icon: CheckCircle2, cls: "border-emerald-500/40 text-emerald-100", icon: "text-emerald-400" },
  error: { Icon: AlertTriangle, cls: "border-red-500/40 text-red-100", icon: "text-red-400" },
  info: { Icon: Info, cls: "border-cyan-500/40 text-cyan-50", icon: "text-cyan-400" },
} as const;

/** Mount once in the root layout. Shows short, self-closing messages bottom-right. */
export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    const onToast = (e: Event) => {
      const d = (e as CustomEvent<ToastDetail>).detail;
      if (!d?.message) return;
      const id = nextId.current++;
      setItems((prev) => [...prev.slice(-3), { ...d, id }]); // keep at most 4 on screen
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), d.kind === "error" ? 6000 : 3500);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 print:hidden">
      {items.map((t) => {
        const { Icon, cls, icon } = STYLE[t.kind];
        return (
          <div key={t.id} role="status" className={`flex items-start gap-3 rounded-xl border bg-[#0f0f14]/95 px-4 py-3 text-sm shadow-xl backdrop-blur ${cls}`}>
            <Icon size={18} className={`mt-0.5 shrink-0 ${icon}`} />
            <p className="flex-1 break-words whitespace-pre-line">{t.message}</p>
            <button onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))} aria-label="Dismiss" className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
