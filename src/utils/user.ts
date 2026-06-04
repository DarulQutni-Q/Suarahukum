import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, PlanType } from '../types';

export const PLAN_LIMITS = {
  free: { max: 3, resetHours: 24, label: 'Free' },
  plus: { max: 15, resetHours: 12, label: 'Plus' },
  pro: { max: 35, resetHours: 12, label: 'Pro' }
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function getOrInitUserProfile(uid: string, initialData?: Partial<UserProfile>): Promise<UserProfile> {
  let profile = await getUserProfile(uid);
  let changed = false;

  if (!profile) {
    profile = {
      fullName: '',
      caseCategory: '',
      onboardingComplete: false,
      plan: 'free',
      quotaUsed: 0,
      quotaResetAt: null,
      subscriptionExpiry: null,
      updatedAt: new Date().toISOString(),
      ...initialData
    };
    changed = true;
  } else {
    // Fill in missing default fields due to schema evolution
    if (profile.plan === undefined) { profile.plan = 'free'; changed = true; }
    if (profile.quotaUsed === undefined) { profile.quotaUsed = 0; changed = true; }
    if (profile.quotaResetAt === undefined) { profile.quotaResetAt = null; changed = true; }
    if (profile.subscriptionExpiry === undefined) { profile.subscriptionExpiry = null; changed = true; }
    // Clean up old field if exists
    if ('quotaExhaustedAt' in profile) {
      delete (profile as any).quotaExhaustedAt;
      changed = true;
    }
  }

  // Check rolling quotas
  if (profile.quotaResetAt) {
    const resetAt = new Date(profile.quotaResetAt).getTime();
    const now = Date.now();

    if (now >= resetAt) {
      profile.quotaUsed = 0;
      profile.quotaResetAt = null;
      changed = true;
    }
  }

  // Check subscription expiry
  if (profile.subscriptionExpiry && profile.plan !== 'free') {
    const expiry = new Date(profile.subscriptionExpiry).getTime();
    if (Date.now() > expiry) {
      profile.plan = 'free';
      changed = true;
    }
  }

  if (changed) {
    await saveUserProfile(uid, profile);
  }

  return profile;
}

export async function saveUserProfile(uid: string, profile: Partial<UserProfile>) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { 
    ...profile, 
    updatedAt: new Date().toISOString() 
  }, { merge: true });
}

export async function incrementQuota(uid: string, profile: UserProfile): Promise<UserProfile> {
  const limits = PLAN_LIMITS[profile.plan] || PLAN_LIMITS.free;
  
  const updatedProfile: UserProfile = { ...profile };
  const now = Date.now();
  
  // If no reset time, or we passed the reset time, restart window.
  if (!updatedProfile.quotaResetAt || now >= new Date(updatedProfile.quotaResetAt).getTime()) {
    updatedProfile.quotaUsed = 1;
    // Set next reset time
    updatedProfile.quotaResetAt = new Date(now + limits.resetHours * 60 * 60 * 1000).toISOString();
  } else {
    updatedProfile.quotaUsed += 1;
  }
  
  await saveUserProfile(uid, updatedProfile);
  return updatedProfile;
}

export function generateMockSql() {
  return `
/*
-- SUPABASE MOCK SCHEMA --
CREATE TABLE public.users (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  case_category text,
  onboarding_complete boolean DEFAULT false,
  plan text DEFAULT 'free',
  quota_used integer DEFAULT 0,
  quota_exhausted_at timestamp with time zone,
  subscription_expiry timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" 
ON public.users FOR ALL USING (auth.uid() = id);

-- Payment status and deeper analysis settings are essentially
-- inferred from the 'plan' column and 'subscription_expiry'.
*/
  `;
}
