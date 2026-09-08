import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Clock, LogOut, Sparkles } from 'lucide-react';
import { auth } from '@/firebase';
import { UserProfile } from '@/types';

interface UserDropdownProps {
  user: User;
  profile?: UserProfile | null;
  onOpenHistory: () => void;
  onOpenPricing: () => void;
}

export default function UserDropdown({ user, profile, onOpenHistory, onOpenPricing }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user.displayName || profile?.fullName || user.email?.split('@')[0] || 'Pengguna';
  const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d1f35&color=fff`;
  const planLabel = profile?.plan ? profile.plan.toUpperCase() : 'FREE';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-white/20 p-1 pr-2 sm:pr-3 rounded-full hover:bg-white/10 transition-colors shadow-sm focus:outline-none"
      >
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-white/20"
        />
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-bold text-white max-w-[100px] truncate">
            {displayName.split(' ')[0]}
          </span>
          <span className="text-[10px] text-[var(--gold)] font-mono font-semibold">
            {planLabel}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[var(--cream-dark)] rounded-2xl shadow-xl flex flex-col py-1 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-500 uppercase font-mono">Akun Anda</p>
            <p className="text-sm font-bold text-[var(--navy-deep)] truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenHistory();
            }}
            className="px-4 py-2.5 text-left w-full text-sm font-semibold text-[var(--navy-deep)] hover:bg-[var(--cream-dark)] transition-colors flex items-center gap-2.5"
          >
            <Clock size={16} className="text-[var(--ink-light)]" />
            <span>Riwayat Analisis</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenPricing();
            }}
            className="px-4 py-2.5 text-left w-full text-sm font-semibold text-[var(--navy-deep)] hover:bg-[var(--cream-dark)] transition-colors flex items-center gap-2.5"
          >
            <Sparkles size={16} className="text-[var(--gold)]" />
            <span>Paket & Kuota</span>
          </button>

          <button
            onClick={() => {
              auth.signOut();
              setIsOpen(false);
            }}
            className="px-4 py-2.5 text-left w-full text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 border-t border-gray-100"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
}
