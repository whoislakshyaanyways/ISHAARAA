'use client';

import { useState, useEffect, useCallback } from 'react';
import { Course } from '@/types';
import { getCourseData, saveCourseData } from '@/lib/storage';

export function useCourse() {
  const [course, setCourse] = useState<Course>(getCourseData());
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setCourse(getCourseData());
  }, []);

  useEffect(() => {
    setCourse(getCourseData());
    setIsLoaded(true);

    const handleCourseUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Course>;
      if (customEvent.detail) {
        setCourse(customEvent.detail);
      } else {
        setCourse(getCourseData());
      }
    };

    window.addEventListener('course-data-updated', handleCourseUpdate);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('course-data-updated', handleCourseUpdate);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return {
    course,
    isLoaded,
    updateCourse: saveCourseData,
    refresh,
  };
}
