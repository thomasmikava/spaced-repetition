import { useMemo } from 'react';
import { useWordIds } from './words.query';
import { arrayToObject, groupArray, uniquelize } from '../../../utils/array';
import { PreviousReviews } from '../../../functions/previous-reviews';
import type { GetLessonsResDTO, LessonDTO } from '../lessons/lessons.schema';
import { ReviewBlock } from '../history/history.schema';

export interface WordStatistics {
  totalWords: number;
  totalViewedWords: number;
  dueReviewWords: number;
}

export interface CourseWordStatistics {
  stats: WordStatistics;
  lessons: Record<number, WordStatistics>;
}

export interface TotalWordStatistics {
  total: WordStatistics;
  courses: Record<number, CourseWordStatistics | undefined>;
}

export const useWordsStats = (
  {
    courseId,
    lessonId,
    lessons,
    block = ReviewBlock.standard,
  }: {
    block?: number;
    courseId?: number;
    lessonId?: number;
    lessons?: GetLessonsResDTO;
  } = { block: ReviewBlock.standard },
): TotalWordStatistics | null => {
  const { data: wordsInfo } = useWordIds({ courseId, lessonId });

  return useMemo((): TotalWordStatistics | null => {
    if (!wordsInfo) return null;
    const mapLessonIdToParentLessonId = getLessonIdMapper(lessonId, lessons);
    const words = wordsInfo.flatMap((courseInfo) =>
      courseInfo.lessons.flatMap((lesson) =>
        lesson.words
          .filter((w) => !w.h)
          .map((w) => ({ id: w.id, courseId: courseInfo.courseId, lessonId: mapLessonIdToParentLessonId(lesson.id) })),
      ),
    );
    const prevReviews = new PreviousReviews();

    const courseStats = groupArray(
      words,
      (w) => w.courseId,
      (courseWords, courseId) => {
        const courseStats = countStats(
          block,
          courseWords.map((w) => w.id),
          prevReviews,
        );
        const lessonStats = groupArray(
          courseWords,
          (w) => w.lessonId,
          (lessonWords, lessonId) => {
            const lessonStats = countStats(
              block,
              lessonWords.map((w) => w.id),
              prevReviews,
            );
            return [lessonId, lessonStats] as const;
          },
        );
        const lessonStatsObject: Record<number, WordStatistics> = Object.fromEntries(lessonStats);
        const courseStat: CourseWordStatistics = { stats: courseStats, lessons: lessonStatsObject };
        return [courseId, courseStat] as const;
      },
    );
    const courseStatsObject: Record<number, CourseWordStatistics | undefined> = Object.fromEntries(courseStats);

    return {
      total: countStats(
        block,
        words.map((w) => w.id),
        prevReviews,
      ),
      courses: courseStatsObject,
    };
  }, [block, wordsInfo, lessonId, lessons]);
};

const getLessonIdMapper = (
  lessonId: number | undefined,
  lessons: GetLessonsResDTO | undefined,
): ((id: number) => number) => {
  if (!lessons) return (id: number) => id;

  const lessonsByIds = arrayToObject(lessons, 'id');

  const childTree = new Map<number | null, LessonDTO[]>();
  for (const lesson of lessons) {
    const parentId = lesson.parentLessonId;
    const parentRecord = childTree.get(parentId);
    if (parentRecord === undefined) {
      childTree.set(parentId, [lesson]);
    } else {
      parentRecord.push(lesson);
    }
  }

  const myLessonChildren = childTree.get(lessonId ?? null);
  const myLessonChildrenIds = new Set(myLessonChildren?.map((l) => l.id) ?? []);

  const cache = new Map<number, number>();
  return (id: number): number => {
    if (cache.has(id)) return cache.get(id)!;
    if (id === lessonId || myLessonChildrenIds.has(id)) {
      cache.set(id, id);
      return id;
    }

    let currentId: number | null = id;
    let parentId = lessonsByIds[currentId]?.parentLessonId;
    while (parentId !== null && parentId !== undefined) {
      if (parentId === lessonId || myLessonChildrenIds.has(parentId)) {
        cache.set(id, parentId);
        return parentId;
      }
      currentId = parentId;
      parentId = lessonsByIds[currentId]?.parentLessonId;
    }

    cache.set(id, id);
    return id;
  };
};

const countStats = (
  block: number,
  wordIds: number[],
  prevReviews: PreviousReviews,
  accordingToDate = new Date(),
): WordStatistics => {
  const uniqueWordIds = uniquelize(wordIds);
  const dueDateSec = Math.floor(accordingToDate.getTime() / 1000);

  const totalWords = uniqueWordIds.length;
  let totalViewedWords = 0;
  let dueReviewWords = 0;
  for (const wordId of uniqueWordIds) {
    const closestDueDate = prevReviews.getClosestDueDate(block, wordId);
    if (closestDueDate === null) continue;
    totalViewedWords++;
    if (closestDueDate <= dueDateSec && closestDueDate !== Infinity) {
      dueReviewWords++;
    }
  }
  return { totalWords, totalViewedWords, dueReviewWords };
};
