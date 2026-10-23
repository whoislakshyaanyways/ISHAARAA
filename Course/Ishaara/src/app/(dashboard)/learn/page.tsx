'use client';

import React, { useState } from 'react';
import { useCourse } from '@/hooks/useCourse';
import { useUserProgress } from '@/hooks/useUserProgress';
import { CourseHeader } from '@/components/learn/CourseHeader';
import { UnitSection } from '@/components/learn/UnitSection';
import { LessonModal } from '@/components/learn/LessonModal';
import { Lesson } from '@/types';

export default function LearnPage() {
  const { course, isLoaded: courseLoaded } = useCourse();
  const { progress, isLoaded: progressLoaded } = useUserProgress();

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  if (!courseLoaded || !progressLoaded) {
    return (
      <div className="py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-extrabold text-slate-500">Loading your ISL pathway...</p>
      </div>
    );
  }

  const isUnlocked = selectedLesson
    ? progress.unlockedLessons.includes(selectedLesson.id)
    : false;

  const lessonProgress = selectedLesson
    ? progress.completedLessons?.[selectedLesson.id]
    : undefined;

  return (
    <div className="py-6 max-w-xl mx-auto">
      {/* Course Top Banner */}
      <CourseHeader course={course} />

      {/* Course Unit Sections */}
      <div className="space-y-4">
        {course.units.map((unit) => (
          <UnitSection
            key={unit.id}
            unit={unit}
            progress={progress}
            onSelectLesson={handleSelectLesson}
          />
        ))}
      </div>

      {/* Lesson Popover Modal */}
      <LessonModal
        lesson={selectedLesson}
        progress={lessonProgress}
        isUnlocked={isUnlocked}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
