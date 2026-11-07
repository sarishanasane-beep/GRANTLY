import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export const DeadlinesPage: React.FC = () => {

  const groupedScholarships = useMemo(() => {
    const urgent = MOCK_SCHOLARSHIPS.filter((s) => s.deadlineDays <= 7).sort((a, b) => a.deadlineDays - b.deadlineDays);
    const impending = MOCK_SCHOLARSHIPS.filter((s) => s.deadlineDays > 7 && s.deadlineDays <= 30).sort((a, b) => a.deadlineDays - b.deadlineDays);
    const upcoming = MOCK_SCHOLARSHIPS.filter((s) => s.deadlineDays > 30).sort((a, b) => a.deadlineDays - b.deadlineDays);

    return { urgent, impending, upcoming };
  }, []);

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

      {/* Urgent Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger" />
          <h2 className="text-lg font-display font-bold text-text">
            Critical Cut-offs (≤ 7 Days Remaining)
          </h2>
          <Badge variant="danger" size="sm">{groupedScholarships.urgent.length} urgent</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedScholarships.urgent.map((s) => (
            <Card key={s.id} className="p-4 border-danger/40 bg-red-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="danger" size="sm">{s.deadlineDays} Days Left</Badge>
                <span className="text-[11px] text-muted font-mono">
                  {new Date(s.deadlineDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-text leading-snug">
                  <Link to={`/scholarship/${s.id}`} className="hover:underline">
                    {s.title}
                  </Link>
                </h3>
                <p className="text-xs text-muted mt-0.5">{s.provider}</p>
              </div>
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{s.amountFormatted}</span>
                <Link to={`/scholarship/${s.id}`}>
                  <Button variant="danger" size="sm">Urgent Apply</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Impending Section (8 - 30 days) */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gold-400" />
          <h2 className="text-lg font-display font-bold text-text">
            Closing This Month (8 - 30 Days Remaining)
          </h2>
          <Badge variant="gold" size="sm">{groupedScholarships.impending.length} closing soon</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedScholarships.impending.map((s) => (
            <Card key={s.id} className="p-4 bg-surface space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="gold" size="sm">{s.deadlineDays} Days Left</Badge>
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
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{s.amountFormatted}</span>
                <Link to={`/scholarship/${s.id}`}>
                  <Button variant="outline" size="sm">Review Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Section (30+ days) */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-display font-bold text-text">
            Long-Term Horizons (&gt; 30 Days)
          </h2>
          <Badge variant="emerald" size="sm">{groupedScholarships.upcoming.length} active</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedScholarships.upcoming.map((s) => (
            <Card key={s.id} className="p-4 bg-surface-elevated/40 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="neutral" size="sm">{s.deadlineDays} Days Remaining</Badge>
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
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{s.amountFormatted}</span>
                <Link to={`/scholarship/${s.id}`}>
                  <Button variant="ghost" size="sm">Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
