/**
 * GRANTLY Internationalization Foundation (i18n)
 * Multi-language string catalogs for high accessibility across diverse demographics.
 */

export type SupportedLanguage = 'en' | 'hi';

export interface TranslationDictionary {
  brand: {
    name: string;
    tagline: string;
    subtagline: string;
  };
  navigation: {
    home: string;
    dashboard: string;
    explore: string;
    tracker: string;
    deadlines: string;
    vault: string;
    compare: string;
    profile: string;
    onboarding: string;
    skipToContent: string;
  };
  common: {
    apply: string;
    applied: string;
    viewDetails: string;
    save: string;
    saved: string;
    remove: string;
    compare: string;
    deadline: string;
    amount: string;
    matchScore: string;
    eligibility: string;
    searchPlaceholder: string;
    filter: string;
    clearAll: string;
    status: string;
    daysRemaining: string;
    renewable: string;
    nonRenewable: string;
    fictionalDisclaimer: string;
  };
  statusLabels: {
    saved: string;
    drafting: string;
    submitted: string;
    under_review: string;
    awarded: string;
    rejected: string;
    archived: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    brand: {
      name: 'GRANTLY',
      tagline: 'Next-Generation Scholarship Discovery & Management',
      subtagline: 'Empowering ambitious minds with precision scholarship matching and intelligent funding navigation.',
    },
    navigation: {
      home: 'Overview',
      dashboard: 'Dashboard',
      explore: 'Explore Grants',
      tracker: 'Application Tracker',
      deadlines: 'Timeline & Deadlines',
      vault: 'Document Vault',
      compare: 'Compare',
      profile: 'Student Profile',
      onboarding: 'Quick Setup',
      skipToContent: 'Skip to main content',
    },
    common: {
      apply: 'Apply Now',
      applied: 'Applied',
      viewDetails: 'View Details',
      save: 'Save Opportunity',
      saved: 'Saved',
      remove: 'Remove',
      compare: 'Compare',
      deadline: 'Deadline',
      amount: 'Grant Amount',
      matchScore: 'Eligibility Match',
      eligibility: 'Eligibility Criteria',
      searchPlaceholder: 'Search scholarships, institutions, eligibility...',
      filter: 'Filter Schemes',
      clearAll: 'Clear Filters',
      status: 'Status',
      daysRemaining: 'days remaining',
      renewable: 'Renewable Annually',
      nonRenewable: 'One-time Grant',
      fictionalDisclaimer: 'Fictional Demonstration Data: Simulated scholarships created exclusively for the hackathon preview.',
    },
    statusLabels: {
      saved: 'Saved Opportunity',
      drafting: 'Application in Progress',
      submitted: 'Successfully Submitted',
      under_review: 'Under Evaluation',
      awarded: 'Scholarship Awarded',
      rejected: 'Not Selected',
      archived: 'Archived',
    },
  },
  hi: {
    brand: {
      name: 'ग्रांटली (GRANTLY)',
      tagline: 'अगली पीढ़ी का छात्रवृत्ति खोज एवं प्रबंधन मंच',
      subtagline: 'सटीक छात्रवृत्ति मिलान और स्मार्ट वित्तीय नेविगेशन के साथ छात्रों का सशक्तिकरण।',
    },
    navigation: {
      home: 'मुख्य पृष्ठ',
      dashboard: 'डैशबोर्ड',
      explore: 'छात्रवृत्तियां खोजें',
      tracker: 'आवेदन ट्रैकर',
      deadlines: 'समय सीमाएं',
      vault: 'दस्तावेज़ वॉल्ट',
      compare: 'तुलना करें',
      profile: 'छात्र प्रोफ़ाइल',
      onboarding: 'त्वरित सेटअप',
      skipToContent: 'मुख्य सामग्री पर जाएं',
    },
    common: {
      apply: 'आवेदन करें',
      applied: 'आवेदित',
      viewDetails: 'विवरण देखें',
      save: 'सहेजें',
      saved: 'सहेजा गया',
      remove: 'हटाएं',
      compare: 'तुलना करें',
      deadline: 'अंतिम तिथि',
      amount: 'अनुदान राशि',
      matchScore: 'पात्रता मिलान',
      eligibility: 'पात्रता मानदंड',
      searchPlaceholder: 'छात्रवृत्ति, संस्थान या पात्रता खोजें...',
      filter: 'फ़िल्टर करें',
      clearAll: 'फ़िल्टर हटाएं',
      status: 'स्थिति',
      daysRemaining: 'दिन शेष',
      renewable: 'वार्षिक नवीकरणीय',
      nonRenewable: 'एकमुश्त अनुदान',
      fictionalDisclaimer: 'काल्पनिक प्रदर्शन डेटा: हैकाथॉन पूर्वावलोकन के लिए निर्मित विशेष प्रोटोटाइप डेटा।',
    },
    statusLabels: {
      saved: 'सहेजी गई छात्रवृत्ति',
      drafting: 'प्रक्रिया जारी',
      submitted: 'जमा कर दिया गया',
      under_review: 'समीक्षाधीन',
      awarded: 'छात्रवृत्ति स्वीकृत',
      rejected: 'अस्वीकृत',
      archived: 'अभिलेखागार',
    },
  },
};
