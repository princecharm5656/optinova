"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; 

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-base text-text-base flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <AlertTriangle className="w-16 h-16 mx-auto text-red-400" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-text-muted">
            We encountered an error. Please try again.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="bg-cyan-accent text-black">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-base-color">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
