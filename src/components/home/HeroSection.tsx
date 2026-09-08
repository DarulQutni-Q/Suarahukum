import React from 'react';
import { motion } from 'framer-motion';
import { Camera, FileText, CheckCircle2, Shield, Scale, Heart } from 'lucide-react';

interface HeroSectionProps {
  onStartAnalysis: () => void;
  onSample: () => void;
}

export default function HeroSection({ onStartAnalysis, onSample }: HeroSectionProps) {
  return (
    <>
      {/* Hero Section */}
      <section
        id="beranda"
        className="relative w-full pt-16 pb-24 lg:pt-32 lg:pb-40 px-6 lg:px-12 flex justify-center bg-[linear-gradient(-45deg,_#0d1f35,_#143152,_#0B1524,_#1a3a5c)] animate-gradient overflow-hidden"
      >
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
              Pahami Kontrak & <br className="hidden lg:block" />
              Dokumen Hukum Anda
            </h1>

            <p className="font-sans text-base lg:text-lg text-blue-100/80 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Tidak perlu biaya mahal untuk mengerti hak Anda. Foto dokumen perjanjian apapun, AI kami akan menganalisis potensi jebakan dan hak Anda secara gratis & instan.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={onStartAnalysis}
                className="w-full sm:w-auto h-14 px-8 bg-[var(--gold)] text-white text-base font-bold rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl hover:bg-[#b07d20]"
              >
                <Camera size={20} />
                <span>Foto & Analisis Sekarang</span>
              </button>

              <button
                onClick={onSample}
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
            {/* Decorative Risk Highlight Card */}
            <div className="relative lg:absolute top-0 lg:top-8 lg:-right-10 w-[95%] sm:w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/5 rotate-[2deg] border border-[var(--cream-dark)] z-10 hover:-translate-y-1 transition-transform">
              <div className="flex items-start justify-between mb-3.5 sm:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                    <span className="font-bold text-xl">!</span>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono font-bold text-red-500 uppercase tracking-wide">
                      Risiko Ditemukan
                    </p>
                    <p className="font-bold text-[var(--navy-deep)] text-sm sm:text-base leading-tight mt-0.5">
                      Klausul Non-Kompetisi
                    </p>
                  </div>
                </div>
                <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] sm:text-[10px] font-mono uppercase font-bold px-2 py-1 rounded-sm shrink-0">
                  Tinggi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--ink-mid)] leading-relaxed font-medium">
                Anda dilarang bekerja di industri serupa selama 2 tahun setelah mengundurkan diri.
              </p>
            </div>

            {/* Decorative Safe Highlight Card */}
            <div className="relative lg:absolute -mt-4 lg:mt-0 lg:top-48 lg:-left-6 right-0 lg:right-auto w-[95%] sm:w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/5 -rotate-[2deg] -translate-x-4 border border-[var(--cream-dark)] z-20 hover:-translate-y-1 transition-transform">
              <div className="flex items-start justify-between mb-3.5 sm:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 size={22} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono font-bold text-emerald-500 uppercase tracking-wide">
                      Hak Anda Aman
                    </p>
                    <p className="font-bold text-[var(--navy-deep)] text-sm sm:text-base leading-tight mt-0.5">
                      Uang Pesangon
                    </p>
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

      {/* Trust Highlights Section */}
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
                <h4 className="font-display font-bold text-xl text-[var(--navy-deep)] leading-tight">
                  100% Kepemilikan Anda
                </h4>
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
                <h4 className="font-display font-bold text-xl text-[var(--navy-deep)] leading-tight">
                  Sesuai Hukum Nasional
                </h4>
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
                <h4 className="font-display font-bold text-xl text-[var(--navy-deep)] leading-tight">
                  Terbuka & Terjangkau
                </h4>
              </div>
              <p className="text-[15px] text-[var(--ink-mid)] leading-relaxed">
                Misi inisiatif Civic Tech: bantu masyarakat Indonesia memahami kontrak tanpa beban biaya konsultasi mahal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
