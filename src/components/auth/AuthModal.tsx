import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronLeft, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  User
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthenticating(false);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      handleClose();
      onSuccess(result.user);
    } catch (error: any) {
      console.error('Google Login Error:', error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError('Popup diblokir. Harap izinkan popup atau buka di tab baru.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError(`Domain (${window.location.hostname}) belum diotorisasi di Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        setAuthError(`Google Login gagal: ${error.message} (${error.code})`);
      } else {
        setAuthError('Popup Google Login ditutup sebelum selesai. Silakan coba lagi.');
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
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        setAuthSuccess('Pendaftaran sukses! Tautan verifikasi telah dikirim ke email Anda. Harap klik tautan tersebut lalu masuk.');
        await auth.signOut();
        setIsSignUp(false);
        setIsAuthenticating(false);
        setPassword('');
        return;
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          setAuthError('Email Anda belum diverifikasi. Harap periksa kotak masuk (atau folder spam) email Anda.');
          await auth.signOut();
          setIsAuthenticating(false);
          return;
        }
        handleClose();
        onSuccess(result.user);
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Email sudah terdaftar. Silakan masuk.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setAuthError('Login Email belum diaktifkan di Firebase Console.');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-white"
        >
          {/* Left Banner */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0a1b2d] via-[#122e4d] to-[var(--navy-light)] flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden text-center order-2 md:order-1">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPSd0cmFuc3BhcmVudCcvPgo8cmVjdCB3aWR0aD0nMScgaGVpZ2h0PScxJyBmaWxsPSdjZmNmY2YnIGZpbGwtb3BhY2l0eT0nMC4yJy8+Cjwvc3ZnPg==')] pointer-events-none" />

            <div className="relative z-10 p-6 rounded-full bg-white/10 border border-white/20 mb-8 shadow-xl backdrop-blur-sm">
              <Scale size={48} className="text-white" />
            </div>

            <h1 className="font-display font-black text-3xl md:text-5xl text-white mb-6 leading-tight relative z-10">
              Selamat Datang <br /> di SuaraHukum
            </h1>
            <p className="text-blue-100/90 text-lg md:text-xl font-medium max-w-sm leading-relaxed relative z-10">
              Asisten hukum bertenaga AI untuk perlindungan hak Anda.
            </p>
          </div>

          {/* Right Form */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-white to-[#f0f4f8] flex flex-col items-center justify-center p-8 lg:p-16 relative order-1 md:order-2 overflow-y-auto">
            <button
              onClick={handleClose}
              className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-semibold text-[var(--ink-mid)] hover:text-[var(--navy-deep)] transition-colors active:scale-95 z-20"
            >
              <ChevronLeft size={16} />
              Kembali
            </button>

            <div className="w-full max-w-md mx-auto flex flex-col pt-12 md:pt-0 relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-full bg-[var(--navy-deep)] flex items-center justify-center shadow-md">
                  <Scale size={16} className="text-[var(--gold)]" />
                </div>
                <span className="font-display font-black text-2xl text-[var(--navy-deep)] tracking-tight">SuaraHukum.</span>
              </div>

              <h2 className="font-display font-black text-3xl text-[var(--navy-deep)] mb-2">
                {isSignUp ? 'Daftar Akun' : 'Masuk'}
              </h2>
              <p className="text-[var(--ink-mid)] mb-8 font-medium">
                {isSignUp ? 'Buat akun Anda untuk mulai analisis dokumen.' : 'Masuk ke akun Anda untuk melanjutkan.'}
              </p>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-14 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl flex items-center justify-center gap-3 font-semibold text-gray-700 shadow-sm transition-all active:scale-95 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isSignUp ? 'Daftar dengan Google' : 'Masuk dengan Google'}
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold">ATAU EMAIL</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {authError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-start gap-2">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-semibold flex items-start gap-2">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
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
                      type={showPassword ? 'text' : 'password'}
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
                  className="w-full h-14 bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)] font-bold rounded-xl active:scale-95 transition-all shadow-md mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAuthenticating ? 'Sedang memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
                </button>
              </form>

              <p className="text-center text-sm font-medium text-[var(--ink-mid)]">
                {isSignUp ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                <button
                  type="button"
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
  );
}
