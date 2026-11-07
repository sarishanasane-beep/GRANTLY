import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LEGAL_CONFIG } from '@/config/legal';
import { ShieldCheck, Lock, AlertTriangle, Printer } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-text">
      {/* Header */}
      <div className="space-y-3 border-b border-border/50 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client-Side Privacy Architecture</span>
            </Badge>
            <Badge variant="gold" size="sm">
              Prototype Disclosure
            </Badge>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print Privacy Policy"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-text hover:bg-surface-elevated transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Policy</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted">
          Last Updated: November 2026 • Effective for GRANTLY Prototype Version 0.1.0
        </p>
      </div>

      {/* Prototype Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#1F2A1F]/70 border border-[#3E5A3F]/50 flex items-start gap-3.5 text-xs text-[#8CA98C]">
        <Lock className="w-4 h-4 text-[#D9C7A3] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-semibold text-[#D9C7A3]">Executive Summary: Local-First Privacy</span>
          <p className="leading-relaxed">
            GRANTLY is currently a frontend-only technology prototype. <strong>We do not operate a remote user database, and we do not transmit, sell, or monetize your personal information.</strong> All scholarship matching algorithms execute locally within your device&apos;s browser memory.
          </p>
        </div>
      </div>

      {/* Section 1: Information Collected */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">1</span>
          Information You Provide Locally
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          When configuring your student profile for scholarship discovery, the following parameters are collected and stored within your web browser (<code className="text-[#D9C7A3] font-mono">localStorage</code>):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Card className="p-4 border-border bg-surface space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D9C7A3]">
              Academic &amp; Eligibility Criteria
            </h3>
            <ul className="text-xs text-muted space-y-1 list-disc list-inside">
              <li>Current education level (e.g. Undergraduate, Diploma)</li>
              <li>Academic field of study and course name</li>
              <li>Percentage or CGPA aggregate score</li>
              <li>State of permanent domicile</li>
              <li>Annual family income bracket</li>
              <li>Social category, gender, first-generation, PwD status</li>
            </ul>
          </Card>

          <Card className="p-4 border-border bg-surface space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D9C7A3]">
              Optional Demonstration Attributes
            </h3>
            <ul className="text-xs text-muted space-y-1 list-disc list-inside">
              <li>Full student name (optional display name)</li>
              <li>Contact email and phone (used only for mock profile previews)</li>
              <li>Self-declared skills and brief bio</li>
              <li>Application tracker checklist statuses</li>
              <li>Document readiness checklist indicators</li>
            </ul>
          </Card>
        </div>

        <p className="text-xs text-muted/80">
          <strong>Data Minimization Notice:</strong> GRANTLY never asks for and never stores sensitive government identity numbers (such as Aadhaar, PAN, SSN), bank account passwords, debit/credit card numbers, or biometric data.
        </p>
      </section>

      {/* Section 2: How Your Data Is Processed */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">2</span>
          How Your Data Is Processed
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Your parameters are processed exclusively by our client-side deterministic matching engine (<code className="text-[#D9C7A3] font-mono">src/lib/matchingEngine.ts</code>) to:
        </p>
        <ul className="text-xs text-muted space-y-1.5 list-disc list-inside pl-2">
          <li>Calculate rule-based match scores across the 36 demonstration scholarships.</li>
          <li>Categorize opportunities into <em>Eligible</em>, <em>Potentially Eligible</em>, and <em>Not Eligible</em>.</li>
          <li>Display transparent explanations of met criteria vs. missing criteria.</li>
          <li>Maintain your application status on the Kanban tracker.</li>
        </ul>
      </section>

      {/* Section 3: Browser Storage */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">3</span>
          Browser Storage &amp; Cookies
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          GRANTLY utilizes HTML5 <code className="text-[#D9C7A3] font-mono">localStorage</code> under the key <code className="text-[#D9C7A3] font-mono">grantly-platform-v1</code> to persist your profile and application state across page reloads.
        </p>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside pl-2">
          <li><strong>Zero Tracking Cookies:</strong> GRANTLY does not deploy advertising cookies, behavioral tracking pixels, or cross-site tracking beacons.</li>
          <li><strong>Device Isolation:</strong> Your stored data does not synchronize to other browsers or devices.</li>
        </ul>
      </section>

      {/* Section 4: External Network Requests */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">4</span>
          External Network Requests
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          While your personal profile is never transmitted over the network, the browser loads the following external assets for visual presentation:
        </p>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside pl-2">
          <li><strong>Google Fonts:</strong> Web fonts (Inter, Plus Jakarta Sans, Sora) loaded from Google&apos;s CDN subject to Google&apos;s standard font privacy terms.</li>
          <li><strong>Unsplash:</strong> A static stock avatar image for mock student demonstration.</li>
        </ul>
      </section>

      {/* Section 5: Data Deletion */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">5</span>
          Data Deletion &amp; User Control
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          You have full and permanent control over your local data. You can erase all profile data, application tracking entries, and saved scholarships at any time by navigating to <a href="/profile" className="text-[#D9C7A3] underline hover:text-[#F5F7F5]">Student Profile</a> and clicking <strong>&quot;Delete My Local Data&quot;</strong>.
        </p>
      </section>

      {/* Section 6: Minor Students Advisory */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">6</span>
          Notice for Students Under 18 Years
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          {LEGAL_CONFIG.disclaimers.underageAdvisoryNotice} Prior to any commercial release involving persistent accounts or server-side data, dedicated parental consent protocols under applicable child data protection standards will be implemented.
        </p>
      </section>

      {/* Section 7: Publisher Transparency & Release Blockers */}
      <section className="space-y-4 border-t border-border/50 pt-6">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">7</span>
          Publisher Information &amp; Legal Review
        </h2>
        <Card className="p-5 border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Prototype Disclosure — Production Release Blocker</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            GRANTLY is an educational technology demonstration. In compliance with strict transparency principles, we explicitly disclose that formal corporate entity registration, Data Protection Officer (DPO) appointment, and official postal support channels are currently <strong>unassigned prototype placeholders</strong>. A comprehensive legal and compliance review is required prior to commercial operations.
          </p>
        </Card>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
