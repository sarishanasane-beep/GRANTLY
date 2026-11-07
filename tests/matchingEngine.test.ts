import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScholarshipMatch,
  evaluateBatchScholarships,
  calculateProfileCompleteness,
  DEFAULT_SCORE_WEIGHTS,
} from '../src/lib/matchingEngine';
import { MOCK_SCHOLARSHIPS } from '../src/data/scholarships';
import { Scholarship, StudentProfile } from '../src/types';

describe('GRANTLY Matching Engine Suite', () => {
  // Baseline complete eligible student fixture
  const baseEligibleStudent: StudentProfile = {
    id: 'STU-TEST-001',
    fullName: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    gender: 'Male',
    educationLevel: 'Undergraduate',
    currentInstitution: 'Indian Institute of Technology Bombay',
    courseName: 'B.Tech Computer Science',
    academicField: 'Engineering & Technology',
    percentageOrCgpa: 9.2,
    isCgpa: true,
    graduationYear: 2026,
    stateOfDomicile: 'Maharashtra',
    annualFamilyIncome: 400000,
    category: 'General',
    isFirstGeneration: false,
    isPwD: false,
    skills: [],
    completedOnboarding: true,
    updatedAt: '2026-11-07T00:00:00.000Z',
  };

  // Test 1: Student fully eligible for a scholarship
  it('Test 1: Student fully eligible for a scholarship', () => {
    // grant-11-sir-syed-professional: Undergrad/Postgrad, Engineering/Commerce/Law/Medicine, All India, min 75%/7.5 CGPA, max 4.5L, General/Minority/EWS, All gender
    const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === 'grant-11-sir-syed-professional')!;
    assert.ok(scholarship, 'grant-11-sir-syed-professional should exist in catalog');

    const result = calculateScholarshipMatch(scholarship, baseEligibleStudent);

    assert.equal(result.eligibilityStatus, 'eligible', 'Status should be strictly eligible');
    assert.ok(result.matchScore >= 80, `Score should be >= 80 (was ${result.matchScore})`);
    assert.equal(result.confidence, 'high', 'Confidence should be high for complete eligible profile');
    assert.equal(result.unmatchedCriteria.length, 0, 'There should be 0 unmatched criteria');
    assert.equal(result.missingProfileInformation.length, 0, 'No profile information should be missing');
    assert.ok(result.matchingCriteria.length >= 3, 'Should list multiple matching criteria points');
  });

  // Test 2: Student failing an academic score threshold
  it('Test 2: Student failing an academic score threshold', () => {
    const lowMeritStudent: StudentProfile = {
      ...baseEligibleStudent,
      percentageOrCgpa: 60, // below 75% requirement for grant-11-sir-syed-professional
      isCgpa: false,
    };

    const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === 'grant-11-sir-syed-professional')!;
    assert.ok(scholarship, 'grant-11-sir-syed-professional should exist in catalog');

    const result = calculateScholarshipMatch(scholarship, lowMeritStudent);

    assert.equal(result.eligibilityStatus, 'not_eligible', 'Failing score threshold must mark as not_eligible');
    assert.equal(result.confidence, 'high', 'Disqualification should have high confidence');
    assert.ok(
      result.unmatchedCriteria.some((c) => c.toLowerCase().includes('score') || c.toLowerCase().includes('academic')),
      'Unmatched criteria must explain academic score deficiency'
    );
  });

  // Test 3: Student exceeding the family income ceiling
  it('Test 3: Student exceeding the family income ceiling', () => {
    const wealthyStudent: StudentProfile = {
      ...baseEligibleStudent,
      annualFamilyIncome: 2500000, // 25 Lakhs, far above ceiling of 4.5 Lakhs
    };

    const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === 'grant-11-sir-syed-professional')!;
    assert.ok(scholarship, 'grant-11-sir-syed-professional should exist in catalog');

    const result = calculateScholarshipMatch(scholarship, wealthyStudent);

    assert.equal(result.eligibilityStatus, 'not_eligible', 'Exceeding income cap must strictly disqualify');
    assert.ok(
      result.unmatchedCriteria.some((c) => c.toLowerCase().includes('income')),
      'Unmatched criteria must identify family income ceiling exceeded'
    );
  });

  // Test 4: Student with an incomplete profile (missing income and percentage)
  it('Test 4: Student with an incomplete profile (missing income and percentage)', () => {
    const incompleteStudent: Partial<StudentProfile> = {
      fullName: 'Pooja Verma',
      email: 'pooja@example.com',
      gender: 'Female',
      educationLevel: 'Undergraduate',
      currentInstitution: 'Delhi University',
      courseName: 'B.Tech Information Technology',
      academicField: 'Engineering & Technology',
      stateOfDomicile: 'Delhi',
      category: 'General',
      annualFamilyIncome: undefined, // Missing income
      percentageOrCgpa: 0, // Missing score
      isCgpa: false,
    };

    const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === 'grant-11-sir-syed-professional')!;
    assert.ok(scholarship, 'grant-11-sir-syed-professional should exist');

    const result = calculateScholarshipMatch(scholarship, incompleteStudent);

    assert.equal(
      result.eligibilityStatus,
      'potentially_eligible',
      'Missing required profile parameters must assign potentially_eligible'
    );
    assert.notEqual(result.confidence, 'high', 'Confidence must not be high when key info is missing');
    assert.ok(
      result.missingProfileInformation.includes('Annual Family Income') ||
      result.missingProfileInformation.includes('Academic Score'),
      'Missing profile info must record missing income and/or score'
    );
  });

  // Test 5: Student with a domicile mismatch on a state-specific scholarship
  it('Test 5: Student with a domicile mismatch on a state-specific scholarship', () => {
    // grant-07-gujarat-kaushalya is strictly state: Gujarat
    const gujaratScholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === 'grant-07-gujarat-kaushalya')!;
    assert.ok(gujaratScholarship, 'grant-07-gujarat-kaushalya should exist');

    const maharashtraStudent: StudentProfile = {
      ...baseEligibleStudent,
      educationLevel: 'Diploma',
      academicField: 'Engineering & Technology',
      stateOfDomicile: 'Maharashtra', // Mismatched state (requires Gujarat)
    };

    const result = calculateScholarshipMatch(gujaratScholarship, maharashtraStudent);

    assert.equal(result.eligibilityStatus, 'not_eligible', 'Domicile mismatch on state-restricted grant must disqualify');
    assert.ok(
      result.unmatchedCriteria.some((c) => c.toLowerCase().includes('domicile') || c.toLowerCase().includes('gujarat')),
      'Unmatched criteria must mention state domicile restriction'
    );
  });

  // Test 6: Student eligible for multiple scholarships — verify correct ranking
  it('Test 6: Student eligible for multiple scholarships — verify correct ranking', () => {
    const batch = evaluateBatchScholarships(MOCK_SCHOLARSHIPS, baseEligibleStudent);

    assert.equal(batch.totalEvaluated, MOCK_SCHOLARSHIPS.length, 'Must evaluate all catalog scholarships');
    assert.ok(batch.eligibleCount > 0, 'Base student should be eligible for multiple schemes');
    assert.equal(batch.topMatches.length, 5, 'Top matches must contain exactly top 5 recommendations');

    // Verify ordering: all eligible items first, sorted by matchScore descending
    for (let i = 0; i < batch.allMatches.length - 1; i++) {
      const current = batch.allMatches[i];
      const next = batch.allMatches[i + 1];

      const statusOrder = { eligible: 3, potentially_eligible: 2, not_eligible: 1 };
      const currentPriority = statusOrder[current.match.eligibilityStatus];
      const nextPriority = statusOrder[next.match.eligibilityStatus];

      assert.ok(
        currentPriority >= nextPriority,
        `Item at index ${i} (${current.match.eligibilityStatus}) must have higher or equal priority than ${i + 1} (${next.match.eligibilityStatus})`
      );

      if (currentPriority === nextPriority) {
        assert.ok(
          current.match.matchScore >= next.match.matchScore,
          `Within same status, score at ${i} (${current.match.matchScore}) must be >= ${i + 1} (${next.match.matchScore})`
        );
      }
    }
  });

  // Test 7: Student eligible for no scholarships — verify graceful handling
  it('Test 7: Student eligible for no scholarships — verify graceful handling', () => {
    const disqualifiedStudent: StudentProfile = {
      id: 'STU-NONE',
      fullName: 'Disqualified Candidate',
      email: 'none@example.com',
      gender: 'Male',
      educationLevel: 'High School',
      currentInstitution: 'Local School',
      courseName: 'Class 9',
      academicField: 'Arts & Design',
      percentageOrCgpa: 35, // extremely low merit
      isCgpa: false,
      graduationYear: 2030,
      stateOfDomicile: 'Nagaland', // not covered in targeted state quotas
      annualFamilyIncome: 99000000, // 9.9 Crores
      category: 'General',
      isFirstGeneration: false,
      isPwD: false,
      skills: [],
      completedOnboarding: true,
      updatedAt: '2026-11-07T00:00:00.000Z',
    };

    const batch = evaluateBatchScholarships(MOCK_SCHOLARSHIPS, disqualifiedStudent);

    assert.ok(Number.isFinite(batch.totalEvaluated));
    assert.equal(batch.eligibleCount, 0, 'No scholarships should be marked eligible');
    assert.ok(batch.notEligibleCount > 0, 'Should have not_eligible scholarships');

    // Verify no crashing or NaNs in scores
    batch.allMatches.forEach(({ match }) => {
      assert.ok(Number.isFinite(match.matchScore), 'Match score must be a finite number');
      assert.ok(match.matchScore >= 0 && match.matchScore <= 100, 'Score must be clamped between 0 and 100');
      assert.ok(typeof match.explanation === 'string' && match.explanation.length > 0);
    });
  });

  // Test 8: Scholarship with unspecified/open criteria — verify fair handling without false eligibility claims
  it('Test 8: Scholarship with unspecified/open criteria — verify fair handling without false eligibility claims', () => {
    const openScholarship: Scholarship = {
      id: 'grant-open-test',
      title: 'Universal Student Academic Grant',
      provider: 'National Foundation',
      providerType: 'Philanthropic Trust',
      amount: 50000,
      amountFormatted: '₹50,000',
      awardPeriod: 'Annual',
      deadlineDays: 45,
      deadlineDate: new Date().toISOString(),
      isRenewable: false,
      effortLevel: 'Low',
      competitionLevel: 'Moderate',
      estimatedTimeMinutes: 30,
      description: 'Open to all students across India regardless of discipline or income.',
      highlights: ['Open criteria', 'Direct transfer'],
      criteria: {
        educationLevels: ['Undergraduate', 'Postgraduate'],
        academicFields: ['Engineering & Technology', 'Pure Sciences', 'Commerce & Finance'],
        states: ['All India'],
        categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
        genderPreference: 'All',
        // Note: maxAnnualFamilyIncome is intentionally undefined (open)
        // minPercentageOrCgpa is not set (open)
      },
      tags: ['Open', 'Universal'],
      hasEssayRequirement: false,
      requiredDocuments: [],
      officialUrl: 'https://demo.grantly.edu.in/grants/open-test',
      isFictionalDemo: true,
    };

    const result = calculateScholarshipMatch(openScholarship, baseEligibleStudent);

    assert.equal(result.eligibilityStatus, 'eligible', 'Should be eligible since student is Undergraduate in Engineering');
    assert.equal(result.breakdown.familyIncome, DEFAULT_SCORE_WEIGHTS.familyIncome, 'Full score for open income criteria');
    assert.equal(result.breakdown.domicile, DEFAULT_SCORE_WEIGHTS.domicile, 'Full score for All India criteria');
    assert.ok(
      result.matchingCriteria.some((c) => c.toLowerCase().includes('open') || c.toLowerCase().includes('all india')),
      'Should mention open or national criteria in matching explanation'
    );
  });

  // Test 9: Score calculation boundary conditions (0%, 100%, negative, over-max)
  it('Test 9: Score calculation boundary conditions (0%, 100%, negative, over-max)', () => {
    const scholarship = MOCK_SCHOLARSHIPS[0];

    // Case 1: Extreme high score / overflow inputs
    const highBoundaryStudent: StudentProfile = {
      ...baseEligibleStudent,
      percentageOrCgpa: 999, // over-max
      annualFamilyIncome: 0, // BPL zero income
    };
    const highResult = calculateScholarshipMatch(scholarship, highBoundaryStudent);
    assert.ok(highResult.matchScore <= 100, `Score must not exceed 100 (got ${highResult.matchScore})`);
    assert.ok(highResult.matchScore >= 0, `Score must be >= 0 (got ${highResult.matchScore})`);

    // Case 2: Negative and zero boundary values
    const lowBoundaryStudent: StudentProfile = {
      ...baseEligibleStudent,
      percentageOrCgpa: -50, // negative score
      annualFamilyIncome: -10000, // negative income
    };
    const lowResult = calculateScholarshipMatch(scholarship, lowBoundaryStudent);
    assert.ok(lowResult.matchScore >= 0, `Score must not be negative (got ${lowResult.matchScore})`);
    assert.ok(Number.isFinite(lowResult.matchScore), 'Score must be a finite number');

    // Case 3: Empty / null profile
    const emptyResult = calculateScholarshipMatch(scholarship, null);
    assert.ok(emptyResult.matchScore >= 0 && emptyResult.matchScore <= 100);
    assert.equal(emptyResult.eligibilityStatus, 'potentially_eligible');
  });

  // Test 10: Determinism and immutability — multiple evaluations produce identical output; original data unmutated
  it('Test 10: Determinism and immutability', () => {
    const rawCatalogSnapshot = JSON.stringify(MOCK_SCHOLARSHIPS);

    // Run 5 successive evaluations
    const run1 = JSON.stringify(evaluateBatchScholarships(MOCK_SCHOLARSHIPS, baseEligibleStudent));
    const run2 = JSON.stringify(evaluateBatchScholarships(MOCK_SCHOLARSHIPS, baseEligibleStudent));
    const run3 = JSON.stringify(evaluateBatchScholarships(MOCK_SCHOLARSHIPS, baseEligibleStudent));
    const run4 = JSON.stringify(evaluateBatchScholarships(MOCK_SCHOLARSHIPS, baseEligibleStudent));
    const run5 = JSON.stringify(evaluateBatchScholarships(MOCK_SCHOLARSHIPS, baseEligibleStudent));

    assert.equal(run1, run2, 'Run 1 and Run 2 must be byte-for-byte identical');
    assert.equal(run2, run3, 'Run 2 and Run 3 must be byte-for-byte identical');
    assert.equal(run3, run4, 'Run 3 and Run 4 must be byte-for-byte identical');
    assert.equal(run4, run5, 'Run 4 and Run 5 must be byte-for-byte identical');

    // Verify catalog was not mutated
    const postCatalogSnapshot = JSON.stringify(MOCK_SCHOLARSHIPS);
    assert.equal(rawCatalogSnapshot, postCatalogSnapshot, 'Original MOCK_SCHOLARSHIPS data must remain completely unmutated');
  });

  // Profile Completeness Unit Tests
  it('Profile completeness calculation test', () => {
    const complete = calculateProfileCompleteness(baseEligibleStudent);
    assert.equal(complete.isComplete, true);
    assert.equal(complete.percentage, 100);
    assert.equal(complete.missingFields.length, 0);

    const empty = calculateProfileCompleteness(null);
    assert.equal(empty.isComplete, false);
    assert.equal(empty.percentage, 0);
    assert.ok(empty.missingFields.length > 0);
  });
});
