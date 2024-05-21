import { useQuery } from '../../../utils/queries';
import { wordController } from './lessons.controller';
import type { GetWordsReqDTO } from './words.schema';

const WordQueryKeys = {
  getCourseWords: (query: GetWordsReqDTO) => [
    `word:getCourseWords${query.courseId}`,
    { courseId: query.courseId },
    query,
  ],
};

export const useCourseWords = (query: GetWordsReqDTO) => {
  return useQuery({
    queryFn: () => wordController.getCourseWords(query),
    queryKey: WordQueryKeys.getCourseWords(query),
  });
};
