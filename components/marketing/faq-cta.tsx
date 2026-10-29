"use client";
import Link from "next/link";
import Section from "@/components/wrapper/section";
import { useState } from "react";
import { Plus, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Is OptiNova really free?",
    answer: "Yes! The free tier includes 5 AI credits daily, basic image and PDF tools, and access to all SEO utilities. No credit card required. Premium tiers unlock unlimited AI access and advanced features.",
  },
  {
    question: "Do you support Urdu and Hindi?",
    answer: "Absolutely. OptiNova is built for South Asian creators with native support for English, Urdu (Roman + Script), and Hindi. Our AI models are trained to understand multilingual contexts.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer: "OptiNova isn't just an AI chatbot — it's a complete workspace. We combine AI with specialized tools (SEO, Image, PDF, Analytics) in one place. Plus, our prompts are optimized for specific creator use cases like captions, hashtags, and SEO content.",
  },
  {
    question: "Is my data private?",
    answer: "100%. We use local-first AI for free tools (your data never leaves your device) and encrypted cloud processing for advanced features. We never train models on your content.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, cancel your subscription anytime with one click. No questions, no retention tricks. Your data is yours — export anytime.",
  },
  {
    question: "Do you offer team plans?",
    answer: "Coming in V2.0. We currently focus on individual creators. Teams will include shared workspaces, brand voice settings, and admin dashboards.",
  },
];

function FAQItem({ faq, isOpen, onClick }: { 
  faq: typeof faqs[0]; 
  isOpen: boolean; 
  onClick: () => void; 
}) {
  return (
    <div className="border-b border-base-color">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between gap-4 text-left group"
      >
        <span className="text-lg font-medium text-text-base group-hover:text-cyan-accent transition-colors">
          {faq.question}
        </span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-cyan-accent flex-shrink-0" />
        ) : (
          <Plus className="w-5 h-5 text-text-muted group-hover:text-cyan-accent flex-shrink-0 transition-colors" />
        )}
      </button>
      {isOpen && (
        <div className="pb-6 text-text-muted leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQCTA() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section 
      background="base"
      className="py-24 md:py-32 text-text-base"
    >
      <div className="grid lg:grid-cols-2 gap-16">
        
        {/* FAQ Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="uppercase tracking-[0.3em] text-cyan-accent text-sm font-semibold">
              Questions
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Everything you
              <span className="bg-gradient-to-r from-cyan-accent via-purple-400 to-cyan-accent bg-clip-text text-transparent">
                {" "}wondered.
              </span>
            </h2>
          </div>

          <div>
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>

        {/* CTA Column */}
        <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-cyan-accent/10 via-purple-400/10 to-cyan-accent/10 border border-cyan-accent/20 overflow-hidden">
          {/* Decorative Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-accent/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full filter blur-3xl" />

          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-accent/20 border border-cyan-accent/30 text-cyan-accent text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Start your creator journey
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to build something
              <span className="bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">
                {" "}extraordinary?
              </span>
            </h2>

            <p className="text-lg text-text-muted">
              Join 10,000+ creators who use OptiNova daily to write, design, optimize, and grow. No credit card required.
            </p>

            <ul className="space-y-3">
              {[
                "5 free AI credits daily",
                "Unlimited basic tool usage",
                "Multilingual support (English, Urdu, Hindi)",
                "No credit card needed",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-text-base">
                  <div className="w-5 h-5 rounded-full bg-cyan-accent/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-cyan-accent" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                size="lg"
                className="bg-cyan-accent text-black hover:bg-cyan-accent/90 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-shadow"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-cyan-accent/50 text-cyan-accent hover:bg-cyan-accent/10"
              >
                View Pricing
              </Button>
            </div>

            <p className="text-sm text-text-muted text-center pt-4">
              Founded by <span className="text-cyan-accent font-semibold">Ram Dhingana</span>
            </p>
          </div>
        </div>

      </div>
    </Section>
  );
}
