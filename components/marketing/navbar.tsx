import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <div className="text-xl font-bold tracking-wide text-white">
          OptiNova
        </div>

        <nav className="hidden gap-8 text-sm text-zinc-400 md:flex">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>

          <a href="#tools" className="hover:text-white transition-colors">
            Tools
          </a>

          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>

          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <Button>Get Started</Button>
      </Container>
    </header>
  );
}