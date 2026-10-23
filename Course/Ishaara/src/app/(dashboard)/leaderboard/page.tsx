'use client';

import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/storage';
import { useUserProgress } from '@/hooks/useUserProgress';
import { LeaderboardUser } from '@/types';
import { Trophy, Zap, Flame, Crown, Shield, ArrowUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function LeaderboardPage() {
  const { progress } = useUserProgress();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [activeLeague, setActiveLeague] = useState<'Bronze' | 'Silver' | 'Gold' | 'Diamond'>('Gold');

  useEffect(() => {
    setUsers(getLeaderboard());
  }, [progress.xp, progress.streak]);

  const leagues: ('Bronze' | 'Silver' | 'Gold' | 'Diamond')[] = ['Bronze', 'Silver', 'Gold', 'Diamond'];

  const top3 = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="py-6 max-w-xl mx-auto space-y-6 select-none">
      {/* League Header Card */}
      <div className="bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 rounded-3xl p-6 text-white border-b-4 border-amber-600 shadow-duo-yellow text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center text-4xl shadow-inner">
          <Trophy className="w-9 h-9 fill-white text-amber-200" />
        </div>
        <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">
          {activeLeague} League
        </h1>
        <p className="text-xs font-bold text-amber-950/80 max-w-xs mx-auto">
          Top 3 learners advance to the Diamond League at the end of the week!
        </p>
      </div>

      {/* League Switcher Tabs */}
      <div className="flex items-center justify-between gap-1 p-1.5 bg-slate-200/80 rounded-2xl">
        {leagues.map((league) => (
          <button
            key={league}
            onClick={() => setActiveLeague(league)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeLeague === league
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Podium for Top 3 */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
        <div className="flex items-end justify-center gap-2 sm:gap-4 pt-4 pb-2">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <span className="text-2xl mb-1">{top3[1].avatar}</span>
              <span className="text-xs font-black text-slate-800 truncate w-full text-center">
                {top3[1].name}
              </span>
              <span className="text-[11px] font-extrabold text-amber-600 mb-2">
                {formatNumber(top3[1].xp)} XP
              </span>
              <div className="w-full h-24 bg-slate-200 rounded-t-2xl border-2 border-slate-300 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-600">🥈 2</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="flex flex-col items-center flex-1 max-w-[130px]">
              <Crown className="w-6 h-6 fill-amber-400 text-amber-500 animate-bounce mb-1" />
              <span className="text-3xl mb-1">{top3[0].avatar}</span>
              <span className="text-xs font-black text-slate-800 truncate w-full text-center">
                {top3[0].name}
              </span>
              <span className="text-[11px] font-extrabold text-amber-600 mb-2">
                {formatNumber(top3[0].xp)} XP
              </span>
              <div className="w-full h-32 bg-amber-400 rounded-t-2xl border-2 border-amber-500 shadow-duo-yellow flex flex-col items-center justify-center text-white">
                <span className="text-2xl font-black">🥇 1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <span className="text-2xl mb-1">{top3[2].avatar}</span>
              <span className="text-xs font-black text-slate-800 truncate w-full text-center">
                {top3[2].name}
              </span>
              <span className="text-[11px] font-extrabold text-amber-600 mb-2">
                {formatNumber(top3[2].xp)} XP
              </span>
              <div className="w-full h-18 bg-amber-100 rounded-t-2xl border-2 border-amber-300 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-amber-800">🥉 3</span>
              </div>
            </div>
          )}
        </div>

        {/* Promotion Zone Banner */}
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-emerald-800">
          <ArrowUp className="w-4 h-4 text-emerald-600" /> PROMOTION ZONE — Top 3 will advance!
        </div>
      </div>

      {/* Full Rankings List */}
      <div className="space-y-2">
        {users.map((user) => {
          const isCurrentUser = user.isCurrentUser || user.id === 'user-curr';
          return (
            <div
              key={user.id}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                isCurrentUser
                  ? 'bg-emerald-50 border-emerald-400 shadow-duo-green ring-2 ring-emerald-200'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 text-center font-black text-sm ${
                    user.rank <= 3 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {user.rank}
                </span>

                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                  {user.avatar}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />{' '}
                    {user.streak}d streak
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-black text-sm text-slate-700">
                <Zap className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{formatNumber(user.xp)} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
