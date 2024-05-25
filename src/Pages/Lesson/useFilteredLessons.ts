import { useMemo } from 'react';
import type { LessonDTO } from '../../api/controllers/lessons/lessons.schema';

export const useFilteredLessons = (
  lessons: LessonDTO[] | undefined,
  courseId: number,
  parentLessonId: number | null,
  includeParent = false,
  includeAllDescendants = false,
) => {
  return useMemo(() => {
    if (!lessons) return undefined;
    return filterLessons(lessons, courseId, parentLessonId, includeParent, includeAllDescendants);
  }, [lessons, courseId, parentLessonId, includeParent, includeAllDescendants]);
};

export const filterLessons = (
  lessons: LessonDTO[],
  courseId: number,
  parentLessonId: number | null,
  includeParent: boolean,
  includeAllDescendants: boolean,
): LessonDTO[] => {
  const filtered = lessons.filter((lesson) => {
    if (lesson.courseId !== courseId) return false;
    if (includeParent && lesson.id === parentLessonId) return true;
    return lesson.parentLessonId === parentLessonId;
  });

  if (!includeAllDescendants) return filtered;

  const allDescendants = filtered.filter((e) => e.parentLessonId === parentLessonId).map((e) => e.id);
  return filtered.concat(allDescendants.map((e) => filterLessons(lessons, courseId, e, false, true)).flat());
};
