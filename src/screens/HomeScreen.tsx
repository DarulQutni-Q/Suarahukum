import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { AppAction, AnalysisResult, UserProfile } from '@/types';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getOrInitUserProfile } from '@/utils/user';

import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import FeatureCards from '@/components/home/FeatureCards';
import PricingPreviewSection from '@/components/home/PricingPreviewSection';
import FAQSection from '@/components/home/FAQSection';
import Footer from '@/components/home/Footer';
import AuthModal from '@/components/auth/AuthModal';

interface Props {
  dispatch: React.Dispatch<AppAction>;
}

export const SAMPLE_RESULT: AnalysisResult = {
  documentType: 'Kontrak Kerja',
  summary:
    'Perjanjian kerja antara karyawan dan PT Maju Bersama untuk posisi Staf Administrasi dengan masa percobaan 3 bulan dan gaji pokok Rp 4.500.000 per bulan.',
  yourRights: [
    {
      right: 'Hak Gaji Tepat Waktu',
      explanation:
        'Gaji wajib dibayarkan setiap tanggal 25. Keterlambatan lebih dari 3 hari kerja memberi Anda hak untuk mengajukan keberatan secara tertulis kepada HRD.'
    },
    {
      right: 'Hak Cuti Tahunan 12 Hari',
      explanation:
        'Setelah melewati masa percobaan 3 bulan, Anda berhak atas 12 hari cuti berbayar per tahun yang dapat diambil sesuai kesepakatan.'
    },
    {
      right: 'Hak Pesangon',
      explanation:
        'Jika perusahaan memberhentikan Anda tanpa alasan yang jelas setelah bekerja lebih dari 1 tahun, Anda berhak mendapat pesangon sesuai Undang-Undang Cipta Kerja.'
    }
  ],
  dangerClauses: [
    {
      clause: 'Klausul Non-Kompetisi 2 Tahun',
      risk: 'Anda tidak boleh bekerja di perusahaan dengan bidang serupa selama 2 tahun setelah keluar. Ini sangat membatasi pilihan karier Anda di masa depan.',
      level: 'tinggi'
    }
  ],
  safeClauses: [
    {
      clause: 'Uang Lembur Dibayar Penuh',
      note: 'Setiap jam lembur dihitung dan dibayar sesuai aturan pemerintah.'
    }
  ],
  recommendedActions: [
    'Coret atau negosiasikan klausul non-kompetisi sebelum menandatangani',
    'Simpan dua salinan kontrak yang sudah ditandatangani'
  ],
  overallSafety: 'perlu_perhatian',
  overallSafetyExplanation:
    'Kontrak ini memiliki 1 klausul yang perlu dinegosiasikan sebelum ditandatangani.'
};

export default function HomeScreen({ dispatch }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<'scanner' | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userSnap = await getOrInitUserProfile(
            currentUser.uid,
            { fullName: currentUser.displayName || '' },
            currentUser.email
          );
          setProfile(userSnap);
          dispatch({ type: 'SET_PROFILE', profile: userSnap });
        } catch (e) {
          console.error('Failed to fetch profile on auth state change', e);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const checkOnboardingAndRedirect = async (currentUser: User, redirectTarget: 'scanner' | null) => {
    try {
      const userSnap = await getOrInitUserProfile(
        currentUser.uid,
        { fullName: currentUser.displayName || '' },
        currentUser.email
      );

      setProfile(userSnap);
      dispatch({ type: 'SET_PROFILE', profile: userSnap });

      if (!userSnap.onboardingComplete) {
        dispatch({ type: 'SET_ONBOARDING_REDIRECT', target: redirectTarget });
        dispatch({ type: 'SET_SCREEN', screen: 'onboarding' });
      } else if (redirectTarget === 'scanner') {
        dispatch({ type: 'SET_SCREEN', screen: 'scanner' });
      }
    } catch (e) {
      console.error(e);
      if (redirectTarget === 'scanner') {
        dispatch({ type: 'SET_SCREEN', screen: 'scanner' });
      }
    }
  };

  const handleStartAnalysis = () => {
    if (user) {
      checkOnboardingAndRedirect(user, 'scanner');
    } else {
      setLoginRedirect('scanner');
      setShowLoginModal(true);
    }
  };

  const handleSample = () => {
    dispatch({ type: 'SET_RESULT', result: SAMPLE_RESULT });
    dispatch({ type: 'SET_SCREEN', screen: 'result' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offsetPos = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetPos, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative z-0 overflow-x-hidden">
      {/* Ambient Animated Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[var(--gold-light)]/40 rounded-full blur-[120px] max-w-[800px] max-h-[800px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-[40%] left-[-10%] w-[60vw] h-[60vw] bg-blue-300/40 rounded-full blur-[140px] max-w-[900px] max-h-[900px]"
        />
      </div>

      {/* Navigation Header */}
      <Navbar
        user={user}
        profile={profile}
        onOpenAuth={() => {
          setLoginRedirect(null);
          setShowLoginModal(true);
        }}
        onOpenHistory={() => dispatch({ type: 'SET_SCREEN', screen: 'history' })}
        onOpenPricing={() => dispatch({ type: 'SET_SCREEN', screen: 'pricing' })}
        onNavigateSection={scrollToSection}
      />

      {/* Main Content Sections */}
      <main>
        <HeroSection onStartAnalysis={handleStartAnalysis} onSample={handleSample} />
        <HowItWorksSection />
        <FeatureCards onStartAnalysis={handleStartAnalysis} />
        <PricingPreviewSection onSelectPlan={() => dispatch({ type: 'SET_SCREEN', screen: 'pricing' })} />
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(loggedInUser) => {
          checkOnboardingAndRedirect(loggedInUser, loginRedirect);
          setLoginRedirect(null);
        }}
      />

      {/* Alert Notice Modal */}
      <AnimatePresence>
        {alertMessage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--navy-deep)]/40 backdrop-blur-sm"
              onClick={() => setAlertMessage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-6 md:p-8 w-full max-w-sm relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-[var(--cream)] rounded-full flex items-center justify-center mb-5 border border-[var(--cream-dark)]">
                <Shield size={28} className="text-[var(--gold)]" />
              </div>
              <h3 className="font-display font-black text-xl text-[var(--navy-deep)] mb-3">
                Pemberitahuan
              </h3>
              <p className="text-[var(--ink-mid)] text-sm mb-8 leading-relaxed">{alertMessage}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className="w-full h-12 bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)] font-bold rounded-xl active:scale-95 transition-all"
              >
                Kembali
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
