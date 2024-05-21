import { useMemo } from 'react';
import type { LessonDTO } from '../../api/controllers/lessons/lessons.schema';

export const useFilteredLessons = (
  lessons: LessonDTO[] | undefined,
  courseId: number,
  parentLessonId: number | null,
) => {
  return useMemo(() => {
    if (!lessons) return undefined;
    return lessons.filter(
      (lesson) => lesson.courseId === courseId && (parentLessonId ? lesson.id === parentLessonId : true),
    );
  }, [lessons, courseId, parentLessonId]);
};
