'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Flame, 
  Gem, 
  Zap, 
  ChevronRight, 
  Trophy,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { getDaysOfWeek, formatNumber } from '@/lib/utils';
import { getQuests, refillHearts } from '@/lib/storage';
import { Modal } from '@/components/common/Modal';
import { ProgressBar } from '@/components/common/ProgressBar';

export const RightSidebar: React.FC = () => {
  const { progress, refresh } = useUserProgress();
  const [showHeartModal, setShowHeartModal] = useState(false);
  const daysOfWeek = getDaysOfWeek();
  const quests = getQuests().slice(0, 3); // Top 3 daily quests

  const handleRefillHearts = () => {
    refillHearts();
    refresh();
    setShowHeartModal(false);
  };

  return (
    <>
      <aside className="hidden xl:flex flex-col gap-6 w-[360px] p-6 sticky top-0 h-screen overflow-y-auto select-none">
        {/* Top Gamification Stats Pill Bar */}
        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
          {/* Hearts */}
          <button
            onClick={() => setShowHeartModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-500 font-extrabold text-sm transition-colors"
            title="Your Hearts"
          >
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>{progress.hearts}</span>
          </button>

          {/* Streak */}
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-orange-50 text-orange-500 font-extrabold text-sm transition-colors"
            title="Daily Streak"
          >
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            <span>{progress.streak}</span>
          </Link>

          {/* Gems */}
          <Link
            href="/shop"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-sky-50 text-sky-500 font-extrabold text-sm transition-colors"
            title="Gems Balance"
          >
            <Gem className="w-5 h-5 fill-sky-400 text-sky-500" />
            <span>{formatNumber(progress.gems)}</span>
          </Link>

          {/* Total XP */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-amber-500 font-extrabold text-sm" title="Total XP">
            <Zap className="w-5 h-5 fill-amber-400 text-amber-500" />
            <span>{formatNumber(progress.xp)}</span>
          </div>
        </div>

        {/* Weekly Streak Card */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {progress.streak} Day Streak!
                </h3>
                <p className="text-xs text-slate-400 font-bold">
                  Practice daily to keep it blazing
                </p>
              </div>
            </div>
          </div>

          {/* 7-day mini calendar */}
          <div className="grid grid-cols-7 gap-1 text-center pt-2 border-t border-slate-100">
            {daysOfWeek.map((day) => {
              const isDone = progress.activeDays?.includes(day.dateStr);
              return (
                <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-slate-400">
                    {day.dayName[0]}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-orange-500 text-white shadow-sm ring-2 ring-orange-200'
                        : day.isToday
                        ? 'border-2 border-orange-400 text-orange-600 bg-orange-50'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : day.isToday ? '•' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Quests Mini Card */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 text-lg">
                🎯
              </div>
              <h3 className="text-base font-black text-slate-800">Daily Quests</h3>
            </div>
            <Link
              href="/quests"
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center"
            >
              VIEW ALL <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {quests.map((q) => {
              const percent = Math.min(100, Math.round((q.currentProgress / q.targetValue) * 100));
              return (
                <div key={q.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>{q.icon}</span> {q.title}
                    </span>
                    <span className="text-slate-400">
                      {q.currentProgress}/{q.targetValue}
                    </span>
                  </div>
                  <ProgressBar
                    value={percent}
                    height="sm"
                    color={q.completed ? 'green' : 'orange'}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Preview Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600 fill-amber-500" />
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider">
                Gold League
              </h3>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs font-extrabold text-amber-700 hover:underline"
            >
              LEADERBOARD
            </Link>
          </div>
          <p className="text-xs font-bold text-amber-800/80 leading-relaxed mb-3">
            You are competing against other ISL learners! Earn XP in lessons to climb the ranks.
          </p>
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-black">
                #1
              </span>
              <span className="text-xs font-extrabold text-slate-700">Aarav Sharma</span>
            </div>
            <span className="text-xs font-black text-amber-600">850 XP</span>
          </div>
        </div>
      </aside>

      {/* Heart Refill Modal */}
      <Modal
        isOpen={showHeartModal}
        onClose={() => setShowHeartModal(false)}
        title="Hearts"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-500">
            <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">
              {progress.hearts} / {progress.maxHearts} Hearts
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-1">
              Hearts give you chances to answer challenge questions! Lose one for each mistake.
            </p>
          </div>

          {progress.hearts < progress.maxHearts ? (
            <button
              onClick={handleRefillHearts}
              className="btn-duo w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-duo-green border-b-4 border-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> REFILL HEARTS (FREE)
            </button>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 font-extrabold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Your hearts are full!
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
