import { DocumentType, VaultDocument, ScholarshipDocument } from '@/types';

export interface DocumentRequirementTemplate {
  type: DocumentType;
  title: string;
  description: string;
  issuingAuthority: string;
  commonValidity: string;
  maxSizeMb: number;
  acceptedFormats: string[];
}

export const STANDARD_DOCUMENT_TEMPLATES: Record<DocumentType, DocumentRequirementTemplate> = {
  marksheet: {
    type: 'marksheet',
    title: 'Academic Transcripts / Marksheet',
    description: 'Consolidated marksheet or latest semester grade card issued by an accredited institution.',
    issuingAuthority: 'State Board / CBSE / University Examination Cell',
    commonValidity: 'Permanent',
    maxSizeMb: 5,
    acceptedFormats: ['PDF', 'JPEG', 'PNG'],
  },
  income_certificate: {
    type: 'income_certificate',
    title: 'Income Certificate',
    description: 'Current financial year revenue certificate declaring total gross parental annual income.',
    issuingAuthority: 'Tehsildar / Revenue Inspector / District Magistrate',
    commonValidity: '1 Financial Year (Requires annual renewal)',
    maxSizeMb: 3,
    acceptedFormats: ['PDF', 'JPEG'],
  },
  caste_certificate: {
    type: 'caste_certificate',
    title: 'Community / Caste Certificate',
    description: 'Valid certificate indicating community category (OBC-NCL / SC / ST / EWS) if claiming reservation.',
    issuingAuthority: 'Sub-Divisional Magistrate (SDM) / Revenue Division Officer',
    commonValidity: 'Permanent (Caste) / 1 Year for OBC-NCL and EWS',
    maxSizeMb: 3,
    acceptedFormats: ['PDF', 'JPEG'],
  },
  domicile_certificate: {
    type: 'domicile_certificate',
    title: 'Domicile / Permanent Resident Certificate',
    description: 'Proof of residential nativity for state-funded schemes.',
    issuingAuthority: 'Tehsildar / District Magistrate / e-Seva Authority',
    commonValidity: 'Permanent / 5-10 Years depending on state',
    maxSizeMb: 3,
    acceptedFormats: ['PDF', 'JPEG'],
  },
  bonafide_letter: {
    type: 'bonafide_letter',
    title: 'Bonafide Student Certificate',
    description: 'Current semester enrollment certificate from college principal or registrar.',
    issuingAuthority: 'College Principal / Registrar / Dean of Student Affairs',
    commonValidity: 'Current Academic Term',
    maxSizeMb: 2,
    acceptedFormats: ['PDF', 'JPEG'],
  },
  id_proof: {
    type: 'id_proof',
    title: 'Government Identity Proof',
    description: 'Aadhaar Card, Passport, or Voter ID with clear photo and date of birth.',
    issuingAuthority: 'UIDAI / Election Commission / Ministry of External Affairs',
    commonValidity: 'Permanent',
    maxSizeMb: 2,
    acceptedFormats: ['PDF', 'JPEG'],
  },
  bank_passbook: {
    type: 'bank_passbook',
    title: 'Bank Passbook / Cancelled Cheque',
    description: 'Aadhaar-seeded savings account passbook front page displaying IFSC and Account Number.',
    issuingAuthority: 'Scheduled Commercial Bank / Post Office Bank',
    commonValidity: 'Current Active Account',
    maxSizeMb: 3,
    acceptedFormats: ['PDF', 'JPEG'],
  },
  passport_photo: {
    type: 'passport_photo',
    title: 'Passport Photograph',
    description: 'Recent 3.5cm x 4.5cm color photograph with plain white background, taken within last 6 months.',
    issuingAuthority: 'Certified Studio / Self-Uploaded',
    commonValidity: '6 Months',
    maxSizeMb: 2,
    acceptedFormats: ['JPEG', 'PNG'],
  },
  recommendation_letter: {
    type: 'recommendation_letter',
    title: 'Letter of Recommendation (LOR)',
    description: 'Academic or professional endorsement detailing intellectual potential and character.',
    issuingAuthority: 'Department HOD / Academic Advisor / Research Mentor',
    commonValidity: '1 Academic Year',
    maxSizeMb: 5,
    acceptedFormats: ['PDF'],
  },
  statement_of_purpose: {
    type: 'statement_of_purpose',
    title: 'Statement of Purpose / Personal Essay',
    description: 'Structured personal narrative answering the scholarship essay prompt.',
    issuingAuthority: 'Authored by Applicant',
    commonValidity: 'Per Application Submission',
    maxSizeMb: 5,
    acceptedFormats: ['PDF', 'DOCX'],
  },
  disability_certificate: {
    type: 'disability_certificate',
    title: 'Disability Certificate (UDID)',
    description: 'Unique Disability ID or medical board certificate verifying 40%+ benchmark disability.',
    issuingAuthority: 'District Medical Board / Dept. of Empowerment of Persons with Disabilities',
    commonValidity: 'Permanent / Specified Re-evaluation Date',
    maxSizeMb: 3,
    acceptedFormats: ['PDF'],
  },
  other: {
    type: 'other',
    title: 'Supplementary Document',
    description: 'Special achievement certificate, olympiad medal, sports credential, or patent filing.',
    issuingAuthority: 'Recognized Award Body',
    commonValidity: 'Permanent',
    maxSizeMb: 5,
    acceptedFormats: ['PDF', 'JPEG'],
  },
};

