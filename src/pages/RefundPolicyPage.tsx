import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, ShieldCheck, Info, Printer } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
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
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free Prototype Notice</span>
            </Badge>
            <Badge variant="gold" size="sm">
              Zero Financial Transactions
            </Badge>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print Refund Policy"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-text hover:bg-surface-elevated transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Policy</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
          Refund &amp; Payment Disclosure
        </h1>
        <p className="text-sm text-muted">
          Last Updated: November 2026 • Disclosure for Free Prototype Operations
        </p>
      </div>

      {/* Primary Statement Card */}
      <Card className="p-6 border-emerald-500/30 bg-emerald-500/5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>100% Free Educational Demonstration Prototype</span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          GRANTLY is currently provided completely free of charge. The platform <strong>does not charge application fees, does not sell subscriptions, does not collect payment card information, and does not conduct commercial financial transactions</strong>.
        </p>
      </Card>

      {/* Section 1: Non-Applicability of Refunds */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">1</span>
          Non-Applicability of Refund Claims
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Because no financial fees, payments, or monetary contributions are collected from students or visitors, <strong>there are currently no refundable monetary transactions</strong> associated with using GRANTLY.
        </p>
      </section>

      {/* Section 2: Protection Against Scams */}
      <section className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">2</span>
          Student Advisory: Beware of Scholarship Scams
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Legitimate public scholarships never demand processing fees, deposit charges, or registration fees to apply. GRANTLY will never ask you to transfer funds via UPI, bank transfer, debit card, or cryptocurrency. If anyone claiming to represent GRANTLY requests payment from you, please report them immediately.
        </p>
      </section>

      {/* Section 3: Future Commercial Features Notice */}
      <section className="space-y-3 border-t border-border/50 pt-6">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">3</span>
          Future Commercial Expansion Policy
        </h2>
        <div className="p-4 rounded-xl bg-surface border border-border text-xs text-muted space-y-2">
          <div className="flex items-center gap-2 text-[#D9C7A3] font-semibold">
            <Info className="w-4 h-4 shrink-0" />
            <span>Policy Update Requirement</span>
          </div>
          <p className="leading-relaxed">
            Prior to the introduction of any premium institutional analytics, partner sponsorship tiers, or paid student services, GRANTLY will draft and publish a formal commercial Terms of Sale and Refund Policy in accordance with applicable consumer protection and electronic commerce regulations.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicyPage;
