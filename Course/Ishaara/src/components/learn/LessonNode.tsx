'use client';

import React from 'react';
import { Check, Star, Lock, Crown, Shield } from 'lucide-react';
import { Lesson, UserLessonProgress } from '@/types';
import { cn } from '@/lib/utils';

interface LessonNodeProps {
  lesson: Lesson;
  progress: UserLessonProgress | undefined;
  isUnlocked: boolean;
  isCurrent: boolean;
  index: number;
  onSelect: (lesson: Lesson) => void;
}

export const LessonNode: React.FC<LessonNodeProps> = ({
  lesson,
  progress,
  isUnlocked,
  isCurrent,
  index,
  onSelect,
}) => {
  const isCompleted = !!progress?.completed;
  const isPerfect = !!progress?.perfect;

  // Calculate winding serpentine offset pattern
  // Pattern sequence: [0, -45, -75, -45, 0, 45, 75, 45]
  const offsets = [0, -45, -75, -45, 0, 45, 75, 45];
  const offsetPx = offsets[index % offsets.length];

  return (
    <div
      className="relative flex flex-col items-center my-6 select-none transition-transform"
      style={{ transform: `translateX(${offsetPx}px)` }}
    >
      {/* "START" floating speech bubble for the current active lesson */}
      {isCurrent && !isCompleted && (
        <div className="absolute -top-11 z-20 animate-bounce">
          <div className="relative bg-emerald-500 text-white text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-duo-green tracking-wider uppercase flex items-center gap-1">
            <span>START</span>
            <span className="text-amber-200">+{lesson.xpReward} XP</span>
            {/* Bubble triangle pointer */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rotate-45" />
          </div>
        </div>
      )}

      {/* 3D Circular Node Button */}
      <button
        onClick={() => onSelect(lesson)}
        disabled={!isUnlocked}
        className={cn(
          'relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150',
          // Locked
          !isUnlocked &&
            'bg-slate-200 border-b-[6px] border-slate-300 text-slate-400 cursor-not-allowed shadow-none',
          // Completed
          isCompleted &&
            'bg-emerald-500 border-b-[6px] border-emerald-600 text-white shadow-duo-green hover:bg-emerald-400 active:translate-y-1 active:border-b-2',
          // Current (unlocked & not completed)
          isUnlocked &&
            !isCompleted &&
            isCurrent &&
            'bg-emerald-500 border-b-[6px] border-emerald-600 text-white shadow-duo-green animate-current-node active:translate-y-1 active:border-b-2',
          // Unlocked but not current (e.g. earlier skipped or unlocked ahead)
          isUnlocked &&
            !isCompleted &&
            !isCurrent &&
            'bg-sky-500 border-b-[6px] border-sky-600 text-white shadow-duo-blue hover:bg-sky-400 active:translate-y-1 active:border-b-2'
        )}
      >
        {/* Top inner gloss reflection */}
        <div className="absolute top-1.5 left-3 right-3 h-4 bg-white/25 rounded-full pointer-events-none" />

        {/* Node Icon / State */}
        {!isUnlocked ? (
          <Lock className="w-8 h-8 stroke-[2.5]" />
        ) : isCompleted ? (
          isPerfect ? (
            <div className="flex flex-col items-center">
              <Crown className="w-8 h-8 fill-amber-300 text-amber-200" />
            </div>
          ) : (
            <Check className="w-9 h-9 stroke-[3.5]" />
          )
        ) : lesson.type === 'boss' ? (
          <Shield className="w-8 h-8 fill-white/80" />
        ) : lesson.type === 'checkpoint' ? (
          <Star className="w-8 h-8 fill-white/80" />
        ) : (
          <span className="text-2xl font-black">🤟</span>
        )}
      </button>

      {/* Lesson Title Label */}
      <div className="mt-2 text-center max-w-[120px]">
        <span
          className={cn(
            'text-xs font-black tracking-tight leading-tight block',
            !isUnlocked ? 'text-slate-400' : 'text-slate-700'
          )}
        >
          {lesson.title}
        </span>
      </div>
    </div>
  );
};
