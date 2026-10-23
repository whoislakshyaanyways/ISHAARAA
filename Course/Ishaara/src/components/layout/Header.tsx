'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Flame, Gem, Zap } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { formatNumber } from '@/lib/utils';

export const Header: React.FC = () => {
  const { progress } = useUserProgress();

  return (
    <header className="lg:hidden sticky top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur border-b-2 border-slate-200 z-30 flex items-center justify-between px-4 select-none">
      {/* Brand logo */}
      <Link href="/learn" className="flex items-center gap-2">
        <span className="text-xl">🤟</span>
        <span className="font-black text-lg text-emerald-600 tracking-tight">
          ISL Lingo
        </span>
      </Link>

      {/* Mobile Top Stats */}
      <div className="flex items-center gap-3">
        {/* Hearts */}
        <div className="flex items-center gap-1 font-black text-xs text-rose-500">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>{progress.hearts}</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 font-black text-xs text-orange-500">
          <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
          <span>{progress.streak}</span>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1 font-black text-xs text-sky-500">
          <Gem className="w-4 h-4 fill-sky-400 text-sky-500" />
          <span>{formatNumber(progress.gems)}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 font-black text-xs text-amber-500">
          <Zap className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{formatNumber(progress.xp)}</span>
        </div>
      </div>
    </header>
  );
};
