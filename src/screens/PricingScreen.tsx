import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, Star, Zap, Infinity as InfinityIcon } from 'lucide-react';
import { AppAction, AppState } from '../types';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function PricingScreen({ state, dispatch }: Props) {
  const [showModal, setShowModal] = useState(false);
  const profile = state.profile;
  const plan = profile?.plan || 'free';

  return (
    <div className="min-h-screen bg-[var(--cream)] animate-in fade-in duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[var(--navy-deep)] px-6 py-4 flex items-center shadow-md">
        <button 
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="flex items-center gap-2 text-white hover:text-[var(--gold)] transition-colors active:scale-95"
        >
          <ChevronLeft size={16} />
          <span className="text-sm font-semibold">Kembali</span>
        </button>
      </header>

      {/* Hero */}
      <section className="bg-[var(--navy-deep)] w-full pt-12 pb-24 px-6 text-center relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{ backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 60px)` }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest px-3 py-1.5 rounded-sm bg-white/10">
            TRANSPARAN & SEDERHANA
          </span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white mt-6 mb-4">
            Pilih Paket Keamanan Anda
          </h1>
          <p className="font-sans text-blue-100 text-lg">
            Dari analisis dasar hingga perlindungan menyeluruh. 
            Semua paket didukung oleh AI hukum terakurat.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border border-[var(--cream-dark)] shadow-xl flex flex-col">
            <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Gratis</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-black text-3xl">Rp 0</span>
              <span className="text-[var(--ink-mid)] font-medium">/bulan</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>3 analisis / 24 jam</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>Ringkasan singkat dokumen</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>1 foto per analisis</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>Riwayat tersimpan 7 hari</span>
              </li>
            </ul>
            {plan === 'free' ? (
              <button disabled className="w-full h-12 rounded-xl font-bold bg-[var(--cream-dark)] text-[var(--ink-light)] cursor-not-allowed">
                Paket Saat Ini
              </button>
            ) : (
              <button disabled className="w-full h-12 rounded-xl font-bold bg-[var(--cream-dark)] text-[var(--ink-light)] cursor-not-allowed">
                Sudah Melewati
              </button>
            )}
          </div>

          {/* Plus Plan - Recommended */}
          <div className="bg-[var(--navy-deep)] rounded-3xl p-8 shadow-2xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full flex items-center gap-1 shadow-lg">
              <Star size={14} /> Paling Diminati
            </div>
            <h3 className="font-bold text-2xl text-white mb-2">Plus</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-black text-3xl text-white">Rp 29.000</span>
              <span className="text-blue-200 font-medium">/bulan</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-blue-50">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>15 analisis / 12 jam (refresh cepat)</span>
              </li>
              <li className="flex gap-3 text-blue-50">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Analisis mendalam per pasal</span>
              </li>
              <li className="flex gap-3 text-blue-50">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Upload banyak halaman/PDF</span>
              </li>
              <li className="flex gap-3 text-blue-50">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Tanya jawab AI lanjut usai hasil</span>
              </li>
              <li className="flex gap-3 text-blue-50">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Riwayat tersimpan 30 hari</span>
              </li>
            </ul>
            {plan === 'plus' || plan === 'pro' ? (
              <button 
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'scanner' })}
                className="w-full h-12 rounded-xl font-bold bg-[var(--gold)] text-white hover:bg-yellow-600 transition-colors shadow-lg active:scale-95"
              >
                Analisis Sekarang
              </button>
            ) : (
              <button 
                onClick={() => setShowModal(true)}
                className="w-full h-12 rounded-xl font-bold bg-[var(--gold)] text-white hover:bg-yellow-600 transition-colors shadow-lg active:scale-95"
              >
                Berlangganan Plus
              </button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 border border-[var(--cream-dark)] shadow-xl flex flex-col">
            <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-black text-3xl">Rp 79.000</span>
              <span className="text-[var(--ink-mid)] font-medium">/bulan</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>35 analisis / 12 jam</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <Zap className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>Prioritas proses AI (Sangat Detail)</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>Semua fitur Plus</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <InfinityIcon className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>Riwayat tersimpan selamanya</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span>Ekspor hasil ke PDF</span>
              </li>
            </ul>
            {plan === 'pro' ? (
              <button 
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'scanner' })}
                className="w-full h-12 rounded-xl font-bold bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)] transition-colors active:scale-95"
              >
                Analisis Sekarang
              </button>
            ) : (
              <button 
                onClick={() => setShowModal(true)}
                className="w-full h-12 rounded-xl font-bold bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)] transition-colors active:scale-95"
              >
                Berlangganan Pro
              </button>
            )}
          </div>
          
        </div>
      </section>

      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[var(--cream)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-[var(--gold)]" size={32} />
            </div>
            <h3 className="font-display font-black text-2xl text-[var(--navy-deep)] mb-3">Segera Hadir</h3>
            <p className="text-[var(--ink-mid)] mb-6 text-sm leading-relaxed">
              Integrasi pembayaran sedang dalam tahap akhir pengembangan. Kami akan memberi tahu Anda segera setelah paket berlangganan tersedia.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-[var(--navy-deep)] text-white font-bold h-12 rounded-xl active:scale-95 transition-all shadow-md"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
