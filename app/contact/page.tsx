"use client";

import Section from "@/components/wrapper/section";
import Container from "@/components/shared/container";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold">
              Get in Touch
            </h1>
            <p className="text-text-muted">
              Questions, feedback, or support? We're here to help.
            </p>
          </div>

          <div className="bg-elevated border border-base-color rounded-2xl p-8 space-y-6">
            
            <a href="mailto:ram@optinova.com" className="flex items-center gap-4 p-4 bg-base rounded-xl hover:bg-base/70 transition-colors">
              <div className="p-3 rounded-xl bg-cyan-accent/10">
                <Mail className="w-6 h-6 text-cyan-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Email Support</p>
                <p className="text-sm text-text-muted">ram@optinova.com</p>
              </div>
            </a>

            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-base rounded-xl hover:bg-base/70 transition-colors">
              <div className="p-3 rounded-xl bg-green-500/10">
                <MessageCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-text-muted">Quick replies during business hours</p>
              </div>
            </a>

          </div>

          <div className="text-center text-sm text-text-muted">
            <p>Response time: Usually within 24 hours</p>
            <p className="mt-2">Founded by Ram Dhingana</p>
          </div>

        </div>
      </Container>
    </Section>
  );
}
