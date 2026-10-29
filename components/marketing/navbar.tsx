"use client";

import Link from "next/link";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";


export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wide text-white">
          OptiNova
        </Link>

        <nav className="hidden gap-8 text-sm text-zinc-400 md:flex">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#tools" className="hover:text-white transition-colors">
            Tools
          </a>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-cyan-accent text-black hover:bg-cyan-accent/90">
              Get Started
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
