import { useInfiniteQuery } from '@tanstack/react-query';
import { queryClient, useQuery } from '../../../utils/queries';
import { wordController } from './words.controller';
import type {
  GetLanguageDictionaryReqDTO,
  GetWordIdsReqDTO,
  GetWordIdsResDTO,
  GetWordsReqDTO,
  SearchWordReqDTO,
} from './words.schema';
import { useMemo } from 'react';
import { getCourseLessonsOffline } from '../lessons/lessons.query';

export const WordQueryKeys = {
  getCourseWords: (query: GetWordsReqDTO) => [
    `word:getCourseWords${query.courseId}`,
    { courseId: query.courseId },
    query,
  ],
  getMyCoursesWords: () => [`word:my-courses`],
  searchWords: (query: Omit<SearchWordReqDTO, 'skip'>) => [`word:searchWords`, query],
  getWordIds: (query: GetWordIdsReqDTO) => [
    `word:searchWords`,
    { courseId: query.courseId ?? null, lessonId: query.lessonId ?? null },
  ],
  getDictionary: (query: GetLanguageDictionaryReqDTO) => [`word:lang`, query],
};

export const useCourseWords = (query: GetWordsReqDTO, avoid = false) => {
  return useQuery({
    queryFn: () => wordController.getCourseWords(query),
    queryKey: WordQueryKeys.getCourseWords(query),
    enabled: !avoid,
  });
};
export const useMyCoursesWords = (avoid = false) => {
  return useQuery({
    queryFn: () => wordController.getMyMainCoursesWords(),
    queryKey: WordQueryKeys.getMyCoursesWords(),
    enabled: !avoid,
  });
};
export const useDictionary = (lang: string | undefined | null) => {
  return useQuery({
    queryFn: () => wordController.getDictionary({ lang: lang as string }),
    queryKey: WordQueryKeys.getDictionary({ lang: lang as string }),
    enabled: !!lang,
  });
};

export const useWordIds = (query: GetWordIdsReqDTO, avoid = false) => {
  const previousDataset = useMemo(() => {
    if (query.courseId && !query.lessonId) {
      const oldDataSet = queryClient.getQueryState<GetWordIdsResDTO>(WordQueryKeys.getWordIds({}));
      if (oldDataSet && oldDataSet.data) {
        return {
          data: oldDataSet.data.filter((course) => course.courseId === query.courseId),
          dataUpdatedAt: oldDataSet.dataUpdatedAt,
        };
      }
    } else if (query.courseId && query.lessonId) {
      const oldDataSet =
        queryClient.getQueryState<GetWordIdsResDTO>(WordQueryKeys.getWordIds({})) ||
        queryClient.getQueryState<GetWordIdsResDTO>(WordQueryKeys.getWordIds({ courseId: query.courseId }));
      if (!oldDataSet || !oldDataSet.data) return undefined;
      const lessons = getCourseLessonsOffline(query.courseId, query.lessonId);
      if (!lessons) return undefined;
      const results = filterWordIds({ courseId: query.courseId, lessonIds: lessons.map((e) => e.id) }, oldDataSet.data);
      return { data: results, dataUpdatedAt: oldDataSet.dataUpdatedAt };
    }
    return undefined;
  }, [query.courseId, query.lessonId]);

  return useQuery({
    queryFn: () => wordController.getWordIds(query),
    queryKey: WordQueryKeys.getWordIds(query),
    enabled: !avoid,
    initialData: () => previousDataset?.data,
    initialDataUpdatedAt: () => previousDataset?.dataUpdatedAt,
  });
};

const filterWordIds = (query: { courseId: number; lessonIds: number[] }, data: GetWordIdsResDTO): GetWordIdsResDTO => {
  const myCourse = data.find((course) => course.courseId === query.courseId);
  if (!myCourse) return [];
  const lessons = myCourse.lessons.filter((lesson) => query.lessonIds.includes(lesson.id));
  return [
    {
      courseId: query.courseId,
      lessons,
    },
  ];
};

export const useSearchWords = (query?: Omit<SearchWordReqDTO, 'skip'>) => {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => wordController.searchWords({ ...query!, skip: pageParam ?? 0 }),
    queryKey: WordQueryKeys.searchWords(query!),
    staleTime: 1000 * 60,
    retry: false,
    enabled: !!query && query.searchValue !== '',
    initialPageParam: 0,
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => Math.max(0, firstPageParam - query!.limit),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.isLastPage) return undefined;
      if (lastPage.words.length < query!.limit) return undefined;
      return lastPageParam + query!.limit;
    },
  });
};
