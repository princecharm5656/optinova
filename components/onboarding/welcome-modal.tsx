"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("optinova-welcome-seen");
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("optinova-welcome-seen", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-elevated border border-cyan-accent/30 rounded-2xl p-8 max-w-2xl w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-base"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-accent to-purple-400">
            <Sparkles className="w-8 h-8 text-black" />
          </div>

          <div>
            <h2 className="text-3xl font-bold">Welcome to OptiNova! 🚀</h2>
            <p className="text-text-muted mt-2">
              Let's get you started in 60 seconds
            </p>
          </div>

          <div className="space-y-3 text-left bg-base rounded-xl p-6">
            <Step number={1} text="Try your first AI tool (AI Caption recommended)" />
            <Step number={2} text="Save outputs to history (auto-saved)" />
            <Step number={3} text="Upgrade to Pro for unlimited AI generations" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/tools/caption">
              <Button onClick={handleClose} className="bg-cyan-accent text-black">
                Start First Tool
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button onClick={handleClose} variant="outline" className="border-base-color">
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-cyan-accent text-black text-sm font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <p className="text-text-base">{text}</p>
    </div>
  );
}
