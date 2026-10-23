'use client';

import React, { useState } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useCourse } from '@/hooks/useCourse';
import { getAchievements, saveUserProgress } from '@/lib/storage';
import { formatNumber, getDaysOfWeek } from '@/lib/utils';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Modal } from '@/components/common/Modal';
import { 
  Flame, 
  Zap, 
  Gem, 
  Target, 
  CheckCircle2, 
  Trophy, 
  Sparkles,
  Calendar,
  Edit2
} from 'lucide-react';

const AVATAR_OPTIONS = ['🚀', '👨‍🎓', '👩‍🏫', '🧑‍💻', '👩‍🎨', '🧗', '🧕', '🧑‍🚀', '👑', '✨', '🤟', '🌸'];

export default function ProfilePage() {
  const { progress, refresh } = useUserProgress();
  const { course } = useCourse();
  const achievements = getAchievements();
  const daysOfWeek = getDaysOfWeek();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [userName, setUserName] = useState(progress.name);
  const [isEditingName, setIsEditingName] = useState(false);

  // Compute stats
  const completedLessonsCount = Object.keys(progress.completedLessons || {}).length;
  let totalLessonsCount = 0;
  course.units.forEach((u) => {
    totalLessonsCount += u.lessons.length;
  });

  const accuracyArray = Object.values(progress.completedLessons || {}).map((l) => l.score);
  const avgAccuracy = accuracyArray.length > 0
    ? Math.round(accuracyArray.reduce((a, b) => a + b, 0) / accuracyArray.length)
    : 100;

  const handleSelectAvatar = (avatar: string) => {
    saveUserProgress({
      ...progress,
      avatar,
    });
    refresh();
    setShowAvatarModal(false);
  };

  const handleSaveName = () => {
    if (userName.trim()) {
      saveUserProgress({
        ...progress,
        name: userName.trim(),
      });
      refresh();
    }
    setIsEditingName(false);
  };

  return (
    <div className="py-6 max-w-xl mx-auto space-y-6 select-none">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          {/* Avatar button */}
          <button
            onClick={() => setShowAvatarModal(true)}
            className="relative group w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-sm hover:scale-105 transition-transform"
            title="Change Avatar"
          >
            <span>{progress.avatar || '🚀'}</span>
            <div className="absolute inset-0 bg-black/30 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Edit2 className="w-5 h-5" />
            </div>
          </button>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="px-3 py-1.5 border-2 border-emerald-500 rounded-xl text-lg font-black text-slate-800 outline-none w-full max-w-[200px]"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-1.5 bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-duo-green"
                >
                  SAVE
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight truncate">
                  {progress.name}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              ISL Explorer • Active Learner
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase">
                Gold League
              </span>
              <span className="text-xs font-bold text-slate-500">
                Joined ISL Lingo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Statistics Grid */}
      <div>
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider mb-3 px-1">
          Learning Statistics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total XP */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center">
            <Zap className="w-6 h-6 fill-amber-400 text-amber-500 mb-1" />
            <span className="text-xl font-black text-slate-800">{formatNumber(progress.xp)}</span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">TOTAL XP</span>
          </div>

          {/* Current Streak */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center">
            <Flame className="w-6 h-6 fill-orange-500 text-orange-500 mb-1" />
            <span className="text-xl font-black text-slate-800">{progress.streak} Days</span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">STREAK</span>
          </div>

          {/* Accuracy */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center">
            <Target className="w-6 h-6 text-emerald-600 mb-1" />
            <span className="text-xl font-black text-slate-800">{avgAccuracy}%</span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">ACCURACY</span>
          </div>

          {/* Lessons Done */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center">
            <CheckCircle2 className="w-6 h-6 text-sky-600 mb-1" />
            <span className="text-xl font-black text-slate-800">
              {completedLessonsCount}/{totalLessonsCount}
            </span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">COMPLETED</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Calendar Card */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-black text-slate-800">Weekly Activity</h3>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {daysOfWeek.map((day) => {
            const isDone = progress.activeDays?.includes(day.dateStr);
            return (
              <div
                key={day.dateStr}
                className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <span className="text-xs font-black text-slate-500">{day.dayName}</span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                    isDone
                      ? 'bg-orange-500 text-white shadow-duo-orange ring-2 ring-orange-200'
                      : day.isToday
                      ? 'border-2 border-orange-400 text-orange-600 bg-orange-50'
                      : 'bg-slate-200/60 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : day.isToday ? '•' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" /> Achievements
          </h2>
          <span className="text-xs font-extrabold text-slate-400">
            {achievements.filter((a) => a.unlocked).length}/{achievements.length} Unlocked
          </span>
        </div>

        <div className="space-y-3">
          {achievements.map((ach) => {
            const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-3xl border-2 transition-all ${
                  ach.unlocked
                    ? 'bg-white border-amber-200 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                      ach.unlocked
                        ? 'bg-amber-100 border border-amber-300 ring-2 ring-amber-200'
                        : 'bg-slate-200 border border-slate-300 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-800 truncate">
                        {ach.title}
                      </h4>
                      <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex-shrink-0">
                        <Zap className="w-3 h-3 fill-amber-400" /> +{ach.rewardXp} XP
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      {ach.description}
                    </p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-black text-slate-500 mb-1">
                        <span>{ach.unlocked ? 'COMPLETED' : 'PROGRESS'}</span>
                        <span>
                          {ach.progress}/{ach.maxProgress}
                        </span>
                      </div>
                      <ProgressBar
                        value={percent}
                        height="sm"
                        color={ach.unlocked ? 'yellow' : 'blue'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Choose Your Avatar"
        maxWidth="sm"
      >
        <div className="grid grid-cols-4 gap-3 py-2">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => handleSelectAvatar(avatar)}
              className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl transition-transform hover:scale-110 active:scale-95 ${
                progress.avatar === avatar
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
