import React, { useState, useEffect, useRef } from 'react';
import { Scale, Camera, Clock, CheckCircle2, ChevronRight, ChevronLeft, FileText, Menu, X, Shield, Heart, LogOut, Star, Zap, Infinity as InfinityIcon, AlertTriangle, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppAction, AnalysisResult } from '../types';
import AnimatedCounter from '../components/AnimatedCounter';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getOrInitUserProfile } from '../utils/user';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';

interface Props {
  dispatch: React.Dispatch<AppAction>;
}

export const SAMPLE_RESULT: AnalysisResult = {
  documentType: "Kontrak Kerja",
  summary: "Perjanjian kerja antara karyawan dan PT Maju Bersama untuk posisi Staf Administrasi dengan masa percobaan 3 bulan dan gaji pokok Rp 4.500.000 per bulan.",
  yourRights: [
    { right: "Hak Gaji Tepat Waktu", explanation: "Gaji wajib dibayarkan setiap tanggal 25. Keterlambatan lebih dari 3 hari kerja memberi Anda hak untuk mengajukan keberatan secara tertulis kepada HRD." },
    { right: "Hak Cuti Tahunan 12 Hari", explanation: "Setelah melewati masa percobaan 3 bulan, Anda berhak atas 12 hari cuti berbayar per tahun yang dapat diambil sesuai kesepakatan." },
    { right: "Hak Pesangon", explanation: "Jika perusahaan memberhentikan Anda tanpa alasan yang jelas setelah bekerja lebih dari 1 tahun, Anda berhak mendapat pesangon sesuai Undang-Undang Cipta Kerja." }
  ],
  dangerClauses: [
    { clause: "Klausul Non-Kompetisi 2 Tahun", risk: "Anda tidak boleh bekerja di perusahaan dengan bidang serupa selama 2 tahun setelah keluar. Ini sangat membatasi pilihan karier Anda di masa depan.", level: "tinggi" }
  ],
  safeClauses: [
    { clause: "Uang Lembur Dibayar Penuh", note: "Setiap jam lembur dihitung dan dibayar sesuai aturan pemerintah." }
  ],
  recommendedActions: [
    "Coret atau negosiasikan klausul non-kompetisi sebelum menandatangani",
    "Simpan dua salinan kontrak yang sudah ditandatangani"
  ],
  overallSafety: "perlu_perhatian",
  overallSafetyExplanation: "Kontrak ini memiliki 1 klausul yang perlu dinegosiasikan sebelum ditandatangani."
};

