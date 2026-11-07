import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ApplicationStatus } from '@/types';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  FileText,
  FolderLock,
  Sparkles,
} from 'lucide-react';

export const TrackerPage: React.FC = () => {
  const {
    applications,
    vaultDocuments,
    updateApplicationStatus,
    toggleApplicationStep,
    setApplicationEssayDraft,
    setApplicationNotes,
  } = useAppStore();

  const applicationList = Object.values(applications);
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applicationList[0]?.scholarshipId || ''
  );

  const activeApp = applications[selectedAppId] || applicationList[0];
  const activeScholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === activeApp?.scholarshipId);

  const statusVariantMap: Record<ApplicationStatus, 'emerald' | 'gold' | 'neutral' | 'success' | 'warning' | 'danger'> = {
    saved: 'neutral',
    drafting: 'gold',
    ready_to_apply: 'gold',
    submitted: 'emerald',
    under_review: 'warning',
    approved: 'success',
    awarded: 'success',
    rejected: 'danger',
    archived: 'neutral',
  };

  const nextStep = activeApp?.steps.find((s) => !s.isCompleted);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
          Application Lifecycle Tracker
        </h1>
        <p className="text-sm text-muted mt-1">
          Monitor your checklist progress, essay drafts, document attachments, and submission milestones.
        </p>
      </div>

      {applicationList.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <CheckSquare className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-bold font-display">No Active Applications</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            You haven't initiated any scholarship applications yet. Explore our curated list to start.
          </p>
          <Link to="/explore">
            <Button variant="primary">Explore Scholarships</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Applications List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted px-1">
              My Active Applications ({applicationList.length})
            </h2>
            {applicationList.map((app) => {
              const completedCount = app.steps.filter((s) => s.isCompleted).length;
              const isSelected = activeApp?.scholarshipId === app.scholarshipId;
              const scholarshipInfo = MOCK_SCHOLARSHIPS.find((s) => s.id === app.scholarshipId);

              return (
                <div
                  key={app.scholarshipId}
                  onClick={() => setSelectedAppId(app.scholarshipId)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-surface-elevated border-primary/50 shadow-sm ring-1 ring-primary/20'
                      : 'bg-surface border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariantMap[app.status]} size="sm">
                        {app.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      {scholarshipInfo && (
                        <span className="text-[10px] text-gold-400 font-mono font-semibold flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {scholarshipInfo.deadlineDays}d left
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted">
                      {completedCount} / {app.steps.length} Steps
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-text leading-snug">
                    {app.scholarshipTitle}
                  </h3>

                  <div className="w-full bg-surface-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${(completedCount / app.steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Application Detail */}
          {activeApp && (
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-xl font-display font-bold text-text">
                      {activeApp.scholarshipTitle}
                    </h2>
                    {activeScholarship && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1.5">
                        <span className="font-display font-bold text-primary">
                          {activeScholarship.amountFormatted}
                        </span>
                        <span>•</span>
                        <span className="text-gold-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {activeScholarship.deadlineDays} days left ({new Date(activeScholarship.deadlineDate).toLocaleDateString()})
                        </span>
                        <span>•</span>
                        <span>{activeScholarship.provider}</span>
                      </div>
                    )}
                    <Link
                      to={`/scholarship/${activeApp.scholarshipId}`}
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                    >
                      <span>View full scheme details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="status-select" className="text-xs text-muted">
                      Status:
                    </label>
                    <select
                      id="status-select"
                      value={activeApp.status}
                      onChange={(e) =>
                        updateApplicationStatus(
                          activeApp.scholarshipId,
                          e.target.value as ApplicationStatus
                        )
                      }
                      className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <option value="saved">Saved</option>
                      <option value="drafting">Drafting</option>
                      <option value="ready_to_apply">Ready to Apply</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="awarded">Awarded</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Next Recommended Action Banner */}
                <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  nextStep
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-emerald-500/30 bg-emerald-500/10'
                }`}>
                  <div className="flex items-start gap-3">
                    {nextStep ? (
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        {nextStep ? 'Next Recommended Milestone' : 'Ready for Submission'}
                      </p>
                      <p className="text-sm font-semibold text-text mt-0.5">
                        {nextStep
                          ? `Step ${nextStep.order}: ${nextStep.title}`
                          : 'All preparation milestones have been completed!'}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {nextStep
                          ? nextStep.description
                          : 'Confirm all details and change status to Ready to Apply or Submitted.'}
                      </p>
                    </div>
                  </div>
                  {nextStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleApplicationStep(activeApp.scholarshipId, nextStep.id)}
                      className="shrink-0 text-xs"
                    >
                      Mark Done
                    </Button>
                  )}
                </div>

                {/* Required Documents Readiness Checklist */}
                {activeScholarship && activeScholarship.requiredDocuments.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-text flex items-center gap-2">
                        <FolderLock className="w-4 h-4 text-emerald-400" />
                        <span>Required Credential Readiness</span>
                      </h3>
                      <Link to="/vault" className="text-xs text-primary hover:underline">
                        Manage Vault &rarr;
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {activeScholarship.requiredDocuments.map((doc) => {
                        const vaultDoc = vaultDocuments.find((v) => v.type === doc.type);
                        const isReady = vaultDoc?.hasDocument ?? false;

                        return (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-lg border flex items-center justify-between ${
                              isReady
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                : 'bg-surface-elevated/40 border-border text-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 shrink-0 text-primary" />
                              <div className="truncate">
                                <p className="font-semibold text-text truncate">{doc.name}</p>
                                <p className="text-[10px] text-muted truncate">
                                  {isReady ? 'Ready in Vault' : doc.required ? 'Mandatory — Missing in Vault' : 'Optional'}
                                </p>
                              </div>
                            </div>
                            <Badge variant={isReady ? 'success' : doc.required ? 'danger' : 'neutral'} size="sm">
                              {isReady ? 'READY' : doc.required ? 'MISSING' : 'OPTIONAL'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Milestone Checklist */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-text">Milestone Checklist</h3>
                  <div className="space-y-2">
                    {activeApp.steps.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => toggleApplicationStep(activeApp.scholarshipId, step.id)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          step.isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                            : 'bg-surface-elevated/40 border-border text-muted hover:text-text'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {step.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted shrink-0" />
                          )}
                          <div>
                            <p className={`text-xs font-semibold ${step.isCompleted ? 'text-text line-through' : 'text-text'}`}>
                              {step.title}
                            </p>
                            <p className="text-[11px] text-muted">{step.description}</p>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm">{step.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Essay Draft Workspace */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text uppercase tracking-wider">
                      Essay / Statement Draft Pad
                    </label>
                    <span className="text-[11px] text-muted">
                      {activeApp.essayDraft ? activeApp.essayDraft.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={activeApp.essayDraft || ''}
                    onChange={(e) =>
                      setApplicationEssayDraft(activeApp.scholarshipId, e.target.value)
                    }
                    placeholder="Draft your personal statement or answers to the scholarship prompt here. Saves automatically to local browser storage..."
                    className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-text placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-mono leading-relaxed"
                  />
                </div>

                {/* Notes & Reminders */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text uppercase tracking-wider">
                    Personal Application Notes
                  </label>
                  <input
                    type="text"
                    value={activeApp.notes || ''}
                    onChange={(e) =>
                      setApplicationNotes(activeApp.scholarshipId, e.target.value)
                    }
                    placeholder="e.g., Requested recommendation letter from HOD; interview scheduled for next week."
                    className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-text placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </Card>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
