"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Sparkles, Wand2 } from "lucide-react";

/**
 * Pollinations' anonymous tier currently allows ~1 image per 45 seconds per IP.
 * When over the limit it returns a *successful* image that says "limit reached",
 * so the browser can't tell it failed. We therefore space requests out and
 * remember the last slot in localStorage (survives reloads and other tabs).
 * With a registered Pollinations key + server-side proxy this limit goes away.
 */
// Set NEXT_PUBLIC_IMAGE_GAP_MS=0 in .env.local once POLLINATIONS_API_KEY is configured.
export const IMAGE_GAP_MS = Number(process.env.NEXT_PUBLIC_IMAGE_GAP_MS ?? 46_000);
const GAP_MS = IMAGE_GAP_MS;
const LOAD_TIMEOUT_MS = 60_000;
const MAX_AUTO_RETRIES = 1;
const SLOT_KEY = "optinova_img_next_slot";

function reserveSlot() {
  const now = Date.now();
  let next = 0;
  try {
    next = Number(localStorage.getItem(SLOT_KEY)) || 0;
  } catch {}
  const start = Math.max(now, next);
  try {
    localStorage.setItem(SLOT_KEY, String(start + GAP_MS));
  } catch {}
  return start - now;
}

// Goes through our server route: it uses the secret key if configured (else redirects to the free tier).
const buildUrl = (prompt: string, seed: number) =>
  `/api/tools/magic/image?prompt=${encodeURIComponent(prompt)}&seed=${seed}`;

function hueFrom(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
  return 250 + (h % 50); // stay in the purple/indigo family
}

type Status = "idle" | "queued" | "loading" | "loaded" | "failed";

export default function AiImage({
  prompt,
  label,
  autoStart = true,
}: {
  prompt: string;
  label: string;
  autoStart?: boolean;
}) {
  const [status, setStatus] = useState<Status>(autoStart ? "queued" : "idle");
  const [src, setSrc] = useState<string | null>(null);
  const [waitSec, setWaitSec] = useState(0);

  const seedRef = useRef(Math.floor(Math.random() * 1_000_000));
  const retriesRef = useRef(0);
  const startedRef = useRef(false);
  const mountedRef = useRef(false);
  const slotTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const loadTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fail = useCallback(() => {
    clearTimeout(loadTimer.current);
    setStatus("failed");
  }, []);

  const start = useCallback(() => {
    clearTimeout(slotTimer.current);
    clearTimeout(loadTimer.current);
    setStatus("queued");
    setSrc(null);

    const delay = reserveSlot();
    setWaitSec(Math.ceil(delay / 1000));

    slotTimer.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setStatus("loading");
      setSrc(buildUrl(prompt, seedRef.current));
      loadTimer.current = setTimeout(() => {
        if (!mountedRef.current) return;
        if (retriesRef.current < MAX_AUTO_RETRIES) {
          retriesRef.current += 1;
          seedRef.current = Math.floor(Math.random() * 1_000_000);
          start();
        } else {
          fail();
        }
      }, LOAD_TIMEOUT_MS);
    }, delay);
  }, [prompt, fail]);

  useEffect(() => {
    mountedRef.current = true;
    if (autoStart && !startedRef.current) {
      startedRef.current = true; // guards React StrictMode's double-run in dev
      start();
    }
    // Do NOT clear timers here (StrictMode would kill the pending start); callbacks check mountedRef.
    return () => {
      mountedRef.current = false;
    };
  }, [start, autoStart]);

  const generate = () => {
    retriesRef.current = 0;
    seedRef.current = Math.floor(Math.random() * 1_000_000);
    start();
  };

  const hue = hueFrom(prompt);
  const statusText =
    status === "queued"
      ? waitSec > 2 ? `Starts in ~${waitSec}s (image rate limit)` : "Starting…"
      : status === "loading" ? "Generating…"
      : status === "failed" ? "Couldn't load image" : "";

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-4 rounded-3xl group">
      <div
        className="aspect-square w-full rounded-2xl mb-4 relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 20%, hsl(${hue} 70% 35% / 0.55), transparent 60%),
                       radial-gradient(circle at 80% 90%, hsl(${hue + 40} 70% 30% / 0.45), transparent 55%), #0b0b12`,
        }}
      >
        {status !== "loaded" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <Sparkles className={`text-purple-300 ${status === "loading" ? "animate-pulse" : ""}`} size={36} />
            <p className="text-base font-semibold text-white">{label}</p>
            {statusText && <p className="text-sm text-gray-300">{statusText}</p>}
            {status === "idle" && (
              <button
                onClick={generate}
                className="mt-1 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors"
              >
                <Wand2 size={16} /> Generate image
              </button>
            )}
          </div>
        )}

        {src && status !== "failed" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={label}
            referrerPolicy="no-referrer"
            onLoad={() => {
              clearTimeout(loadTimer.current);
              setStatus("loaded");
            }}
            onError={() => {
              if (retriesRef.current < MAX_AUTO_RETRIES) {
                retriesRef.current += 1;
                seedRef.current = Math.floor(Math.random() * 1_000_000);
                start();
              } else fail();
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {status === "loaded" && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent text-sm text-white font-medium">
            {label}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-300 italic line-clamp-2">{prompt}</p>
        {(status === "loaded" || status === "failed") && (
          <button
            onClick={generate}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm text-purple-300 hover:text-purple-200 border border-purple-500/30 rounded-full px-3 py-1.5 transition-colors"
          >
            <RefreshCw size={14} /> {status === "failed" ? "Retry" : "Regenerate"}
          </button>
        )}
      </div>
    </div>
  );
}
