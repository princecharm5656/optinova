"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";

// "/#id" (not just "#id") so these also work when you are on another page.
const links = [
  { label: "Features", href: "/#features" },
  { label: "Tools", href: "/tools" },
  { label: "Pricing", href: "/pricing" },
  { label: "Magic", href: "/magic" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wide text-white">
          OptiNova
        </Link>

        <nav className="hidden gap-8 text-sm text-zinc-400 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-cyan-400 text-black font-semibold hover:bg-cyan-300">
              Get Started
            </Button>
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden ml-1 p-2 text-zinc-300 hover:text-white"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-md">
          <Container className="flex flex-col py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-zinc-300 hover:text-white border-b border-white/5 last:border-0"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="py-3 text-zinc-300 hover:text-white sm:hidden">
              Login
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
