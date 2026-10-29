"use client";

import Section from "@/components/wrapper/section";
import Container from "@/components/shared/container";

export default function PrivacyPage() {
  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <div className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-text-muted">Last updated: August 7, 2026</p>

          <div className="space-y-6 mt-8 text-text-base">
            
            <Section_ title="1. Introduction">
              OptiNova ("we", "our", "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you visit our website optinova-black.vercel.app.
              <br /><br />
              By accessing or using OptiNova, you agree to the collection and use of 
              information in accordance with this policy.
            </Section_>

            <Section_ title="2. Information We Collect">
              
              <h3 className="text-xl font-semibold mt-4">2.1 Personal Information</h3>
              <p>When you sign up, we collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Email address (required for account creation)</li>
                <li>Authentication data (managed by Supabase)</li>
                <li>Optional profile information</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4">2.2 Usage Data</h3>
              <p>We automatically collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and features used</li>
                <li>Time and date of access</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4">2.3 User Content</h3>
              <p>
                When you use our AI tools, we temporarily process your inputs 
                (text prompts) to generate outputs. Your saved generations are stored 
                in our database. <strong>We do NOT use your content to train AI models.</strong>
              </p>
            </Section_>

            <Section_ title="3. How We Use Your Information">
              We use collected information for:
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-text-muted">
                <li>Providing and maintaining our service</li>
                <li>Processing AI tool requests</li>
                <li>Saving your generation history</li>
                <li>Sending transactional emails (account, billing)</li>
                <li>Analyzing usage patterns to improve our service</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Complying with legal obligations</li>
              </ul>
            </Section_>

            <Section_ title="4. Data Storage & Security">
              <p>
                Your data is stored using Supabase (data infrastructure provider) 
                with industry-standard encryption:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Encrypted in transit (HTTPS/TLS)</li>
                <li>Encrypted at rest (AES-256)</li>
                <li>Row-level security (RLS) policies enforced</li>
                <li>Regular security audits</li>
              </ul>
              <p className="mt-3">
                <strong>However, no method of transmission over the internet is 100% secure.</strong> 
                While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </Section_>

            <Section_ title="5. Third-Party Services">
              We use the following third-party services:
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-text-muted">
                <li><strong>Supabase:</strong> Authentication and database hosting</li>
                <li><strong>Vercel:</strong> Website hosting and CDN</li>
                <li><strong>Groq AI:</strong> AI text generation (prompts sent to API)</li>
                <li><strong>Pollinations.ai:</strong> AI image generation</li>
              </ul>
              <p className="mt-3 text-text-muted">
                These services have their own privacy policies. We are not responsible 
                for their practices.
              </p>
            </Section_>

            <Section_ title="6. Cookies & Tracking">
              <p>
                We use minimal cookies and local storage for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Authentication session management</li>
                <li>User preferences (theme, language)</li>
                <li>Analytics (optional, anonymized)</li>
              </ul>
              <p className="mt-3">
                You can disable cookies in your browser settings, but this may 
                affect functionality.
              </p>
            </Section_>

            <Section_ title="7. Your Rights">
              You have the right to:
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Correction:</strong> Update inaccurate information</li>
                <li><strong>Deletion:</strong> Request account and data deletion</li>
                <li><strong>Export:</strong> Download all your data (coming soon)</li>
                <li><strong>Opt-out:</strong> Unsubscribe from emails</li>
              </ul>
              <p className="mt-3">
                Contact us at <a href="mailto:privacy@optinova.com" className="text-cyan-accent">privacy@optinova.com</a> to exercise these rights.
              </p>
            </Section_>

            <Section_ title="8. Data Retention">
              <p>
                We retain your data for as long as your account is active. 
                If you delete your account:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Personal data deleted within 30 days</li>
                <li>Anonymized analytics retained indefinitely</li>
                <li>Backups purged within 90 days</li>
              </ul>
            </Section_>

            <Section_ title="9. Children's Privacy">
              <p>
                OptiNova is not intended for users under 13 years of age. 
                We do not knowingly collect data from children. 
                If you believe a child has provided data, contact us immediately.
              </p>
            </Section_>

            <Section_ title="10. International Data Transfers">
              <p>
                Your data may be transferred to and processed in countries other than 
                your own. By using OptiNova, you consent to such transfers. 
                We ensure adequate protection through standard contractual clauses.
              </p>
            </Section_>

            <Section_ title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically. 
                Changes will be posted on this page with an updated "Last updated" date. 
                Continued use after changes constitutes acceptance.
              </p>
            </Section_>

            <Section_ title="12. AI-Generated Content Disclaimer">
              <p>
                OptiNova uses AI to generate content. While we strive for accuracy:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>AI outputs may contain errors or biases</li>
                <li>You are responsible for reviewing AI-generated content</li>
                <li>Do not rely solely on AI for legal, medical, or financial advice</li>
                <li>AI content should not infringe on copyrights or trademarks</li>
              </ul>
            </Section_>

            <Section_ title="13. Contact Us">
              <p>For privacy questions or concerns:</p>
              <ul className="list-none space-y-1 ml-4 mt-2 text-text-muted">
                <li>📧 Email: privacy@optinova.com</li>
                <li>🌐 Website: optinova-black.vercel.app</li>
                <li>👤 Founder: Ram Dhingana</li>
              </ul>
            </Section_>

          </div>

          {/* Acceptance Box */}
          <div className="mt-12 p-6 bg-cyan-accent/10 border border-cyan-accent/30 rounded-2xl">
            <p className="text-text-base">
              <strong>By using OptiNova, you acknowledge that you have read and 
              understood this Privacy Policy.</strong>
            </p>
          </div>

        </div>
      </Container>
    </Section>
  );
}

function Section_({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-cyan-accent">{title}</h2>
      <div className="text-text-base leading-relaxed">{children}</div>
    </div>
  );
}
