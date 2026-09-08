import React, { useState } from 'react';
import { Scale, Menu, X, Clock, Sparkles, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserProfile } from '@/types';
import UserDropdown from '@/components/auth/UserDropdown';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  onOpenPricing: () => void;
  onNavigateSection: (id: string) => void;
}

export default function Navbar({
  user,
  profile,
  onOpenAuth,
  onOpenHistory,
  onOpenPricing,
  onNavigateSection
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    onNavigateSection(id);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[var(--navy-deep)]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleNavClick('beranda')}
        >
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-sm">
            <Scale size={20} className="text-[var(--gold)]" />
          </div>
          <span className="font-display font-black text-2xl text-white tracking-tight">
            SuaraHukum.
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <button
            onClick={() => handleNavClick('layanan')}
            className="text-white/80 font-semibold hover:text-white transition-colors text-sm"
          >
            Layanan
          </button>
          <button
            onClick={() => handleNavClick('peraturan')}
            className="text-white/80 font-semibold hover:text-white transition-colors text-sm"
          >
            Peraturan
          </button>
          <button
            onClick={() => handleNavClick('tentang-kami')}
            className="text-white/80 font-semibold hover:text-white transition-colors text-sm"
          >
            Tentang Kami
          </button>
          <button
            onClick={onOpenPricing}
            className="text-[var(--gold)] font-semibold hover:text-[var(--gold-light)] transition-colors text-sm flex items-center gap-1.5"
          >
            <Sparkles size={15} />
            <span>Harga</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onOpenHistory}
            className="hidden sm:flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Clock size={15} />
            <span>Riwayat</span>
          </button>

          {user ? (
            <UserDropdown
              user={user}
              profile={profile}
              onOpenHistory={onOpenHistory}
              onOpenPricing={onOpenPricing}
            />
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-sm font-bold border border-white/20 text-white hover:bg-white hover:text-[var(--navy-deep)] px-3 py-2 sm:px-6 rounded-xl active:scale-95 transition-all"
            >
              <UserIcon size={16} className="lg:hidden" />
              <span className="hidden lg:inline">Masuk / Daftar</span>
              <span className="inline lg:hidden">Masuk</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="lg:hidden text-white p-2 -mr-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Buka Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
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
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl z-[70] lg:hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--navy-deep)] rounded-lg flex items-center justify-center shadow-sm">
                    <Scale size={16} className="text-[var(--gold)]" />
                  </div>
                  <span className="font-display font-black text-lg text-[var(--navy-deep)]">
                    SuaraHukum.
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-2">
                <button
                  onClick={() => handleNavClick('layanan')}
                  className="w-full text-left py-3 px-4 rounded-xl font-semibold text-[var(--navy-deep)] hover:bg-gray-50 transition-colors"
                >
                  Layanan Analisis
                </button>
                <button
                  onClick={() => handleNavClick('peraturan')}
                  className="w-full text-left py-3 px-4 rounded-xl font-semibold text-[var(--navy-deep)] hover:bg-gray-50 transition-colors"
                >
                  Peraturan yang Dicakup
                </button>
                <button
                  onClick={() => handleNavClick('tentang-kami')}
                  className="w-full text-left py-3 px-4 rounded-xl font-semibold text-[var(--navy-deep)] hover:bg-gray-50 transition-colors"
                >
                  Tentang Kami
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPricing();
                  }}
                  className="w-full text-left py-3 px-4 rounded-xl font-semibold text-[var(--gold)] hover:bg-amber-50 transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Paket Berlangganan</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="w-full text-left py-3 px-4 rounded-xl font-semibold text-[var(--navy-deep)] hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Clock size={16} />
                  <span>Riwayat Analisis Dokumen</span>
                </button>
              </div>

              <div className="p-5 border-t border-gray-100">
                {!user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full h-12 bg-[var(--navy-deep)] text-white font-bold rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Masuk atau Daftar</span>
                  </button>
                ) : (
                  <p className="text-center text-xs text-gray-500 font-medium">
                    Masuk sebagai <strong className="text-gray-700">{user.email}</strong>
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
