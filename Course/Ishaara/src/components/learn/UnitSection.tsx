'use client';

import React, { useState } from 'react';
import { Unit, Lesson, UserProgress } from '@/types';
import { LessonNode } from './LessonNode';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { cn } from '@/lib/utils';

interface UnitSectionProps {
  unit: Unit;
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
}

export const UnitSection: React.FC<UnitSectionProps> = ({
  unit,
  progress,
  onSelectLesson,
}) => {
  const [showGuidebook, setShowGuidebook] = useState(false);

  // Unit gradient themes
  const colorSchemes = {
    green: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-600',
      shadow: 'shadow-duo-green',
      badge: 'bg-emerald-700/50 text-emerald-100',
      guideBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    blue: {
      bg: 'bg-sky-500',
      border: 'border-sky-600',
      shadow: 'shadow-duo-blue',
      badge: 'bg-sky-700/50 text-sky-100',
      guideBtn: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
    purple: {
      bg: 'bg-purple-500',
      border: 'border-purple-600',
      shadow: 'shadow-duo-purple',
      badge: 'bg-purple-700/50 text-purple-100',
      guideBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    orange: {
      bg: 'bg-orange-500',
      border: 'border-orange-600',
      shadow: 'shadow-duo-orange',
      badge: 'bg-orange-700/50 text-orange-100',
      guideBtn: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
    yellow: {
      bg: 'bg-amber-500',
      border: 'border-amber-600',
      shadow: 'shadow-duo-yellow',
      badge: 'bg-amber-700/50 text-amber-100',
      guideBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    rose: {
      bg: 'bg-rose-500',
      border: 'border-rose-600',
      shadow: 'shadow-duo-rose',
      badge: 'bg-rose-700/50 text-rose-100',
      guideBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    emerald: {
      bg: 'bg-emerald-600',
      border: 'border-emerald-700',
      shadow: 'shadow-duo-green',
      badge: 'bg-emerald-800/50 text-emerald-100',
      guideBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    },
  };

  const scheme = colorSchemes[unit.color] || colorSchemes.green;

  // Determine current lesson
  const unlockedLessons = progress.unlockedLessons || ['u1-l1'];
  const completedLessons = progress.completedLessons || {};

  return (
    <section className="mb-14 relative select-none">
      {/* Unit Header Card */}
      <div
        className={cn(
          'relative rounded-3xl p-6 text-white border-b-4 mb-8 transition-all',
          scheme.bg,
          scheme.border,
          scheme.shadow
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-flex items-center gap-1',
                  scheme.badge
                )}
              >
                <span>{unit.icon || '📖'}</span> UNIT {unit.order}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{unit.title}</h2>
            <p className="text-sm font-bold text-white/90 mt-1 max-w-md">
              {unit.description}
            </p>
          </div>

          <button
            onClick={() => setShowGuidebook(true)}
            className={cn(
              'btn-duo flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs tracking-wider uppercase shadow-sm border border-white/20 flex-shrink-0',
              scheme.guideBtn
            )}
          >
            <BookOpen className="w-4 h-4" /> GUIDEBOOK
          </button>
        </div>
      </div>

      {/* Vertical Winding Path of Lesson Nodes */}
      <div className="relative flex flex-col items-center py-4">
        {unit.lessons.map((lesson, idx) => {
          const isUnlocked = unlockedLessons.includes(lesson.id);
          const isCompleted = !!completedLessons[lesson.id]?.completed;
          // Current is the first unlocked but not completed lesson
          const isCurrent = isUnlocked && !isCompleted;

          return (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              progress={completedLessons[lesson.id]}
              isUnlocked={isUnlocked}
              isCurrent={isCurrent}
              index={idx}
              onSelect={onSelectLesson}
            />
          );
        })}
      </div>

      {/* Guidebook Modal */}
      <Modal
        isOpen={showGuidebook}
        onClose={() => setShowGuidebook(false)}
        title={`${unit.title} — Guidebook`}
        maxWidth="lg"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm font-bold text-slate-600">
            Key signs and tips for mastering this unit in Indian Sign Language:
          </p>

          <div className="space-y-3">
            {unit.lessons.map((l, i) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800">{l.title}</h4>
                </div>
                <p className="text-xs text-slate-600 font-medium pl-8">
                  {l.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800">
              <strong>Tip for ISL Learners:</strong> In Indian Sign Language, facial expressions and head nods are essential parts of grammar. Always watch the signer&apos;s face along with hand motions!
            </p>
          </div>
        </div>
      </Modal>
    </section>
  );
};
