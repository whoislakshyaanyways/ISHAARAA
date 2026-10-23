'use client';

import React from 'react';
import { Course } from '@/types';
import { useUserProgress } from '@/hooks/useUserProgress';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Award, BookOpen } from 'lucide-react';

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const { progress } = useUserProgress();

  // Calculate total course completion percentage
  let totalLessons = 0;
  let completedLessonsCount = 0;

  course.units.forEach((u) => {
    u.lessons.forEach((l) => {
      totalLessons += 1;
      if (progress.completedLessons?.[l.id]?.completed) {
        completedLessonsCount += 1;
      }
    });
  });

  const percentage = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 mb-8 border-2 border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Course Info */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-duo-green shrink-0">
            {course.imageSrc || '🤟'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider shrink-0">
                ACTIVE COURSE
              </span>
              <span className="text-xs font-bold text-slate-400 shrink-0">
                {course.units.length} Units • {totalLessons} Lessons
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate">
              {course.title}
            </h1>
            <p className="text-xs font-bold text-slate-500 truncate mt-0.5">
              {course.description}
            </p>
          </div>
        </div>

        {/* Right Progress Card */}
        <div className="w-full sm:w-44 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-black text-slate-600 mb-1.5">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Progress
            </span>
            <span className="text-emerald-600 font-extrabold">
              {completedLessonsCount}/{totalLessons}
            </span>
          </div>
          <ProgressBar value={percentage} height="sm" color="green" />
        </div>
      </div>
    </div>
  );
};
