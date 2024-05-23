import { useInfiniteQuery } from '@tanstack/react-query';
import { useQuery } from '../../../utils/queries';
import { wordController } from './words.controller';
import type { GetWordsReqDTO, SearchWordReqDTO } from './words.schema';

export const WordQueryKeys = {
  getCourseWords: (query: GetWordsReqDTO) => [
    `word:getCourseWords${query.courseId}`,
    { courseId: query.courseId },
    query,
  ],
  searchWords: (query: Omit<SearchWordReqDTO, 'skip'>) => [`word:searchWords`, query],
};

export const useCourseWords = (query: GetWordsReqDTO) => {
  return useQuery({
    queryFn: () => wordController.getCourseWords(query),
    queryKey: WordQueryKeys.getCourseWords(query),
  });
};

export const useSearchWords = (query: Omit<SearchWordReqDTO, 'skip'>) => {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => wordController.searchWords({ ...query, skip: pageParam ?? 0 }),
    queryKey: WordQueryKeys.searchWords(query),
    staleTime: 1000 * 60,
    retry: false,
    enabled: query.searchValue !== '',
    initialPageParam: 0,
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => Math.max(0, firstPageParam - query.limit),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.isLastPage) return undefined;
      if (lastPage.words.length < query.limit) return undefined;
      return lastPageParam + query.limit;
    },
  });
};
