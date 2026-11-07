/**
 * GRANTLY Core TypeScript Type Definitions
 * Phase 01: Project Foundation
 * Strict mode compliant - No any types allowed.
 */

export type EducationLevel =
  | 'High School'
  | 'Class 11-12'
  | 'Diploma'
  | 'Undergraduate'
  | 'Postgraduate'
  | 'PhD/Doctorate';

export type AcademicField =
  | 'Engineering & Technology'
  | 'Medicine & Healthcare'
  | 'Pure Sciences'
  | 'Commerce & Finance'
  | 'Humanities & Social Sciences'
  | 'Arts & Design'
  | 'Law & Public Policy'
  | 'Vocational & Applied Skills'
  | 'Interdisciplinary';

export type SocialCategory =
  | 'General'
  | 'OBC'
  | 'SC'
  | 'ST'
  | 'EWS'
  | 'Minority'
  | 'Women in STEM'
  | 'First-Generation Learner'
  | 'Persons with Disabilities (PwD)'
  | 'Defence/Ex-Servicemen Wards';

export type ApplicationStatus =
  | 'saved'
  | 'drafting'
  | 'submitted'
  | 'under_review'
  | 'awarded'
  | 'rejected'
  | 'archived';

export type DocumentType =
  | 'marksheet'
  | 'income_certificate'
  | 'caste_certificate'
  | 'domicile_certificate'
  | 'bonafide_letter'
  | 'id_proof'
  | 'bank_passbook'
  | 'recommendation_letter'
  | 'statement_of_purpose'
  | 'disability_certificate'
  | 'other';

export interface ScholarshipDocument {
  id: string;
  name: string;
  type: DocumentType;
  required: boolean;
  description: string;
  maxSizeMb: number;
  acceptedFormats: string[];
}

export interface VaultDocument {
  id: string;
  name: string;
  type: DocumentType;
  hasDocument: boolean;
  status: 'verified' | 'pending' | 'expired' | 'missing';
  expiryDate?: string;
  notes?: string;
  lastCheckedAt?: string;
  tags: string[];
}

export interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string;
  order: number;
  type: 'document' | 'form' | 'essay' | 'verification' | 'submission';
}

export interface ScholarshipCriteria {
  educationLevels: EducationLevel[];
  academicFields: AcademicField[];
  states: string[]; // State names e.g., 'All India', 'Maharashtra', 'Karnataka', etc.
  percentageMin?: number;
  cgpaMin?: number;
  maxAnnualFamilyIncome?: number; // In INR
  categories: SocialCategory[];
  genderPreference: 'All' | 'Female' | 'Male' | 'Non-Binary/Transgender';
  maxAge?: number;
  specialConditions?: string[];
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  providerType:
    | 'Government (Central)'
    | 'Government (State)'
    | 'Corporate CSR'
    | 'Philanthropic Trust'
    | 'Academic Foundation'
    | 'Global Merit Grant';
  amount: number; // Value in INR
  amountFormatted: string; // e.g. "₹1,50,000 / year"
  awardPeriod: 'One-time' | 'Per Semester' | 'Annual' | 'Full Degree';
  deadlineDays: number; // Offset in days from current date
  deadlineDate: string; // ISO date string computed relative to runtime date
  isRenewable: boolean;
  effortLevel: 'Low' | 'Medium' | 'High';
  competitionLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  estimatedTimeMinutes: number;
  description: string;
  highlights: string[];
  criteria: ScholarshipCriteria;
  requiredDocuments: ScholarshipDocument[];
  hasEssayRequirement: boolean;
  essayPrompt?: string;
  essayWordLimit?: number;
  tags: string[];
  officialUrl: string;
  isFictionalDemo: true; // Explicit declaration that data is demonstration only
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  educationLevel: EducationLevel;
  currentInstitution: string;
  courseName: string;
  academicField: AcademicField;
  graduationYear: number;
  percentageOrCgpa: number;
  isCgpa: boolean;
  stateOfDomicile: string;
  annualFamilyIncome: number; // In INR
  category: SocialCategory;
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  isFirstGeneration: boolean;
  isPwD: boolean;
  bio?: string;
  skills: string[];
  completedOnboarding: boolean;
  updatedAt: string;
}

export interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  status: ApplicationStatus;
  appliedDate?: string;
  lastUpdated: string;
  steps: ApplicationStep[];
  essayDraft?: string;
  attachedVaultDocumentIds: string[];
  notes?: string;
}

export type EligibilityStatus = 'eligible' | 'potentially_eligible' | 'not_eligible';
export type MatchConfidence = 'high' | 'medium' | 'low';

export interface ScoreWeightConfig {
  educationLevel: number;
  academicField: number;
  academicMerit: number;
  familyIncome: number;
  domicile: number;
  category: number;
  otherCriteria: number;
}

export interface MatchBreakdownScore {
  educationLevel: number;
  academicField: number;
  academicMerit: number;
  familyIncome: number;
  domicile: number;
  category: number;
  otherCriteria: number;
}

export interface ProfileCompleteness {
  percentage: number;
  isComplete: boolean;
  completedFieldsCount: number;
  totalFieldsCount: number;
  missingFields: string[];
}

export interface ScholarshipMatch {
  scholarshipId: string;
  matchScore: number; // 0 to 100 percentage
  eligibilityStatus: EligibilityStatus;
  confidence: MatchConfidence;
  matchingCriteria: string[];
  unmatchedCriteria: string[];
  missingProfileInformation: string[];
  explanation: string;
  breakdown: MatchBreakdownScore;
  reasons: string[]; // for backward-compatibility with UI
  matchBreakdown: {
    academicFit: number;
    financialEligibility: number;
    demographicFit: number;
    effortScore: number;
  };
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large';
  emailNotifications: boolean;
  deadlineAlerts: boolean;
  soundEffects: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'deadline' | 'match' | 'system' | 'award';
  read: boolean;
  actionUrl?: string;
}
