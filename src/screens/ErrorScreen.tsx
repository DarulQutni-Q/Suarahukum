import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppState, AppAction } from '../types';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function ErrorScreen({ state, dispatch }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-[var(--cream)] animate-in fade-in duration-300 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-[var(--danger)]" />
      </div>
      
      <h2 className="font-display text-2xl font-bold mb-3 text-[var(--ink)]">Terjadi Kesalahan</h2>
      
      <p className="text-base text-[var(--ink-mid)] max-w-sm mb-10 leading-relaxed">
        {state.error || "Gagal memproses dokumen. Silakan coba lagi dengan foto yang lebih jelas."}
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button 
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'scanner' })}
          className="w-full h-14 bg-[var(--navy-deep)] text-white font-semibold rounded-lg shadow-md active:scale-95"
        >
          Coba Lagi
        </button>
        <button 
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="w-full h-14 bg-white border border-[var(--cream-dark)] text-[var(--ink-mid)] font-semibold rounded-lg active:scale-95"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
