import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { useAppStore } from '@/store/useAppStore';
import { calculateScholarshipMatch } from '@/lib/matchingEngine';
import { useSEO } from '@/hooks/useSEO';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Bookmark,
  Scale,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Share2,
  Check,
  Printer,
} from 'lucide-react';

export const ScholarshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, savedScholarshipIds, toggleSaveScholarship, addToCompare, isInCompare, startApplication, applications } = useAppStore();
  const [copied, setCopied] = useState(false);

  const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === id);

  useSEO({
    title: scholarship ? `${scholarship.title} — GRANTLY` : 'Scholarship Details — GRANTLY',
    description: scholarship
      ? `${scholarship.title} offers ${scholarship.amountFormatted} in grant funding. Review criteria, eligibility, and deadlines.`
      : 'Review scholarship requirements and eligibility matching on GRANTLY.',
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && scholarship) {
      try {
        await navigator.share({
          title: scholarship.title,
          text: `Check out ${scholarship.title} on GRANTLY:`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fall back to copy link
      }
    }
    handleCopyLink();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!scholarship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display">Scholarship Not Found</h2>
        <p className="text-muted text-sm">The requested opportunity ID could not be located in our demo catalog.</p>
        <Link to="/explore">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const match = calculateScholarshipMatch(scholarship, profile);
  const isSaved = savedScholarshipIds.includes(scholarship.id);
  const inCompare = isInCompare(scholarship.id);
  const activeApp = applications[scholarship.id];

  const handleApply = () => {
    if (!activeApp) {
      startApplication(scholarship.id, scholarship.title);
    }
    navigate('/tracker');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to all schemes
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share & Copy Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            title="Share or copy scholarship link"
            aria-label="Share or copy scholarship link"
          >
            {copied ? 'Link Copied!' : 'Share'}
          </Button>

          {/* Print Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            title="Print or save as PDF"
            aria-label="Print or save as PDF"
          >
            Print
          </Button>

          <Button
            variant={isSaved ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggleSaveScholarship(scholarship.id)}
            leftIcon={<Bookmark className="w-4 h-4" />}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>

          <Button
            variant={inCompare ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              if (inCompare) {
                useAppStore.getState().removeFromCompare(scholarship.id);
              } else {
                addToCompare(scholarship.id);
              }
            }}
            leftIcon={<Scale className="w-4 h-4" />}
          >
            {inCompare ? 'In Compare' : 'Compare'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
          >
            {activeApp ? 'Open in Tracker' : 'Start Application'}
          </Button>
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="p-6 sm:p-8 bg-surface space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" size="md">{scholarship.providerType}</Badge>
              <Badge
                variant={
                  match.eligibilityStatus === 'eligible'
                    ? 'success'
                    : match.eligibilityStatus === 'potentially_eligible'
                    ? 'gold'
                    : 'neutral'
                }
                size="md"
              >
                {match.eligibilityStatus === 'eligible'
                  ? 'Verified Eligible'
                  : match.eligibilityStatus === 'potentially_eligible'
                  ? 'Potentially Eligible'
                  : 'Not Eligible'}
              </Badge>
              <Badge variant={match.matchScore >= 80 ? 'success' : 'gold'} size="md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{match.matchScore}% Match ({match.confidence} Confidence)</span>
              </Badge>
              {scholarship.isRenewable && (
                <Badge variant="neutral" size="md">Renewable Annually</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
              {scholarship.title}
            </h1>
            <p className="text-sm font-medium text-muted">
              Administered by: <span className="text-text font-semibold">{scholarship.provider}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-elevated/70 min-w-[200px] text-right space-y-1">
            <span className="text-xs uppercase text-muted font-medium">Grant Value</span>
            <p className="text-2xl sm:text-3xl font-display font-bold text-primary">
              {scholarship.amountFormatted}
            </p>
            <span className="text-xs text-gold-400 font-semibold block flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
              {scholarship.deadlineDays} days remaining
            </span>
          </div>
        </div>

        {/* Highlights Pills */}
        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border flex flex-wrap gap-4 text-xs">
          {scholarship.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-1.5 text-text">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Split Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Description & Essay */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-display font-bold text-text">Program Overview</h2>
            <p className="text-sm text-muted leading-relaxed">
              {scholarship.description}
            </p>

            <h3 className="text-sm font-bold text-text pt-2">Eligibility Criteria</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                <span className="text-muted block">Eligible Levels</span>
                <span className="font-semibold text-text">{scholarship.criteria.educationLevels.join(', ')}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                <span className="text-muted block">Academic Disciplines</span>
                <span className="font-semibold text-text">{scholarship.criteria.academicFields.join(', ')}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                <span className="text-muted block">Geographic Scope</span>
                <span className="font-semibold text-text">{scholarship.criteria.states.join(', ')}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                <span className="text-muted block">Income Ceiling</span>
                <span className="font-semibold text-text">
                  {scholarship.criteria.maxAnnualFamilyIncome
                    ? `Under ₹${scholarship.criteria.maxAnnualFamilyIncome.toLocaleString('en-IN')}`
                    : 'No Income Cap / Open'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                <span className="text-muted block">Minimum Academic Cutoff</span>
                <span className="font-semibold text-text">
                  {scholarship.criteria.percentageMin
                    ? `${scholarship.criteria.percentageMin}% Marks or ${scholarship.criteria.cgpaMin || (scholarship.criteria.percentageMin / 9.5).toFixed(1)} CGPA`
                    : 'No Minimum Cutoff Threshold'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                <span className="text-muted block">Applicable Communities / Categories</span>
                <span className="font-semibold text-text">{scholarship.criteria.categories.join(', ')}</span>
              </div>
            </div>

            {scholarship.criteria.specialConditions && scholarship.criteria.specialConditions.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-muted block mb-1.5">Special Eligibility Conditions:</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-text">
                  {scholarship.criteria.specialConditions.map((cond, idx) => (
                    <li key={idx}>{cond}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Application Walkthrough & Effort Instructions */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-lg font-display font-bold text-text">Application Stages & Instructions</h2>
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="sm">{scholarship.effortLevel} Effort</Badge>
                <Badge variant="gold" size="sm">Est. {scholarship.estimatedTimeMinutes} mins</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border space-y-1">
                <span className="text-primary font-bold block text-[11px]">STAGE 01</span>
                <p className="font-semibold text-text">Document Readiness</p>
                <p className="text-muted text-[11px]">Verify required certificates in your Vault.</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border space-y-1">
                <span className="text-primary font-bold block text-[11px]">STAGE 02</span>
                <p className="font-semibold text-text">Statement Drafting</p>
                <p className="text-muted text-[11px]">
                  {scholarship.hasEssayRequirement ? 'Draft essay in the Tracker workspace.' : 'No essay required for this scheme.'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border space-y-1">
                <span className="text-primary font-bold block text-[11px]">STAGE 03</span>
                <p className="font-semibold text-text">Institution Endorsement</p>
                <p className="text-muted text-[11px]">Obtain bonafide or Dean digital seal.</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border space-y-1">
                <span className="text-primary font-bold block text-[11px]">STAGE 04</span>
                <p className="font-semibold text-text">Portal Filing</p>
                <p className="text-muted text-[11px]">Submit to provider portal before deadline.</p>
              </div>
            </div>
          </Card>

          {/* Essay Section if applicable */}
          {scholarship.hasEssayRequirement && (
            <Card className="p-6 space-y-3 border-gold-500/30 bg-gold-500/5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold-400" />
                <h2 className="text-base font-display font-bold text-text">
                  Application Essay Requirement
                </h2>
                {scholarship.essayWordLimit && (
                  <Badge variant="gold" size="sm">Max {scholarship.essayWordLimit} words</Badge>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed font-mono bg-surface p-3 rounded border border-border">
                "{scholarship.essayPrompt}"
              </p>
              <p className="text-[11px] text-muted">
                Tip: You can draft and store your essay directly in the Tracker module.
              </p>
            </Card>
          )}

          {/* Required Documents */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-display font-bold text-text">Required Documentation</h2>
            <div className="space-y-2">
              {scholarship.requiredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-border bg-surface-elevated/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-semibold text-text">{doc.name}</p>
                      <p className="text-muted text-[11px]">{doc.description}</p>
                    </div>
                  </div>
                  <Badge variant={doc.required ? 'danger' : 'neutral'} size="sm">
                    {doc.required ? 'Mandatory' : 'Optional'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Match Breakdown & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Personalized Eligibility Explanation Card */}
          <Card className={`p-5 space-y-3 border ${
            match.eligibilityStatus === 'eligible'
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : match.eligibilityStatus === 'potentially_eligible'
              ? 'border-gold-500/30 bg-gold-500/5'
              : 'border-border bg-surface'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Eligibility Verdict
              </span>
              <Badge
                variant={
                  match.eligibilityStatus === 'eligible'
                    ? 'success'
                    : match.eligibilityStatus === 'potentially_eligible'
                    ? 'gold'
                    : 'neutral'
                }
                size="sm"
              >
                {match.eligibilityStatus === 'eligible'
                  ? 'Verified Eligible'
                  : match.eligibilityStatus === 'potentially_eligible'
                  ? 'Potentially Eligible'
                  : 'Not Eligible'}
              </Badge>
            </div>
            <p className="text-xs text-text leading-relaxed font-medium">
              {match.explanation ||
                (match.eligibilityStatus === 'eligible'
                  ? 'You satisfy all mandatory academic, income, and domicile thresholds for this scheme.'
                  : match.eligibilityStatus === 'potentially_eligible'
                  ? 'This opportunity has open criteria or your profile is missing optional verification fields.'
                  : 'Your profile does not satisfy one or more mandatory thresholds for this scheme.')}
            </p>
            <p className="text-[11px] text-muted italic border-t border-border/50 pt-2">
              Note: Algorithmic match scores indicate criteria alignment and do not guarantee funding.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text">Compatibility Analysis</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-muted mb-1">
                  <span>Academic Fit</span>
                  <span className="font-semibold text-text">{match.matchBreakdown.academicFit} / 30</span>
                </div>
                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${(match.matchBreakdown.academicFit / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-muted mb-1">
                  <span>Financial Eligibility</span>
                  <span className="font-semibold text-text">{match.matchBreakdown.financialEligibility} / 30</span>
                </div>
                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${(match.matchBreakdown.financialEligibility / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-muted mb-1">
                  <span>Demographic Fit</span>
                  <span className="font-semibold text-text">{match.matchBreakdown.demographicFit} / 25</span>
                </div>
                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${(match.matchBreakdown.demographicFit / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-muted mb-1">
                  <span>Process Readiness</span>
                  <span className="font-semibold text-text">{match.matchBreakdown.effortScore} / 15</span>
                </div>
                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gold-400 h-full rounded-full transition-all"
                    style={{ width: `${(match.matchBreakdown.effortScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-text">Matching Highlights:</p>
              {match.reasons.map((r, i) => (
                <p key={i} className="text-[11px] text-muted flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </p>
              ))}
            </div>

            {match.unmatchedCriteria.length > 0 && (
              <div className="pt-2 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-amber-400">Considerations:</p>
                {match.unmatchedCriteria.map((c, i) => (
                  <p key={i} className="text-[11px] text-muted flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </p>
                ))}
              </div>
            )}

            {match.missingProfileInformation.length > 0 && (
              <div className="pt-2 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-gold-400">Missing Information:</p>
                <div className="p-2.5 rounded bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-300 space-y-1">
                  <p>Provide the following fields to confirm final eligibility:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-muted">
                    {match.missingProfileInformation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <Link to="/profile" className="text-primary hover:underline font-semibold block pt-1">
                    Update profile &rarr;
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-surface-muted/40 border-border text-xs text-muted space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-text">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Demonstration Notice</span>
            </div>
            <p className="leading-relaxed">
              This entry is simulated data generated for testing during the hackathon. 
              Client-side demonstration data; no student records transmitted.
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
};
