import Link from "next/link";
import Section from "@/components/wrapper/section";
import Container from "@/components/shared/container";

export default function Footer() {
  return (
    <footer className="border-t border-base bg-base">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-4">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-2xl font-bold text-text-base">
              OptiNova
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              The operating system for creators.
              Built for the next generation of digital professionals.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold text-text-base mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#features" className="hover:text-cyan-accent transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#tools" className="hover:text-cyan-accent transition-colors">
                  Tools
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-cyan-accent transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#changelog" className="hover:text-cyan-accent transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-text-base mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#about" className="hover:text-cyan-accent transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-cyan-accent transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-cyan-accent transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-text-base mb-4">
              Legal
            </h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#privacy" className="hover:text-cyan-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-cyan-accent transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-cyan-accent transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-base flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted text-center md:text-left">
            © 2026 OptiNova. All rights reserved.
          </p>

          <p className="text-sm text-text-muted text-center md:text-right">
            Founded by{" "}
            <span className="text-cyan-accent font-semibold">
              Ram Dhingana
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center text-xs text-text-muted">
          <Link href="/privacy" className="hover:text-cyan-accent">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-cyan-accent">Terms of Service</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-cyan-accent">Contact</Link>
        </div>


      </Container>
    </footer>
  );
}
