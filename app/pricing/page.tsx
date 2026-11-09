"use client";

import Link from "next/link";
import Section from "@/components/wrapper/section";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

// Only list what exists today. Teams is not built yet, so it is "coming soon" and cannot be bought.
const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "40 AI generations daily",
      "60 image generations daily",
      "10 business blueprints daily",
      "All tools included",
      "Your history saved in your account",
      "Support via the contact form",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
    comingSoon: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious creators",
    features: [
      "400 AI generations daily",
      "600 image generations daily",
      "100 business blueprints daily",
      "All tools included",
      "Your history saved in your account",
      "Priority email support",
    ],
    cta: "Get Pro",
    href: "/upgrade",
    highlighted: true,
    comingSoon: false,
  },
  {
    name: "Teams",
    price: "Soon",
    description: "Planned for a future release. Not available yet.",
    features: [
      "Everything in Pro",
      "Multiple team seats",
      "Shared workspace",
      "Brand voice settings",
      "Team analytics",
    ],
    cta: "Tell us you are interested",
    href: "/contact",
    highlighted: false,
    comingSoon: true,
  },
];

function FeatureRow({ feature, free, pro, teams }: {
  feature: string;
  free: string;
  pro: string;
  teams: string;
}) {
  return (
    <tr className="border-b border-base-color/50">
      <td className="p-4 text-text-base">{feature}</td>
      <td className="p-4 text-center text-text-muted">{free}</td>
      <td className="p-4 text-center text-cyan-accent font-medium">{pro}</td>
      <td className="p-4 text-center text-purple-400 font-medium">{teams}</td>
    </tr>
  );
}


export default function PricingPage() {
  return (
    <Section background="base" className="py-24 min-h-screen text-text-base">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="uppercase tracking-[0.3em] text-cyan-accent text-sm font-semibold">
            Pricing
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Simple plans.
            <span className="bg-gradient-to-r from-cyan-accent via-purple-400 to-cyan-accent bg-clip-text text-transparent">
              Real value.
            </span>
          </h1>
          <p className="text-xl text-text-muted">
            Start free. Upgrade when you need more power. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border ${
                tier.highlighted
                  ? "border-cyan-accent bg-elevated shadow-[0_0_40px_rgba(6,182,212,0.3)]"
                  : "border-base-color bg-elevated/40"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-accent text-black text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-text-muted">{tier.period}</span>}
              </div>
              <p className="text-text-muted mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-cyan-accent flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.name === "Free" ? (
                <Link href="/signup">
                  <Button size="lg" className="w-full">{tier.cta}</Button>
                </Link>
              ) : tier.comingSoon ? (
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full">{tier.cta}</Button>
                </Link>
              ) : (
                <Link href="/upgrade">
                  <Button size="lg" className="w-full bg-cyan-400 text-black font-semibold hover:bg-cyan-300">
                    {tier.cta}
                  </Button>
                </Link>
              )}

            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-accent/20 to-purple-400/20 border border-cyan-accent/30 rounded-2xl p-6 text-center max-w-3xl mx-auto">
          <p className="text-cyan-accent font-semibold text-lg">🚀 Launch Special</p>
          <p className="text-text-base mt-2">
            First 50 users get <span className="font-bold text-cyan-accent">50% off lifetime</span>
          </p>
          <p className="text-xs text-text-muted mt-2">
            Use code <code className="px-2 py-1 bg-base rounded">LAUNCH50</code> at upgrade
          </p>
        </div>


        <p className="text-center text-text-muted text-sm mt-8">
          Founded by <span className="text-cyan-accent font-semibold">Ram Dhingana</span>
        </p>
      </Container>

      {/* Feature Comparison */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Compare Plans</h2>
        <div className="bg-elevated border border-base-color rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-base-color">
                <th className="text-left p-4 text-text-muted">Feature</th>
                <th className="text-center p-4 text-cyan-accent">Free</th>
                <th className="text-center p-4 text-cyan-accent">Pro</th>
                <th className="text-center p-4 text-purple-400">Teams (soon)</th>
              </tr>
            </thead>
            <tbody className="text-text-base">
              <FeatureRow feature="AI generations per day" free="40/day" pro="400/day" teams="Soon" />
              <FeatureRow feature="Image generations per day" free="60/day" pro="600/day" teams="Soon" />
              <FeatureRow feature="Business blueprints per day" free="10/day" pro="100/day" teams="Soon" />
              <FeatureRow feature="Blueprint PDF export" free="✅" pro="✅" teams="Soon" />
              <FeatureRow feature="History saved in your account" free="✅" pro="✅" teams="Soon" />
              <FeatureRow feature="Priority support" free="❌" pro="✅" teams="Soon" />
            </tbody>
          </table>
        </div>
      </div>

    </Section>
  );
}
