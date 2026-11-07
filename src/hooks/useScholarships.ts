import { useMemo } from 'react';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { useAppStore } from '@/store/useAppStore';
import { calculateScholarshipMatch } from '@/lib/matchingEngine';
import { Scholarship, ScholarshipMatch } from '@/types';

export interface MatchedScholarshipItem {
  scholarship: Scholarship;
  match: ScholarshipMatch;
  isSaved: boolean;
}

export const useScholarships = () => {
  const { profile, savedScholarshipIds } = useAppStore();

  const allMatchedScholarships = useMemo<MatchedScholarshipItem[]>(() => {
    return MOCK_SCHOLARSHIPS.map((scholarship) => ({
      scholarship,
      match: calculateScholarshipMatch(scholarship, profile),
      isSaved: savedScholarshipIds.includes(scholarship.id),
    }));
  }, [profile, savedScholarshipIds]);

  const topMatches = useMemo(() => {
    return [...allMatchedScholarships].sort((a, b) => b.match.matchScore - a.match.matchScore);
  }, [allMatchedScholarships]);

  const urgentDeadlines = useMemo(() => {
    return [...allMatchedScholarships].sort((a, b) => a.scholarship.deadlineDays - b.scholarship.deadlineDays);
  }, [allMatchedScholarships]);

  return {
    scholarships: allMatchedScholarships,
    topMatches,
    urgentDeadlines,
    totalCount: MOCK_SCHOLARSHIPS.length,
  };
};
