import { z } from 'zod';
import type { OptionalKeys } from '../../../utils/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
const StandardCardAttributesSchema = z.record(z.number());
export type StandardCardAttributes = Record<string, number>; // key: attribute id, value: attribute record id

export type CardLabelsDTO = number[];

const WordSchema = z.object({
  id: z.number(),
  lang: z.string(),
  type: z.number(),
  mainType: z.number().nullable(),
  value: z.string(),
  attributes: StandardCardAttributesSchema.nullable(),
  userId: z.number().nullable(),
  isOfficial: z.boolean(),
});

export interface WordDTO {
  id: number;
  lang: string;
  type: number;
  mainType: number | null;
  value: string;
  attributes: StandardCardAttributes | null;
  labels?: CardLabelsDTO | null;
  userId: number | null;
  isOfficial: boolean;
}

export interface BaseWordVariantDTO {
  id: number;
  attrs: StandardCardAttributes | null;
  categoryId: number | null;
  value: string;
}
export interface WordVariantDTO extends BaseWordVariantDTO {
  lang: string;
  wordId: number;
  // word type
  wt: number;
  userId: number | null;
  isOfficial: boolean;
}

export interface TranslationDTO {
  id: number;
  lang: string;
  wordId: number;
  translation: string;
  advancedTranslation: any[] | null;
  userId: number | null;
  isMain: boolean;
}

export const WordWithTranslationSchema = WordSchema.extend({
  translation: z.string().optional().nullable(),
  advancedTranslation: z.array(z.any()).optional().nullable(),
});
export type WordWithTranslationDTO = WordDTO & {
  translation?: TranslationDTO['translation'] | null;
  advancedTranslation?: TranslationDTO['advancedTranslation'] | null;
};

export type WordWithTranslationAndLessonsDTO = WordWithTranslationDTO & {
  relations: { courseId: number; lessonId: number }[];
};

export type WordWithTranslationAndLessonsAndVariantsDTO = WordWithTranslationAndLessonsDTO & {
  variants: BaseWordVariantDTO[];
};
export type WordWithTranslationVariantsDTO = WordWithTranslationDTO & {
  variants: BaseWordVariantDTO[];
};

///

export interface GetWordsReqDTO {
  courseId: number;
  lessonId?: number;
  includeVariants?: boolean;
}

export type GetWordsResDTO = OptionalKeys<WordWithTranslationAndLessonsAndVariantsDTO, 'variants'>[];

///

export type GetMyCoursesWordsResDTO = WordWithTranslationAndLessonsAndVariantsDTO[];

///
export interface GetLanguageDictionaryReqDTO {
  lang: string;
}
export type GetLanguageDictionaryResDTO = WordWithTranslationVariantsDTO[];

///

export interface GetOneWordReqDTO {
  id: number;
  translationLang?: string | null;
  onlyOfficialTranslation?: boolean;
  includeAllOfficialTranslations?: boolean;
}
export type GetOneWordResDTO = WordWithTranslationVariantsDTO & {
  officialTranslations?: TranslationDTO[];
};

///

export interface GetWordIdsReqDTO {
  courseId?: number;
  lessonId?: number;
}

type LessonWorIdsDTO = { id: number; words: { id: number; /** hidden */ h?: boolean }[] };
export type CourseWordIdsDTO = {
  courseId: number;
  lessons: LessonWorIdsDTO[];
};
export type GetWordIdsResDTO = CourseWordIdsDTO[];

///

export interface SearchWordReqDTO {
  searchValue: string;
  wordType?: number;
  lang: string;
  translationLang: string;
  limit: number;
  skip: number;
}

export interface SearchWordResDTO {
  words: WordWithTranslationDTO[];
  isLastPage: boolean;
}

///
type CreateStandardCardVariantDTO = {
  attrs?: StandardCardAttributes | null;
  category?: number | null;
  value: string;
};

interface CreateWordDTO {
  lang: string;
  type: number;
  mainType?: number | null;
  value: string;
  attributes?: StandardCardAttributes | null;
  labels?: CardLabelsDTO | null;
  isOfficial: boolean;
  variants: CreateStandardCardVariantDTO[];
  variantsIncludeTopCard: boolean;
  translation: {
    lang: string;
    translation: string;
    advancedTranslation?: any[] | null;
  };
}

export type CreateManyWordsDTO = CreateWordDTO[];
