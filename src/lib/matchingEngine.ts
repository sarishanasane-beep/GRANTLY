import {
  Scholarship,
  StudentProfile,
  ScholarshipMatch,
  ScoreWeightConfig,
  MatchBreakdownScore,
  ProfileCompleteness,
  EligibilityStatus,
  MatchConfidence,
} from '@/types';

/**
 * Default Configurable Scoring Weights (sums to 100 points)
 */
export const DEFAULT_SCORE_WEIGHTS: ScoreWeightConfig = {
  educationLevel: 20,
  academicField: 15,
  academicMerit: 20,
  familyIncome: 20,
  domicile: 10,
  category: 10,
  otherCriteria: 5,
};

/**
 * Calculates transparent profile completeness and identifies missing fields
 */
export const calculateProfileCompleteness = (
  profile: Partial<StudentProfile> | null | undefined
): ProfileCompleteness => {
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      completedFieldsCount: 0,
      totalFieldsCount: 12,
      missingFields: [
        'Full Name',
        'Email Address',
        'Gender',
        'Education Level',
        'Current Institution',
        'Course Name',
        'Academic Field',
        'Academic Score (CGPA / %)',
        'Graduation Year',
        'State of Domicile',
        'Annual Family Income',
        'Social Category',
      ],
    };
  }

  const checks: { name: string; isFilled: boolean }[] = [
    { name: 'Full Name', isFilled: Boolean(profile.fullName && profile.fullName.trim().length >= 2) },
    { name: 'Email Address', isFilled: Boolean(profile.email && profile.email.includes('@')) },
    { name: 'Gender', isFilled: Boolean(profile.gender) },
    { name: 'Education Level', isFilled: Boolean(profile.educationLevel) },
    { name: 'Current Institution', isFilled: Boolean(profile.currentInstitution && profile.currentInstitution.trim().length > 0) },
    { name: 'Course Name', isFilled: Boolean(profile.courseName && profile.courseName.trim().length > 0) },
    { name: 'Academic Field', isFilled: Boolean(profile.academicField) },
    { name: 'Academic Score', isFilled: typeof profile.percentageOrCgpa === 'number' && profile.percentageOrCgpa > 0 },
    { name: 'Graduation Year', isFilled: typeof profile.graduationYear === 'number' && profile.graduationYear > 1900 },
    { name: 'State of Domicile', isFilled: Boolean(profile.stateOfDomicile && profile.stateOfDomicile.trim().length > 0) },
    { name: 'Annual Family Income', isFilled: typeof profile.annualFamilyIncome === 'number' && profile.annualFamilyIncome >= 0 },
    { name: 'Social Category', isFilled: Boolean(profile.category) },
  ];

  const completedCount = checks.filter((c) => c.isFilled).length;
  const missingFields = checks.filter((c) => !c.isFilled).map((c) => c.name);
  const percentage = Math.round((completedCount / checks.length) * 100);

  return {
    percentage,
    isComplete: completedCount === checks.length,
    completedFieldsCount: completedCount,
    totalFieldsCount: checks.length,
    missingFields,
  };
};

/**
 * GRANTLY Deterministic, Transparent Scholarship Matching Engine
 *
 * Evaluates scholarship eligibility criteria against student profile data.
 * Distinguishes between:
 * - 'eligible': All mandatory conditions verified and satisfied.
 * - 'potentially_eligible': No disqualification found, but missing profile data prevents final confirmation.
 * - 'not_eligible': Explicitly fails one or more mandatory eligibility requirements.
 *
 * High score does not override mandatory disqualifications.
 */
