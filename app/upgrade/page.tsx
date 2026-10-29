"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, Copy, Check, Building2, MessageCircle, Zap } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function UpgradePage() {
  const [copied, setCopied] = useState<string | null>(null);

  const bankDetails = {
    bankName: "Meezan Bank",
    accountTitle: "Ram Dhingana",
    accountNumber: "1234567890",
    iban: "PK00MEZN0000001234567890",
    swiftCode: "MEZNPKKA",
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-sm">
              <Zap className="w-4 h-4" />
              Upgrade to Pro
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Choose Your Plan
            </h1>
            <p className="text-text-muted">
              Pay via bank transfer (PKR) or international (USD)
            </p>
          </div>

          {/* Pro Plan */}
          <div className="bg-elevated border border-base-color rounded-2xl p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold">OptiNova Pro</h2>
                <p className="text-text-muted mt-1">For individual creators</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">$9</p>
                <p className="text-xs text-text-muted">/month</p>
              </div>
            </div>

            <ul className="space-y-2 text-text-base">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Unlimited AI generation
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                All 12 AI tools
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Save unlimited history
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Priority email support
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Early access to new features
              </li>
            </ul>
          </div>

          {/* Payment Method Tabs */}
          <div className="bg-elevated border border-base-color rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Bank Transfer Details (PKR)
            </h3>

            <div className="space-y-3">
              <DetailRow
                label="Bank Name"
                value={bankDetails.bankName}
                field="bank"
                copied={copied}
                onCopy={copyToClipboard}
              />
              <DetailRow
                label="Account Title"
                value={bankDetails.accountTitle}
                field="title"
                copied={copied}
                onCopy={copyToClipboard}
              />
              <DetailRow
                label="Account Number"
                value={bankDetails.accountNumber}
                field="account"
                copied={copied}
                onCopy={copyToClipboard}
              />
              <DetailRow
                label="IBAN"
                value={bankDetails.iban}
                field="iban"
                copied={copied}
                onCopy={copyToClipboard}
              />
              <DetailRow
                label="SWIFT Code (for international)"
                value={bankDetails.swiftCode}
                field="swift"
                copied={copied}
                onCopy={copyToClipboard}
              />
            </div>

            <div className="bg-base border border-cyan-accent/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-cyan-accent">
                📋 Steps to Upgrade:
              </p>
              <ol className="text-sm text-text-muted space-y-1 list-decimal list-inside">
                <li>Transfer PKR 2500 (≈$9 USD) to the account above</li>
                <li>Take screenshot of transaction</li>
                <li>Email screenshot + your email to: <a href="mailto:ram@optinova.com" className="text-cyan-accent">ram@optinova.com</a></li>
                <li>You'll get Pro access within 24 hours</li>
              </ol>
            </div>

            <a href="mailto:ram@optinova.com?subject=OptiNova Pro Upgrade">
              <Button className="w-full bg-cyan-accent text-black" size="lg">
                <Mail className="w-4 h-4 mr-2" />
                Email Payment Proof
              </Button>
            </a>

            <p className="text-xs text-text-muted text-center">
              For international users: Use SWIFT transfer or PayPal (Friends & Family)
            </p>
          </div>

          {/* WhatsApp Option */}
          <div className="bg-elevated border border-base-color rounded-2xl p-6 text-center space-y-3">
            <MessageCircle className="w-8 h-8 mx-auto text-green-400" />
            <h3 className="font-bold">Questions?</h3>
            <p className="text-sm text-text-muted">
              WhatsApp me directly for instant support
            </p>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="border-green-500/50 text-green-400">
                WhatsApp: +92 300 1234567
              </Button>
            </a>
          </div>

          {/* Trust */}
          <div className="text-center text-xs text-text-muted">
            <p>🔒 Secure transfer · Manual verification · Instant upgrade</p>
            <p className="mt-1">Founded by Ram Dhingana · OptiNova</p>
          </div>

        </div>
      </Container>
    </Section>
  );
}

function DetailRow({
  label,
  value,
  field,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  field: string;
  copied: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-base rounded-lg border border-base-color">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-mono text-text-base truncate">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, field)}
        className="p-2 rounded-lg hover:bg-elevated text-text-muted hover:text-cyan-accent flex-shrink-0"
        title="Copy"
      >
        {copied === field ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
