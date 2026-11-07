import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  StudentProfile,
  ScholarshipApplication,
  ApplicationStatus,
  ApplicationStep,
  VaultDocument,
  UserSettings,
  Notification,
} from '@/types';
import { DEFAULT_MOCK_VAULT_DOCUMENTS } from '@/data/documents';

/**
 * Initial Default Student Profile for seamless demo experience
 */
export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'usr-demo-01',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@grantly.demo.edu',
  phone: '+91 98765 43210',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  educationLevel: 'Undergraduate',
  currentInstitution: 'Indian Institute of Technology, Bombay',
  courseName: 'B.Tech in Computer Science and Engineering',
  academicField: 'Engineering & Technology',
  graduationYear: 2027,
  percentageOrCgpa: 8.7,
  isCgpa: true,
  stateOfDomicile: 'Maharashtra',
  annualFamilyIncome: 450000,
  category: 'General',
  gender: 'Male',
  isFirstGeneration: false,
  isPwD: false,
  bio: 'Second-year undergraduate passionate about systems engineering, distributed computation, and accessibility technology.',
  skills: ['TypeScript', 'Python', 'Systems Architecture', 'Algorithms', 'Robotics'],
  completedOnboarding: true,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_SETTINGS: UserSettings = {
  theme: 'dark',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'normal',
  emailNotifications: true,
  deadlineAlerts: true,
  soundEffects: false,
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-01',
    title: 'Aditi EmpowerTech Application Deadline in 14 Days',
    message: 'Remember to finalize your essay draft and attach your College Bonafide Certificate before the cut-off.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'deadline',
    read: false,
    actionUrl: '/scholarship/grant-01-aditi-stem',
  },
  {
    id: 'notif-02',
    title: 'New 95% Match Opportunity Identified',
    message: 'CyberShield National Information Security Fellowship matches your Engineering profile and academic GPA.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    type: 'match',
    read: false,
    actionUrl: '/scholarship/grant-27-cloud-shield',
  },
  {
    id: 'notif-03',
    title: 'Document Vault Verification Verified',
    message: 'Your Class 12th Marksheet and Income Certificate are fully verified for direct DBT application attachment.',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    type: 'award',
    read: true,
    actionUrl: '/vault',
  },
];

export const createDefaultSteps = (): ApplicationStep[] => [
  {
    id: 'step-1',
    title: 'Personal & Domicile Verification',
    description: 'Verify Aadhaar and permanent residential domicile match the scheme jurisdiction.',
    isCompleted: true,
    order: 1,
    type: 'verification',
  },
  {
    id: 'step-2',
    title: 'Academic Transcripts & Marksheet Upload',
    description: 'Attach certified semester grade sheets from your institution.',
    isCompleted: false,
    order: 2,
    type: 'document',
  },
  {
    id: 'step-3',
    title: 'Statement of Purpose / Essay Draft',
    description: 'Craft and review the scholarship response prompt.',
    isCompleted: false,
    order: 3,
    type: 'essay',
  },
  {
    id: 'step-4',
    title: 'Institutional Endorsement & Head Seal',
    description: 'Acquire Dean or Principal digital seal on bonafide letter.',
    isCompleted: false,
    order: 4,
    type: 'verification',
  },
  {
    id: 'step-5',
    title: 'Final Portal Review & DBT Submission',
    description: 'Confirm direct benefit transfer bank account details and submit.',
    isCompleted: false,
    order: 5,
    type: 'submission',
  },
];

export interface AppState {
  // 1. Student Profile
  profile: StudentProfile;
  setProfile: (partial: Partial<StudentProfile>) => void;
  resetProfile: () => void;

  // 2. Saved Scholarships
  savedScholarshipIds: string[];
  toggleSaveScholarship: (scholarshipId: string) => void;
  isScholarshipSaved: (scholarshipId: string) => boolean;

