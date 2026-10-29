"use client";

import { useState } from "react";
import { Mail, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WaitlistForm({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || "Failed");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-accent/10 to-purple-400/10 border border-cyan-accent/30 rounded-2xl p-8 max-w-xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/20 text-cyan-accent text-sm">
          <Sparkles className="w-4 h-4" />
          Join 10,000+ creators
        </div>

        <h3 className="text-3xl font-bold">
          Get Early Access + Updates
        </h3>
        <p className="text-text-muted">
          New tools, features, and AI tips. No spam.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 bg-base border border-base-color rounded-lg text-text-base focus:border-cyan-accent focus:outline-none"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-cyan-accent text-black hover:bg-cyan-accent/90"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <><Check className="w-4 h-4 mr-1" />Done!</>
            ) : (
              <>Join Waitlist →</>
            )}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-400">
            ✅ Check your email for confirmation!
          </p>
        )}

        <p className="text-xs text-text-muted pt-2">
          🔒 No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
