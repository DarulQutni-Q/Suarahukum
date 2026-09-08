import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, ChevronRight } from 'lucide-react';
import { AppAction, AppState } from '../types';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const CASE_CATEGORIES = [
  "Ketenagakerjaan & Kontrak Kerja",
  "Sewa Menyewa Properti",
  "Hutang Piutang & Pinjaman",
  "Jual Beli Tanah & Bangunan",
  "Kemitraan & Bisnis",
  "Keluarga & Pra-Nikah",
  "Lainnya"
];

export default function OnboardingScreen({ state, dispatch }: Props) {
  const [fullName, setFullName] = useState(auth.currentUser?.displayName || '');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !category) return;
    
    setLoading(true);
    try {
      if (auth.currentUser) {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
          displayName: fullName
        });

        // Save to Firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          fullName,
          caseCategory: category,
          onboardingComplete: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Update AppState profile
        const updatedProfile = {
          ...(state.profile || {
            plan: 'free' as const,
            quotaUsed: 0,
            quotaResetAt: null,
            subscriptionExpiry: null
          }),
          fullName,
          caseCategory: category,
          onboardingComplete: true,
          updatedAt: new Date().toISOString()
        };
        dispatch({ type: 'SET_PROFILE', profile: updatedProfile });

        // Redirect based on intent
        if (state.onboardingRedirect === 'scanner') {
          dispatch({ type: 'SET_SCREEN', screen: 'scanner' });
        } else {
          dispatch({ type: 'SET_SCREEN', screen: 'home' });
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--navy-deep)] animate-in fade-in duration-300 relative justify-center items-center p-6">
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 60px)` }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--navy-deep)] rounded-2xl flex items-center justify-center shadow-lg">
            <Scale size={32} className="text-[var(--gold)]" />
          </div>
        </div>
        
        <h2 className="font-display font-black text-3xl text-[var(--navy-deep)] text-center mb-3">Senang Bertemu Anda.</h2>
        <p className="text-[var(--ink-mid)] text-center mb-8 px-2">
          Mari kita memulainya dengan mengenal Anda lebih dekat untuk memberikan saran yang lebih relevan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-base font-bold text-[var(--navy-deep)]">Siapa nama lengkap Anda?</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full h-14 px-4 rounded-xl border-2 border-[var(--cream-dark)] outline-none focus:border-[var(--navy-deep)] transition-colors bg-[var(--cream)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-[var(--navy-deep)]">Dokumen hukum apa yang sedang Anda hadapi?</label>
            <p className="text-xs text-[var(--ink-light)] mb-3">Pilih satu yang paling sering jadi kendala Anda</p>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {CASE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                    category === cat 
                      ? 'border-[var(--navy-deep)] bg-[var(--navy-deep)] text-white' 
                      : 'border-[var(--cream-dark)] bg-white text-[var(--ink-mid)] hover:border-[var(--navy-mid)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !fullName.trim() || !category}
            className="w-full h-14 bg-[var(--navy-deep)] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl mt-4"
          >
            {loading ? 'Menyimpan...' : 'Selesai & Lanjutkan'}
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