/**
 * Sample Pre-populated Vault Document Checklist for Demo
 * Stores checklist readiness state, expiry dates, and student notes.
 */
export const DEFAULT_MOCK_VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: 'vault-doc-001',
    name: 'Class 12 Consolidated Marksheet',
    type: 'marksheet',
    hasDocument: true,
    status: 'verified',
    expiryDate: 'Permanent Record',
    notes: 'CBSE Board original verified with school seal.',
    lastCheckedAt: '2026-09-15T10:30:00Z',
    tags: ['Academics', 'Class 12', 'CBSE'],
  },
  {
    id: 'vault-doc-002',
    name: 'Annual Family Income Certificate',
    type: 'income_certificate',
    hasDocument: true,
    status: 'verified',
    expiryDate: '2027-03-31',
    notes: 'Issued by Tehsildar Office for FY 2026-27.',
    lastCheckedAt: '2026-10-01T08:15:00Z',
    tags: ['Revenue', 'Income', 'FY26-27'],
  },
  {
    id: 'vault-doc-003',
    name: 'College Bonafide Student Certificate',
    type: 'bonafide_letter',
    hasDocument: true,
    status: 'verified',
    expiryDate: '2027-05-31',
    notes: 'Signed by Dean of Student Affairs for ongoing term.',
    lastCheckedAt: '2026-10-20T16:45:00Z',
    tags: ['Enrollment', 'College', 'Engineering'],
  },
  {
    id: 'vault-doc-004',
    name: 'Aadhaar Card (Masked Copy)',
    type: 'id_proof',
    hasDocument: true,
    status: 'verified',
    expiryDate: 'Permanent Record',
    notes: 'UIDAI verified copy with updated phone link.',
    lastCheckedAt: '2026-08-10T12:00:00Z',
    tags: ['Identity', 'UIDAI', 'Aadhaar'],
  },
  {
    id: 'vault-doc-005',
    name: 'Aadhaar-Linked Bank Account Passbook',
    type: 'bank_passbook',
    hasDocument: true,
    status: 'verified',
    expiryDate: 'Active Account',
    notes: 'SBI Account verified for DBT credit.',
    lastCheckedAt: '2026-10-25T11:10:00Z',
    tags: ['Banking', 'DBT Ready', 'SBI'],
  },
  {
    id: 'vault-doc-006',
    name: 'Community / Category Certificate',
    type: 'caste_certificate',
    hasDocument: false,
    status: 'missing',
    expiryDate: undefined,
    notes: 'Required if claiming reservation under OBC/SC/ST/EWS categories.',
    tags: ['Category', 'Affirmative Action'],
  },
  {
    id: 'vault-doc-007',
    name: 'State Domicile / Nativity Certificate',
    type: 'domicile_certificate',
    hasDocument: true,
    status: 'verified',
    expiryDate: 'Permanent Record',
    notes: 'Maharashtra State Resident Certificate issued by Tehsildar.',
    lastCheckedAt: '2026-09-01T09:00:00Z',
    tags: ['Domicile', 'Maharashtra'],
  },
  {
    id: 'vault-doc-008',
    name: 'Passport Photograph (Color)',
    type: 'passport_photo',
    hasDocument: true,
    status: 'verified',
    expiryDate: '2026-12-15', // Approaching expiry!
    notes: 'Recent studio photograph with white background. Renew soon for winter term.',
    lastCheckedAt: '2026-10-15T14:30:00Z',
    tags: ['Photo', 'Identity'],
  },
  {
    id: 'vault-doc-009',
    name: 'Academic Letter of Recommendation',
    type: 'recommendation_letter',
    hasDocument: false,
    status: 'missing',
    expiryDate: undefined,
    notes: 'Requested from Department HOD for fellowship schemes.',
    tags: ['Academic', 'LOR'],
  },
  {
    id: 'vault-doc-010',
    name: 'Statement of Purpose / Personal Statement',
    type: 'statement_of_purpose',
    hasDocument: true,
    status: 'verified',
    expiryDate: '2027-04-30',
    notes: 'General SOP covering academic aspirations and research goals.',
    lastCheckedAt: '2026-10-28T10:00:00Z',
    tags: ['Essay', 'SOP'],
  },
];

export const createStandardDocument = (
  id: string,
  type: DocumentType,
  required: boolean = true,
  customDescription?: string
): ScholarshipDocument => {
  const template = STANDARD_DOCUMENT_TEMPLATES[type];
  return {
    id,
    name: template.title,
    type,
    required,
    description: customDescription || template.description,
    maxSizeMb: template.maxSizeMb,
    acceptedFormats: template.acceptedFormats,
  };
};
