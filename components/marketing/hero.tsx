"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <Section background="base" className="min-h-screen text-text-base flex items-center pt-16 relative overflow-hidden">
      <div className="absolute inset-0 animate-gradient" style={{ background: 'linear-gradient(135deg, #08080F 0%, #1E1B4B 25%, #312E81 50%, #1E1B4B 75%, #08080F 100%)' }} aria-hidden="true" />
      <div className="relative z-10 max-w-3xl space-y-8">
        <p className="uppercase tracking-[0.3em] text-cyan-accent">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse" />
            OptiNova
          </span>
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          The Operating System
          <br />
          <span className="bg-gradient-to-r from-cyan-accent via-purple-400 to-cyan-accent bg-clip-text text-transparent">
            For Creators
          </span>
        </h1>
        <p className="text-xl text-text-muted max-w-2xl">
          AI Writing, SEO, Image, PDF and Creator Tools— all inside one intelligent workspace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-cyan-accent text-black hover:bg-cyan-accent/90">
              Start Building Free →
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-cyan-accent/50 text-cyan-accent">
              Login
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-6 pt-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-cyan-accent/30 border-2 border-base" />
            <div className="w-8 h-8 rounded-full bg-purple-400/30 border-2 border-base" />
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 border-2 border-base" />
            <div className="w-8 h-8 rounded-full bg-cyan-accent/30 border-2 border-base" />
          </div>
          <p className="text-sm text-text-muted">
            <span className="text-text-base font-semibold">10,000+</span> creators building with OptiNova
          </p>
        </div>
      </div>
    </Section>
  );
}
