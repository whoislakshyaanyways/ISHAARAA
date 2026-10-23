'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Zap, Target, Star, Heart, RotateCcw, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Lesson } from '@/types';

interface LessonCompleteProps {
  lesson: Lesson;
  earnedXp: number;
  accuracy: number;
  stars: number;
  heartsRemaining: number;
  unlockedNextId: string | null;
  onPracticeAgain: () => void;
}

export const LessonComplete: React.FC<LessonCompleteProps> = ({
  lesson,
  earnedXp,
  accuracy,
  stars,
  heartsRemaining,
  unlockedNextId,
  onPracticeAgain,
}) => {
  const router = useRouter();

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#0ea5e9', '#eab308', '#f97316', '#a855f7'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
        {/* Celebration Trophy / Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-5xl shadow-duo-yellow animate-bounce">
          🎉
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> LESSON COMPLETED
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Outstanding Work!
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">
            You just learned key Indian Sign Language signs in <span className="text-slate-800 font-extrabold">{lesson.title}</span>!
          </p>
        </div>

        {/* Gamification Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* XP */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Zap className="w-6 h-6 fill-amber-400 text-amber-500 mb-1" />
            <span className="text-xs font-black text-amber-600 uppercase tracking-wider">TOTAL XP</span>
            <span className="text-2xl font-black text-amber-900">+{earnedXp}</span>
          </div>

          {/* Accuracy */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Target className="w-6 h-6 text-emerald-600 mb-1" />
            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">ACCURACY</span>
            <span className="text-2xl font-black text-emerald-900">{accuracy}%</span>
          </div>

          {/* Stars */}
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-0.5 mb-1 text-sky-500">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < stars ? 'fill-sky-500 text-sky-500' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-black text-sky-600 uppercase tracking-wider">STARS</span>
            <span className="text-2xl font-black text-sky-900">{stars}/3</span>
          </div>
        </div>

        {/* Unlocked notification */}
        {unlockedNextId && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-black text-sm">
            <Sparkles className="w-5 h-5 text-emerald-600" /> Next Lesson Unlocked on Pathway!
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => router.push('/learn')}
            className="btn-duo w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base tracking-wider rounded-2xl shadow-duo-green border-b-4 border-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            CONTINUE PATHWAY <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onPracticeAgain}
            className="btn-duo w-full py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> PRACTICE AGAIN
          </button>
        </div>
      </div>
    </div>
  );
};