export default function HomeScreen({ dispatch }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<'scanner' | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch or auto-upgrade
          const userSnap = await getOrInitUserProfile(currentUser.uid, {
            fullName: currentUser.displayName || ''
          });
          
          if (currentUser.email === 'darulqutni512@gmail.com' && userSnap.plan !== 'pro') {
            userSnap.plan = 'pro';
            userSnap.subscriptionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString(); // 10 years
            await setDoc(doc(db, 'users', currentUser.uid), { plan: 'pro', subscriptionExpiry: userSnap.subscriptionExpiry }, { merge: true });
          }
          dispatch({ type: 'SET_PROFILE', profile: userSnap });
        } catch (e) {
          console.error("Failed to fetch profile on auth state change", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const checkOnboardingAndRedirect = async (currentUser: User, redirectTarget: 'scanner' | null) => {
    try {
      const userSnap = await getOrInitUserProfile(currentUser.uid, {
        fullName: currentUser.displayName || ''
      });
      
      if (currentUser.email === 'darulqutni512@gmail.com' && userSnap.plan !== 'pro') {
        userSnap.plan = 'pro';
        userSnap.subscriptionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString(); // 10 years
        await setDoc(doc(db, 'users', currentUser.uid), { plan: 'pro', subscriptionExpiry: userSnap.subscriptionExpiry }, { merge: true });
      }
      
      dispatch({ type: 'SET_PROFILE', profile: userSnap });
      
      if (!userSnap.onboardingComplete) {
        dispatch({ type: 'SET_ONBOARDING_REDIRECT', target: redirectTarget });
        dispatch({ type: 'SET_SCREEN', screen: 'onboarding' });
      } else {
        if (redirectTarget === 'scanner') {
          dispatch({ type: 'SET_SCREEN', screen: 'scanner' });
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback
      if (redirectTarget === 'scanner') {
        dispatch({ type: 'SET_SCREEN', screen: 'scanner' });
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      setShowLoginModal(false);
      checkOnboardingAndRedirect(result.user, loginRedirect);
      setLoginRedirect(null);
    } catch (error: any) {
      console.error("Google Login Error:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError('Popup diblokir. Harap izinkan popup atau buka di tab baru (open in new tab).');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError(`Domain belum diotorisasi. Harap tambahkan domain ini (${window.location.hostname}) ke Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        setAuthError(`Google Login gagal: ${error.message} (${error.code})`);
      } else {
        setAuthError('Popup Google Login ditutup sebelum selesai. Silakan coba lagi atau buka di tab baru.');
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Email dan password harus diisi.');
      return;
    }
    
    setIsAuthenticating(true);
    setAuthError(null);
    setAuthSuccess(null);
    
    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        setAuthSuccess('Pendaftaran sukses! Tautan verifikasi telah dikirim ke email Anda. Harap klik tautan tersebut lalu masuk.');
        auth.signOut();
        setIsSignUp(false);
        setIsAuthenticating(false);
        setPassword('');
        return;
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          setAuthError('Email Anda belum diverifikasi. Harap cek kotak masuk (atau folder spam) email Anda.');
          auth.signOut();
          setIsAuthenticating(false);
          return;
        }
      }
      setShowLoginModal(false);
      checkOnboardingAndRedirect(result.user, loginRedirect);
      setLoginRedirect(null);
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    } catch (error: any) {
      console.error('Email auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Email sudah terdaftar. Silakan masuk.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setAuthError('Login Email belum diaktifkan. Harap aktifkan "Email/Password" di Firebase Console > Authentication.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setAuthError('Email atau password salah.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password terlalu lemah. Minimal 6 karakter.');
      } else {
        setAuthError(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleStartAnalysis = async () => {
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
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offsetPos = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetPos,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-300 bg-white relative z-0 overflow-x-hidden">
      
      {/* Global Ambient Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[var(--gold-light)]/40 rounded-full blur-[120px] max-w-[800px] max-h-[800px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] left-[-10%] w-[60vw] h-[60vw] bg-blue-300/40 rounded-full blur-[140px] max-w-[900px] max-h-[900px]" 
        />
      </div>
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[var(--navy-deep)]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('beranda')}>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-sm">
            <Scale size={20} className="text-[var(--gold)]" />
          </div>
          <span className="font-display font-black text-2xl text-white tracking-tight">SuaraHukum.</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
          <button onClick={() => scrollToSection('layanan')} className="text-white/80 font-semibold hover:text-white transition-colors">Layanan</button>
          <button onClick={() => scrollToSection('peraturan')} className="text-white/80 font-semibold hover:text-white transition-colors">Peraturan</button>
          <button onClick={() => scrollToSection('tentang-kami')} className="text-white/80 font-semibold hover:text-white transition-colors">Tentang Kami</button>
          <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'pricing' })} className="text-[var(--gold)] font-semibold hover:text-[var(--gold-light)] transition-colors">Harga</button>
        </nav>
        
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 border border-white/20 p-1 pr-2 sm:pr-3 rounded-full hover:bg-white/10 transition-colors shadow-sm"
              >
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName || user.displayName || 'User'}`} alt="Profile" className="w-8 h-8 rounded-full" />
                <span className="hidden sm:block text-sm font-bold text-white">{(auth.currentUser?.displayName || user.displayName)?.split(' ')[0] || 'Pengguna'}</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[var(--cream-dark)] rounded-xl shadow-xl flex flex-col py-1 overflow-hidden z-[100]">
                  <button onClick={() => { setShowDropdown(false); dispatch({ type: 'SET_SCREEN', screen: 'history' }); }} className="px-4 py-3 text-left w-full text-sm font-semibold text-[var(--navy-deep)] hover:bg-[var(--cream)] transition-colors flex items-center gap-2">
                    <Clock size={16} /> Riwayat
                  </button>
                  <button onClick={() => { auth.signOut(); setShowDropdown(false); }} className="px-4 py-3 text-left w-full text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-[var(--cream-dark)]">
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => {
                setLoginRedirect(null);
                setShowLoginModal(true);
              }}
              className="flex items-center gap-2 text-sm font-bold border border-white/20 text-white hover:bg-white hover:text-[var(--navy-deep)] px-3 py-2 sm:px-6 rounded-lg active:scale-95 transition-all"
            >
              <UserIcon size={18} className="lg:hidden" />
              <span className="hidden lg:inline">Masuk / Daftar</span>
              <span className="inline lg:hidden">Masuk</span>
            </button>
          )}
          <button 
            className="lg:hidden text-white p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--navy-deep)]/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[var(--cream)] shadow-2xl z-[70] lg:hidden flex flex-col"
            >
              <div className="p-5 border-b border-[var(--cream-dark)] flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--navy-deep)] rounded-lg flex items-center justify-center shadow-sm">
                    <Scale size={16} className="text-[var(--gold)]" />
                  </div>
                  <span className="font-display font-black text-lg text-[var(--navy-deep)]">SuaraHukum.</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-[var(--ink-mid)] bg-[var(--cream)] rounded-full active:scale-95 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col p-6 gap-2 bg-white flex-1 overflow-y-auto">
                <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('layanan'); }} className="text-left font-bold text-[17px] text-[var(--navy-deep)] border-b border-[var(--cream-dark)] py-4">Layanan</button>
                <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('peraturan'); }} className="text-left font-bold text-[17px] text-[var(--navy-deep)] border-b border-[var(--cream-dark)] py-4">Peraturan Acuan</button>
                <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('tentang-kami'); }} className="text-left font-bold text-[17px] text-[var(--navy-deep)] border-b border-[var(--cream-dark)] py-4">Tentang Kami</button>
                <button onClick={() => { setIsMobileMenuOpen(false); dispatch({ type: 'SET_SCREEN', screen: 'pricing' }); }} className="text-left font-bold text-[17px] text-[var(--gold)] py-4 mb-4 border-b border-[var(--cream-dark)]">Harga & Paket</button>
                
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleStartAnalysis();
                  }}
                  className="w-full text-base font-bold bg-[var(--navy-deep)] text-white px-6 py-3.5 rounded-xl active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  Mulai Analisis
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSample();
                  }}
                  className="w-full mt-3 font-bold bg-[var(--cream)] border border-[var(--cream-dark)] text-[var(--ink-mid)] px-6 py-3.5 rounded-xl active:scale-95 transition-transform"
                >
                  Lihat Contoh Hasil
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="beranda" className="relative w-full pt-16 pb-24 lg:pt-32 lg:pb-40 px-6 lg:px-12 flex justify-center bg-[linear-gradient(-45deg,_#0d1f35,_#143152,_#0B1524,_#1a3a5c)] animate-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:w-1/2 flex flex-col text-center lg:text-left"
          >
            <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
              <span className="mono text-xs uppercase bg-[var(--gold)]/20 text-[var(--gold)] font-bold tracking-widest px-3 py-1.5 rounded-sm">
                TEKNOLOGI HUKUM AI TERKINI
              </span>
            </div>
            
            <h1 className="font-display font-black text-4xl lg:text-6xl text-white leading-[1.1] tracking-tight mb-6">
              Pahami Kontrak & <br className="hidden lg:block"/>Dokumen Hukum Anda
            </h1>
            
            <p className="font-sans text-base lg:text-lg text-blue-100/80 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Tidak perlu biaya mahal untuk mengerti hak Anda. Foto dokumen perjanjian apapun, AI kami akan menganalisis potensi jebakan dan hak Anda secara gratis & instan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={handleStartAnalysis}
                className="w-full sm:w-auto h-14 px-8 bg-[var(--gold)] text-white text-base font-bold rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl hover:bg-[#b07d20]"
              >
                <Camera size={20} />
                <span>Foto & Analisis Sekarang</span>
              </button>
              
              <button 
                onClick={handleSample}
                className="w-full sm:w-auto h-14 px-8 border border-white/30 text-white text-base font-bold rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] hover:bg-white/5 transition-all"
              >
                <FileText size={20} />
                <span>Lihat Contoh Hasil</span>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full lg:w-1/2 relative lg:h-[480px] mt-12 lg:mt-0 flex flex-col items-center justify-center lg:block"
          >
             {/* Decorative UI elements for the hero */}
             <div className="relative lg:absolute top-0 lg:top-8 lg:-right-10 w-[95%] sm:w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/5 rotate-[2deg] border border-[var(--cream-dark)] z-10 hover:-translate-y-1 transition-transform">
               <div className="flex items-start justify-between mb-3.5 sm:mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                     <span className="font-bold text-xl">!</span>
                   </div>
                   <div>
                     <p className="text-[10px] sm:text-xs font-mono font-bold text-red-500 uppercase tracking-wide">Risiko Ditemukan</p>
                     <p className="font-bold text-[var(--navy-deep)] text-sm sm:text-base leading-tight mt-0.5">Klausul Non-Kompetisi</p>
                   </div>
                 </div>
                 <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] sm:text-[10px] font-mono uppercase font-bold px-2 py-1 rounded-sm shrink-0">Tinggi</span>
               </div>
               <p className="text-xs sm:text-sm text-[var(--ink-mid)] leading-relaxed font-medium">
                 Anda dilarang bekerja di industri serupa selama 2 tahun setelah mengundurkan diri.
               </p>
             </div>

             <div className="relative lg:absolute -mt-4 lg:mt-0 lg:top-48 lg:-left-6 right-0 lg:right-auto w-[95%] sm:w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/5 -rotate-[2deg] -translate-x-4 border border-[var(--cream-dark)] z-20 hover:-translate-y-1 transition-transform">
               <div className="flex items-start justify-between mb-3.5 sm:mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                     <CheckCircle2 size={22} className="sm:w-6 sm:h-6" />
                   </div>
                   <div>
                     <p className="text-[10px] sm:text-xs font-mono font-bold text-emerald-500 uppercase tracking-wide">Hak Anda Aman</p>
                     <p className="font-bold text-[var(--navy-deep)] text-sm sm:text-base leading-tight mt-0.5">Uang Pesangon</p>
                   </div>
                 </div>
               </div>
               <p className="text-xs sm:text-sm text-[var(--ink-mid)] leading-relaxed font-medium">
                 Klausul pemutusan hubungan kerja telah mengacu dengan baik pada UU Cipta Kerja.
               </p>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Proof Section */}
      <section className="bg-white w-full py-16 px-6 relative z-10 border-b border-[var(--cream-dark)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-[var(--cream-dark)]"
            >
               <div className="flex items-center gap-4 mb-4">
                 <Shield className="w-8 h-8 text-[var(--gold)] shrink-0" />
                 <h4 className="font-display font-bold text-xl text-[var(--navy-deep)] leading-tight">100% Kepemilikan Anda</h4>
               </div>
               <p className="text-[15px] text-[var(--ink-mid)] leading-relaxed">
                 Dokumen & hasil analisis sepenuhnya diproses dengan aman. Data hanya milik Anda.
               </p>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-[var(--cream-dark)]"
            >
               <div className="flex items-center gap-4 mb-4">
                 <Scale className="w-8 h-8 text-[var(--gold)] shrink-0" />
                 <h4 className="font-display font-bold text-xl text-[var(--navy-deep)] leading-tight">Sesuai Hukum Nasional</h4>
               </div>
               <p className="text-[15px] text-[var(--ink-mid)] leading-relaxed">
                 Standar perlindungan dan analisis didasarkan murni pada perundang-undangan Republik Indonesia.
               </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-[var(--cream-dark)]"
            >
               <div className="flex items-center gap-4 mb-4">
                 <Heart className="w-8 h-8 text-[var(--gold)] shrink-0" />
                 <h4 className="font-display font-bold text-xl text-[var(--navy-deep)] leading-tight">Terbuka & Gratis Selamanya</h4>
               </div>
               <p className="text-[15px] text-[var(--ink-mid)] leading-relaxed">
                 Misi inisiatif Civic Tech: tidak ada tarif tersembunyi, tidak ada sistem langganan. Bebas untuk rakyat.
               </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo removed as it collides with new Cara Kerja */}

      {/* Cara Kerja Section */}
      <section className="w-full py-16 lg:py-24 bg-[var(--cream)] relative z-10 border-b border-[var(--cream-dark)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">CARA KERJA SUARAHUKUM</span>
            <h2 className="font-display font-black text-3xl md:text-4xl mt-3 text-[var(--navy-deep)]">Tiga Langkah Menuju Kepastian Hukum</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-slate-200 z-0"></div>

            {[
              { num: '1', title: 'Foto atau Unggah Dokumen', desc: 'Ambil foto kontrak dengan kamera HP Anda atau unggah file PDF yang sudah ada. Privasi terjamin.' },
              { num: '2', title: 'AI Menganalisis Detail', desc: 'Pemrosesan canggih membaca setiap pasal dan mencocokkannya dengan perundang-undangan RI terbaru.' },
              { num: '3', title: 'Pahami Dalam Bahasa Anda', desc: 'Dapatkan laporan yang disusun dalam bahasa sehari-hari. Pahami risiko dan hak Anda seketika.' }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center px-4"
              >
                <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center text-3xl font-black text-[var(--navy-deep)] border-[3px] border-[var(--gold)] shadow-md mb-6 outline outline-4 outline-slate-50">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-[var(--navy-deep)] mb-3">{step.title}</h3>
                <p className="text-[var(--ink-mid)] leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Layanan Section */}
      <section id="layanan" className="w-full py-16 lg:py-24 px-5 lg:px-12 bg-white relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">LAYANAN KAMI</span>
            <h2 className="font-display font-black text-3xl md:text-4xl mt-3 text-[var(--navy-deep)]">Dokumen Apa Saja Yang Bisa Dianalisis?</h2>
            <p className="text-[var(--ink-mid)] mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg">
              SuaraHukum dirancang untuk mengenali dan memberikan saran hukum untuk puluhan jenis dokumen perjanjian sehari-hari.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[
              { icon: '💼', title: 'Kontrak Kerja / PKWT', desc: 'Periksa ketentuan gaji, jam kerja, pesangon, dan tahan ijazah sebelum tanda tangan.' },
              { icon: '🔑', title: 'Perjanjian Sewa Menyewa', desc: 'Pastikan hak Anda atas perbaikan bangunan, penahanan uang jaminan (deposit), dan pembatalan sewa.' },
              { icon: '💰', title: 'Surat Perjanjian Hutang', desc: 'Validasi besaran bunga, denda keterlambatan yang wajar, dan penyitaan jaminan/agunan.' },
              { icon: '🏡', title: 'Sertifikat & Jual Beli Tanah', desc: 'Identifikasi potensi sengketa dan keabsahan balik nama di hadapan notaris.' },
              { icon: '🤝', title: 'Perjanjian Kemitraan Bisnis', desc: 'Pahami skema pembagian keuntungan dan tanggung jawab utang piutang usaha (PT/CV).' },
              { icon: '💍', title: 'Perjanjian Pra-Nikah', desc: 'Lindungi keamanan finansial terkait utang bawaan dan pembagian harta gana-gini.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -4, borderColor: "#cbd5e1" }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-[var(--cream-dark)] shadow-sm rounded-xl p-6 md:p-8 cursor-pointer hover:shadow-md"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--cream)] mb-4 md:mb-6 rounded-lg border border-white flex items-center justify-center text-2xl md:text-3xl">{item.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--navy-deep)] mb-2 md:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-[var(--ink-mid)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Peraturan Section */}
      <section id="peraturan" className="w-full py-24 px-6 lg:px-12 bg-white relative z-20 overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="w-full lg:w-1/2"
           >
             <div className="aspect-square bg-[var(--cream)] rounded-3xl p-8 relative max-w-[500px] mx-auto">
                <div className="absolute inset-0 bg-[var(--navy-deep)] rounded-3xl transform rotate-3 scale-[0.98] -z-10"></div>
                <div className="bg-white w-full h-full rounded-2xl shadow-sm border border-[var(--cream-dark)] p-6 md:p-8 flex flex-col">
                  <div className="w-16 h-2 bg-[var(--gold)] mb-6"></div>
                  <h3 className="font-display font-black text-2xl md:text-3xl text-[var(--navy-deep)] mb-4">Dasar Hukum Acuan AI</h3>
                  <div className="space-y-4 font-mono text-xs md:text-sm overflow-y-auto hide-scrollbar">
                    <div className="pb-4 border-b border-[var(--cream-dark)]">➢ Kitab Undang-Undang Hukum Perdata (KUHPerdata) Buku III</div>
                    <div className="pb-4 border-b border-[var(--cream-dark)]">➢ Undang-Undang No. 13 Tahun 2003 tentang Ketenagakerjaan</div>
                    <div className="pb-4 border-b border-[var(--cream-dark)]">➢ Undang-Undang No. 6 Tahun 2023 (Cipta Kerja)</div>
                    <div className="pb-4 border-b border-[var(--cream-dark)]">➢ Undang-Undang No. 5 Tahun 1960 (UUPA)</div>
                    <div className="pb-4">➢ Peraturan Menteri Ketenagakerjaan Terkini</div>
                  </div>
                </div>
             </div>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="w-full lg:w-1/2"
           >
             <span className="mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">AKURASI HUKUM</span>
             <h2 className="font-display font-black text-3xl md:text-4xl mt-3 text-[var(--navy-deep)] leading-tight mb-6">Analisis Selalu Disesuaikan dengan Peraturan Nasional Terkini</h2>
             <p className="text-[var(--ink-mid)] mb-8 text-lg leading-relaxed">
               Sistem kecerdasan buatan kami dilatih menggunakan standar hukum yang berlaku di Indonesia. AI akan membandingkan setiap pasal dalam dokumen Anda terhadap perlindungan minimal yang diwajibkan oleh undang-undang.
             </p>
             <button 
               onClick={handleStartAnalysis}
               className="h-14 px-8 bg-[var(--navy-deep)] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--navy-mid)] transition-colors inline-flex active:scale-95 shadow-md"
             >
               Coba Analisis Berkas Anda
               <ChevronRight size={18} />
             </button>
           </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="w-full py-24 px-6 lg:px-12 bg-[var(--cream)] relative z-30 transition-colors border-t border-[var(--cream-dark)]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">PILIHAN PAKET</span>
            <h2 className="font-display font-black text-3xl md:text-5xl mt-3 text-[var(--navy-deep)]">Transparan. Tanpa Biaya Tersembunyi.</h2>
            <p className="text-[var(--ink-mid)] mt-4 max-w-2xl mx-auto text-lg">
              Mulai secara gratis atau dapatkan analisis mendalam dengan harga yang terjangkau.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 flex flex-col transform hover:-translate-y-2 transition-transform border border-[var(--cream-dark)] shadow-sm"
            >
              <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Gratis</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display font-black text-3xl text-[var(--navy-deep)]">Rp 0</span>
                <span className="text-[var(--ink-mid)] font-medium">/bulan</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>3 analisis / 24 jam</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Ringkasan singkat dokumen</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>1 foto per analisis</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Riwayat tersimpan 7 hari</span>
                </li>
              </ul>
              <button 
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'scanner' })}
                className="w-full h-12 rounded-xl font-bold bg-[var(--cream-dark)] text-[var(--navy-deep)] hover:bg-slate-200 transition-colors shadow-sm border border-[var(--cream-dark)]"
              >
                Mulai Sekarang
              </button>
            </motion.div>

            {/* Plus */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-md relative flex flex-col transform md:-translate-y-4 hover:-translate-y-6 transition-transform border-2 border-[var(--gold)]"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full flex items-center gap-1 shadow-md">
                 <Star size={14} className="text-white fill-current" /> Paling Diminati
              </div>
              <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Plus</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display font-black text-3xl text-[var(--navy-deep)]">Rp 29.000</span>
                <span className="text-blue-100 font-medium">/bulan</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>15 analisis / 12 jam</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Analisis mendalam per pasal</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Upload PDF/Banyak halaman</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Tanya jawab berkelanjutan</span>
                </li>
              </ul>
              <button 
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'pricing' })}
                className="w-full h-12 rounded-xl font-bold bg-[var(--gold)] text-white hover:bg-[#b07d20] transition-colors shadow-sm active:scale-95"
              >
                Lihat Detail Paket
              </button>
            </motion.div>

            {/* Pro */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 flex flex-col transform hover:-translate-y-2 transition-transform border border-[var(--cream-dark)] shadow-sm"
            >
              <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display font-black text-3xl text-[var(--navy-deep)]">Rp 79.000</span>
                <span className="text-[var(--ink-mid)] font-medium">/bulan</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>35 analisis / 12 jam</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <Zap className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Prioritas proses AI (Sangat Detail)</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Semua fitur Plus</span>
                </li>
                <li className="flex gap-3 text-[var(--ink-mid)]">
                  <InfinityIcon className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                  <span>Riwayat tersimpan selamanya</span>
                </li>
              </ul>
              <button 
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'pricing' })}
                className="w-full h-12 rounded-xl font-bold border-2 border-[var(--navy-deep)] text-[var(--navy-deep)] hover:bg-[var(--navy-deep)] hover:text-white transition-colors shadow-sm"
              >
                Lihat Detail Paket
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-24 px-6 lg:px-12 bg-white relative z-30 transition-colors">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">FAQ</span>
            <h2 className="font-display font-black text-3xl md:text-5xl mt-3 text-[var(--navy-deep)]">Pertanyaan yang Sering Diajukan</h2>
          </motion.div>

          <Accordion className="w-full max-w-3xl mx-auto space-y-4">
            {[
              { q: 'Apakah dokumen yang saya unggah aman?', a: 'Ya, keamanan Anda adalah prioritas utama. Semua dokumen yang Anda unggah diproses secara lokal di perangkat Anda (di browser). Transmisi ke AI dienkripsi secara end-to-end, dan kami tidak menyimpan dokumen Anda di server kami.' },
              { q: 'Bagaimana kecerdasan buatan membaca dokumen Indonesia?', a: 'Kami menggunakan Gemini, model Bahasa Besar (LLM) terbaru dari Google yang dilatih dengan terminologi hukum Indonesia serta peraturan perundang-undangan nasional.' },
              { q: 'Apakah hasilnya dapat digunakan sebagai nasihat hukum resmi?', a: 'Tidak. SuaraHukum adalah alat bantu kecerdasan buatan, bukan penasihat hukum resmi. Hasil analisis bersifat informatif untuk membantu Anda memahami isi dokumen. Untuk pengambilan keputusan berisiko tinggi, tetap direkomendasikan berkonsultasi dengan pengacara/advokat profesional.' },
              { q: 'Dokumen berformat apa saja yang didukung?', a: 'Saat ini kami mendukung berbagai format gambar (berupa foto) seperti JPG, PNG, dan WEBP.' },
              { q: 'Bagaimana jika dokumen tidak terbaca oleh AI?', a: 'Pastikan foto dokumen diambil dengan pencahayaan yang terang, fokus, dan seluruh teks terlihat jelas. Jika resolusi atau pencahayaan masih buruk, sistem akan memberi tahu Anda agar mengunggah dokumen ulang.' }
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-[var(--cream)] rounded-xl px-6 border-none mb-4 shadow-sm py-2">
                <AccordionTrigger className="text-lg font-bold text-[var(--navy-deep)] hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-[var(--ink-mid)] text-[15px] leading-relaxed pt-2 pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="w-full bg-[var(--navy-deep)] flex justify-center py-8 relative z-20">
        <div className="w-[80%] max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--navy-light)] to-transparent opacity-60"></div>
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-6 h-6 bg-[var(--navy-deep)] rounded-full flex items-center justify-center border border-[var(--navy-light)] opacity-60">
          <div className="w-1 h-1 bg-[var(--gold)] rounded-full text-xs"></div>
        </div>
      </div>

      {/* Tentang Kami Section */}
      <section id="tentang-kami" className="w-full py-24 px-6 lg:px-12 bg-[var(--navy-deep)] text-white relative z-30 transition-colors">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
            <Scale size={48} className="mx-auto mb-8 text-[var(--gold)] opacity-90" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black mb-8 leading-tight text-white/95">Mewujudkan Keadilan Bagi Mereka Yang Tidak Mengerti Bahasa Hukum</h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium mb-12 px-4 md:px-0">
              Jutaan orang Indonesia menandatangani dokumen yang merugikan mereka setiap harinya karena bahasa kontrak sengaja dibuat rumit. SuaraHukum adalah inisiatif Civic Tech untuk menerjemahkan kebingungan hukum menjadi kesadaran akan hak-hak Anda dengan bantuan teknologi.
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-sm tracking-widest text-[var(--gold)] font-bold uppercase bg-white/5 px-4 py-2 rounded-md">Gratis & Terbuka Selamanya</span>
            </div>
        </motion.div>
      </section>

      <footer className="bg-gradient-to-b from-[var(--navy-deep)] to-[#0B1524] text-slate-400 py-12 px-6 text-center border-t border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-[var(--gold)]" />
            <span className="font-display font-black text-xl text-white tracking-tight">SuaraHukum.</span>
          </div>
          <p className="text-sm">© 2026 SuaraHukum. By Daerul Comp's.</p>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat Penggunaan</a>
            <a href="#" className="hover:text-white transition-colors">Hubungi Kami</a>
          </div>
        </div>
      </footer>
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-white"
          >
            
            {/* Left Side (Banner) */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0a1b2d] via-[#122e4d] to-[var(--navy-light)] flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden text-center order-2 md:order-1">
            {/* Minimalist background component */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPSd0cmFuc3BhcmVudCcvPgo8cmVjdCB3aWR0aD0nMScgaGVpZ2h0PScxJyBmaWxsPSdjZmNmY2YnIGZpbGwtb3BhY2l0eT0nMC4yJy8+Cjwvc3ZnPg==')] pointer-events-none" />
            
            <div className="relative z-10 p-6 rounded-full bg-white/10 border border-white/20 mb-8 shadow-xl backdrop-blur-sm">
              <Scale size={48} className="text-white" />
            </div>
            
            <h1 className="font-display font-black text-3xl md:text-5xl text-white mb-6 leading-tight relative z-10">
              Selamat Datang <br /> di SuaraHukum
            </h1>
            <p className="text-blue-100/90 text-lg md:text-xl font-medium max-w-sm leading-relaxed relative z-10">
              Asisten hukum bertenaga AI untuk lingkungan yang lebih baik.
            </p>
          </div>

          {/* Right Side (Form) */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-white to-[#f0f4f8] flex flex-col items-center justify-center p-8 lg:p-16 relative order-1 md:order-2">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-semibold text-[var(--ink-mid)] hover:text-[var(--navy-deep)] transition-colors active:scale-95 z-20"
            >
              <ChevronLeft size={16} />
              Kembali
            </button>
            
            <div className="w-full max-w-md mx-auto flex flex-col pt-12 md:pt-0 relative z-10">
              <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-8 rounded-full bg-[var(--navy-deep)] flex items-center justify-center shadow-md">
                  <Scale size={16} className="text-[var(--gold)]" />
                </div>
                <span className="font-display font-black text-2xl text-[var(--navy-deep)] tracking-tight">SuaraHukum.</span>
              </div>
              
              <h2 className="font-display font-black text-4xl text-[var(--navy-deep)] mb-3">{isSignUp ? 'Daftar' : 'Masuk'}</h2>
              <p className="text-[var(--ink-mid)] mb-8 font-medium">{isSignUp ? 'Buat akun Anda untuk memulai analisa.' : 'Masuk ke akun Anda untuk melanjutkan.'}</p>
              
              {/* Google Login Button */}
              <button 
                onClick={handleGoogleLogin}
                className="w-full h-14 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl flex items-center justify-center gap-3 font-semibold text-gray-700 shadow-sm transition-all active:scale-95 mb-8"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isSignUp ? 'Daftar dengan Google' : 'Masuk dengan Google'}
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold">ATAU DENGAN EMAIL</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              {authError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-start gap-2">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-semibold flex items-start gap-2">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}
              
              <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-[var(--ink-mid)] mb-2">Email</label>
                  <input 
                    type="email" 
                    placeholder="nama@email.com" 
                    className="w-full h-12 px-4 rounded-xl border border-[var(--cream-dark)] focus:border-[var(--navy-deep)] focus:ring-1 focus:ring-[var(--navy-deep)] outline-none bg-white transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--ink-mid)] mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="w-full h-12 pl-4 pr-12 rounded-xl border border-[var(--cream-dark)] focus:border-[var(--navy-deep)] focus:ring-1 focus:ring-[var(--navy-deep)] outline-none bg-white transition-all text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-light)] hover:text-[var(--navy-deep)] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full h-14 bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)] font-bold rounded-xl active:scale-95 transition-all shadow-md mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAuthenticating ? 'Sedang memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
                </button>
              </form>
              
              <p className="text-center text-sm font-medium text-[var(--ink-mid)]">
                {isSignUp ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                <button 
                  className="text-[var(--navy-deep)] font-bold hover:underline" 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                >
                  {isSignUp ? 'Masuk' : 'Daftar Gratis'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Alert Modal */}
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
              <h3 className="font-display font-black text-xl text-[var(--navy-deep)] mb-3">Pemberitahuan</h3>
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