export const calculateScholarshipMatch = (
  scholarship: Scholarship,
  profile: Partial<StudentProfile> | null | undefined,
  weights: ScoreWeightConfig = DEFAULT_SCORE_WEIGHTS
): ScholarshipMatch => {
  const criteria = scholarship.criteria;

  let educationLevelScore = 0;
  let academicFieldScore = 0;
  let academicMeritScore = 0;
  let familyIncomeScore = 0;
  let domicileScore = 0;
  let categoryScore = 0;
  let otherCriteriaScore = 0;

  const matchingCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];
  const missingProfileInformation: string[] = [];

  // 1. Education Level (Weight: 20)
  if (!criteria.educationLevels || criteria.educationLevels.length === 0) {
    educationLevelScore = weights.educationLevel;
    matchingCriteria.push('No educational level restriction specified.');
  } else if (!profile?.educationLevel) {
    missingProfileInformation.push('Education Level');
    educationLevelScore = Math.round(weights.educationLevel * 0.4);
  } else if (criteria.educationLevels.includes(profile.educationLevel)) {
    educationLevelScore = weights.educationLevel;
    matchingCriteria.push(`Education level matches your enrolment (${profile.educationLevel}).`);
  } else {
    educationLevelScore = 0;
    unmatchedCriteria.push(`Requires ${criteria.educationLevels.join(' or ')} enrolment.`);
  }

  // 2. Academic Field (Weight: 15)
  if (!criteria.academicFields || criteria.academicFields.length === 0 || criteria.academicFields.includes('Interdisciplinary')) {
    academicFieldScore = weights.academicField;
    matchingCriteria.push('Open to all disciplines and interdisciplinary studies.');
  } else if (!profile?.academicField) {
    missingProfileInformation.push('Academic Discipline / Field');
    academicFieldScore = Math.round(weights.academicField * 0.4);
  } else if (criteria.academicFields.includes(profile.academicField)) {
    academicFieldScore = weights.academicField;
    matchingCriteria.push(`Your academic field (${profile.academicField}) directly matches.`);
  } else {
    academicFieldScore = 0;
    unmatchedCriteria.push(`Specialized for ${criteria.academicFields.slice(0, 2).join(', ')} students.`);
  }

  // 3. Academic Score / Merit (Weight: 20)
  const hasMinPercent = typeof criteria.percentageMin === 'number';
  const hasMinCgpa = typeof criteria.cgpaMin === 'number';

  if (!hasMinPercent && !hasMinCgpa) {
    academicMeritScore = weights.academicMerit;
    matchingCriteria.push('No minimum grade or CGPA requirement specified.');
  } else if (typeof profile?.percentageOrCgpa !== 'number' || profile.percentageOrCgpa <= 0) {
    missingProfileInformation.push('Academic Score / CGPA');
    academicMeritScore = Math.round(weights.academicMerit * 0.3);
  } else {
    const studentScore = profile.isCgpa ? profile.percentageOrCgpa * 9.5 : profile.percentageOrCgpa;
    const requiredScore = criteria.percentageMin ?? (criteria.cgpaMin ? criteria.cgpaMin * 9.5 : 50);

    if (studentScore >= requiredScore) {
      academicMeritScore = weights.academicMerit;
      const scoreDisplay = profile.isCgpa ? `${profile.percentageOrCgpa} CGPA` : `${profile.percentageOrCgpa}%`;
      matchingCriteria.push(`Your academic score (${scoreDisplay}) meets the stated minimum requirement.`);
    } else {
      academicMeritScore = Math.max(0, Math.round(weights.academicMerit * (studentScore / requiredScore) * 0.5));
      const requiredDisplay = criteria.cgpaMin ? `${criteria.cgpaMin} CGPA` : `${criteria.percentageMin}%`;
      const studentDisplay = profile.isCgpa ? `${profile.percentageOrCgpa} CGPA` : `${profile.percentageOrCgpa}%`;
      unmatchedCriteria.push(`Requires minimum academic score of ${requiredDisplay} (you have ${studentDisplay}).`);
    }
  }

  // 4. Family Income (Weight: 20)
  if (!criteria.maxAnnualFamilyIncome) {
    familyIncomeScore = weights.familyIncome;
    matchingCriteria.push('No household income threshold required for this endowment.');
  } else if (typeof profile?.annualFamilyIncome !== 'number' || profile.annualFamilyIncome < 0) {
    missingProfileInformation.push('Annual Family Income');
    familyIncomeScore = Math.round(weights.familyIncome * 0.4);
  } else if (profile.annualFamilyIncome <= criteria.maxAnnualFamilyIncome) {
    familyIncomeScore = weights.familyIncome;
    matchingCriteria.push(`Family income (₹${profile.annualFamilyIncome.toLocaleString('en-IN')}) is within the ceiling of ₹${criteria.maxAnnualFamilyIncome.toLocaleString('en-IN')}/year.`);
  } else {
    familyIncomeScore = 0;
    unmatchedCriteria.push(`Annual income exceeds maximum eligibility ceiling of ₹${criteria.maxAnnualFamilyIncome.toLocaleString('en-IN')}.`);
  }

  // 5. Domicile / State (Weight: 10)
  const isPanIndia = !criteria.states || criteria.states.length === 0 || criteria.states.includes('All India');

  if (isPanIndia) {
    domicileScore = weights.domicile;
    matchingCriteria.push('Open to student applicants from all Indian states and Union Territories.');
  } else if (!profile?.stateOfDomicile) {
    missingProfileInformation.push('State of Domicile');
    domicileScore = Math.round(weights.domicile * 0.4);
  } else if (criteria.states.includes(profile.stateOfDomicile)) {
    domicileScore = weights.domicile;
    matchingCriteria.push(`Your domicile (${profile.stateOfDomicile}) matches the eligible state quota.`);
  } else {
    domicileScore = 0;
    unmatchedCriteria.push(`Restricted to domicile residents of ${criteria.states.join(', ')}.`);
  }

  // 6. Category & Social Affirmation (Weight: 10)
  const isGeneralOpen = !criteria.categories || criteria.categories.length === 0 || criteria.categories.includes('General');

  if (isGeneralOpen) {
    categoryScore = weights.category;
    matchingCriteria.push('Open to applicants across all social categories.');
  } else if (!profile?.category) {
    missingProfileInformation.push('Social / Diversity Category');
    categoryScore = Math.round(weights.category * 0.4);
  } else {
    const isCategoryMatch = criteria.categories.includes(profile.category);
    const isFirstGenMatch = Boolean(profile.isFirstGeneration && criteria.categories.includes('First-Generation Learner'));
    const isPwdMatch = Boolean(profile.isPwD && criteria.categories.includes('Persons with Disabilities (PwD)'));
    const isWomenMatch = Boolean(profile.gender === 'Female' && criteria.categories.includes('Women in STEM'));

    if (isCategoryMatch || isFirstGenMatch || isPwdMatch || isWomenMatch) {
      categoryScore = weights.category;
      if (isFirstGenMatch && !isCategoryMatch) {
        matchingCriteria.push('Eligible under First-Generation College Learner reservation.');
      } else if (isPwdMatch && !isCategoryMatch) {
        matchingCriteria.push('Eligible under Persons with Disabilities (PwD) benchmark reservation.');
      } else if (isWomenMatch && !isCategoryMatch) {
        matchingCriteria.push('Eligible under Women in STEM affirmative action initiative.');
      } else {
        matchingCriteria.push(`Your applicant category (${profile.category}) directly qualifies.`);
      }
    } else {
      categoryScore = 0;
      unmatchedCriteria.push(`Reserved for ${criteria.categories.join(', ')} candidates.`);
    }
  }

  // 7. Other Applicable Criteria (Gender, Age/Graduation Year) (Weight: 5)
  const hasGenderPref = criteria.genderPreference && criteria.genderPreference !== 'All';

  if (!hasGenderPref) {
    otherCriteriaScore = weights.otherCriteria;
  } else if (!profile?.gender) {
    missingProfileInformation.push('Gender Identity');
    otherCriteriaScore = Math.round(weights.otherCriteria * 0.5);
  } else if (criteria.genderPreference === profile.gender) {
    otherCriteriaScore = weights.otherCriteria;
    matchingCriteria.push(`Eligible for ${criteria.genderPreference}-specific allocation.`);
  } else {
    otherCriteriaScore = 0;
    unmatchedCriteria.push(`Exclusively reserved for ${criteria.genderPreference} candidates.`);
  }

  // Calculate raw sum and clamp to 0-100
  const rawSum =
    educationLevelScore +
    academicFieldScore +
    academicMeritScore +
    familyIncomeScore +
    domicileScore +
    categoryScore +
    otherCriteriaScore;

  const matchScore = Math.min(100, Math.max(0, Math.round(rawSum)));

  // Determine Eligibility Status & Confidence strictly enforcing mandatory rules
  let eligibilityStatus: EligibilityStatus;
  let confidence: MatchConfidence;
  let explanation: string;

  if (unmatchedCriteria.length > 0) {
    // Failing ANY mandatory condition disqualifies from being labeled eligible
    eligibilityStatus = 'not_eligible';
    confidence = missingProfileInformation.length > 0 ? 'medium' : 'high';
    explanation = `Does not meet mandatory eligibility requirements: ${unmatchedCriteria[0]}`;
  } else if (missingProfileInformation.length > 0) {
    // No explicit failure, but key profile fields are absent
    eligibilityStatus = 'potentially_eligible';
    confidence = missingProfileInformation.length > 2 ? 'low' : 'medium';
    explanation = `Potentially eligible based on current profile, but missing ${missingProfileInformation.slice(0, 2).join(' and ')} required to confirm qualification.`;
  } else {
    // Fully eligible across all evaluated parameters
    eligibilityStatus = 'eligible';
    confidence = 'high';
    explanation = 'Fully meets all stated eligibility criteria for this scholarship opportunity.';
  }

  const breakdown: MatchBreakdownScore = {
    educationLevel: educationLevelScore,
    academicField: academicFieldScore,
    academicMerit: academicMeritScore,
    familyIncome: familyIncomeScore,
    domicile: domicileScore,
    category: categoryScore,
    otherCriteria: otherCriteriaScore,
  };

  // Legacy format for UI backward compatibility
  const legacyMatchBreakdown = {
    academicFit: Math.round(((educationLevelScore + academicFieldScore + academicMeritScore) / 55) * 30),
    financialEligibility: Math.round((familyIncomeScore / 20) * 30),
    demographicFit: Math.round(((domicileScore + categoryScore) / 20) * 25),
    effortScore: Math.round((otherCriteriaScore / 5) * 15),
  };

  return {
    scholarshipId: scholarship.id,
    matchScore,
    eligibilityStatus,
    confidence,
    matchingCriteria,
    unmatchedCriteria,
    missingProfileInformation,
    explanation,
    breakdown,
    reasons: matchingCriteria,
    matchBreakdown: legacyMatchBreakdown,
  };
};

