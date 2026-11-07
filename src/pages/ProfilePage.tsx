import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { EducationLevel, AcademicField, SocialCategory } from '@/types';
import { calculateProfileCompleteness } from '@/lib/matchingEngine';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, setProfile, resetProfile } = useAppStore();
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const completeness = useMemo(() => calculateProfileCompleteness(profile), [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

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

  const educationLevels: EducationLevel[] = [
    'High School',
    'Class 11-12',
    'Diploma',
    'Undergraduate',
    'Postgraduate',
    'PhD/Doctorate',
  ];

  const academicFields: AcademicField[] = [
    'Engineering & Technology',
    'Medicine & Healthcare',
    'Pure Sciences',
    'Commerce & Finance',
    'Humanities & Social Sciences',
    'Arts & Design',
    'Law & Public Policy',
    'Vocational & Applied Skills',
    'Interdisciplinary',
  ];

  const socialCategories: SocialCategory[] = [
    'General',
    'OBC',
    'SC',
    'ST',
    'EWS',
    'Minority',
    'Women in STEM',
    'First-Generation Learner',
    'Persons with Disabilities (PwD)',
    'Defence/Ex-Servicemen Wards',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
            Student Eligibility Profile
          </h1>
          <p className="text-sm text-muted mt-1">
            Fine-tune your academic, demographic, and financial parameters to update your match scores across all 36 schemes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetProfile}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset to Demo Default
        </Button>
      </div>

      {isSavedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile changes saved and applied immediately to the matching engine.</span>
        </div>
      )}

      {/* Completeness Card */}
      <Card className="p-5 border-border bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Profile Completeness
            </span>
            <Badge
              variant={completeness.isComplete ? 'success' : completeness.percentage >= 60 ? 'gold' : 'danger'}
              size="sm"
            >
              {completeness.percentage}%
            </Badge>
          </div>
          <span className="text-xs text-muted">
            {completeness.completedFieldsCount} of {completeness.totalFieldsCount} criteria provided
          </span>
        </div>

        <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completeness.isComplete ? 'bg-emerald-400' : 'bg-gold-400'
            }`}
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>

        {!completeness.isComplete && (
          <p className="text-xs text-amber-300 flex items-center gap-1.5 mt-2.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Missing: {completeness.missingFields.join(', ')}</span>
          </p>
        )}
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-display font-bold text-text border-b border-border pb-2">
            Personal & Academic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ fullName: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ email: e.target.value })}
              required
            />

            <Input
              label="Current Institution"
              value={profile.currentInstitution}
              onChange={(e) => setProfile({ currentInstitution: e.target.value })}
              required
            />

            <Input
              label="Degree / Course Name"
              value={profile.courseName}
              onChange={(e) => setProfile({ courseName: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Education Level
              </label>
              <select
                value={profile.educationLevel}
                onChange={(e) => setProfile({ educationLevel: e.target.value as EducationLevel })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {educationLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Academic Field
              </label>
              <select
                value={profile.academicField}
                onChange={(e) => setProfile({ academicField: e.target.value as AcademicField })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {academicFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={`Academic Score (${profile.isCgpa ? 'CGPA out of 10' : 'Percentage %'})`}
              type="number"
              step="0.01"
              value={profile.percentageOrCgpa}
              onChange={(e) => setProfile({ percentageOrCgpa: parseFloat(e.target.value) || 0 })}
              required
            />

            <Input
              label="Graduation Year"
              type="number"
              value={profile.graduationYear}
              onChange={(e) => setProfile({ graduationYear: parseInt(e.target.value, 10) || 2026 })}
              required
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-base font-display font-bold text-text border-b border-border pb-2">
            Demographic & Financial Eligibility
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                State of Permanent Domicile
              </label>
              <select
                value={profile.stateOfDomicile}
                onChange={(e) => setProfile({ stateOfDomicile: e.target.value })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {indianStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Annual Family Income (INR ₹)"
              type="number"
              value={profile.annualFamilyIncome}
              onChange={(e) => setProfile({ annualFamilyIncome: parseInt(e.target.value, 10) || 0 })}
              helperText={`₹${profile.annualFamilyIncome.toLocaleString('en-IN')} / year`}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Social Category
              </label>
              <select
                value={profile.category}
                onChange={(e) => setProfile({ category: e.target.value as SocialCategory })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {socialCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Gender Identity
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ gender: e.target.value as any })}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <input
                type="checkbox"
                id="first-gen"
                checked={profile.isFirstGeneration}
                onChange={(e) => setProfile({ isFirstGeneration: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <label htmlFor="first-gen" className="text-xs text-text font-medium cursor-pointer">
                First-Generation College Learner in Family
              </label>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <input
                type="checkbox"
                id="pwd"
                checked={profile.isPwD}
                onChange={(e) => setProfile({ isPwD: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <label htmlFor="pwd" className="text-xs text-text font-medium cursor-pointer">
                Person with Benchmark Disability (PwD 40%+)
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary">
            Save Profile Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
