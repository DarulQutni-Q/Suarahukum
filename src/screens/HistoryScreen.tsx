import React, { useState } from 'react';
import { X, Trash2, Clock, Scale, AlertTriangle } from 'lucide-react';
import { AppState, AppAction } from '../types';
import * as Dialog from '@radix-ui/react-dialog';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  backgroundScreen?: string;
}

export default function HistoryScreen({ state, dispatch, backgroundScreen }: Props) {
  const { history } = state;
  const isOpen = state.screen === 'history';
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, type: 'single'|'all', id?: string}>({isOpen: false, type: 'single'});

  const onOpenChange = (open: boolean) => {
    if (!open) {
      dispatch({ type: 'SET_SCREEN', screen: backgroundScreen as any || 'home' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[var(--navy-deep)]/40 backdrop-blur-[2px] z-[100] animate-in fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 max-h-[85vh] h-full sm:h-auto sm:max-w-md sm:mx-auto sm:mb-8 sm:rounded-t-[32px] sm:rounded-b-[32px] bg-white rounded-t-[32px] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] z-[100] flex flex-col focus:outline-none animate-in slide-in-from-bottom-[100%] duration-300">
          
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[var(--cream-dark)] flex items-center justify-between z-10">
              <Dialog.Title className="font-display text-xl font-black text-[var(--navy-deep)] tracking-tight">
                Riwayat Analisis
              </Dialog.Title>
              <Dialog.Close className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--cream)] text-[var(--ink-mid)] hover:bg-[var(--cream-dark)] hover:text-[var(--ink)] transition-colors active:scale-95 focus:outline-none">
                <X size={20} />
              </Dialog.Close>
            </div>

            {/* List */}
            <div className="p-6">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center mt-12 py-8 bg-[var(--cream)] rounded-2xl border border-[var(--cream-dark)] border-dashed">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Scale size={28} className="text-[var(--ink-light)]" />
                  </div>
                  <h2 className="text-[17px] font-bold text-[var(--ink-mid)] mb-2">Belum Ada Riwayat</h2>
                  <p className="text-sm text-[var(--ink-light)] font-medium leading-relaxed px-4">
                    Analisis kontrak pertama Anda untuk melihat hasilnya di sini
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="group bg-white border border-[var(--cream-dark)] rounded-2xl flex flex-col p-4 active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:border-[var(--navy-light)] relative"
                      onClick={() => {
                        dispatch({ type: 'SET_RESULT', result: entry.result });
                        dispatch({ type: 'SET_IMAGES', files: [new File([], 'history.jpg')], previews: [entry.thumbnail] });
                        dispatch({ type: 'SET_SCREEN', screen: 'result' });
                      }}
                    >
                      <div className="flex gap-4 items-start">
                        <img 
                          src={entry.thumbnail} 
                          alt="Thumbnail" 
                          className="w-14 h-20 object-cover rounded-md shadow-sm shrink-0 bg-[var(--cream-dark)] border border-black/5" 
                        />
                        <div className="flex-1 pr-8">
                          <div className="font-mono text-[10px] uppercase font-bold text-[var(--gold)] mb-1.5 tracking-widest bg-[var(--gold-light)] inline-block px-1.5 py-0.5 rounded-sm">
                            {entry.documentType}
                          </div>
                          <p className="text-sm text-[var(--ink)] line-clamp-2 leading-relaxed font-semibold">
                            {entry.summary}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs font-mono font-medium opacity-60">
                            <Clock size={12} />
                            {formatDate(entry.analyzedAt)}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmState({ isOpen: true, type: 'single', id: entry.id });
                        }}
                        className="absolute top-4 right-4 text-[var(--ink-light)] hover:text-[var(--danger)] hover:bg-red-50 p-2 rounded-full transition-colors active:scale-90 z-20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {history.length > 0 && (
                    <button 
                      onClick={() => {
                        setConfirmState({ isOpen: true, type: 'all' });
                      }}
                      className="w-full text-center py-4 text-xs font-bold font-mono tracking-widest uppercase text-[var(--danger)] hover:underline opacity-80 mt-4 block active:scale-95 transition-transform"
                    >
                      KOSONGKAN RIWAYAT
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="pb-8 pt-4 px-6 text-center">
               <span className="mono text-[10px] uppercase bg-black/5 px-3 py-1.5 rounded-sm font-bold tracking-widest text-[var(--ink-light)]">100% LOKAL & PRIVAT</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    <Dialog.Root open={confirmState.isOpen} onOpenChange={(c) => setConfirmState({ ...confirmState, isOpen: c })}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl shadow-xl z-[200] p-6 focus:outline-none animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <Dialog.Title className="text-lg font-bold text-[var(--ink)] mb-2">
                {confirmState.type === 'single' ? 'Hapus Riwayat?' : 'Kosongkan Riwayat?'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-[var(--ink-mid)] mb-6">
                {confirmState.type === 'single' 
                  ? 'Riwayat analisis ini akan dihapus secara permanen dan tidak dapat dikembalikan.'
                  : 'Semua riwayat analisis akan dihapus secara permanen. Apakah Anda yakin?'}
              </Dialog.Description>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmState({ ...confirmState, isOpen: false })}
                  className="flex-1 py-3 bg-gray-100 text-[var(--ink-mid)] rounded-xl font-semibold hover:bg-gray-200 transition-colors active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (confirmState.type === 'single' && confirmState.id) {
                      dispatch({ type: 'DELETE_HISTORY', id: confirmState.id });
                    } else if (confirmState.type === 'all') {
                      dispatch({ type: 'CLEAR_HISTORY' });
                    }
                    setConfirmState({ ...confirmState, isOpen: false });
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors active:scale-95"
                >
                  Hapus
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
