import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Cookie, HardDrive, ShieldCheck, Printer } from 'lucide-react';

export const CookiePolicyPage: React.FC = () => {
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
              <Cookie className="w-3.5 h-3.5 text-emerald-400" />
              <span>Storage Transparency</span>
            </Badge>
            <Badge variant="gold" size="sm">
              Zero Cookie Platform
            </Badge>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print Cookie Policy"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-text hover:bg-surface-elevated transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Policy</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
          Cookie &amp; Local Storage Disclosure
        </h1>
        <p className="text-sm text-muted">
          Last Updated: November 2026 • Transparent Technical Storage Audit
        </p>
      </div>

      {/* Key Disclosure */}
      <div className="p-4 rounded-2xl bg-[#1F2A1F]/70 border border-[#3E5A3F]/50 flex items-start gap-3.5 text-xs text-[#8CA98C]">
        <ShieldCheck className="w-4 h-4 text-[#D9C7A3] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-semibold text-[#D9C7A3]">Direct Truth in Privacy: We Do Not Use HTTP Cookies</span>
          <p className="leading-relaxed">
            GRANTLY does not set any HTTP tracking cookies, advertising beacons, or session cookies on your device. We intentionally avoid misleading &quot;cookie banner&quot; dark patterns because we do not employ non-essential tracking technologies.
          </p>
        </div>
      </div>

      {/* Section 1: Distinction between Cookies and LocalStorage */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">1</span>
          Technical Distinction: Cookies vs. Local Storage
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Many websites blur the line between server-transmitted HTTP cookies and browser-contained client storage. At GRANTLY, we believe in technical honesty:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-border bg-surface space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <Cookie className="w-4 h-4 text-amber-400" />
              <span>HTTP Cookies</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Small headers transmitted to servers with every network request. Frequently utilized by third parties for cross-site behavioral tracking and advertising.
            </p>
            <p className="text-xs text-emerald-400 font-medium">
              ✓ Used by GRANTLY: <strong>0 Cookies</strong>
            </p>
          </Card>

          <Card className="p-4 border-border bg-surface space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <HardDrive className="w-4 h-4 text-[#D9C7A3]" />
              <span>HTML5 Web Storage (localStorage)</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Isolated client-side key-value storage residing strictly in your device&apos;s browser sandbox. It is never transmitted across the network.
            </p>
            <p className="text-xs text-[#D9C7A3] font-medium">
              ✓ Used by GRANTLY: <strong>Essential UI State Only</strong>
            </p>
          </Card>
        </div>
      </section>

      {/* Section 2: Essential Storage Audit */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">2</span>
          Storage Keys Audit
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          The following essential key is maintained in your browser&apos;s <code className="text-[#D9C7A3] font-mono">localStorage</code>:
        </p>

        <Card className="p-4 border-border bg-surface overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/50 text-[#D9C7A3] uppercase tracking-wider">
                <th className="pb-2">Storage Key</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Exact Purpose</th>
                <th className="pb-2">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-muted">
              <tr>
                <td className="py-2.5 font-mono text-text">grantly-platform-v1</td>
                <td className="py-2.5">localStorage</td>
                <td className="py-2.5">Persists dark/light theme, student profile criteria, saved scholarships, and application tracker steps.</td>
                <td className="py-2.5">Until cleared by user</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </section>

      {/* Section 3: How to Manage and Delete */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-[#D9C7A3]">3</span>
          How to View or Erase Your Storage
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          You can inspect or delete this data anytime:
        </p>
        <ul className="text-xs text-muted space-y-1.5 list-disc list-inside pl-2">
          <li><strong>One-Click In-App Erasure:</strong> Visit <a href="/profile" className="text-[#D9C7A3] underline hover:text-[#F5F7F5]">Student Profile</a> and select <em>&quot;Delete My Local Data&quot;</em> to instantly purge all GRANTLY keys.</li>
          <li><strong>Browser Developer Tools:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px]">F12</kbd> &rarr; Application &rarr; Local Storage &rarr; Right-click <code className="text-[#D9C7A3] font-mono">grantly-platform-v1</code> &rarr; Delete.</li>
        </ul>
      </section>
    </div>
  );
};

export default CookiePolicyPage;
