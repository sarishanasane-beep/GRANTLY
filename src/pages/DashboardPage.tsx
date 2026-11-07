import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { evaluateBatchScholarships, calculateProfileCompleteness } from '@/lib/matchingEngine';
import { formatINR } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  TrendingUp,
  FolderLock,
  CheckSquare,
  Clock,
  ArrowRight,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  CalendarClock,
  ArrowUpRight,
  Scale,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    savedScholarshipIds,
    applications,
    vaultDocuments,
    toggleSaveScholarship,
    addToCompare,
    isInCompare,
  } = useAppStore();

  // Evaluate batch scholarships & profile completeness
  const completeness = useMemo(() => calculateProfileCompleteness(profile), [profile]);
  const batchResult = useMemo(() => evaluateBatchScholarships(MOCK_SCHOLARSHIPS, profile), [profile]);

  // Top 5 recommendations
  const topMatches = batchResult.topMatches;
  const activeApplicationsCount = Object.keys(applications).length;
  const readyDocsCount = vaultDocuments.filter((d) => d.hasDocument).length;
  const totalSavedValue = MOCK_SCHOLARSHIPS.filter((s) => savedScholarshipIds.includes(s.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Urgent matches in top recommendations
  const urgentMatches = topMatches.filter(({ scholarship }) => scholarship.deadlineDays <= 14);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-surface to-surface-elevated p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Deterministic Matching Active</span>
            </Badge>
            <span className="text-xs text-muted">ID: {profile.id || 'STU-DEMO'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
            Welcome back, {profile.fullName || 'Student'}
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            {profile.currentInstitution ? `${profile.currentInstitution} • ` : ''}
            {profile.courseName || profile.educationLevel || 'Undergraduate'}
            {profile.percentageOrCgpa
              ? ` (${profile.percentageOrCgpa} ${profile.isCgpa ? 'CGPA' : '%'})`
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/explore">
            <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Opportunities
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Profile Completeness Card */}
      <Card className="p-5 border-border bg-surface/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Profile Completeness
              </span>
              <Badge
                variant={completeness.isComplete ? 'success' : completeness.percentage >= 60 ? 'gold' : 'danger'}
                size="sm"
              >
                {completeness.percentage}% Complete
              </Badge>
            </div>

            <div className="w-full bg-surface-muted h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completeness.isComplete
                    ? 'bg-emerald-400'
                    : completeness.percentage >= 60
                    ? 'bg-gold-400'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>

            {completeness.isComplete ? (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Your profile is fully verified. All eligibility criteria are evaluated with maximum precision.</span>
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                <p className="text-xs text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>
                    Missing {completeness.missingFields.length} field{completeness.missingFields.length > 1 ? 's' : ''}:{' '}
                    <strong className="text-text font-medium">
                      {completeness.missingFields.slice(0, 3).join(', ')}
                      {completeness.missingFields.length > 3 ? ` +${completeness.missingFields.length - 3} more` : ''}
                    </strong>
                  </span>
                </p>
                <Link
                  to="/profile"
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
                >
                  Complete missing fields <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Continuation State Callout */}
      {!completeness.isComplete ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-text">
                Complete your profile to unlock and confirm {batchResult.potentiallyEligibleCount} potentially matching scholarships
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Unspecified financial or academic information places matching schemes in preliminary review status.
              </p>
            </div>
          </div>
          <Link to="/profile" className="shrink-0">
            <Button variant="outline" size="sm" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20">
              Update Profile Now
            </Button>
          </Link>
        </div>
      ) : urgentMatches.length > 0 ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CalendarClock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-text">
                {urgentMatches.length} high-match scholarships have application deadlines within the next 14 days!
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Prepare your documents in the Vault and submit before the application windows close.
              </p>
            </div>
          </div>
          <Link to="/deadlines" className="shrink-0">
            <Button variant="primary" size="sm">
              View Urgent Deadlines
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-text">
                You have {batchResult.eligibleCount} verified eligible opportunities ready to apply
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Every mandatory parameter has been verified deterministically against your academic profile.
              </p>
            </div>
          </div>
          <Link to="/explore" className="shrink-0">
            <Button variant="primary" size="sm">
              Browse Matches
            </Button>
          </Link>
        </div>
      )}

      {/* Eligibility Overview Metrics Row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Eligibility Engine Overview
          </h2>
          <span className="text-xs text-muted">
            {batchResult.totalEvaluated} Total Catalog Schemes
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Eligible
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
                {batchResult.eligibleCount}
              </p>
              <p className="text-[11px] text-muted mt-0.5">All criteria fully satisfied</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between border-gold-500/20 bg-gold-500/5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium uppercase tracking-wider text-gold-400">
                Potentially Eligible
              </span>
              <HelpCircle className="w-4 h-4 text-gold-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-display font-bold text-gold-400">
                {batchResult.potentiallyEligibleCount}
              </p>
              <p className="text-[11px] text-muted mt-0.5">Pending data or open criteria</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between border-border bg-surface">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Requires Info
              </span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-display font-bold text-text">
                {batchResult.missingInfoCount}
              </p>
              <p className="text-[11px] text-muted mt-0.5">Missing profile inputs</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between border-border bg-surface">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Not Eligible
              </span>
              <TrendingUp className="w-4 h-4 text-muted" />
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-display font-bold text-muted">
                {batchResult.notEligibleCount}
              </p>
              <p className="text-[11px] text-muted mt-0.5">Fails mandatory threshold</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Active Tracker</span>
            <CheckSquare className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-display font-bold text-text">
              {activeApplicationsCount}
            </p>
            <p className="text-xs text-muted mt-0.5">In progress & submitted</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Saved Pipeline</span>
            <Bookmark className="w-4 h-4 text-gold-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-display font-bold text-gold-400">
              {formatINR(totalSavedValue)}
            </p>
            <p className="text-xs text-muted mt-0.5">{savedScholarshipIds.length} schemes saved</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Vault Status</span>
            <FolderLock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-display font-bold text-text">
              {readyDocsCount} / {vaultDocuments.length}
            </p>
            <p className="text-xs text-muted mt-0.5">Credentials ready</p>
          </div>
        </Card>
      </div>

      {/* Top 5 Algorithmic Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-text">
              Top 5 Recommendations For You
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Ranked dynamically by the deterministic GRANTLY 7-parameter matching engine.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Browse all {batchResult.totalEvaluated} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topMatches.map(({ scholarship, match }) => {
            const isSaved = savedScholarshipIds.includes(scholarship.id);
            const inCompare = isInCompare(scholarship.id);

            return (
              <Card
                key={scholarship.id}
                glow
                className="p-5 flex flex-col justify-between space-y-4 border-border bg-surface"
              >
                <div className="space-y-3">
                  {/* Status & Confidence Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
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
                          ? 'Eligible'
                          : match.eligibilityStatus === 'potentially_eligible'
                          ? 'Potentially Eligible'
                          : 'Not Eligible'}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {match.matchScore}% Score
                      </Badge>
                    </div>

                    <span className="text-xs text-muted flex items-center gap-1 shrink-0 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gold-400" />
                      {scholarship.deadlineDays}d left
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-text line-clamp-1">
                      <Link
                        to={`/scholarship/${scholarship.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {scholarship.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{scholarship.provider}</p>
                  </div>

                  {/* Why it matches snippet */}
                  <div className="bg-surface-elevated/70 rounded-lg p-2.5 text-xs space-y-1 border border-border/50">
                    <p className="text-text font-medium flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Match justification:</span>
                    </p>
                    <p className="text-muted leading-relaxed line-clamp-2 text-[11px]">
                      {match.matchingCriteria[0] ||
                        match.reasons[0] ||
                        'Satisfies educational and merit eligibility.'}
                    </p>
                  </div>

                  {/* Missing information snippet if applicable */}
                  {match.missingProfileInformation.length > 0 && (
                    <div className="bg-amber-500/10 rounded-lg p-2 text-[11px] text-amber-300 border border-amber-500/20 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Needs: {match.missingProfileInformation.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer with Amount & Actions */}
                <div className="pt-3 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Award Amount</span>
                      <span className="font-display font-bold text-sm text-primary">
                        {scholarship.amountFormatted}
                      </span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {scholarship.effortLevel} Effort
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isSaved ? 'secondary' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleSaveScholarship(scholarship.id)}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </Button>

                    <Button
                      variant={inCompare ? 'secondary' : 'ghost'}
                      size="sm"
                      className="px-2"
                      title={inCompare ? 'In Compare List' : 'Add to Compare'}
                      onClick={() => {
                        if (inCompare) {
                          useAppStore.getState().removeFromCompare(scholarship.id);
                        } else {
                          addToCompare(scholarship.id);
                        }
                      }}
                    >
                      <Scale className="w-4 h-4" />
                    </Button>

                    <Link to={`/scholarship/${scholarship.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
