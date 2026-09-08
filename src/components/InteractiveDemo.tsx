import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Upload, MousePointer2, ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const steps = [
  {
    id: 1,
    title: "1. Foto atau Unggah Dokumen",
    desc: "Ambil foto kontrak, surat perjanjian, atau dokumen hukum lainnya langsung dengan HP Anda."
  },
  {
    id: 2,
    title: "2. AI Menganalisis Detail",
    desc: "Sistem mendeteksi pasal-pasal penting, jebakan hukum, dan hak tersembunyi dalam hitungan detik."
  },
  {
    id: 3,
    title: "3. Pahami Dalam Bahasa Anda",
    desc: "Dapatkan penjelasan instan tentang bagian yang AMAN, BERBAHAYA, atau perlu NEGOSIASI."
  }
];



export default function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const paginate = (newDirection: number) => {
    if (isTransitioning) return;
    const next = currentPage + newDirection;
    if (next < 0 || next > 3) return;
    setDirection(newDirection);
    setIsTransitioning(true);
    setCurrentPage(next);
  };

  const pageFlipVariants = {
    initial: (dir: number) => ({
      originX: 0, // Pivot at the spine
      rotateY: dir > 0 ? 100 : -100, // Page starts flipped open
      rotateZ: dir > 0 ? -2 : 2, // Subtle paper curl twist
      opacity: 0,
      scale: 1,
      boxShadow: "20px 0px 40px rgba(0,0,0,0.15)"
    }),
    enter: {
      rotateY: 0,
      rotateZ: 0,
      opacity: 1,
      scale: 1,
      boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } // Decelerating curve
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -100 : 100, // Page flips over
      rotateZ: dir > 0 ? 2 : -2, // Subtle paper curl twist out
      opacity: 0,
      scale: 0.98,
      boxShadow: "0px 10px 40px rgba(0,0,0,0.25)",
      transition: { duration: 0.4, ease: "easeInOut" as const }
    })
  };
  const containerRef = useRef<HTMLDivElement>(null);

  // Periodic step change like an auto-play demo if user hasn't clicked recently?
  // Let's keep it purely click-based to be simple and robust as requested.
  
  return (
    <section className="relative w-full py-24 overflow-hidden bg-white border-y border-slate-200">
      {/* Topographic Background Pattern using an SVG data URL */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='contour' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 40 Q 60 80 100 40 T 200 40' fill='none' stroke='%230d1f35' stroke-width='1'/%3E%3Cpath d='M0 140 Q 50 100 100 140 T 200 140' fill='none' stroke='%230d1f35' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23contour)'/%3E%3C/svg%3E\")",
          backgroundSize: "400px"
        }}
      />
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <h2 className="font-display font-black text-4xl lg:text-5xl text-[var(--navy-deep)] mb-3 text-center">
          Cara Kerja SuaraHukum
        </h2>
        <p className="font-sans text-[var(--ink-mid)] text-lg mb-16 max-w-2xl text-center">
          Jelajahi bagaimana AI kami membongkar kompleksitas kontrak hukum, halaman demi halaman, sebelum Anda menandatanganinya.
        </p>

        <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Steps List (Left / Top) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {steps.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <Card 
                  key={step.id}
                  className={`p-6 cursor-pointer transition-all duration-300 border-2 rounded-2xl ${
                    isActive 
                    ? 'border-[var(--navy-deep)] bg-[var(--navy-deep)] text-white shadow-xl translate-x-0 lg:translate-x-2' 
                    : 'border-[var(--cream-dark)] bg-white text-[var(--ink-light)] hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <h3 className={`font-bold font-sans text-xl mb-2 flex items-center gap-3 transition-colors ${isActive ? 'text-white' : 'text-[var(--navy-deep)]'}`}>
                    <div className={`w-8 h-8 rounded-full flex justify-center items-center font-display font-black text-lg flex-shrink-0 ${isActive ? 'bg-[var(--gold)] text-white' : 'bg-[var(--cream-dark)] text-[var(--ink-light)]'}`}>
                      {step.id}
                    </div>
                    {step.title.replace(/^\\d\\.\\s/, '')}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-white/90' : 'text-[var(--ink-mid)]'}`}>
                    {step.desc}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Separator - Hidden on desktop, visible on mobile */}
          <Separator className="lg:hidden w-full bg-[var(--cream-dark)]" />

          {/* Browser Mockup Panel (Right / Bottom) */}
          <div className="w-full lg:w-2/3">
            <Card className="w-full p-0 overflow-hidden shadow-2xl border-[var(--cream-dark)] bg-[var(--cream-dark)] rounded-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full flex flex-col h-[650px] lg:h-[700px]"
              >
                {/* Browser Header */}
                <div className="h-14 border-b border-[var(--cream-dark)] flex items-center px-4 relative flex-shrink-0 shrink-0 select-none bg-[var(--cream-dark)]/50">
                {/* Dots */}
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-500/20"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-yellow-500/20"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-green-400 border border-green-500/20"></div>
                </div>
                {/* URL Bar */}
                <div className="absolute left-1/2 -translate-x-1/2 bg-[var(--cream)] px-8 md:px-32 py-1.5 rounded-md text-xs font-mono text-[var(--ink-mid)] border border-[var(--cream-dark)] flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap max-w-[50%] md:max-w-none">
                  <span className="text-[var(--ink-light)] truncate">https://</span>
                  <span className="truncate">suarahukum.app</span>
                </div>
              </div>

              {/* Browser Content Window */}
              <div className="flex-1 relative overflow-hidden bg-white" ref={containerRef}>
                <AnimatePresence mode="wait">
                  {/* STEP 1: UPLOAD MOCKUP */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none"
                    >
                      <div className="text-center mb-6 w-full max-w-sm">
                        <h1 className="font-display text-2xl font-black text-[var(--navy-deep)] mb-2">Unggah Dokumen</h1>
                        <p className="text-[var(--ink-mid)] text-sm">Pilih draft perjanjian sewa, kontrak kerja, atau hutang piutang.</p>
                      </div>
                      
                      <div className="w-full max-w-sm h-64 border-2 border-dashed border-[var(--navy-light)] rounded-xl bg-white flex flex-col items-center justify-center gap-4 relative">
                         <div className="absolute top-4 right-4 bg-[var(--cream-dark)] text-[var(--ink-mid)] text-[10px] font-mono px-2 py-0.5 rounded font-bold tracking-widest uppercase">
                            Plus Plan
                         </div>
                         <div className="w-16 h-16 bg-[var(--cream-dark)] rounded-full flex items-center justify-center text-[var(--navy-light)]">
                            <Upload size={32} />
                         </div>
                         <div className="text-center">
                            <div className="font-bold text-[var(--navy-deep)]">Pilih Dokumen PDF/Foto</div>
                            <div className="text-xs text-[var(--ink-light)] mt-1">Multi-halaman didukung</div>
                         </div>
                      </div>
                      
                      <div className="mt-6 w-full max-w-sm h-14 bg-[var(--navy-deep)] rounded-xl opacity-90 flex items-center justify-center text-white font-bold gap-2">
                        <FileText size={20} /> ANALISIS DOKUMEN
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: ANALYZING MOCKUP */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[var(--cream)] pointer-events-none z-10"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80" 
                        alt="Doc preview mock" 
                        className="w-32 h-44 object-cover rounded-md shadow-xl -rotate-2 border border-gray-200"
                      />
                      
                      <div className="w-56 h-1 bg-[var(--cream-dark)] rounded-full mt-10 overflow-hidden relative">
                         <motion.div 
                           className="absolute top-0 bottom-0 left-0 bg-[var(--navy-deep)] w-full origin-left"
                           initial={{ scaleX: 0 }}
                           animate={{ scaleX: [0, 0.4, 0.7, 0.9, 1] }}
                           transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
                         />
                      </div>
                      
                      <h3 className="font-display font-black text-[var(--navy-deep)] text-xl mt-6">Sedang Menganalisis...</h3>
                      <p className="text-sm font-sans text-[var(--ink-light)] mt-2">Memeriksa hak dan kewajiban Anda.</p>
                      
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 z-0 pointer-events-none"></div>
                    </motion.div>
                  )}

                  {/* STEP 3: RESULT REALISTIC BOOK MOCKUP */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0 w-full h-full overflow-hidden z-20 flex flex-col items-center justify-center gap-6 p-5 bg-[var(--cream)] pointer-events-auto"
                    >
                      {/* Elegant Background additions */}
                      <div className="absolute inset-0 opacity-50 bg-pattern-cream" />
                      <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
                      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[var(--gold-light)] rounded-full blur-3xl opacity-40 pointer-events-none" />
                      
                      {/* Decorative Background Accents */}
                      <div className="absolute inset-x-12 bottom-12 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/20 to-transparent pointer-events-none hidden md:block" />
                      <div className="absolute inset-y-12 right-12 w-px bg-gradient-to-b from-transparent via-[var(--navy-deep)]/10 to-transparent pointer-events-none hidden md:block" />
                      <div className="absolute inset-y-12 left-12 w-px bg-gradient-to-b from-transparent via-[var(--navy-deep)]/10 to-transparent pointer-events-none hidden md:block" />
                      
                      {/* Book Container */}
                      <div className="relative w-[210px] h-[340px] sm:w-[250px] sm:h-[400px] md:w-[280px] md:h-[460px] xl:w-[300px] xl:h-[490px] shrink-0 z-20 mx-auto" style={{ perspective: '1200px' }}>
                        <motion.div 
                          className="absolute inset-0 transform cursor-pointer" 
                          style={{ transform: 'rotateX(5deg) rotateY(-5deg)', transformStyle: 'preserve-3d' }}
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                          whileHover={{ scale: 1.03 }}
                        >
                          {/* Static Spines and Covers for thickness */}
                          <div className="absolute inset-0 bg-white shadow-2xl rounded-r-lg border border-gray-200" style={{ zIndex: 0 }} />
                          <div className="absolute top-0 bottom-0 -left-3 w-3 bg-[var(--navy-deep)] shadow-[inset_-2px_0_5px_rgba(0,0,0,0.5)] rounded-l-md border-r border-[#ffffff20]" style={{ zIndex: 1 }} />

                          {/* Page Content */}
                          <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                              key={currentPage}
                              custom={direction}
                              variants={pageFlipVariants}
                              initial="initial"
                              animate="enter"
                              exit="exit"
                              onAnimationComplete={(def) => {
                                if (def === 'enter' || def === 'center') setIsTransitioning(false);
                              }}
                              className="absolute inset-0 origin-left bg-[var(--cream)] rounded-r-lg border border-gray-200 shadow-[inset_-5px_0_10px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden"
                              style={{ backfaceVisibility: 'hidden', zIndex: 10 }}
                            >
                              {/* Page Texture */}
                              <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

                              {/* Decorative Borders (Visible only on inner pages) */}
                              {currentPage !== 0 && (
                                <div className="absolute inset-[8px] md:inset-[12px] border border-[var(--gold)]/20 pointer-events-none z-[5] rounded-sm flex items-center justify-center">
                                  <div className="absolute inset-[3px] border border-[var(--gold)]/10 rounded-[1px]" />
                                  {/* Corner Flourishes */}
                                  <svg className="absolute -top-[1px] -left-[1px] w-4 h-4 text-[var(--gold)]/60" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 16V0H16" stroke="currentColor" strokeWidth="1"/>
                                    <path d="M3 13V3H13" stroke="currentColor" strokeWidth="0.5"/>
                                  </svg>
                                  <svg className="absolute -top-[1px] -right-[1px] w-4 h-4 text-[var(--gold)]/60" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 16V0H0" stroke="currentColor" strokeWidth="1"/>
                                    <path d="M13 13V3H3" stroke="currentColor" strokeWidth="0.5"/>
                                  </svg>
                                  <svg className="absolute -bottom-[1px] -left-[1px] w-4 h-4 text-[var(--gold)]/60" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 0V16H16" stroke="currentColor" strokeWidth="1"/>
                                    <path d="M3 3V13H13" stroke="currentColor" strokeWidth="0.5"/>
                                  </svg>
                                  <svg className="absolute -bottom-[1px] -right-[1px] w-4 h-4 text-[var(--gold)]/60" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 0V16H0" stroke="currentColor" strokeWidth="1"/>
                                    <path d="M13 3V13H3" stroke="currentColor" strokeWidth="0.5"/>
                                  </svg>
                                </div>
                              )}

                              {currentPage === 0 && (
                                <Card className="w-full h-full rounded-none border-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center p-4 md:p-5 bg-[var(--navy-deep)] text-white shadow-none relative">
                                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />
                                  <Scale size={160} className="absolute inset-0 m-auto text-white/5 pointer-events-none" />
                                  <div className="relative z-10 flex flex-col items-center justify-between h-full py-2 text-center w-full">
                                    <div className="flex flex-col items-center mt-2">
                                      <h2 className="font-display font-black text-xl md:text-2xl text-[var(--gold)] mb-3 leading-tight tracking-wide">HASIL ANALISIS</h2>
                                      <Separator className="w-12 bg-[var(--gold)]/50 h-[2px] mb-4" />
                                      <Scale size={24} className="text-[var(--gold-light)] opacity-80 mb-4" />
                                    </div>
                                    
                                    <div className="flex flex-col items-center w-full bg-black/40 p-3 rounded-lg backdrop-blur-md border border-[var(--gold)]/20 shadow-lg shrink-0">
                                      <Badge className="bg-[var(--gold)] text-[var(--navy-deep)] hover:bg-[var(--gold)] mb-3 tracking-widest text-[9px] uppercase font-mono font-bold shadow-sm">
                                        Perjanjian Sewa
                                      </Badge>
                                      <p className="text-[10px] md:text-[11px] text-gray-200 leading-relaxed font-sans mb-3 line-clamp-3">
                                        Dokumen ini berisi klausul standar dengan beberapa risiko pada pajak dan denda.
                                      </p>
                                      <div className="bg-[var(--danger)] text-white px-2 py-1.5 md:py-2 rounded font-display font-bold text-sm md:text-base w-full shadow-inner border border-red-500/50">
                                        Berisiko Tinggi
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              {currentPage === 1 && (
                                <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col p-3 md:p-4 relative">
                                  <div className="flex items-center justify-between mb-2 md:mb-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck size={16} className="text-[var(--safe)]" />
                                      <h3 className="font-mono text-[9px] md:text-[10px] tracking-widest font-bold text-[var(--safe)] mb-0 uppercase">Hak-Hak Anda</h3>
                                    </div>
                                  </div>
                                  <Separator className="bg-[var(--cream-dark)] mb-3" />
                                  <div className="flex flex-col gap-2.5">
                                    <div className="border-l-[3px] border-[var(--safe)] pl-2.5 bg-white p-2 rounded-r-md shadow-sm">
                                      <h4 className="font-bold text-[11px] md:text-xs text-[var(--ink)] mb-0.5">Masa Tenggang</h4>
                                      <p className="text-[9px] md:text-[10px] text-[var(--ink-mid)]">Anda diberikan 7 hari masa tenggang pembayaran sebelum denda berlaku.</p>
                                    </div>
                                    <div className="border-l-[3px] border-[var(--safe)] pl-2.5 bg-white p-2 rounded-r-md shadow-sm">
                                      <h4 className="font-bold text-[11px] md:text-xs text-[var(--ink)] mb-0.5">Pembatalan Sepihak</h4>
                                      <p className="text-[9px] md:text-[10px] text-[var(--ink-mid)]">Opsi pembatalan gratis dalam 30 hari pertama masa sewa.</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {currentPage === 2 && (
                                <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col p-3 md:p-4 relative">
                                  <div className="flex flex-col shrink-0">
                                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                                      <AlertTriangle size={16} className="text-[var(--danger)]" />
                                      <h3 className="font-mono text-[9px] md:text-[10px] tracking-widest font-bold text-[var(--danger)] mb-0 uppercase">Klausul Berisiko</h3>
                                    </div>
                                    <Separator className="bg-[var(--cream-dark)] mb-3" />
                                  </div>
                                  <div className="flex flex-col gap-2.5">
                                    <div className="border-l-[3px] border-[var(--danger)] pl-2.5 bg-white p-2 rounded-r-md shadow-sm">
                                      <div className="flex justify-between items-start mb-0.5 gap-2">
                                        <h4 className="font-bold text-[11px] md:text-xs text-[var(--danger)] leading-tight">Denda Keterlambatan</h4>
                                        <span className="bg-[var(--danger)] text-white text-[7px] px-1 py-0.5 rounded-sm uppercase font-mono shrink-0 flex items-center">Tinggi</span>
                                      </div>
                                      <p className="text-[9px] md:text-[10px] text-[var(--ink-mid)] mt-1">Denda 5% per hari tanpa batas maksimal. Sangat merugikan.</p>
                                    </div>
                                    <div className="border-l-[3px] border-[var(--danger)] pl-2.5 bg-white p-2 rounded-r-md shadow-sm">
                                      <div className="flex justify-between items-start mb-0.5 gap-2">
                                        <h4 className="font-bold text-[11px] md:text-xs text-[var(--danger)] leading-tight">Uang Muka Hangus</h4>
                                        <span className="bg-orange-500 text-white text-[7px] px-1 py-0.5 rounded-sm uppercase font-mono shrink-0 flex items-center">Sedang</span>
                                      </div>
                                      <p className="text-[9px] md:text-[10px] text-[var(--ink-mid)] mt-1">Pembayaran di awal tidak bisa ditarik kembali walau batal.</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {currentPage === 3 && (
                                <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col p-3 md:p-4 relative">
                                  <div className="flex flex-col shrink-0">
                                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                                      <FileText size={16} className="text-[var(--navy-deep)]" />
                                      <h3 className="font-mono text-[9px] md:text-[10px] tracking-widest font-bold text-[var(--navy-deep)] mb-0 uppercase">Langkah Rekomendasi</h3>
                                    </div>
                                    <Separator className="bg-[var(--cream-dark)] mb-3" />
                                  </div>
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex gap-2 bg-white p-2 rounded-md shadow-sm border border-gray-200">
                                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 bg-[var(--navy-deep)] text-white text-[8px] font-mono font-bold flex items-center justify-center rounded-sm leading-none shrink-0 mt-0.5">1</div>
                                      <p className="text-[9px] md:text-[10px] text-[var(--ink-mid)] font-medium leading-relaxed">Minta batas maksimal denda di pasal 4.</p>
                                    </div>
                                    <div className="flex gap-2 bg-white p-2 rounded-md shadow-sm border border-gray-200">
                                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 bg-[var(--navy-deep)] text-white text-[8px] font-mono font-bold flex items-center justify-center rounded-sm leading-none shrink-0 mt-0.5">2</div>
                                      <p className="text-[9px] md:text-[10px] text-[var(--ink-mid)] font-medium leading-relaxed">Negosiasikan opsi pengembalian uang muka 50%.</p>
                                    </div>
                                    <div className="flex gap-2 bg-white p-2 rounded-md shadow-sm border border-gray-200">
                                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 bg-[var(--navy-deep)] text-white text-[8px] font-mono font-bold flex items-center justify-center rounded-sm leading-none shrink-0 mt-0.5">3</div>
                                      <p className="text-[9px] md:text-[10px] text-[var(--ink-mid)] font-medium leading-relaxed">Simpan riwayat ini ke email Anda.</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 z-30 pb-0">
                        <button 
                          onClick={() => paginate(-1)} 
                          disabled={currentPage === 0 || isTransitioning}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[var(--ink)] shadow-md transition-all ${
                            currentPage === 0 || isTransitioning ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--cream-dark)]'
                          }`}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="font-mono text-[9px] md:text-[11px] tracking-widest font-bold text-[var(--ink-mid)] whitespace-nowrap shrink-0 min-w-[110px] text-center flex items-center justify-center">
                          HALAMAN {currentPage + 1}&nbsp;/&nbsp;4
                        </span>
                        <button 
                          onClick={() => paginate(1)} 
                          disabled={currentPage === 3 || isTransitioning}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[var(--ink)] shadow-md transition-all ${
                            currentPage === 3 || isTransitioning ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--cream-dark)]'
                          }`}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
