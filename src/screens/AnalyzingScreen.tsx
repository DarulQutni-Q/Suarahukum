import React, { useEffect, useState } from 'react';
import { AppState, AppAction } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const MESSAGES = [
  "Membaca isi dokumen...",
  "Mengidentifikasi pasal dan klausul...",
  "Memeriksa hak-hak Anda...",
  "Mencari potensi risiko tersembunyi...",
  "Menyusun laporan dalam bahasa sederhana..."
];

export default function AnalyzingScreen({ state }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let start = 0;
    const duration = 12000;
    const interval = 16;
    const step = (95 / duration) * interval;
    
    const timer = setInterval(() => {
      start += step;
      if (start >= 95) {
        setProgress(95);
        clearInterval(timer);
      } else {
        setProgress(start);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-5 bg-[var(--navy-deep)] text-white">
      {state.imagePreviews && state.imagePreviews.length > 0 && (
        <motion.div
           className="relative"
           initial={{ opacity: 0, y: 20, rotate: -6 }}
           animate={{ opacity: 1, y: 0, rotate: -2 }}
           transition={{ duration: 0.5 }}
        >
          <img 
            src={state.imagePreviews[0]} 
            alt="Thumbnail" 
            className="w-28 h-40 object-cover rounded-lg shadow-2xl border-2 border-white/20 mx-auto"
          />
          {state.imagePreviews.length > 1 && (
            <div className="absolute -bottom-2 -right-2 bg-[var(--gold)] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
              +{state.imagePreviews.length - 1}
            </div>
          )}
        </motion.div>
      )}

      <div className="w-48 h-0.5 bg-white/20 rounded-full mt-8 mx-auto overflow-hidden">
        <div 
          className="bg-[var(--gold)] h-full rounded-full" 
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        ></div>
      </div>

      <h2 className="font-display text-3xl font-black text-white mt-8 text-center">
        Sedang Menganalisis
      </h2>
      
      <div className="h-6 mt-3 relative w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-base text-white/80 absolute text-center w-full"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-xs text-white/40 text-center mt-12 max-w-xs">
        Dokumen Anda tidak dikirim atau disimpan di server manapun
      </p>
    </div>
  );
}
