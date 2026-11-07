import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { useAppStore } from '@/store/useAppStore';
import { calculateScholarshipMatch, evaluateBatchScholarships } from '@/lib/matchingEngine';
import { EligibilityStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Bookmark,
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const {
    profile,
    savedScholarshipIds,
    toggleSaveScholarship,
    addToCompare,
    isInCompare,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedAmountRange, setSelectedAmountRange] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'amount' | 'deadline'>('match');

  // Pre-evaluate all scholarships immutably for accurate counts
  const batchEvaluation = useMemo(() => {
    return evaluateBatchScholarships(MOCK_SCHOLARSHIPS, profile);
  }, [profile]);

  // Derive unique academic fields from catalog
  const academicFields = useMemo(() => {
    const fields = new Set<string>();
    MOCK_SCHOLARSHIPS.forEach((s) => s.criteria.academicFields.forEach((f) => fields.add(f)));
    return ['All', ...Array.from(fields)];
  }, []);

  const educationLevels = [
    'All',
    'Undergraduate',
    'Postgraduate',
    'Class 11-12',
    'Diploma',
    'PhD/Doctorate',
    'High School',
  ];

  // Filter and sort items without mutating the original dataset
  const filteredScholarships = useMemo(() => {
    return MOCK_SCHOLARSHIPS.map((scholarship) => ({
      scholarship,
      match: calculateScholarshipMatch(scholarship, profile),
    }))
      .filter(({ scholarship, match }) => {
        // Search query filter (title, provider, states, tags)
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          scholarship.title.toLowerCase().includes(q) ||
          scholarship.provider.toLowerCase().includes(q) ||
          scholarship.criteria.states.some((st) => st.toLowerCase().includes(q)) ||
          scholarship.tags.some((t) => t.toLowerCase().includes(q));

        // Eligibility filter
        const matchesEligibility =
          selectedEligibility === 'all' || match.eligibilityStatus === selectedEligibility;

        // Academic field filter
        const matchesField =
          selectedField === 'All' ||
          scholarship.criteria.academicFields.includes(selectedField as any);

        // Education level filter
        const matchesLevel =
          selectedLevel === 'All' ||
          scholarship.criteria.educationLevels.includes(selectedLevel as any);

        // Award amount range filter
        let matchesAmount = true;
        if (selectedAmountRange === 'under50k') {
          matchesAmount = scholarship.amount <= 50000;
        } else if (selectedAmountRange === '50k-150k') {
          matchesAmount = scholarship.amount > 50000 && scholarship.amount <= 150000;
        } else if (selectedAmountRange === 'above150k') {
          matchesAmount = scholarship.amount > 150000;
        }

        // Deadline urgency filter
        let matchesUrgency = true;
        if (selectedUrgency === 'urgent') {
          matchesUrgency = scholarship.deadlineDays <= 14;
        } else if (selectedUrgency === '30days') {
          matchesUrgency = scholarship.deadlineDays <= 30;
        } else if (selectedUrgency === 'future') {
          matchesUrgency = scholarship.deadlineDays > 30;
        }

        return (
          matchesSearch &&
          matchesEligibility &&
          matchesField &&
          matchesLevel &&
          matchesAmount &&
          matchesUrgency
        );
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          // Status priority: eligible > potentially_eligible > not_eligible, then score descending
          const statusPriority: Record<EligibilityStatus, number> = {
            eligible: 3,
            potentially_eligible: 2,
            not_eligible: 1,
          };
          const priorityDiff =
            statusPriority[b.match.eligibilityStatus] - statusPriority[a.match.eligibilityStatus];
          if (priorityDiff !== 0) return priorityDiff;
          return b.match.matchScore - a.match.matchScore;
        }
        if (sortBy === 'amount') {
          return b.scholarship.amount - a.scholarship.amount;
        }
        if (sortBy === 'deadline') {
          return a.scholarship.deadlineDays - b.scholarship.deadlineDays;
        }
        return 0;
      });
  }, [
    searchQuery,
    selectedEligibility,
    selectedField,
    selectedLevel,
    selectedAmountRange,
    selectedUrgency,
    sortBy,
    profile,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedEligibility('all');
    setSelectedField('All');
    setSelectedLevel('All');
    setSelectedAmountRange('all');
    setSelectedUrgency('all');
    setSortBy('match');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedEligibility !== 'all' ||
    selectedField !== 'All' ||
    selectedLevel !== 'All' ||
    selectedAmountRange !== 'all' ||
    selectedUrgency !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
              Explore 36 Opportunities
            </h1>
            <Badge variant="emerald" size="sm">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Multi-criteria Filter</span>
            </Badge>
          </div>
          <p className="text-sm text-muted mt-1">
            Browse verified fictional scholarships matched with transparent rule-based precision to your profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="md">
            {filteredScholarships.length} Displayed
          </Badge>
          <Link to="/compare">
            <Button variant="outline" size="sm" leftIcon={<Scale className="w-3.5 h-3.5" />}>
              Compare List
            </Button>
          </Link>
        </div>
      </div>

      {/* Eligibility Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedEligibility('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedEligibility === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-surface border border-border text-muted hover:text-text hover:border-primary/50'
          }`}
        >
          <span>All Scholarships</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
            {batchEvaluation.totalEvaluated}
          </span>
        </button>

        <button
          onClick={() => setSelectedEligibility('eligible')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedEligibility === 'eligible'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-surface border border-border text-muted hover:text-emerald-400 hover:border-emerald-500/50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Eligible</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
            {batchEvaluation.eligibleCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedEligibility('potentially_eligible')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedEligibility === 'potentially_eligible'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-surface border border-border text-muted hover:text-amber-400 hover:border-amber-500/50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Potentially Eligible</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
            {batchEvaluation.potentiallyEligibleCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedEligibility('not_eligible')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedEligibility === 'not_eligible'
              ? 'bg-surface-elevated text-text border border-primary/50 shadow-sm'
              : 'bg-surface border border-border text-muted hover:text-text'
          }`}
        >
          <span>Not Eligible</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
            {batchEvaluation.notEligibleCount}
          </span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="ml-auto text-xs text-muted hover:text-primary flex items-center gap-1 shrink-0 px-2 py-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-surface space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Query */}
          <div className="md:col-span-4">
            <Input
              placeholder="Search by title, state, provider, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Academic Field */}
          <div className="md:col-span-2">
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Filter by Academic Field"
            >
              {academicFields.map((field) => (
                <option key={field} value={field}>
                  Field: {field}
                </option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div className="md:col-span-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Filter by Education Level"
            >
              {educationLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level: {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Award Amount Range */}
          <div className="md:col-span-2">
            <select
              value={selectedAmountRange}
              onChange={(e) => setSelectedAmountRange(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Filter by Award Amount"
            >
              <option value="all">Amount: Any</option>
              <option value="under50k">Under ₹50,000</option>
              <option value="50k-150k">₹50,000 – ₹1,50,000</option>
              <option value="above150k">Above ₹1,50,000</option>
            </select>
          </div>

          {/* Deadline Urgency */}
          <div className="md:col-span-2">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Filter by Deadline Urgency"
            >
              <option value="all">Deadline: Any</option>
              <option value="urgent">Urgent (≤14 days)</option>
              <option value="30days">Next 30 days</option>
              <option value="future">Beyond 30 days</option>
            </select>
          </div>
        </div>

        {/* Sort Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
          <div className="text-muted">
            Showing <strong className="text-text">{filteredScholarships.length}</strong> of{' '}
            <strong className="text-text">{batchEvaluation.totalEvaluated}</strong> total schemes
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-xs text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Sort Scholarships"
            >
              <option value="match">Match Score & Status</option>
              <option value="amount">Award Amount (High to Low)</option>
              <option value="deadline">Earliest Deadline</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Scholarship Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map(({ scholarship, match }) => {
          const isSaved = savedScholarshipIds.includes(scholarship.id);
          const inCompare = isInCompare(scholarship.id);

          return (
            <Card key={scholarship.id} glow className="flex flex-col justify-between p-5 space-y-4">
              <div className="space-y-3">
                {/* Header: Eligibility status badge, score & deadline */}
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
                      {match.matchScore}% Match
                    </Badge>
                  </div>

                  <span className="text-xs text-muted flex items-center gap-1 font-medium shrink-0">
                    <Clock className="w-3.5 h-3.5 text-gold-400" />
                    {scholarship.deadlineDays}d left
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-text leading-snug line-clamp-2">
                    <Link
                      to={`/scholarship/${scholarship.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {scholarship.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted mt-1">{scholarship.provider}</p>
                </div>

                {/* Criteria Pills */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="neutral" size="sm">
                    {scholarship.criteria.educationLevels[0]}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {scholarship.criteria.states[0]}
                  </Badge>
                  {scholarship.isRenewable && (
                    <Badge variant="emerald" size="sm">
                      Renewable
                    </Badge>
                  )}
                  {scholarship.hasEssayRequirement && (
                    <Badge variant="gold" size="sm">
                      Essay
                    </Badge>
                  )}
                </div>

                {/* Match Reason or Missing Info Snippet */}
                {match.eligibilityStatus === 'eligible' ? (
                  <div className="bg-emerald-500/10 rounded-lg p-2.5 text-xs text-emerald-300 border border-emerald-500/20 space-y-1">
                    <p className="font-medium flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Why you qualify:</span>
                    </p>
                    <p className="text-[11px] leading-relaxed line-clamp-2 text-muted">
                      {match.matchingCriteria[0] || 'Meets all mandatory criteria.'}
                    </p>
                  </div>
                ) : match.eligibilityStatus === 'potentially_eligible' ? (
                  <div className="bg-amber-500/10 rounded-lg p-2.5 text-xs text-amber-300 border border-amber-500/20 space-y-1">
                    <p className="font-medium flex items-center gap-1 text-[11px] text-amber-400">
                      <HelpCircle className="w-3 h-3 shrink-0" />
                      <span>Preliminary Match:</span>
                    </p>
                    <p className="text-[11px] leading-relaxed line-clamp-2 text-muted">
                      {match.missingProfileInformation.length > 0
                        ? `Awaiting: ${match.missingProfileInformation.join(', ')}`
                        : match.matchingCriteria[0] || 'Meets general parameters; requires verification.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-surface-elevated/80 rounded-lg p-2.5 text-xs border border-border/60 space-y-1">
                    <p className="font-medium flex items-center gap-1 text-[11px] text-muted">
                      <AlertCircle className="w-3 h-3 shrink-0 text-amber-400" />
                      <span>Criteria consideration:</span>
                    </p>
                    <p className="text-[11px] leading-relaxed line-clamp-2 text-muted">
                      {match.unmatchedCriteria[0] || 'Specific eligibility requirement not satisfied.'}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {scholarship.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Award Amount</span>
                    <span className="font-display font-bold text-base text-primary">
                      {scholarship.amountFormatted}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted uppercase block">Effort</span>
                    <span className="text-xs font-semibold text-text">
                      {scholarship.effortLevel}
                    </span>
                  </div>
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

      {/* Empty State */}
      {filteredScholarships.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-xl border border-border p-8 space-y-4">
          <p className="text-muted text-base">No scholarships match the selected filter combination.</p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};
