import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { EducationLevel, AcademicField, SocialCategory } from '@/types';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
import { evaluateBatchScholarships } from '@/lib/matchingEngine';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Bookmark,
  Scale,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    setProfile,
    savedScholarshipIds,
    toggleSaveScholarship,
    addToCompare,
    isInCompare,
    startApplication,
  } = useAppStore();

  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    email: profile.email || '',
    gender: profile.gender || 'Prefer not to say',
    educationLevel: profile.educationLevel || 'Undergraduate',
    currentInstitution: profile.currentInstitution || '',
    courseName: profile.courseName || '',
    academicField: profile.academicField || 'Engineering & Technology',
    percentageOrCgpa: profile.percentageOrCgpa || 8.0,
    isCgpa: profile.isCgpa ?? true,
    graduationYear: profile.graduationYear || 2027,
    stateOfDomicile: profile.stateOfDomicile || 'Maharashtra',
    annualFamilyIncome: profile.annualFamilyIncome ?? 400000,
    category: profile.category || 'General',
    isFirstGeneration: profile.isFirstGeneration || false,
    isPwD: profile.isPwD || false,
  });

  const indianStates = [
    'Maharashtra',
    'Karnataka',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Delhi',
    'Gujarat',
    'Kerala',
    'Telangana',
    'Andhra Pradesh',
    'West Bengal',
    'Rajasthan',
    'Madhya Pradesh',
    'Punjab',
    'Haryana',
    'Bihar',
    'Odisha',
    'Assam',
  ];

  // Step Validation Logic
  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        stepErrors.fullName = 'Please enter your full name (at least 2 characters).';
      }
      if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
        stepErrors.email = 'Please provide a valid email address.';
      }
      if (!formData.gender) {
        stepErrors.gender = 'Please select your gender identity.';
      }
    }

    if (currentStep === 2) {
      if (!formData.educationLevel) {
        stepErrors.educationLevel = 'Please choose your current education level.';
      }
      if (!formData.currentInstitution.trim()) {
        stepErrors.currentInstitution = 'Please enter your school, college, or university name.';
      }
      if (!formData.courseName.trim()) {
        stepErrors.courseName = 'Please enter your degree or course of study.';
      }
    }

    if (currentStep === 3) {
      if (!formData.academicField) {
        stepErrors.academicField = 'Please specify your primary academic field.';
      }
      if (formData.percentageOrCgpa <= 0) {
        stepErrors.percentageOrCgpa = 'Please enter a valid positive academic score.';
      } else if (formData.isCgpa && formData.percentageOrCgpa > 10) {
        stepErrors.percentageOrCgpa = 'CGPA cannot exceed 10.0. For percentage, switch mode.';
      } else if (!formData.isCgpa && formData.percentageOrCgpa > 100) {
        stepErrors.percentageOrCgpa = 'Percentage cannot exceed 100%.';
      }
      if (!formData.graduationYear || formData.graduationYear < 2020 || formData.graduationYear > 2035) {
        stepErrors.graduationYear = 'Please provide a valid graduation year between 2020 and 2035.';
      }
    }

    if (currentStep === 4) {
      if (!formData.stateOfDomicile.trim()) {
        stepErrors.stateOfDomicile = 'Please select your state of permanent domicile.';
      }
    }

    if (currentStep === 5) {
      if (formData.annualFamilyIncome === undefined || formData.annualFamilyIncome < 0) {
        stepErrors.annualFamilyIncome = 'Please enter a non-negative gross family annual income.';
      }
      if (!formData.category) {
        stepErrors.category = 'Please choose your social category.';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) return;

    // Persist intermediate answers into store
    setProfile(formData);

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Completed Step 5
      setProfile({
        ...formData,
        completedOnboarding: true,
      });
      setShowResults(true);
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Evaluate matching results when completed
  const batchResults = React.useMemo(() => {
    return evaluateBatchScholarships(MOCK_SCHOLARSHIPS, profile);
  }, [profile]);

  // If user completed onboarding and we show results
  if (showResults) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
        {/* Header Celebration & Stats Summary */}
        <div className="text-center space-y-3">
          <Badge variant="emerald" size="md">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Evaluation Complete
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-text">
            Your Personalized Scholarship Matches
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Based on your profile and the sample eligibility criteria across {batchResults.totalEvaluated} opportunities.
          </p>
        </div>

        {/* Evaluation Metric Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center space-y-1">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">Evaluated</span>
            <p className="text-2xl sm:text-3xl font-display font-bold text-text">
              {batchResults.totalEvaluated}
            </p>
            <p className="text-[11px] text-muted">Total Schemes</p>
          </Card>

          <Card className="p-4 text-center space-y-1 border-emerald-500/30 bg-emerald-500/5">
            <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Eligible</span>
            <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
              {batchResults.eligibleCount}
            </p>
            <p className="text-[11px] text-muted">All criteria met</p>
          </Card>

          <Card className="p-4 text-center space-y-1 border-amber-500/30 bg-amber-500/5">
            <span className="text-xs text-amber-400 font-medium uppercase tracking-wider">Potentially Eligible</span>
            <p className="text-2xl sm:text-3xl font-display font-bold text-amber-400">
              {batchResults.potentiallyEligibleCount}
            </p>
            <p className="text-[11px] text-muted">Missing some info</p>
          </Card>

          <Card className="p-4 text-center space-y-1">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">Need Info</span>
            <p className="text-2xl sm:text-3xl font-display font-bold text-text">
              {batchResults.missingInfoCount}
            </p>
            <p className="text-[11px] text-muted">Uncertain claims avoided</p>
          </Card>
        </div>

        {/* Action button bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
          <p className="text-xs text-muted">
            Tip: You can refine any profile answers anytime from the profile settings.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link to="/explore" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto" leftIcon={<Compass className="w-4 h-4" />}>
                Explore All {batchResults.totalEvaluated} Schemes
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Matching Opportunities */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-text">
            Top Recommended Opportunities For You
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchResults.topMatches.map(({ scholarship, match }) => {
              const isSaved = savedScholarshipIds.includes(scholarship.id);
              const inCompare = isInCompare(scholarship.id);

              const statusBadgeVariant =
                match.eligibilityStatus === 'eligible'
                  ? 'success'
                  : match.eligibilityStatus === 'potentially_eligible'
                  ? 'warning'
                  : 'neutral';

              const statusLabel =
                match.eligibilityStatus === 'eligible'
                  ? 'CONFIRMED ELIGIBLE'
                  : match.eligibilityStatus === 'potentially_eligible'
                  ? 'POTENTIALLY ELIGIBLE'
                  : 'NOT ELIGIBLE';

              return (
                <Card key={scholarship.id} glow className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={statusBadgeVariant} size="sm">
                          {statusLabel}
                        </Badge>
                        <Badge variant="gold" size="sm">
                          {match.matchScore}% Score
                        </Badge>
                      </div>
                      <span className="text-xs text-muted flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        {scholarship.deadlineDays}d left
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-text leading-snug">
                        <Link to={`/scholarship/${scholarship.id}`} className="hover:text-primary transition-colors">
                          {scholarship.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted mt-1">{scholarship.provider}</p>
                    </div>

                    {/* Explanations & Reasons */}
                    <div className="bg-surface-elevated/60 rounded-lg p-3 text-xs space-y-1.5">
                      <p className="text-text font-semibold">Evaluation summary:</p>
                      <p className="text-muted leading-relaxed">{match.explanation}</p>
                      {match.matchingCriteria.length > 0 && (
                        <p className="text-[11px] text-emerald-400">
                          ✓ {match.matchingCriteria[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted uppercase block">Grant Value</span>
                        <span className="font-display font-bold text-base text-primary">
                          {scholarship.amountFormatted}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted uppercase block">Confidence</span>
                        <span className="text-xs font-semibold capitalize text-text">{match.confidence}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={isSaved ? 'secondary' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleSaveScholarship(scholarship.id)}
                        leftIcon={<Bookmark className="w-3.5 h-3.5" />}
                      >
                        {isSaved ? 'Saved' : 'Save'}
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

                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          startApplication(scholarship.id, scholarship.title);
                          navigate('/tracker');
                        }}
                      >
                        Apply
                      </Button>

                      <Link to={`/scholarship/${scholarship.id}`}>
                        <Button variant="outline" size="sm" className="px-2.5">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl border border-border bg-surface-muted/40 text-xs text-muted flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p>
            GRANTLY Matching Engine: Results are rule-based calculations using your inputs and sample scheme criteria. Matching scores do not guarantee official scholarship awards.
          </p>
        </div>
      </div>
    );
  }

  // 5-Step Wizard
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* 5-Step Indicator */}
      <div className="text-center space-y-2">
        <Badge variant="emerald" size="sm">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Step {step} of 5
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
          {step === 1 && 'Personal Profile'}
          {step === 2 && 'Educational Enrolment'}
          {step === 3 && 'Academic Merit & Field'}
          {step === 4 && 'State of Domicile'}
          {step === 5 && 'Means & Diversity Eligibility'}
        </h1>
        <p className="text-xs text-muted max-w-md mx-auto">
          {step === 1 && 'Let us know who you are to personalize your funding matches.'}
          {step === 2 && 'Specify your current college or school program to filter eligible levels.'}
          {step === 3 && 'Share your discipline and academic score to benchmark merit requirements.'}
          {step === 4 && 'State nativity determines eligibility for regional government and state CSR grants.'}
          {step === 5 && 'Income slabs and categories unlock targeted affirmative action and need-based endowments.'}
        </p>

        {/* 5-Segment Progress Bar */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'w-10 bg-primary' : 'w-5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Step 1: Personal Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">
              1. Basic Identity & Contact
            </h2>
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Aarav Sharma"
              error={errors.fullName}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.edu"
              error={errors.email}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Gender Identity
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="text-xs text-danger">{errors.gender}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Educational Enrollment */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">
              2. Program & Institution
            </h2>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Current Education Level
              </label>
              <select
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Undergraduate">Undergraduate (B.Tech, MBBS, B.Sc, B.A, B.Com, LL.B)</option>
                <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, M.A, MBA)</option>
                <option value="Class 11-12">Class 11 - 12 (Higher Secondary)</option>
                <option value="Diploma">Polytechnic / Technical Diploma</option>
                <option value="PhD/Doctorate">PhD / Doctoral Research Scholar</option>
                <option value="High School">High School (Class 9 - 10)</option>
              </select>
              {errors.educationLevel && <p className="text-xs text-danger">{errors.educationLevel}</p>}
            </div>

            <Input
              label="College / University Name"
              value={formData.currentInstitution}
              onChange={(e) => setFormData({ ...formData, currentInstitution: e.target.value })}
              placeholder="e.g. IIT Bombay, Delhi University, Anna University"
              error={errors.currentInstitution}
              required
            />

            <Input
              label="Course / Degree Name"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. B.Tech in Computer Science and Engineering"
              error={errors.courseName}
              required
            />
          </div>
        )}

        {/* Step 3: Academic Merit & Score */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">
              3. Discipline & Merit Benchmark
            </h2>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Primary Academic Field
              </label>
              <select
                value={formData.academicField}
                onChange={(e) => setFormData({ ...formData, academicField: e.target.value as AcademicField })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Engineering & Technology">Engineering & Technology</option>
                <option value="Medicine & Healthcare">Medicine & Healthcare</option>
                <option value="Pure Sciences">Pure Sciences</option>
                <option value="Commerce & Finance">Commerce & Finance</option>
                <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                <option value="Arts & Design">Arts & Design</option>
                <option value="Law & Public Policy">Law & Public Policy</option>
                <option value="Vocational & Applied Skills">Vocational & Applied Skills</option>
                <option value="Interdisciplinary">Interdisciplinary</option>
              </select>
              {errors.academicField && <p className="text-xs text-danger">{errors.academicField}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Academic Performance Score
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isCgpa: !formData.isCgpa })}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Switch to {formData.isCgpa ? 'Percentage (%)' : 'CGPA (out of 10)'}
                </button>
              </div>
              <Input
                type="number"
                step="0.01"
                value={formData.percentageOrCgpa}
                onChange={(e) => setFormData({ ...formData, percentageOrCgpa: parseFloat(e.target.value) || 0 })}
                placeholder={formData.isCgpa ? '8.5' : '85'}
                helperText={formData.isCgpa ? 'CGPA on a 10-point scale' : 'Aggregate percentage marks'}
                error={errors.percentageOrCgpa}
                required
              />
            </div>

            <Input
              label="Anticipated Graduation Year"
              type="number"
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) || 2027 })}
              error={errors.graduationYear}
              required
            />
          </div>
        )}

        {/* Step 4: Geographic Scope & Domicile */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">
              4. Domicile & Regional Jurisdiction
            </h2>
            <p className="text-xs text-muted">
              Select your permanent residential domicile. Many state government programs require proof of residency.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                State of Domicile
              </label>
              <select
                value={formData.stateOfDomicile}
                onChange={(e) => setFormData({ ...formData, stateOfDomicile: e.target.value })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {indianStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.stateOfDomicile && <p className="text-xs text-danger">{errors.stateOfDomicile}</p>}
            </div>
          </div>
        )}

        {/* Step 5: Financial Means & Affirmative Diversity */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">
              5. Means Slabs & Diversity Categories
            </h2>
            <Input
              label="Annual Household Family Income (INR ₹)"
              type="number"
              value={formData.annualFamilyIncome}
              onChange={(e) => setFormData({ ...formData, annualFamilyIncome: parseInt(e.target.value, 10) || 0 })}
              helperText={`₹${formData.annualFamilyIncome.toLocaleString('en-IN')} / annum`}
              error={errors.annualFamilyIncome}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Social / Affirmative Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SocialCategory })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="Minority">Linguistic / Religious Minority</option>
                <option value="Women in STEM">Women in STEM</option>
                <option value="First-Generation Learner">First-Generation College Learner</option>
                <option value="Persons with Disabilities (PwD)">Persons with Disabilities (PwD)</option>
              </select>
              {errors.category && <p className="text-xs text-danger">{errors.category}</p>}
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <input
                type="checkbox"
                id="first-gen-wizard"
                checked={formData.isFirstGeneration}
                onChange={(e) => setFormData({ ...formData, isFirstGeneration: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <label htmlFor="first-gen-wizard" className="text-xs text-text font-medium cursor-pointer">
                First-Generation College Learner in Family
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="pwd-wizard"
                checked={formData.isPwD}
                onChange={(e) => setFormData({ ...formData, isPwD: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <label htmlFor="pwd-wizard" className="text-xs text-text font-medium cursor-pointer">
                Person with Benchmark Disability (PwD 40%+)
              </label>
            </div>

            {/* Student Privacy & Consent Disclosure */}
            <div className="p-3.5 rounded-lg border border-border/80 bg-surface-muted/40 text-[11px] text-muted space-y-1 mt-4">
              <div className="flex items-center gap-1.5 text-text font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Client-Side Data Minimization</span>
              </div>
              <p className="leading-relaxed">
                By calculating matches, your academic and demographic profile is stored exclusively in your browser's local storage to compute instant match rankings. No profile information is transmitted to external servers. You can erase this data at any time from your{' '}
                <Link to="/profile" className="text-primary underline hover:text-text">Profile</Link>. Review our{' '}
                <Link to="/privacy" className="text-primary underline hover:text-text">Privacy Policy</Link> and{' '}
                <Link to="/terms" className="text-primary underline hover:text-text">Terms of Service</Link>.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Calculate My Matches
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
