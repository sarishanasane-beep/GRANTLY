/**
 * GRANTLY — Central Legal & Regulatory Configuration
 *
 * Single source of truth for publisher identity, regulatory compliance,
 * platform disclosures, and demo disclaimers.
 *
 * NOTE FOR PRODUCTION LAUNCH:
 * All fields with `isVerified: false` are explicit RELEASE BLOCKERS.
 * Commercial deployment requires formal registration and legal counsel review.
 */

export interface LegalPublisher {
  legalEntityName: string | null;
  registrationType: 'Private Limited' | 'LLP' | 'Non-Profit / Section 8' | 'Sole Proprietorship' | 'Unregistered Prototype';
  registrationNumber: string | null;
  jurisdiction: string | null;
  registeredAddress: string | null;
  supportEmail: string | null;
  privacyEmail: string | null;
  grievanceOfficerName: string | null;
  isVerified: boolean;
}

export interface LegalDisclaimers {
  isPrototype: boolean;
  prototypeNotice: string;
  isFictionalCatalog: boolean;
  catalogDisclaimer: string;
  noFinancialGuaranteeNotice: string;
  noOfficialAffiliationNotice: string;
  underageAdvisoryNotice: string;
}

export interface LegalConfig {
  appName: string;
  tagline: string;
  currentYear: number;
  publisher: LegalPublisher;
  disclaimers: LegalDisclaimers;
}

export const LEGAL_CONFIG: LegalConfig = {
  appName: 'GRANTLY',
  tagline: 'Rethinking the Scholarship Experience',
  currentYear: new Date().getFullYear(),

  publisher: {
    legalEntityName: null, // [RELEASE BLOCKER]: Unverified prototype. Must be completed prior to production.
    registrationType: 'Unregistered Prototype',
    registrationNumber: null,
    jurisdiction: 'India',
    registeredAddress: null,
    supportEmail: null,
    privacyEmail: null,
    grievanceOfficerName: null,
    isVerified: false,
  },

  disclaimers: {
    isPrototype: true,
    prototypeNotice:
      'GRANTLY is currently an academic technology prototype developed for user interface, eligibility matching, and student workflow evaluation. The platform operates on client-side state without a persistent backend.',

    isFictionalCatalog: true,
    catalogDisclaimer:
      'The 36 scholarship opportunities displayed within this catalog are fictional demonstration models crafted to illustrate multi-criteria eligibility matching and tracking workflows. They do not represent active monetary grants or verified funding programs.',

    noFinancialGuaranteeNotice:
      'GRANTLY does not guarantee scholarship awards, institutional admission, or financial disbursements. Final eligibility and monetary approval reside exclusively with the designated scholarship-granting institutions.',

    noOfficialAffiliationNotice:
      'GRANTLY is an independent educational platform prototype and is not affiliated with, authorized by, or an agent of the Government of India, the National Scholarship Portal (NSP), state departments, or any university administration.',

    underageAdvisoryNotice:
      'Students under 18 years of age should explore this platform with parental or guardian guidance. No sensitive biometric or government identification credentials should ever be stored.',
  },
};