  // 3. Applications Tracker
  applications: Record<string, ScholarshipApplication>;
  startApplication: (scholarshipId: string, scholarshipTitle: string) => void;
  updateApplicationStatus: (scholarshipId: string, status: ApplicationStatus) => void;
  toggleApplicationStep: (scholarshipId: string, stepId: string) => void;
  setApplicationEssayDraft: (scholarshipId: string, essay: string) => void;
  setApplicationNotes: (scholarshipId: string, notes: string) => void;
  attachVaultDocToApplication: (scholarshipId: string, docId: string) => void;
  removeVaultDocFromApplication: (scholarshipId: string, docId: string) => void;

  // 4. Document Vault
  vaultDocuments: VaultDocument[];
  addVaultDocument: (doc: Omit<VaultDocument, 'id' | 'lastCheckedAt'>) => void;
  removeVaultDocument: (id: string) => void;
  updateVaultDocument: (id: string, updates: Partial<VaultDocument>) => void;
  toggleVaultDocument: (id: string) => void;

  // 5. Compare List (Max 3 scholarships)
  compareList: string[];
  addToCompare: (scholarshipId: string) => boolean;
  removeFromCompare: (scholarshipId: string) => void;
  clearCompare: () => void;
  isInCompare: (scholarshipId: string) => boolean;

  // 6. User Settings & Theme
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  toggleTheme: () => void;

  // 7. Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;

