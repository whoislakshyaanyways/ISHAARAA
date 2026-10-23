'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, RefreshCw, BookOpen } from 'lucide-react';
import { refillHearts } from '@/lib/storage';

interface OutOfHeartsModalProps {
  isOpen: boolean;
  onRefilled: () => void;
}

export const OutOfHeartsModal: React.FC<OutOfHeartsModalProps> = ({
  isOpen,
  onRefilled,
}) => {
  const router = useRouter();
  if (!isOpen) return null;

  const handleRefill = () => {
    refillHearts();
    onRefilled();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-slate-100 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-500 animate-bounce">
          <Heart className="w-12 h-12 fill-rose-400 text-rose-500" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            You ran out of hearts!
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">
            Don&apos;t worry! Refill your hearts now to keep learning Indian Sign Language.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleRefill}
            className="btn-duo w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base rounded-2xl shadow-duo-green border-b-4 border-emerald-600 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> REFILL HEARTS (FREE)
          </button>

          <button
            onClick={() => router.push('/learn')}
            className="btn-duo w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> RETURN TO PATHWAY
          </button>
        </div>
      </div>
    </div>
  );
};
