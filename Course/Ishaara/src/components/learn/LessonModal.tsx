'use client';

import React from 'react';
import Link from 'next/link';
import { Lesson, UserLessonProgress } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Zap, CheckCircle2, Star, Play, RotateCcw, Lock } from 'lucide-react';

interface LessonModalProps {
  lesson: Lesson | null;
  progress: UserLessonProgress | undefined;
  isUnlocked: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  progress,
  isUnlocked,
  isOpen,
  onClose,
}) => {
  if (!lesson) return null;

  const isCompleted = progress?.completed;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center py-2 space-y-4 select-none">
        {/* Type icon header */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-emerald-400 mx-auto flex items-center justify-center text-white text-3xl shadow-duo-green">
          {lesson.type === 'boss' ? '🛡️' : lesson.type === 'checkpoint' ? '⭐' : '🤟'}
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-1">
            {lesson.type === 'boss'
              ? 'BOSS CHALLENGE'
              : lesson.type === 'checkpoint'
              ? 'CHECKPOINT QUIZ'
              : `LESSON ${lesson.order}`}
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {lesson.title}
          </h3>
          <p className="text-sm font-bold text-slate-500 mt-1 max-w-xs mx-auto">
            {lesson.description}
          </p>
        </div>

        {/* Reward & Progress stats */}
        <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-100">
          <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-sm">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>+{lesson.xpReward} XP</span>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{progress?.score || 100}% Accuracy</span>
            </div>
          )}

          {progress?.stars && (
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: progress.stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
          )}
        </div>

        {/* Action button */}
        {isUnlocked ? (
          <Link
            href={`/lesson/${lesson.id}`}
            className="btn-duo w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base tracking-wider rounded-2xl shadow-duo-green border-b-4 border-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-5 h-5" /> PRACTICE AGAIN
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" /> START +{lesson.xpReward} XP
              </>
            )}
          </Link>
        ) : (
          <div className="w-full py-3.5 px-6 bg-slate-200 text-slate-500 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Complete previous lessons to unlock
          </div>
        )}
      </div>
    </Modal>
  );
};
