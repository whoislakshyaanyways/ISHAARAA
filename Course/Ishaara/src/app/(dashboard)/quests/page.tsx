'use client';

import React, { useState, useEffect } from 'react';
import { getQuests, claimQuestReward } from '@/lib/storage';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Quest } from '@/types';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Target, Zap, Gem, CheckCircle, Gift, Sparkles } from 'lucide-react';

export default function QuestsPage() {
  const { progress, refresh } = useUserProgress();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  useEffect(() => {
    setQuests(getQuests());
  }, [progress.xp, progress.completedLessons]);

  const handleClaim = (quest: Quest) => {
    const success = claimQuestReward(quest.id);
    if (success) {
      setQuests(getQuests());
      refresh();
      setClaimedNotice(`Claimed +${quest.rewardXp} XP and +${quest.rewardGems} Gems!`);
      setTimeout(() => setClaimedNotice(null), 3000);
    }
  };

  const dailyQuests = quests.filter((q) => q.type === 'daily');
  const weeklyQuests = quests.filter((q) => q.type === 'weekly');

  return (
    <div className="py-6 max-w-xl mx-auto space-y-6 select-none">
      {/* Quests Header Card */}
      <div className="bg-gradient-to-tr from-rose-500 to-pink-500 rounded-3xl p-6 text-white border-b-4 border-rose-600 shadow-duo-rose flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-rose-700/50 text-rose-100 text-xs font-black uppercase tracking-wider">
              DAILY & WEEKLY GOALS
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Learning Quests</h1>
          <p className="text-xs font-bold text-rose-100/90 mt-1 max-w-sm">
            Complete daily objectives to earn bonus XP and gems for your journey.
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0">
          🎯
        </div>
      </div>

      {/* Claimed Toast Banner */}
      {claimedNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-black text-sm animate-fadeIn">
          <Sparkles className="w-5 h-5 text-emerald-600" /> {claimedNotice}
        </div>
      )}

      {/* Daily Quests Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span> Daily Quests
          </h2>
          <span className="text-xs font-extrabold text-slate-400">Resets Daily</span>
        </div>

        {dailyQuests.map((quest) => {
          const percent = Math.min(100, Math.round((quest.currentProgress / quest.targetValue) * 100));
          const canClaim = quest.completed && !quest.claimed;

          return (
            <div
              key={quest.id}
              className={`p-5 rounded-3xl border-2 transition-all ${
                quest.claimed
                  ? 'bg-slate-50/80 border-slate-200 opacity-75'
                  : canClaim
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-duo-green ring-2 ring-emerald-200'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-2xl flex-shrink-0">
                    {quest.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      {quest.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      {quest.description}
                    </p>
                  </div>
                </div>

                {/* Reward Badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" /> +{quest.rewardXp}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-black text-sky-500 bg-sky-50 px-2 py-1 rounded-xl border border-sky-200">
                    <Gem className="w-3.5 h-3.5 fill-sky-400" /> +{quest.rewardGems}
                  </span>
                </div>
              </div>

              {/* Progress & Claim button */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 mb-1">
                    <span>{quest.claimed ? 'CLAIMED' : quest.completed ? 'COMPLETED' : 'IN PROGRESS'}</span>
                    <span>
                      {quest.currentProgress}/{quest.targetValue}
                    </span>
                  </div>
                  <ProgressBar
                    value={percent}
                    height="sm"
                    color={quest.completed ? 'green' : 'rose'}
                  />
                </div>

                {canClaim && (
                  <button
                    onClick={() => handleClaim(quest)}
                    className="btn-duo py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-duo-green border-b-2 border-emerald-600 flex items-center gap-1.5 flex-shrink-0 animate-bounce"
                  >
                    <Gift className="w-4 h-4" /> CLAIM
                  </button>
                )}

                {quest.claimed && (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-black flex-shrink-0">
                    <CheckCircle className="w-4 h-4" /> DONE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Quests Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>🏆</span> Weekly Quest
          </h2>
          <span className="text-xs font-extrabold text-slate-400">Resets in 5 days</span>
        </div>

        {weeklyQuests.map((quest) => {
          const percent = Math.min(100, Math.round((quest.currentProgress / quest.targetValue) * 100));
          const canClaim = quest.completed && !quest.claimed;

          return (
            <div
              key={quest.id}
              className={`p-5 rounded-3xl border-2 transition-all ${
                quest.claimed
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : canClaim
                  ? 'bg-amber-50 border-amber-300 shadow-duo-yellow ring-2 ring-amber-200'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl flex-shrink-0">
                    {quest.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      {quest.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      {quest.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" /> +{quest.rewardXp}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-black text-sky-500 bg-sky-50 px-2 py-1 rounded-xl border border-sky-200">
                    <Gem className="w-3.5 h-3.5 fill-sky-400" /> +{quest.rewardGems}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 mb-1">
                    <span>{quest.claimed ? 'CLAIMED' : quest.completed ? 'COMPLETED' : 'PROGRESS'}</span>
                    <span>
                      {quest.currentProgress}/{quest.targetValue}
                    </span>
                  </div>
                  <ProgressBar
                    value={percent}
                    height="sm"
                    color={quest.completed ? 'yellow' : 'blue'}
                  />
                </div>

                {canClaim && (
                  <button
                    onClick={() => handleClaim(quest)}
                    className="btn-duo py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-duo-yellow border-b-2 border-amber-600 flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Gift className="w-4 h-4" /> CLAIM
                  </button>
                )}

                {quest.claimed && (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-black flex-shrink-0">
                    <CheckCircle className="w-4 h-4" /> DONE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
