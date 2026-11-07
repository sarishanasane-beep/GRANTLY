/**
 * GRANTLY Education & Scholarship Finance Glossary
 * Educational and financial terminologies to empower students.
 */

export interface GlossaryItem {
  id: string;
  term: string;
  pronunciation?: string;
  category: 'Eligibility' | 'Documentation' | 'Disbursement' | 'Academic' | 'Tax & Legal';
  definition: string;
  practicalTip: string;
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    id: 'merit-cum-means',
    term: 'Merit-cum-Means (MCM)',
    category: 'Eligibility',
    definition: 'A funding category that evaluates candidates on both academic excellence (merit) and household financial necessity (means).',
    practicalTip: 'Ensure both your recent semester marksheets and officially certified income certificates are updated concurrently.',
  },
  {
    id: 'domicile-certificate',
    term: 'Domicile / Residence Certificate',
    category: 'Documentation',
    definition: 'An official state document certifying that a candidate has been a permanent resident of a specific state/UT for a stipulated duration.',
    practicalTip: 'Apply via your state e-District or MeeSeva / Seva Sindhu / Aaple Sarkar portal at least 3 weeks in advance.',
  },
  {
    id: 'bonafide-certificate',
    term: 'Bonafide Student Certificate',
    category: 'Documentation',
    definition: 'A certificate issued by the Head of Institution (Dean/Principal/Registrar) attesting that the student is genuinely enrolled in a designated program.',
    practicalTip: 'Ask your college administration office for the standard scholarship format bearing the official seal and registration number.',
  },
  {
    id: 'ews-quota',
    term: 'Economically Weaker Section (EWS)',
    category: 'Eligibility',
    definition: 'A socio-economic category reserved for citizens belonging to the unreserved general category whose family gross annual income falls below specified thresholds (typically ₹8 Lakh/annum).',
    practicalTip: 'EWS certificates are valid for the financial year of issue; check expiration dates before submitting.',
  },
  {
    id: 'dbt-disbursement',
    term: 'Direct Benefit Transfer (DBT)',
    category: 'Disbursement',
    definition: 'The electronic transfer of scholarship subsidies directly into the recipient student\'s Aadhaar-seeded bank account.',
    practicalTip: 'Verify that your bank account is active, Aadhaar-linked (NPCI mapper active), and not restricted by a minor or zero-balance ceiling.',
  },
  {
    id: 'renewal-criterion',
    term: 'Scholarship Renewal Clause',
    category: 'Eligibility',
    definition: 'Conditions mandated by providers (e.g., maintaining 7.5 CGPA, 75% attendance, no backlogs) to retain annual funding.',
    practicalTip: 'Track your renewal deadline early each semester to prevent abrupt funding cessation.',
  },
  {
    id: 'cgpa-conversion',
    term: 'CGPA to Percentage Multiplier',
    category: 'Academic',
    definition: 'The mathematical formula authorized by a university/board (e.g., AICTE 9.5 multiplier) to translate grade point averages into percentages.',
    practicalTip: 'Always upload your university\'s official grade conversion notification alongside transcripts.',
  },
  {
    id: 'statement-of-purpose',
    term: 'Statement of Purpose (SOP) / Essay',
    category: 'Documentation',
    definition: 'A structured essay detailing your academic background, career ambitions, financial hardships, and how the scholarship will catalyze your impact.',
    practicalTip: 'Quantify your achievements and highlight community leadership or problem-solving beyond pure grades.',
  },
  {
    id: 'first-generation-learner',
    term: 'First-Generation Learner',
    category: 'Eligibility',
    definition: 'A candidate whose parents have not obtained a formal higher-education degree (bachelor\'s degree or higher).',
    practicalTip: 'Many CSR foundations allocate special diversity endowments for first-generation graduates.',
  },
  {
    id: 'csr-endowment',
    term: 'Corporate Social Responsibility (CSR) Grant',
    category: 'Disbursement',
    definition: 'Corporate-funded philanthropic grants mandated by company law to support underprivileged students in technology, healthcare, and business.',
    practicalTip: 'CSR scholarships often pair monetary awards with executive mentorship and internship fast-tracks.',
  },
];
