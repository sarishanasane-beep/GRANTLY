import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  AlertTriangle,
  Calendar,
  CheckSquare,
  FolderLock,
  Sparkles,
} from 'lucide-react';

export const DeadlinesPage: React.FC = () => {
  const { applications, vaultDocuments } = useAppStore();
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'month' | 'future'>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'amount' | 'title'>('urgency');

  // Active student application deadlines with dynamic calculation
  const activeAppDeadlines = useMemo(() => {
    return Object.values(applications).map((app) => {
      const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === app.scholarshipId);
      const deadlineDays = scholarship?.deadlineDays ?? 30;
      const deadlineDate = scholarship?.deadlineDate ?? new Date().toISOString();
      const nextTask = app.steps.find((step) => !step.isCompleted);
      const isOverdue = deadlineDays < 0;

      return {
        app,
        scholarship,
        deadlineDays,
        deadlineDate,
        nextTask,
        isOverdue,
      };
    }).sort((a, b) => a.deadlineDays - b.deadlineDays);
  }, [applications]);

  const overdueApplications = useMemo(() => {
    return activeAppDeadlines.filter((item) => item.isOverdue);
  }, [activeAppDeadlines]);

  // Document expiry alerts from Vault
  const expiringDocuments = useMemo(() => {
    return vaultDocuments.filter((doc) => {
      if (!doc.expiryDate || doc.expiryDate === 'Permanent Record' || doc.expiryDate === 'Active Account') {
        return false;
      }
      const expiryTime = Date.parse(doc.expiryDate);
      if (isNaN(expiryTime)) return false;
      const diffDays = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
      return diffDays <= 60; // Expired or expiring within 60 days
    }).map((doc) => {
      const diffDays = Math.ceil((Date.parse(doc.expiryDate!) - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        ...doc,
        diffDays,
        isExpired: diffDays <= 0,
      };
    }).sort((a, b) => a.diffDays - b.diffDays);
  }, [vaultDocuments]);

  // All catalog scholarships sorted & filtered dynamically
  const displayedScholarships = useMemo(() => {
    return MOCK_SCHOLARSHIPS.filter((s) => {
      if (filterUrgency === 'critical') return s.deadlineDays <= 7;
      if (filterUrgency === 'month') return s.deadlineDays > 7 && s.deadlineDays <= 30;
      if (filterUrgency === 'future') return s.deadlineDays > 30;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgency') return a.deadlineDays - b.deadlineDays;
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [filterUrgency, sortBy]);

  const urgentCount = MOCK_SCHOLARSHIPS.filter((s) => s.deadlineDays <= 7).length;
  const monthCount = MOCK_SCHOLARSHIPS.filter((s) => s.deadlineDays > 7 && s.deadlineDays <= 30).length;
  const futureCount = MOCK_SCHOLARSHIPS.filter((s) => s.deadlineDays > 30).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
          Timeline & Deadlines Engine
        </h1>
        <p className="text-sm text-muted mt-1">
          Dynamic calendar countdowns computed relative to the current date to prevent missed submission cut-offs.
        </p>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueApplications.length > 0 && (
        <div className="rounded-xl border border-danger/50 bg-red-500/10 p-4 sm:p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text">Overdue Application Notice</h3>
            <p className="text-xs text-muted">
              You have {overdueApplications.length} application(s) past their listed submission deadline. Check with the provider portal if grace periods apply.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Active Student Application Deadlines & Preparation Tasks */}
      {activeAppDeadlines.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold text-text">
                My Active Application Deadlines ({activeAppDeadlines.length})
              </h2>
            </div>
            <Link to="/tracker" className="text-xs text-primary hover:underline">
              Open Tracker &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAppDeadlines.map(({ app, scholarship, deadlineDays, deadlineDate, nextTask, isOverdue }) => (
              <Card
                key={app.scholarshipId}
                className={`p-5 space-y-3 border ${
                  isOverdue
                    ? 'border-danger/40 bg-red-500/5'
                    : deadlineDays <= 14
                    ? 'border-gold-500/40 bg-gold-500/5'
                    : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isOverdue ? 'danger' : deadlineDays <= 14 ? 'gold' : 'neutral'} size="sm">
                    {isOverdue ? 'OVERDUE' : `${deadlineDays} Days Remaining`}
                  </Badge>
                  <span className="text-xs text-muted font-mono font-medium">
                    Due: {new Date(deadlineDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-text leading-snug">
                    <Link to={`/scholarship/${app.scholarshipId}`} className="hover:text-primary transition-colors">
                      {app.scholarshipTitle}
                    </Link>
                  </h3>
                  {scholarship && (
                    <p className="text-xs text-muted mt-0.5">
                      {scholarship.provider} • <strong className="text-primary font-semibold">{scholarship.amountFormatted}</strong>
                    </p>
                  )}
                </div>

                {/* Next Preparation Task */}
                {nextTask && (
                  <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-text font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Next Preparation Task:</span>
                    </div>
                    <p className="text-muted text-[11px] leading-relaxed">
                      {nextTask.title} — {nextTask.description}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted uppercase text-[10px]">
                    Status: <strong className="text-text">{app.status.replace(/_/g, ' ')}</strong>
                  </span>
                  <Link to="/tracker">
                    <Button variant="outline" size="sm">
                      Continue Application
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Document Validity & Expiry Alerts */}
      {expiringDocuments.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-display font-bold text-text">
                Credential Validity Alerts ({expiringDocuments.length})
              </h2>
            </div>
            <Link to="/vault" className="text-xs text-primary hover:underline">
              Update in Vault &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {expiringDocuments.map((doc) => (
              <Card
                key={doc.id}
                className={`p-3.5 space-y-2 border ${
                  doc.isExpired ? 'border-danger/40 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={doc.isExpired ? 'danger' : 'gold'} size="sm">
                    {doc.isExpired ? 'EXPIRED' : `Expires in ${doc.diffDays} Days`}
                  </Badge>
                  <span className="text-[10px] text-muted font-mono">{doc.expiryDate}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text truncate">{doc.name}</h4>
                  <p className="text-[11px] text-muted italic truncate">{doc.notes || 'Tracked credential'}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: All Catalog Deadlines Browser */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-text">
              Scholarship Application Deadlines ({displayedScholarships.length})
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Live countdowns calculated dynamically relative to today's date.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Sort Deadlines"
            >
              <option value="urgency">Earliest Deadline First</option>
              <option value="amount">Grant Value (High to Low)</option>
              <option value="title">Scholarship Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Urgency Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterUrgency('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterUrgency === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-text'
            }`}
          >
            <span>All Deadlines ({MOCK_SCHOLARSHIPS.length})</span>
          </button>

          <button
            onClick={() => setFilterUrgency('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterUrgency === 'critical'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-red-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-danger" />
            <span>Critical (≤ 7 Days) ({urgentCount})</span>
          </button>

          <button
            onClick={() => setFilterUrgency('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterUrgency === 'month'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-gold-400" />
            <span>This Month (8–30 Days) ({monthCount})</span>
          </button>

          <button
            onClick={() => setFilterUrgency('future')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterUrgency === 'future'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-emerald-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Beyond 30 Days ({futureCount})</span>
          </button>
        </div>

        {/* Scholarships Deadlines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedScholarships.map((s) => (
            <Card
              key={s.id}
              className={`p-4 space-y-3 ${
                s.deadlineDays <= 7
                  ? 'border-danger/40 bg-red-500/5'
                  : s.deadlineDays <= 30
                  ? 'bg-surface'
                  : 'bg-surface-elevated/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant={s.deadlineDays <= 7 ? 'danger' : s.deadlineDays <= 30 ? 'gold' : 'neutral'}
                  size="sm"
                >
                  {s.deadlineDays <= 0 ? 'Closes Today' : `${s.deadlineDays} Days Left`}
                </Badge>
                <span className="text-[11px] text-muted font-mono">
                  {new Date(s.deadlineDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-text leading-snug">
                  <Link to={`/scholarship/${s.id}`} className="hover:text-primary transition-colors">
                    {s.title}
                  </Link>
                </h3>
                <p className="text-xs text-muted mt-0.5">{s.provider}</p>
              </div>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{s.amountFormatted}</span>
                <Link to={`/scholarship/${s.id}`}>
                  <Button variant={s.deadlineDays <= 7 ? 'danger' : 'outline'} size="sm">
                    {s.deadlineDays <= 7 ? 'Urgent Apply' : 'Review Details'}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
