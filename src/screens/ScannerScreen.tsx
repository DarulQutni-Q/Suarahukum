import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Upload, CheckCircle2, Scale, Crop as CropIcon, X, Check, Clock, AlertTriangle, Plus, Zap, RefreshCw, Camera as CameraIcon } from 'lucide-react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { AppState, AppAction, PlanType } from '../types';
import { prepareImage, analyzeDocument } from '../utils/gemini';
import { PLAN_LIMITS, incrementQuota } from '../utils/user';
import { createThumbnail } from '../utils/storage';
import { auth } from '../firebase';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function ScannerScreen({ state, dispatch }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState<{show: boolean, reason: string}>({show: false, reason: ''});

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const profile = state.profile;
  const isFree = !profile || profile.plan === 'free';
  const limits = profile ? PLAN_LIMITS[profile.plan] : PLAN_LIMITS.free;
  
  // Calculate remaining quota
  const remaining = Math.max(0, (limits?.max || 3) - (profile?.quotaUsed || 0));
  
  let hoursRemaining = 0;
  if (profile?.quotaResetAt) {
    const resetTime = new Date(profile.quotaResetAt).getTime();
    hoursRemaining = Math.max(0, (resetTime - Date.now()) / (1000 * 60 * 60));
  }

  // Stop camera stream utility
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stream]);

  // Handle camera restart when facing mode changes
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const startCamera = async () => {
    try {
      stopCamera();
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsCameraActive(true);
      setIsFlashOn(false); // Reset flash state
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.message.includes('not allowed')) {
        alert("Akses kamera ditolak atau tidak didukung di lingkungan ini. Anda akan diarahkan untuk memilih file gambar.");
      }
      // fallback to file input or show alert
      fileInputRef.current?.click();
    }
  };

  const toggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch || capabilities.fillLightMode) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn }] as any
        } as MediaTrackConstraints);
        setIsFlashOn(!isFlashOn);
      } else {
        alert("Flash/Torch tidak didukung di perangkat atau kamera ini.");
      }
    } catch (err) {
      console.error("Error toggling flash:", err);
      alert("Gagal mengaktifkan flash.");
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (facingMode === 'user') {
      // Flip the canvas context horizontally if it's the front camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFiles = [...state.imageFiles, file];
        const newPreviews = [...state.imagePreviews, reader.result as string];
        dispatch({ type: 'SET_IMAGES', files: newFiles, previews: newPreviews });
        setActiveImageIdx(newPreviews.length - 1);
        setIsCameraActive(false);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }, 'image/jpeg', 0.85);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    if (files.length > 1 && isFree) {
      setShowUpgradeModal({ show: true, reason: 'multi_page' });
      return;
    }

    if (remaining <= 0) {
      setShowUpgradeModal({ show: true, reason: 'quota' });
      return;
    }

    const newFiles = [...state.imageFiles, ...files];
    if (newFiles.length > 1 && isFree) {
      setShowUpgradeModal({ show: true, reason: 'multi_page' });
      return;
    }

    const previews = await Promise.all(
      files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    dispatch({ type: 'SET_IMAGES', files: newFiles, previews: [...state.imagePreviews, ...previews] });
    setActiveImageIdx([...state.imagePreviews, ...previews].length - 1);
    setIsCropping(false);
  };

  const removeImage = (idx: number) => {
    const newFiles = [...state.imageFiles];
    const newPreviews = [...state.imagePreviews];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    
    dispatch({ type: 'SET_IMAGES', files: newFiles, previews: newPreviews });
    if (activeImageIdx >= newPreviews.length) {
      setActiveImageIdx(Math.max(0, newPreviews.length - 1));
    }
  };

  const handleAnalyze = async () => {
    if (state.imageFiles.length === 0) return;
    
    if (remaining <= 0) {
      setShowUpgradeModal({ show: true, reason: 'quota' });
      return;
    }

    setIsAnalyzing(true);
    dispatch({ type: 'START_ANALYZING' });

    try {
      // Pass all images to Gemini
      const base64Images = await Promise.all(state.imageFiles.map(file => prepareImage(file)));
      const result = await analyzeDocument(base64Images, profile?.plan || 'free');
      
      let updatedProfile = profile;
      if (auth.currentUser && profile) {
        updatedProfile = await incrementQuota(auth.currentUser.uid, profile);
        dispatch({ type: 'SET_PROFILE', profile: updatedProfile });
      }
      
      dispatch({ type: 'SET_RESULT', result });
      
      const rawThumbnail = (state.imagePreviews && state.imagePreviews.length > 0) ? state.imagePreviews[0] : '';
      const compressedThumbnail = await createThumbnail(rawThumbnail);

      const entry = {
        id: crypto.randomUUID(),
        documentType: result.documentType,
        summary: result.summary,
        overallSafety: result.overallSafety,
        analyzedAt: new Date().toISOString(),
        thumbnail: compressedThumbnail,
        result: result
      };
      dispatch({ type: 'SAVE_TO_HISTORY', entry });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', message: error.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyCrop = () => {
    if (!completedCrop || !imgRef.current) {
      setIsCropping(false);
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Check if the crop has actual width/height
    if (completedCrop.width === 0 || completedCrop.height === 0) {
      setIsCropping(false);
      return;
    }

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        setIsCropping(false);
        return;
      }
      
      const file = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFiles = [...state.imageFiles];
        const newPreviews = [...state.imagePreviews];
        newFiles[activeImageIdx] = file;
        newPreviews[activeImageIdx] = reader.result as string;
        
        dispatch({ type: 'SET_IMAGES', files: newFiles, previews: newPreviews });
        setIsCropping(false);
      };
      reader.readAsDataURL(file);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--cream)] overflow-x-hidden flex flex-col font-sans animate-in fade-in duration-300">
      
      {/* Website Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[var(--cream)]/90 backdrop-blur-md border-b border-[var(--cream-dark)] px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
        >
          <div className="w-10 h-10 bg-[var(--navy-deep)] rounded-xl flex items-center justify-center shadow-sm">
            <Scale size={20} className="text-[var(--gold)]" />
          </div>
          <span className="font-display font-black text-2xl text-[var(--navy-deep)] tracking-tight">SuaraHukum.</span>
        </div>
        
        <button 
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-mid)] hover:text-[var(--navy-deep)] transition-colors active:scale-95"
        >
          <ChevronLeft size={16} /> Kembali
        </button>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        {showUpgradeModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col p-8 text-center relative">
              <div 
                className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 1px, transparent 1px, transparent 60px)` }}
              />
              <button 
                onClick={() => setShowUpgradeModal({show: false, reason: ''})}
                className="absolute top-4 right-4 text-[var(--ink-light)] hover:text-[var(--navy-deep)] transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <div className="w-16 h-16 bg-[var(--gold)]/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 text-[var(--gold)]">
                {showUpgradeModal.reason === 'quota' ? <Clock size={32} /> : <AlertTriangle size={32} />}
              </div>
              
              <h3 className="font-display font-black text-2xl text-[var(--navy-deep)] mb-3 relative z-10">
                {showUpgradeModal.reason === 'quota' ? 'Kuota Anda Habis' : 'Upload Multi-Halaman'}
              </h3>
              
              <p className="font-sans text-[var(--ink-mid)] mb-8 leading-relaxed relative z-10">
                {showUpgradeModal.reason === 'quota' 
                   ? `Anda telah mencapai batas analisis paket ${profile?.plan || 'Free'} Anda. Kuota akan tereset dalam ${Math.ceil(hoursRemaining)} jam. Segera upgrade untuk mendapatkan lebih banyak batas analisis dan menghindari waktu tunggu.` 
                   : "Menganalisis lebih dari 1 halaman sekaligus hanya tersedia untuk paket Plus dan Pro. Upgrade sekarang untuk mendapatkan wawasan lebih dalam dari kontrak panjang."}
              </p>
              
              <div className="flex flex-col gap-3 relative z-10">
                <button 
                  onClick={() => {
                    setShowUpgradeModal({show: false, reason: ''});
                    dispatch({ type: 'SET_SCREEN', screen: 'pricing' });
                  }}
                  className="w-full h-14 bg-[var(--navy-deep)] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:shadow-2xl hover:bg-[var(--navy-mid)]"
                >
                   Tingkatkan ke Plus / Pro
                </button>
                <button 
                  onClick={() => setShowUpgradeModal({show: false, reason: ''})}
                  className="w-full h-12 bg-transparent text-[var(--ink-mid)] font-semibold rounded-xl active:scale-95 transition-all hover:bg-[var(--cream)]"
                >
                   Nanti Saja
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="w-full flex justify-between items-end mb-10">
          <div className="text-left w-full md:w-auto">
            <h1 className="font-display text-4xl lg:text-5xl font-black text-[var(--navy-deep)] mb-4 tracking-tight">
              Unggah Dokumen
            </h1>
            <p className="text-[var(--ink-mid)] text-lg max-w-xl">
              Sistem AI kami akan meninjau kontrak Anda dan mengidentifikasi potensi jebakan hukum.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--ink-mid)]">Paket Saat Ini</span>
              <span className={`text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded-sm ${profile?.plan === 'free' || !profile ? 'bg-[var(--ink-light)]' : profile?.plan === 'plus' ? 'bg-[var(--gold)]' : 'bg-[var(--navy-deep)]'}`}>
                {profile?.plan || 'Free'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
               <span className="font-semibold text-[var(--navy-deep)]">Sisa Kuota:</span>
               <div className="w-32 h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden shrink-0 mt-0.5">
                  <div className={`h-full rounded-full transition-all ${remaining === 0 ? 'bg-red-500' : 'bg-[var(--safe)]'}`} style={{ width: `${Math.max(0, (remaining / (limits?.max || 3)) * 100)}%` }} />
               </div>
               <span className="font-mono text-xs font-bold text-[var(--ink-mid)]">{remaining}/{limits?.max || 3}</span>
            </div>
            {remaining <= 1 && hoursRemaining > 0 && (
              <span className="text-xs text-[var(--danger)] font-medium mt-1">Gunakan dengan bijak.</span>
            )}
            {remaining === 0 && (
              <span className="text-xs text-[var(--danger)] font-medium mt-1">Reset dalam {Math.ceil(hoursRemaining)} jam</span>
            )}
          </div>
        </div>

        {/* Mobile quota indicator */}
        <div className="w-full md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-[var(--cream-dark)] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--ink-mid)]">Paket:</span>
              <span className={`text-[9px] uppercase font-bold text-white px-1.5 py-[1px] rounded-sm ${profile?.plan === 'free' || !profile ? 'bg-[var(--ink-light)]' : profile?.plan === 'plus' ? 'bg-[var(--gold)]' : 'bg-[var(--navy-deep)]'}`}>
                {profile?.plan || 'Free'}
              </span>
            </div>
            <div className="text-xs font-semibold text-[var(--navy-deep)]">
              Sisa Kuota: {remaining}/{limits?.max || 3}
            </div>
          </div>
          <div className="w-24 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
             <div className={`h-full rounded-full ${remaining === 0 ? 'bg-red-500' : 'bg-[var(--safe)]'}`} style={{ width: `${Math.max(0, (remaining / (limits?.max || 3)) * 100)}%` }} />
          </div>
        </div>

        <input 
          type="file" 
          accept="image/*" 
          multiple
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />

        <div className="w-full flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-2/3">
            <div 
              onClick={() => !isCameraActive && state.imagePreviews.length === 0 && fileInputRef.current?.click()}
              className={`relative overflow-hidden ${!isCameraActive ? 'cursor-pointer' : ''} min-h-[300px] md:min-h-[400px] border-2 border-dashed border-[var(--navy-light)] rounded-2xl bg-white w-full transition-all duration-300 ${!isCameraActive ? 'hover:border-[var(--navy-deep)] group shadow-sm hover:shadow-md' : 'border-transparent bg-black'} ${state.imagePreviews.length === 0 ? '' : ''}`}
            >
              {isCameraActive ? (
                <div className="w-full h-full min-h-[400px] flex flex-col justify-center items-center bg-black relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={`max-h-[60vh] object-contain w-full h-full ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                  />
                  
                  {/* Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFlash(); }} 
                      className={`p-3 rounded-full shadow-lg transition-colors ${isFlashOn ? 'bg-yellow-400 text-black' : 'bg-black/50 text-white hover:bg-black/80'}`}
                    >
                      <Zap size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleCamera(); }} 
                      className="bg-black/50 text-white p-3 rounded-full hover:bg-black/80 shadow-lg transition-colors"
                    >
                      <RefreshCw size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsCameraActive(false); stopCamera(); }} 
                      className="bg-black/50 text-white p-3 rounded-full hover:bg-black/80 shadow-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-0 right-0 flex justify-center pb-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); captureImage(); }} 
                      className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-xl active:scale-95 flex items-center justify-center transition-transform"
                    >
                      <div className="w-12 h-12 bg-white rounded-full border border-gray-200"></div>
                    </button>
                  </div>
                </div>
              ) : state.imagePreviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 p-8 h-full min-h-[300px] md:min-h-[400px]">
                  <div className="w-20 h-20 bg-[var(--cream-dark)] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-[var(--navy-light)] focus-within:ring-2 focus-within:ring-[var(--navy-deep)]">
                    <Upload size={40} />
                  </div>
                  <div className="text-center mt-2 flex flex-col items-center gap-2">
                    <p className="text-xl font-bold text-[var(--navy-deep)]">Klik untuk memilih dokumen</p>
                    <p className="text-base text-[var(--ink-light)]">atau tarik file langsung ke area ini</p>
                    <div className="flex items-center gap-2 my-2 w-full max-w-[200px]">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-sm font-semibold text-gray-400">ATAU</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); startCamera(); }}
                      className="flex items-center gap-2 bg-[var(--navy-deep)] text-white px-5 py-2.5 rounded-lg active:scale-95 transition-transform shadow hover:shadow-md font-medium"
                    >
                      <CameraIcon size={18} /> Gunakan Kamera Langsung
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4 font-mono">
                    <span className="bg-[var(--cream-dark)] text-[var(--ink-light)] px-3 py-1 rounded-sm text-xs font-semibold">JPG</span>
                    <span className="bg-[var(--cream-dark)] text-[var(--ink-light)] px-3 py-1 rounded-sm text-xs font-semibold">PNG</span>
                    <span className="bg-[var(--cream-dark)] text-[var(--ink-light)] px-3 py-1 rounded-sm text-xs font-semibold">HEIC</span>
                  </div>
                </div>
              ) : isCropping ? (
                <div className="w-full h-full min-h-[300px] md:min-h-[400px] relative flex justify-center items-center bg-gray-900 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    className="max-h-[70vh] flex items-center justify-center"
                  >
                    <img 
                      ref={imgRef}
                      src={state.imagePreviews[activeImageIdx]} 
                      alt="Crop preview" 
                      className="max-w-full max-h-[70vh] object-contain"
                      crossOrigin="anonymous"
                      onLoad={(e) => {
                        const { width, height } = e.currentTarget;
                        const defaultCrop = {
                          unit: '%' as const,
                          width: 80,
                          height: 80,
                          x: 10,
                          y: 10
                        };
                        setCrop(defaultCrop);
                        setCompletedCrop(defaultCrop as any);
                      }}
                    />
                  </ReactCrop>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsCropping(false); setCrop(undefined); setCompletedCrop(null); }}
                      className="bg-gray-800 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow border border-gray-700 hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <X size={18} /> Batal
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleApplyCrop(); }}
                      className="bg-[var(--safe)] text-white font-bold text-sm px-6 py-2.5 rounded-full shadow hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Check size={18} /> Terapkan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full min-h-[300px] md:min-h-[400px] relative flex flex-col justify-between bg-gray-50 border border-[var(--cream-dark)] p-4">
                  <div className="flex-1 flex justify-center items-center relative min-h-[250px]">
                     <img src={state.imagePreviews[activeImageIdx]} alt="Preview" className="max-w-full max-h-[60vh] object-contain shadow-lg" crossOrigin="anonymous" />
                     <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" style={{ animation: 'scanLine 2.5s linear infinite' }}></div>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsCropping(true); }}
                      className="bg-white/90 text-[var(--navy-deep)] font-bold text-sm px-4 py-2.5 rounded-full shadow border hover:bg-white transition-colors flex items-center gap-2"
                    >
                      <CropIcon size={16} /> Potong Foto
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(activeImageIdx); }}
                      className="bg-white/90 text-red-600 font-bold text-sm px-4 py-2.5 rounded-full shadow border hover:bg-white transition-colors flex items-center justify-center w-10 h-10"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  {state.imagePreviews.length > 0 && (
                    <div className="w-full mt-4 flex gap-2 overflow-x-auto p-2 bg-white rounded-xl shadow-inner border border-gray-200" onClick={e => e.stopPropagation()}>
                       {state.imagePreviews.map((preview, i) => (
                         <button 
                           key={i} 
                           onClick={() => setActiveImageIdx(i)}
                           className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === activeImageIdx ? 'border-[var(--navy-deep)] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                         >
                           <img src={preview} className="w-full h-full object-cover" />
                         </button>
                       ))}
                       {(!isFree || state.imagePreviews.length === 0) && (
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-[var(--navy-deep)] hover:border-[var(--navy-deep)] transition-all bg-gray-50"
                         >
                           <Plus size={20} />
                           <span className="text-[10px] mt-1 font-semibold">Tmbh</span>
                         </button>
                       )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--cream-dark)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs uppercase tracking-widest font-bold text-[var(--gold)]">
                  Tips Hasil Akurat
                </span>
              </div>
              
              <div className="space-y-4">
                {[
                  "Pastikan pencahayaan cukup terang",
                  "Permukaan dokumen rata, tidak terlipat",
                  "Semua teks terlihat jelas, tidak blur"
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-[var(--cream)] rounded-xl border border-[var(--cream-dark)] hover:border-[var(--navy-light)] transition-colors">
                    <CheckCircle2 size={24} className="text-[var(--safe)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--ink-mid)] leading-snug">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={state.imagePreviews.length === 0 || isAnalyzing || remaining <= 0}
              className={`w-full h-16 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 ${state.imagePreviews.length > 0 && !isAnalyzing && remaining > 0 ? 'bg-[var(--navy-deep)] text-white shadow-xl hover:-translate-y-1 active:translate-y-0' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>MEMPROSES AI...</span>
                </div>
              ) : (
                <span>ANALISIS DOKUMEN</span>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 font-mono">*100% data diproses lokal dan dihapus</p>
          </div>
        </div>
      </main>
    </div>
  );
}
