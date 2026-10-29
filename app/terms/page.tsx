"use client";

import Section from "@/components/wrapper/section";
import Container from "@/components/shared/container";

export default function TermsPage() {
  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-text-muted mt-2">Last updated: August 7, 2026</p>

          <div className="space-y-6 mt-8 text-text-base leading-relaxed">
            
            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using OptiNova (the "Service"), you agree to be bound by 
                these Terms of Service ("Terms"). If you disagree with any part of these 
                Terms, you may not access the Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">2. Description of Service</h2>
              <p>
                OptiNova provides AI-powered content generation tools including but not 
                limited to caption generators, hashtag finders, bio writers, email composers, 
                and image generators. The Service is provided "AS IS" and "AS AVAILABLE."
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">3. Account Registration</h2>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the security of your account and password</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately upon any unauthorized use of your account</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">4. Acceptable Use</h2>
              <p className="mb-3">You agree NOT to use the Service to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Generate illegal, harmful, threatening, abusive, or defamatory content</li>
                <li>Create content that infringes intellectual property rights</li>
                <li>Distribute spam, malware, or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Abuse free tier limits through automated means</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">5. Content Ownership & License</h2>
              <p className="mb-3"><strong>Your Content:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>You retain all rights to content you input into the Service</li>
                <li>You retain all rights to AI-generated outputs (subject to third-party AI provider terms)</li>
                <li>You grant us a limited license to process your content solely to provide the Service</li>
                <li>You are solely responsible for the content you create and its use</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">6. AI-Generated Content Disclaimer</h2>
              <p className="mb-3">
                <strong>IMPORTANT:</strong> AI-generated content may contain errors, biases, 
                or inaccuracies. By using OptiNova, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>We do not guarantee accuracy, completeness, or reliability of AI outputs</li>
                <li>You must review and verify all AI-generated content before use</li>
                <li>We are not liable for any damages from AI-generated content</li>
                <li>AI content should not be used for professional advice (medical, legal, financial)</li>
                <li>AI outputs should not violate copyrights, trademarks, or other IP rights</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">7. Free Tier & Paid Plans</h2>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li><strong>Free tier:</strong> 5 AI generations per day, subject to fair use</li>
                <li><strong>Pro plan:</strong> $9/month or equivalent in local currency, unlimited usage</li>
                <li><strong>Teams plan:</strong> $29/month, for team workspaces</li>
                <li>Pricing may change with 30 days notice</li>
                <li>Refunds per our Refund Policy</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">8. Payment Terms</h2>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Subscriptions renew automatically unless canceled</li>
                <li>Cancel anytime from your account dashboard</li>
                <li>No refunds for partial months</li>
                <li>Price changes apply on next billing cycle</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">9. Service Availability</h2>
              <p>
                We strive for 99.9% uptime but do not guarantee uninterrupted access. 
                We may suspend service for maintenance, updates, or unforeseen circumstances.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OPTINOVA SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Any indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages from AI-generated content</li>
                <li>Service interruptions or downtime</li>
                <li>Third-party content or actions</li>
              </ul>
              <p className="mt-3">
                Our total liability shall not exceed the amount paid by you in the past 12 months.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold OptiNova, its founder Ram Dhingana, and affiliates 
                harmless from any claims, damages, or expenses arising from your use of the Service 
                or violation of these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">12. Termination</h2>
              <p className="mb-3">We reserve the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-text-muted">
                <li>Suspend or terminate accounts violating these Terms</li>
                <li>Remove abusive or illegal content</li>
                <li>Discontinue the Service with 30 days notice</li>
                <li>You may delete your account anytime</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">13. Changes to Terms</h2>
              <p>
                We may update these Terms periodically. Continued use after changes 
                constitutes acceptance. Major changes will be notified via email.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">14. Governing Law</h2>
              <p>
                These Terms shall be governed by the laws of Pakistan. 
                Any disputes shall be resolved in courts of Pakistan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-accent mb-3">15. Contact</h2>
              <p>For questions about these Terms:</p>
              <ul className="list-none space-y-1 ml-4 mt-2 text-text-muted">
                <li>📧 Email: legal@optinova.com</li>
                <li>👤 Founder: Ram Dhingana</li>
                <li>🌐 Website: optinova-black.vercel.app</li>
              </ul>
            </div>

          </div>

          {/* Acceptance */}
          <div className="mt-12 p-6 bg-cyan-accent/10 border border-cyan-accent/30 rounded-2xl">
            <p className="text-text-base">
              <strong>By creating an account or using OptiNova, you agree to these Terms of Service.</strong>
            </p>
          </div>

        </div>
      </Container>
    </Section>
  );
}