export interface MatchingBatchResult {
  totalEvaluated: number;
  eligibleCount: number;
  potentiallyEligibleCount: number;
  notEligibleCount: number;
  missingInfoCount: number;
  topMatches: { scholarship: Scholarship; match: ScholarshipMatch }[];
  allMatches: { scholarship: Scholarship; match: ScholarshipMatch }[];
}

/**
 * Batch evaluates an array of scholarships against a profile and returns structured summary metrics
 */
export const evaluateBatchScholarships = (
  scholarships: Scholarship[],
  profile: Partial<StudentProfile> | null | undefined,
  weights: ScoreWeightConfig = DEFAULT_SCORE_WEIGHTS
): MatchingBatchResult => {
  const evaluated = scholarships.map((scholarship) => ({
    scholarship,
    match: calculateScholarshipMatch(scholarship, profile, weights),
  }));

  // Sort by eligibility status priority (eligible > potentially_eligible > not_eligible), then by matchScore descending
  const statusPriority: Record<EligibilityStatus, number> = {
    eligible: 3,
    potentially_eligible: 2,
    not_eligible: 1,
  };

  evaluated.sort((a, b) => {
    const priorityDiff = statusPriority[b.match.eligibilityStatus] - statusPriority[a.match.eligibilityStatus];
    if (priorityDiff !== 0) return priorityDiff;
    return b.match.matchScore - a.match.matchScore;
  });

  const eligibleCount = evaluated.filter((e) => e.match.eligibilityStatus === 'eligible').length;
  const potentiallyEligibleCount = evaluated.filter((e) => e.match.eligibilityStatus === 'potentially_eligible').length;
  const notEligibleCount = evaluated.filter((e) => e.match.eligibilityStatus === 'not_eligible').length;
  const missingInfoCount = evaluated.filter((e) => e.match.missingProfileInformation.length > 0).length;

  return {
    totalEvaluated: scholarships.length,
    eligibleCount,
    potentiallyEligibleCount,
    notEligibleCount,
    missingInfoCount,
    topMatches: evaluated.slice(0, 5),
    allMatches: evaluated,
  };
};
