import { useMemo } from 'react';
import { useMyCoursesWords, useCourseWords } from '../../api/controllers/words/words.query';
import type {
  WordWithTranslationAndLessonsAndVariantsDTO,
  WordWithTranslationVariantsDTO,
} from '../../api/controllers/words/words.schema';
import type { StandardCard } from '../../database/types';

export const useWords = ({ courseId, lessonId }: { courseId: number | undefined; lessonId: number | undefined }) => {
  const isCourseKnown = courseId !== undefined;
  const result1 = useMyCoursesWords(isCourseKnown);
  const result2 = useCourseWords({ courseId: courseId as number, lessonId, includeVariants: true }, !isCourseKnown);
  const result = isCourseKnown ? result2 : result1;

  const data = useMemo((): StandardCard[] | undefined => {
    if (!result.data) return undefined;
    return (result.data as WordWithTranslationAndLessonsAndVariantsDTO[]).map(transformToStandardCard); // TODO: sort by course id then by lesson id
  }, [result.data]);

  return { ...result, data };
};

export const transformToStandardCard = (word: WordWithTranslationVariantsDTO): StandardCard => {
  return {
    id: word.id,
    lang: word.lang,
    type: word.type,
    mainType: word.mainType,
    value: word.value,
    attributes: word.attributes,
    labels: word.labels,
    translations: word.translations || [],
    variants: (word.variants || []).map((variant) => ({
      id: variant.id,
      value: variant.value,
      attrs: variant.attrs,
      category: variant.categoryId,
    })),
  };
};
