import React from 'react';
import { Link } from 'react-router-dom';
import { Scholarship, ScholarshipMatch } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bookmark, Clock, Scale } from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  match?: ScholarshipMatch;
  isSaved?: boolean;
  inCompare?: boolean;
  onToggleSave?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  match,
  isSaved = false,
  inCompare = false,
  onToggleSave,
  onToggleCompare,
}) => {
  return (
    <Card glow className="p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {match ? (
            <Badge variant={match.matchScore >= 80 ? 'success' : 'gold'} size="sm">
              {match.matchScore}% Match
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">{scholarship.providerType}</Badge>
          )}
          <span className="text-xs text-muted flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-gold-400" />
            {scholarship.deadlineDays}d left
          </span>
        </div>

        <div>
          <h3 className="font-display font-bold text-base text-text leading-snug line-clamp-2">
            <Link to={`/scholarship/${scholarship.id}`} className="hover:text-primary transition-colors">
              {scholarship.title}
            </Link>
          </h3>
          <p className="text-xs text-muted mt-1">{scholarship.provider}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="neutral" size="sm">{scholarship.criteria.educationLevels[0]}</Badge>
          <Badge variant="neutral" size="sm">{scholarship.criteria.states[0]}</Badge>
          {scholarship.isRenewable && <Badge variant="emerald" size="sm">Renewable</Badge>}
        </div>

        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
          {scholarship.description}
        </p>
      </div>

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
            <span className="text-xs font-semibold text-text">{scholarship.effortLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSave && (
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => onToggleSave(scholarship.id)}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
          )}

          {onToggleCompare && (
            <Button
              variant={inCompare ? 'secondary' : 'ghost'}
              size="sm"
              className="px-2"
              title={inCompare ? 'In Compare List' : 'Add to Compare'}
              onClick={() => onToggleCompare(scholarship.id)}
            >
              <Scale className="w-4 h-4" />
            </Button>
          )}

          <Link to={`/scholarship/${scholarship.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
