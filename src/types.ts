interface AnalysisResult {
  documentType: string
  summary: string
  yourRights: { right: string; explanation: string }[]
  dangerClauses: { clause: string; risk: string; level: 'tinggi' | 'sedang' }[]
  safeClauses: { clause: string; note: string }[]
  recommendedActions: string[]
  overallSafety: 'aman' | 'perlu_perhatian' | 'berbahaya'
  overallSafetyExplanation: string
  followUpQA?: { question: string, answer: string }[]
}

interface HistoryEntry {
  id: string
  documentType: string
  summary: string
  overallSafety: 'aman' | 'perlu_perhatian' | 'berbahaya'
  analyzedAt: string
  thumbnail: string
  result: AnalysisResult
}

export type PlanType = 'free' | 'plus' | 'pro';

export interface UserProfile {
  fullName: string;
  caseCategory: string;
  onboardingComplete: boolean;
  plan: PlanType;
  quotaUsed: number;
  quotaResetAt: string | null;
  subscriptionExpiry: string | null;
  updatedAt: string;
}

type Screen = 'home' | 'scanner' | 'analyzing' | 'result' | 'history' | 'error' | 'onboarding' | 'pricing'

interface AppState {
  screen: Screen
  imageFiles: File[]
  imagePreviews: string[]
  analyzingMessage: string
  result: AnalysisResult | null
  history: HistoryEntry[]
  error: string | null
  profile: UserProfile | null
  onboardingRedirect: 'scanner' | null
}

type AppAction = 
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_IMAGES'; files: File[]; previews: string[] }
  | { type: 'START_ANALYZING' }
  | { type: 'SET_ANALYZING_MESSAGE'; message: string }
  | { type: 'SET_RESULT'; result: AnalysisResult }
  | { type: 'ADD_FOLLOW_UP'; qa: { question: string, answer: string } }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'SAVE_TO_HISTORY'; entry: HistoryEntry }
  | { type: 'DELETE_HISTORY'; id: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_PROFILE'; profile: UserProfile }
  | { type: 'SET_ONBOARDING_REDIRECT'; target: 'scanner' | null }
  | { type: 'RESET' }

export type { AnalysisResult, HistoryEntry, Screen, AppState, AppAction }
