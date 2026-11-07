import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { calculateScholarshipMatch } from '@/lib/matchingEngine';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Scale, Trash2, Plus, ExternalLink } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, profile } = useAppStore();

  const selectedScholarships = MOCK_SCHOLARSHIPS.filter((s) => compareList.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
            Scholarship Comparison Matrix
          </h1>
          <p className="text-sm text-muted mt-1">
            Side-by-side evaluation of funding amounts, eligibility thresholds, and application requirements.
          </p>
        </div>

        {selectedScholarships.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearCompare}>
            Clear Matrix
          </Button>
        )}
      </div>

      {selectedScholarships.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <Scale className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-bold font-display">No Schemes Selected for Comparison</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Add up to 3 scholarships from the catalog to compare their eligibility rules and benefits side-by-side.
          </p>
          <Link to="/explore">
            <Button variant="primary">Browse Scholarships</Button>
          </Link>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] border border-border rounded-xl bg-surface divide-y divide-border">
            {/* Header / Titles Row */}
            <div className="grid grid-cols-4 p-4 bg-surface-elevated font-semibold text-xs text-muted">
              <div className="col-span-1 flex items-center">Metric</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-sm text-text line-clamp-2">{s.title}</span>
                    <button
                      onClick={() => removeFromCompare(s.id)}
                      className="text-muted hover:text-danger p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Link
                    to={`/scholarship/${s.id}`}
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    <span>View Scheme</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
              {Array.from({ length: 3 - selectedScholarships.length }).map((_, i) => (
                <div key={i} className="col-span-1 px-2 flex items-center justify-center border-l border-dashed border-border/60">
                  <Link to="/explore" className="text-xs text-muted hover:text-primary flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Scheme
                  </Link>
                </div>
              ))}
            </div>

            {/* Match Compatibility & Verdict */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Eligibility Verdict</div>
              {selectedScholarships.map((s) => {
                const match = calculateScholarshipMatch(s, profile);
                return (
                  <div key={s.id} className="col-span-1 px-2 space-y-1">
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
                    <p className="text-[10px] text-muted">{match.matchScore}% Match Score</p>
                  </div>
                );
              })}
            </div>

            {/* Grant Amount */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Grant Amount</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2">
                  <span className="font-display font-bold text-sm text-primary block">{s.amountFormatted}</span>
                  <span className="text-[10px] text-muted">{s.awardPeriod}</span>
                </div>
              ))}
            </div>

            {/* Provider Type */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Administering Body</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 text-text">
                  <p className="font-semibold">{s.providerType}</p>
                  <p className="text-muted text-[11px]">{s.provider}</p>
                </div>
              ))}
            </div>

            {/* Deadline */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Deadline</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 font-medium text-gold-400">
                  <span className="block">{s.deadlineDays} days remaining</span>
                  <span className="text-[10px] text-muted font-mono">{new Date(s.deadlineDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>

            {/* Education Levels */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Education Level</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 text-text font-medium">
                  {s.criteria.educationLevels.join(', ')}
                </div>
              ))}
            </div>

            {/* Academic Cutoff Threshold */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Academic Cutoff</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 text-text">
                  {s.criteria.percentageMin
                    ? `${s.criteria.percentageMin}% Marks / ${s.criteria.cgpaMin || 7.0} CGPA`
                    : 'No minimum cutoff required'}
                </div>
              ))}
            </div>

            {/* Academic Disciplines */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Disciplines</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 text-text">
                  {s.criteria.academicFields.slice(0, 2).join(', ')}
                </div>
              ))}
            </div>

            {/* Geographic Scope / States */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Applicable States</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 text-text">
                  {s.criteria.states.join(', ')}
                </div>
              ))}
            </div>

            {/* Eligible Categories */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Target Communities</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 text-text">
                  {s.criteria.categories.join(', ')}
                </div>
              ))}
            </div>

            {/* Income Ceiling */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Income Ceiling</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 text-text">
                  {s.criteria.maxAnnualFamilyIncome
                    ? `₹${s.criteria.maxAnnualFamilyIncome.toLocaleString('en-IN')}`
                    : 'Open / No Ceiling'}
                </div>
              ))}
            </div>

            {/* Essay Required */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Essay Mandate</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2">
                  <Badge variant={s.hasEssayRequirement ? 'gold' : 'neutral'} size="sm">
                    {s.hasEssayRequirement ? `Required (${s.essayWordLimit || 500}w)` : 'No Essay'}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Documentation Effort & Required Documents */}
            <div className="grid grid-cols-4 p-4 text-xs items-center">
              <div className="col-span-1 font-semibold text-muted">Required Documents</div>
              {selectedScholarships.map((s) => (
                <div key={s.id} className="col-span-1 px-2 space-y-1">
                  <span className="font-semibold text-text block">
                    {s.effortLevel} Effort ({s.requiredDocuments.length} docs)
                  </span>
                  <p className="text-[10px] text-muted">
                    {s.requiredDocuments.map((d) => d.name).slice(0, 2).join(', ')}
                    {s.requiredDocuments.length > 2 ? ` +${s.requiredDocuments.length - 2} more` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