  // 8. Hydration tracking
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Profile State
      profile: INITIAL_STUDENT_PROFILE,
      setProfile: (partial) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...partial,
            updatedAt: new Date().toISOString(),
          },
        })),
      resetProfile: () => set({ profile: INITIAL_STUDENT_PROFILE }),

      // Saved Scholarships
      savedScholarshipIds: ['grant-01-aditi-stem', 'grant-03-bengaluru-science', 'grant-27-cloud-shield'],
      toggleSaveScholarship: (scholarshipId) =>
        set((state) => {
          const exists = state.savedScholarshipIds.includes(scholarshipId);
          return {
            savedScholarshipIds: exists
              ? state.savedScholarshipIds.filter((id) => id !== scholarshipId)
              : [...state.savedScholarshipIds, scholarshipId],
          };
        }),
      isScholarshipSaved: (scholarshipId) =>
        get().savedScholarshipIds.includes(scholarshipId),

      // Applications State
      applications: {
        'grant-01-aditi-stem': {
          id: 'app-01',
          scholarshipId: 'grant-01-aditi-stem',
          scholarshipTitle: 'Aditi EmpowerTech National Fellowship for Women',
          status: 'drafting',
          appliedDate: undefined,
          lastUpdated: new Date().toISOString(),
          steps: createDefaultSteps(),
          essayDraft: 'As a computer science student, I have witnessed firsthand the rural digital gap during my volunteer teaching...',
          attachedVaultDocumentIds: ['vault-doc-001', 'vault-doc-003'],
          notes: 'Recommendation letter requested from Prof. Kulkarni on Nov 2nd.',
        },
        'grant-27-cloud-shield': {
          id: 'app-02',
          scholarshipId: 'grant-27-cloud-shield',
          scholarshipTitle: 'CyberShield National Information Security Fellowship',
          status: 'submitted',
          appliedDate: new Date(Date.now() - 86400000 * 3).toISOString(),
          lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString(),
          steps: createDefaultSteps().map((s) => ({ ...s, isCompleted: true })),
          essayDraft: 'Zero-trust architecture in critical public infrastructure is not merely an engineering concern but a national security imperative...',
          attachedVaultDocumentIds: ['vault-doc-001', 'vault-doc-002', 'vault-doc-003', 'vault-doc-004'],
          notes: 'Submitted via National Cyber Security CSR portal. Awaiting interview shortlist.',
        },
      },
      startApplication: (scholarshipId, scholarshipTitle) =>
        set((state) => {
          if (state.applications[scholarshipId]) return state;
          const newApp: ScholarshipApplication = {
            id: `app-${Date.now()}`,
            scholarshipId,
            scholarshipTitle,
            status: 'drafting',
            lastUpdated: new Date().toISOString(),
            steps: createDefaultSteps(),
            attachedVaultDocumentIds: [],
          };
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: newApp,
            },
          };
        }),
      updateApplicationStatus: (scholarshipId, status) =>
        set((state) => {
          const app = state.applications[scholarshipId];
          if (!app) return state;
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: {
                ...app,
                status,
                appliedDate: status === 'submitted' ? (app.appliedDate || new Date().toISOString()) : app.appliedDate,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
      toggleApplicationStep: (scholarshipId, stepId) =>
        set((state) => {
          const app = state.applications[scholarshipId];
          if (!app) return state;
          const updatedSteps = app.steps.map((step) =>
            step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
          );
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: {
                ...app,
                steps: updatedSteps,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
      setApplicationEssayDraft: (scholarshipId, essay) =>
        set((state) => {
          const app = state.applications[scholarshipId];
          if (!app) return state;
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: {
                ...app,
                essayDraft: essay,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
      setApplicationNotes: (scholarshipId, notes) =>
        set((state) => {
          const app = state.applications[scholarshipId];
          if (!app) return state;
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: {
                ...app,
                notes,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
      attachVaultDocToApplication: (scholarshipId, docId) =>
        set((state) => {
          const app = state.applications[scholarshipId];
          if (!app) return state;
          if (app.attachedVaultDocumentIds.includes(docId)) return state;
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: {
                ...app,
                attachedVaultDocumentIds: [...app.attachedVaultDocumentIds, docId],
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
      removeVaultDocFromApplication: (scholarshipId, docId) =>
        set((state) => {
          const app = state.applications[scholarshipId];
          if (!app) return state;
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: {
                ...app,
                attachedVaultDocumentIds: app.attachedVaultDocumentIds.filter((id) => id !== docId),
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),

      // Document Vault State
      vaultDocuments: DEFAULT_MOCK_VAULT_DOCUMENTS,
      addVaultDocument: (doc) =>
        set((state) => ({
          vaultDocuments: [
            ...state.vaultDocuments,
            {
              ...doc,
              id: `vault-doc-${Date.now()}`,
              lastCheckedAt: new Date().toISOString(),
            },
          ],
        })),
      removeVaultDocument: (id) =>
        set((state) => ({
          vaultDocuments: state.vaultDocuments.filter((d) => d.id !== id),
        })),
      updateVaultDocument: (id, updates) =>
        set((state) => ({
          vaultDocuments: state.vaultDocuments.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      toggleVaultDocument: (id) =>
        set((state) => ({
          vaultDocuments: state.vaultDocuments.map((d) =>
            d.id === id
              ? {
                  ...d,
                  hasDocument: !d.hasDocument,
                  status: !d.hasDocument ? 'verified' : 'missing',
                  lastCheckedAt: new Date().toISOString(),
                }
              : d
          ),
        })),

      // Compare State (Max 3 scholarships)
      compareList: ['grant-01-aditi-stem', 'grant-27-cloud-shield'],
      addToCompare: (scholarshipId) => {
        const { compareList } = get();
        if (compareList.includes(scholarshipId)) return false;
        if (compareList.length >= 3) return false;
        set({ compareList: [...compareList, scholarshipId] });
        return true;
      },
      removeFromCompare: (scholarshipId) =>
        set((state) => ({
          compareList: state.compareList.filter((id) => id !== scholarshipId),
        })),
      clearCompare: () => set({ compareList: [] }),
      isInCompare: (scholarshipId) => get().compareList.includes(scholarshipId),

      // Settings State
      settings: INITIAL_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
          return {
            settings: { ...state.settings, theme: newTheme },
          };
        }),

      // Notifications State
      notifications: INITIAL_NOTIFICATIONS,
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              ...notif,
              id: `notif-${Date.now()}`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      // Hydration
      isHydrated: false,
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'grantly-platform-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
