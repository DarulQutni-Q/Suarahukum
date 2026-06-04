import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Share2, ShieldCheck, AlertTriangle, BookOpen, ListChecks, Scale, Send, Bot, User, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppState, AppAction } from '../types';
import * as Accordion from '@radix-ui/react-accordion';
import { saveToHistory } from '../utils/storage';
import { askQuestion } from '../utils/gemini';
import { auth } from '../firebase';
import { PLAN_LIMITS, incrementQuota } from '../utils/user';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function ResultScreen({ state, dispatch }: Props) {
  const [toastMessage, setToastMessage] = useState('');
  const [scoreProgress, setScoreProgress] = useState(0);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string|null>(null);
  const [accordionValues, setAccordionValues] = useState<string[]>(['item-0']);
  
  const res = state.result;
  const profile = state.profile;
  const isFree = !profile || profile.plan === 'free';
  if (!res) return null;
  const followUps = res.followUpQA || [];

  const isSafe = res.overallSafety === 'aman';
  const isWarning = res.overallSafety === 'perlu_perhatian';

  const score = isSafe ? 85 : isWarning ? 48 : 18;
  const scoreColor = isSafe ? 'text-[var(--safe)]' : isWarning ? 'text-[var(--gold)]' : 'text-[var(--danger)]';
  const scoreBgColor = isSafe ? 'bg-[var(--safe)]' : isWarning ? 'bg-[var(--gold)]' : 'bg-[var(--danger)]';

  const totalClauses = (res.dangerClauses?.length || 0) + (res.safeClauses?.length || 0);

  useEffect(() => {
    const timer = setTimeout(() => setScoreProgress(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || isAsking) return;
    
    // Check quota
    const limits = profile ? PLAN_LIMITS[profile.plan] : PLAN_LIMITS.free;
    const remaining = Math.max(0, (limits?.max || 3) - (profile?.quotaUsed || 0));
    
    if (remaining <= 0) {
       showToast("Kuota analisis Anda habis. Harap tunggu.");
       return;
    }
    
    const q = question.trim();
    setQuestion('');
    setIsAsking(true);
    
    // Add optimistic user message to local state just for visual feedback until API returns
    // The actual update will happen via SET_RESULT that will trigger a re-render. Wait, no. We use ADD_FOLLOW_UP.
    try {
       const contextStr = JSON.stringify(res);
       const answer = await askQuestion(q, contextStr);
       dispatch({ type: 'ADD_FOLLOW_UP', qa: { question: q, answer } });
       
       if (auth.currentUser && profile) {
          const updatedProfile = await incrementQuota(auth.currentUser.uid, profile);
          dispatch({ type: 'SET_PROFILE', profile: updatedProfile });
       }
    } catch (err: any) {
       showToast(err.message || 'Gagal mengirim pertanyaan');
    } finally {
       setIsAsking(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [followUps, isAsking]);

  const handleShare = async () => {
    const text = [
      `📋 Analisis SuaraHukum: ${res.documentType}`,
      ``,
      `Status: ${isSafe ? '✅ Aman' : isWarning ? '⚠️ Perlu Diperhatikan' : '🚨 Berbahaya'}`,
      ``,
      res.summary,
      ``,
      `Yang Harus Dilakukan:`,
      ...(res.recommendedActions || []).map((a, i) => `${i+1}. ${a}`),
      ``,
      `Dibuat dengan SuaraHukum — Foto Dokumen. Tahu Hak Kamu.`
    ].join('\n');
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Analisis SuaraHukum', text });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Ringkasan disalin ke clipboard");
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (isFree) {
       showToast('Fitur Ekspor PDF hanya untuk pengguna Plus & Pro');
       return;
    }
    
    if (!contentRef.current) return;
    
    try {
      setIsExporting(true);
      showToast('Menyiapkan file PDF...');
      
      // Tunggu render & animasi accordion jika sebelumnya tertutup
      // 1000ms untuk memastikan semua DOM render selesai termasuk flex-wrap
      await new Promise(r => setTimeout(r, 1200));
      
      const originalError = console.error;
      const originalWarn = console.warn;
      console.error = () => {};
      console.warn = () => {};

      const dataUrl = await toPng(contentRef.current, {
        quality: 1,
        backgroundColor: '#faf8f3', // match var(--cream)
        pixelRatio: 2,
        fontEmbedCSS: '',
        skipFonts: true,
      });

      console.error = originalError;
      console.warn = originalWarn;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image height while maintaining aspect ratio based on original element
      const elementWidth = contentRef.current.scrollWidth;
      const elementHeight = contentRef.current.scrollHeight;
      const pdfHeight = (elementHeight * pdfWidth) / elementWidth;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`SuaraHukum-${res.documentType.replace(/\s+/g, '-')}.pdf`);
      showToast('PDF berhasil diunduh');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menghasilkan PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-screen bg-[var(--cream)] overflow-x-hidden flex flex-col font-sans relative pb-32"
    >
      
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-[var(--ink)] text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-fade-slide-up">
          {toastMessage}
        </div>
      )}

      {/* Website Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[var(--cream)]/90 backdrop-blur-md border-b border-[var(--cream-dark)] px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
        >
          <div className="w-10 h-10 bg-[var(--navy-deep)] rounded-xl flex items-center justify-center shadow-sm">
            <Scale size={20} className="text-[var(--gold)]" />
          </div>
          <span className="font-display font-black text-2xl text-[var(--navy-deep)] tracking-tight hidden sm:block">SuaraHukum.</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className={`flex items-center gap-1.5 p-2 rounded-lg text-sm font-medium transition-colors active:scale-95 ${!isFree ? 'text-[var(--navy-mid)] hover:bg-[var(--cream-dark)]' : 'text-gray-400 opacity-70'} ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline">{isExporting ? 'Proses...' : 'Ekspor PDF'}</span>
            {isFree && <div className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-[var(--gold)] text-white font-mono uppercase tracking-widest leading-none flex items-center shadow-sm">Pro</div>}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 p-2 rounded-lg text-sm font-medium text-[var(--navy-mid)] active:scale-95 hover:bg-[var(--cream-dark)] transition-colors">
            <Share2 size={18} />
            <span className="hidden sm:inline">Bagikan</span>
          </button>
          <div className="w-px h-6 bg-[var(--cream-dark)] mx-2"></div>
          <button 
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-mid)] hover:text-[var(--navy-deep)] transition-colors active:scale-95"
          >
            <ChevronLeft size={16} />
            Kembali
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div 
        ref={contentRef} 
        className={`max-w-7xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-8 bg-[var(--cream)] ${isExporting ? 'w-[1024px] min-w-[1024px] !max-w-none !px-16' : ''}`}
      >
        
        {/* Left Column (Sticky info) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full md:w-1/3 flex flex-col gap-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--cream-dark)] sticky top-24">
            {/* Safety Banner */}
            <div className={`w-full px-6 py-8 rounded-t-2xl animate-fade-slide-up ${isSafe ? 'bg-[var(--safe)] text-white' : isWarning ? 'bg-[var(--gold)] text-white' : 'bg-[var(--danger)] text-white'}`}>
              <div className="flex items-center gap-3">
                {isSafe ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
                <span className="font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded-sm font-bold tracking-widest">
                  {isSafe ? 'DOKUMEN AMAN' : isWarning ? 'PERLU DIPERHATIKAN' : 'RISIKO TINGGI'}
                </span>
              </div>
              <h1 className="font-display font-black text-3xl mt-4 leading-tight tracking-tight">
                {isSafe ? 'Dokumen Ini Relatif Aman' : isWarning ? 'Ada Beberapa Hal Yang Perlu Diperhatikan' : 'Dokumen Ini Berisiko Tinggi'}
              </h1>
              <p className="text-sm text-white/85 mt-3 leading-relaxed">
                {res.overallSafetyExplanation}
              </p>
            </div>

            {/* Score Card */}
            <div className="px-6 py-6 border-b border-[var(--cream-dark)] bg-[var(--cream-dark)]/30">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-semibold text-[var(--ink-mid)]">Skor Keamanan Dokumen</span>
                <span className={`font-display text-3xl font-black ${scoreColor}`}>{score}</span>
              </div>
              <div className="w-full h-2 bg-[var(--cream-dark)] rounded-full overflow-hidden">
                <div className={`h-full ${scoreBgColor}`} style={{ width: `${scoreProgress}%`, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
              </div>
              <p className="text-xs text-[var(--ink-light)] mt-2 italic">
                berdasarkan {totalClauses} klausul ditemukan
              </p>
            </div>

            {/* Document Summary Card */}
            <div className="flex flex-col gap-4 px-6 py-6 border-b border-[var(--cream-dark)] items-start">
              <div className="font-mono text-[var(--gold)] font-bold mb-1 text-sm">{res.documentType}</div>
              <p className="text-[15px] text-[var(--ink-mid)] leading-relaxed font-medium">{res.summary}</p>
              
              {state.imagePreviews && state.imagePreviews.length > 0 && (
                <div className={`w-full mt-4 bg-[var(--cream)]/50 border border-[var(--cream-dark)] p-3 rounded-xl flex gap-3 ${isExporting ? 'flex-wrap' : 'overflow-x-auto snap-x'}`}>
                  {state.imagePreviews.map((preview, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedImage(preview)}
                      className="cursor-pointer relative shrink-0 snap-center group"
                    >
                      <img src={preview} alt={`Halaman ${i+1}`} className="w-auto h-32 md:h-40 object-contain rounded-md shadow-sm border border-[var(--cream-dark)] transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-2 py-1 rounded text-xs font-medium">Perbesar</span>
                      </div>
                      {state.imagePreviews!.length > 1 && (
                        <div className="absolute top-1 left-1 bg-white/90 text-[var(--navy-deep)] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          {i+1}/{state.imagePreviews!.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isExporting && (
              <div className="p-6">
                <button 
                  onClick={() => dispatch({ type: 'RESET' })}
                  className="w-full h-14 bg-[var(--navy-deep)] text-white font-bold rounded-xl active:scale-[0.98] transition-all text-base shadow-md hover:shadow-lg"
                >
                  ANALISIS DOKUMEN LAIN
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column (Details) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-2/3 flex flex-col gap-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--cream-dark)] overflow-hidden">
            {/* Stats Row */}
            <div className="bg-[var(--navy-deep)] text-white px-3 sm:px-8 py-5 flex justify-between sm:grid sm:grid-cols-3 divide-x divide-white/20 text-center sm:text-left">
              <div className="flex flex-col gap-1 px-2 sm:px-4 flex-1">
                <span className="font-mono text-[9px] sm:text-xs text-white/60 font-bold tracking-widest truncate">HAK ANDA</span>
                <span className="text-xl sm:text-2xl font-black text-white">{res.yourRights?.length || 0}</span>
              </div>
              <div className="flex flex-col gap-1 px-2 sm:px-4 flex-1">
                <span className="font-mono text-[9px] sm:text-xs text-red-300 font-bold tracking-widest truncate">RISIKO</span>
                <span className="text-xl sm:text-2xl font-black text-red-400">{res.dangerClauses?.length || 0}</span>
              </div>
              <div className="flex flex-col gap-1 px-2 sm:px-4 flex-1">
                <span className="font-mono text-[9px] sm:text-xs text-green-300 font-bold tracking-widest truncate">KLAUSUL BAIK</span>
                <span className="text-xl sm:text-2xl font-black text-green-400">{res.safeClauses?.length || 0}</span>
              </div>
            </div>

            {/* Hak Anda */}
            {res.yourRights && res.yourRights.length > 0 && (
              <div className="border-b border-[var(--cream-dark)]">
                <div className="px-8 py-5 bg-[var(--cream)] border-b border-[var(--cream-dark)] flex items-center gap-3">
                  <BookOpen size={20} className="text-[var(--navy-mid)]" />
                  <span className="font-mono text-[var(--navy-mid)] font-bold tracking-widest text-sm">HAK-HAK ANDA</span>
                </div>
                <Accordion.Root 
                  type="multiple" 
                  value={isExporting ? res.yourRights.map((_, i) => `item-${i}`) : accordionValues} 
                  onValueChange={setAccordionValues}
                  className="w-full"
                >
                  {res.yourRights.map((right, idx) => (
                    <motion.div
                      key={`right-${idx}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1), duration: 0.4 }}
                    >
                      <Accordion.Item value={`item-${idx}`} className="border-b border-[var(--cream-dark)] last:border-b-0 hover:bg-[var(--cream)]/50 transition-colors">
                        <Accordion.Header>
                          <Accordion.Trigger className="w-full flex justify-between items-center text-left text-base font-semibold group px-8 py-5">
                            <span className="text-[var(--ink)] leading-snug pr-4">{right.right}</span>
                            <ChevronLeft className="shrink-0 transition-transform duration-200 group-data-[state=open]:-rotate-90 text-[var(--ink-light)]" size={20} />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <p className="px-8 pb-6 text-sm text-[var(--ink-mid)] leading-relaxed">
                            {right.explanation}
                          </p>
                        </Accordion.Content>
                      </Accordion.Item>
                    </motion.div>
                  ))}
                </Accordion.Root>
              </div>
            )}

            {/* Klausul Berisiko */}
            {res.dangerClauses && res.dangerClauses.length > 0 && (
              <div>
                <div className="px-8 py-5 bg-[var(--cream)] border-b border-[var(--cream-dark)] flex items-center gap-3">
                  <AlertTriangle size={20} className="text-[var(--danger)]" />
                  <span className="font-mono text-[var(--danger)] font-bold tracking-widest text-sm">KLAUSUL BERISIKO</span>
                </div>
                {res.dangerClauses.map((clause, idx) => (
                  <motion.div 
                    key={`danger-${idx}`} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1), duration: 0.4 }}
                    className="bg-[var(--danger-bg)] px-8 py-6 border-b border-red-100 flex flex-col items-start"
                  >
                    <div className="flex w-full justify-between items-start gap-4">
                      <h3 className="text-base font-bold text-[var(--danger)] leading-snug flex-1">
                        {clause.clause}
                      </h3>
                      <span className={`shrink-0 rounded-md text-xs font-mono px-3 py-1 uppercase font-bold text-white tracking-widest ${
                        clause.level === 'tinggi' ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'
                      }`}>
                        {clause.level}
                      </span>
                    </div>
                    <p className="text-[15px] text-[var(--ink-mid)] mt-3 text-red-950/80 leading-relaxed font-medium">
                      {clause.risk}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Klausul Menguntungkan */}
            {res.safeClauses && res.safeClauses.length > 0 && (
              <div>
                <div className="px-8 py-5 bg-[var(--cream)] border-y border-[var(--cream-dark)] flex items-center gap-3">
                  <ShieldCheck size={20} className="text-[var(--safe)]" />
                  <span className="font-mono text-[var(--safe)] font-bold tracking-widest text-sm">KLAUSUL MENGUNTUNGKAN</span>
                </div>
                {res.safeClauses.map((clause, idx) => (
                  <motion.div 
                    key={`safe-${idx}`} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1), duration: 0.4 }}
                    className="bg-[var(--safe-bg)] px-8 py-6 border-b border-green-100 flex flex-col items-start"
                  >
                    <h3 className="text-base font-bold text-[var(--safe)] mb-2 leading-snug">
                      {clause.clause}
                    </h3>
                    <p className="text-[15px] text-[var(--ink-mid)] mt-1 text-green-900/80 leading-relaxed font-medium">
                      {clause.note}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Langkah Selanjutnya */}
            {res.recommendedActions && res.recommendedActions.length > 0 && (
              <div className="border-b border-[var(--cream-dark)]">
                <div className="px-8 py-5 bg-[var(--cream)] border-b border-[var(--cream-dark)] flex items-center gap-3">
                  <ListChecks size={20} className="text-[var(--ink-mid)]" />
                  <span className="font-mono text-[var(--ink-mid)] font-bold tracking-widest text-sm">YANG HARUS DILAKUKAN</span>
                </div>
                {res.recommendedActions.map((action, idx) => (
                  <motion.div 
                    key={`action-${idx}`} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1), duration: 0.4 }}
                    className="bg-white px-8 py-6 border-b border-[var(--cream-dark)] flex gap-5 items-start last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-md bg-[var(--navy-deep)] text-white font-mono text-sm flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-base font-medium text-[var(--ink)] leading-relaxed pt-0.5">
                      {action}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* QA Section (Plus/Pro Only) */}
            {!isFree && !isExporting && (
              <div className="border-t-4 border-[var(--cream-dark)]">
                <div className="px-8 py-5 bg-[var(--navy-deep)] flex items-center gap-3 text-white">
                  <Bot size={20} className="text-[var(--gold)]" />
                  <span className="font-mono font-bold tracking-widest text-sm">TANYA JAWAB AI</span>
                </div>
                <div className="p-6 md:p-8 bg-gray-50 min-h-[300px] flex flex-col">
                  {followUps.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--ink-light)] py-10 opacity-70">
                       <Bot size={48} className="mb-4 text-[var(--cream-dark)]" />
                       <p className="font-medium text-sm">Ada yang belum jelas?<br/>Tanyakan langsung ke AI kami.</p>
                       <p className="text-xs mt-2">*Mengurangi 1 kuota analisis</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-6 mb-6">
                      {followUps.map((qa, i) => (
                        <div key={i} className="flex flex-col gap-4 text-sm md:text-base">
                          <div className="self-end max-w-[85%] bg-[var(--navy-deep)] text-white p-4 rounded-2xl rounded-tr-sm shadow-md animate-in slide-in-from-right-2">
                             <p className="leading-relaxed">{qa.question}</p>
                          </div>
                          <div className="self-start max-w-[85%] bg-white border border-[var(--cream-dark)] p-4 rounded-2xl rounded-tl-sm shadow-md flex gap-4 animate-in slide-in-from-left-2">
                             <div className="w-8 h-8 rounded-full bg-[var(--cream)] border border-[var(--gold)] flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-[var(--gold)]" />
                             </div>
                             <p className="leading-relaxed text-[var(--ink-mid)]">{qa.answer}</p>
                          </div>
                        </div>
                      ))}
                      {isAsking && (
                         <div className="self-start max-w-[85%] bg-white border border-[var(--cream-dark)] p-4 rounded-2xl rounded-tl-sm shadow-md flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[var(--cream)] border border-[var(--gold)] flex items-center justify-center shrink-0">
                               <Bot size={16} className="text-[var(--gold)] animate-pulse" />
                            </div>
                            <div className="flex items-center gap-1.5 h-6">
                              <span className="w-1.5 h-1.5 bg-[var(--navy-light)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1.5 h-1.5 bg-[var(--navy-light)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1.5 h-1.5 bg-[var(--navy-light)] rounded-full animate-bounce"></span>
                            </div>
                         </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                  
                  <div className="relative mt-auto">
                     <input 
                       type="text" 
                       value={question}
                       onChange={e => setQuestion(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
                       placeholder="Tanya tentang kontrak ini..." 
                       disabled={isAsking}
                       className="w-full bg-white border border-gray-300 rounded-full h-14 pl-6 pr-14 text-sm md:text-base text-[var(--ink)] focus:outline-none focus:border-[var(--navy-light)] focus:ring-4 focus:ring-[var(--navy-light)]/10 transition-all disabled:opacity-50 shadow-sm"
                     />
                     <button
                       onClick={handleAskQuestion}
                       disabled={!question.trim() || isAsking}
                       className="absolute right-2 top-2 bottom-2 w-10 bg-[var(--navy-deep)] text-white rounded-full flex items-center justify-center hover:bg-[var(--navy-mid)] transition-colors active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
                     >
                       <Send size={16} />
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/10 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <img 
            src={selectedImage} 
            alt="Preview Penuh" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()} 
          />
        </div>
      )}
    </motion.div>
  );
}
