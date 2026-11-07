import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LEGAL_CONFIG } from '@/config/legal';
import { FileText, AlertCircle, Printer } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terms of Service</span>
            </Badge>
            <Badge variant="gold" size="sm">
              Academic Prototype
            </Badge>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print Terms and Conditions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-text hover:bg-surface-elevated transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Terms</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-muted">
          Last Updated: November 2026 • Governs Usage of GRANTLY Prototype
        </p>
      </div>

      {/* Critical Disclaimer Banner */}
      <Card className="p-5 border-amber-500/30 bg-amber-500/5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Fictional Demonstration Data Notice</span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          {LEGAL_CONFIG.disclaimers.catalogDisclaimer}
        </p>
      </Card>

      {/* Section 1: Platform Purpose */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">1</span>
          Purpose of the Platform
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          GRANTLY is an experimental frontend technology prototype designed to demonstrate modern user experience patterns in higher education scholarship discovery. It provides interactive eligibility scoring, deadline tracking simulation, and comparative decision tooling.
        </p>
      </section>

      {/* Section 2: Non-Authority Status */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">2</span>
          Not an Issuing Authority
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          {LEGAL_CONFIG.disclaimers.noOfficialAffiliationNotice}
        </p>
        <p className="text-xs text-muted/80 leading-relaxed">
          GRANTLY does not submit, adjudicate, or transfer official scholarship applications. To apply for verified educational funding, students must visit official government portals (such as the National Scholarship Portal, State Higher Education portals) or verified university bursar offices directly.
        </p>
      </section>

      {/* Section 3: No Funding Guarantee */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">3</span>
          No Guarantee of Approval or Funding
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          {LEGAL_CONFIG.disclaimers.noFinancialGuaranteeNotice} Match scores calculated by the platform represent algorithmic estimations based on fictional criteria and do not constitute legal or contractual guarantees of financial aid.
        </p>
      </section>

      {/* Section 4: Acceptable Use */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">4</span>
          Acceptable Use
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          You agree to use GRANTLY solely for non-commercial educational exploration. You agree not to:
        </p>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside pl-2">
          <li>Attempt to reverse-engineer, exploit, or inject malicious payloads into WebGL canvases or DOM handlers.</li>
          <li>Represent fictional demonstration scholarship entries as genuine legal financial grants to third parties.</li>
          <li>Scrape or mirror the proprietary 3D self-assembly animation and assets for unauthorized commercial redistribution.</li>
        </ul>
      </section>

      {/* Section 5: Intellectual Property */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">5</span>
          Intellectual Property
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          The GRANTLY brand identity, custom shaders, 18-agent autonomous self-assembly architecture, and design components are the intellectual work of the creators. Third-party libraries (React, Three.js, Tailwind, Lucide, Originkit) remain the intellectual property of their respective maintainers.
        </p>
      </section>

      {/* Section 6: Limitation of Liability */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">6</span>
          Limitation of Liability
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          GRANTLY is provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; prototype basis without warranties of any kind. To the maximum extent permitted by applicable law, the authors disclaim liability for any direct, indirect, incidental, or consequential damages resulting from platform downtime or reliance on demonstration data.
        </p>
      </section>
    </div>
  );
};

export default TermsPage;
