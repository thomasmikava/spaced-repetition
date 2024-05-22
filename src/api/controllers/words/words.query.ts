import { useQuery } from '../../../utils/queries';
import { wordController } from './words.controller';
import type { GetWordsReqDTO, SearchWordReqDTO } from './words.schema';

const WordQueryKeys = {
  getCourseWords: (query: GetWordsReqDTO) => [
    `word:getCourseWords${query.courseId}`,
    { courseId: query.courseId },
    query,
  ],
  searchWords: (query: SearchWordReqDTO) => [`word:searchWords`, query],
};

export const useCourseWords = (query: GetWordsReqDTO) => {
  return useQuery({
    queryFn: () => wordController.getCourseWords(query),
    queryKey: WordQueryKeys.getCourseWords(query),
  });
};

export const useSearchWords = (query: SearchWordReqDTO) => {
  return useQuery({
    queryFn: () => wordController.searchWords(query),
    queryKey: WordQueryKeys.searchWords(query),
    staleTime: 1000 * 60,
    retry: false,
    enabled: query.searchValue !== '',
  });
};
