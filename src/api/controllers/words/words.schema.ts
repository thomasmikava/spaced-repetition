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

export type WordUsageExampleDTO = {
  text: string;
  translation?: string;
};

export type AdvancedTranslationDTO = {
  schema?: string;
  attrs?: Record<string, number | number[]>;
  translation: string;
  examples?: WordUsageExampleDTO[];
};

export interface TranslationDTO {
  id: number;
  lang: string;
  wordId: number;
  translation: string;
  advancedTranslation: AdvancedTranslationDTO[] | null;
  userId: number | null;
  isMain: boolean;
}

const AdvancedTranslation = z.object({
  schema: z.string().optional(),
  attrs: z.record(z.union([z.number(), z.array(z.number())])).optional(),
  translation: z.string(),
});

export const WordWithTranslationSchema = WordSchema.extend({
  translation: z.string().optional().nullable(),
  advancedTranslation: z.array(AdvancedTranslation).optional().nullable(),
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
  translationLang?: string | null;
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
export interface GetWordsByIdsReqDTO {
  ids: number[];
  translationLang?: string | null;
  onlyOfficialTranslation?: boolean;
  includeAllOfficialTranslations?: boolean;
}
export type GetWordsByIdsResDTO = {
  words: GetOneWordResDTO[];
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
export type CreateWordStandardCardVariantDTO = {
  attrs?: StandardCardAttributes | null;
  categoryId?: number | null;
  value: string;
};
export type CreateWordTranslationDTO = {
  lang: string;
  translation: string;
  advancedTranslation?: AdvancedTranslationDTO[] | null;
};

export interface CreateWordDTO {
  lang: string;
  type: number;
  mainType?: number | null;
  value: string;
  attributes?: StandardCardAttributes | null;
  labels?: CardLabelsDTO | null;
  isOfficial: boolean;
  variants: CreateWordStandardCardVariantDTO[];
  variantsIncludeTopCard: boolean;
  translations: CreateWordTranslationDTO[];
}

export type CreateOneWordsReqDTO = CreateWordDTO;
export type CreateOneWordsResDTO = WordDTO;

export type CreateManyWordsReqDTO = CreateWordDTO[];

export type CreateWordReqDTO = CreateOneWordsReqDTO | CreateManyWordsReqDTO;

///

export type DeleteStandardCardVariantDTO = {
  type: 'delete';
  id: number;
};

export interface CreateInsideWordStandardCardVariantDTO extends CreateWordStandardCardVariantDTO {
  type: 'create';
}

export type UpdateStandardCardVariantDTO = Partial<CreateWordStandardCardVariantDTO> & {
  type: 'update';
  id: number;
};

export type CRUDWordStandardCardVariantDTO =
  | DeleteStandardCardVariantDTO
  | CreateInsideWordStandardCardVariantDTO
  | UpdateStandardCardVariantDTO;

export type DeleteTranslationDTO = {
  type: 'delete';
  id: number;
};

export interface CreateInsideWordTranslationDTO extends CreateWordTranslationDTO {
  type: 'create';
}

export type UpdateTranslationDTO = Partial<CreateWordTranslationDTO> & {
  type: 'update';
  id: number;
};

export type CRUDWordTranslationsDTO = DeleteTranslationDTO | CreateInsideWordTranslationDTO | UpdateTranslationDTO;

export interface UpdateWordReqDTO {
  id: number;
  wordUpdates?: {
    type?: number;
    mainType?: number | null;
    value?: string;
    attributes?: StandardCardAttributes | null;
    labels?: CardLabelsDTO | null;
    isOfficial?: boolean;
  };
  variants?: CRUDWordStandardCardVariantDTO[];
  translations?: CRUDWordTranslationsDTO[];
}

export type UpdateWordResDTO = WordDTO;

///

export interface MultiSearchWordIdReqDTO {
  searchValues: string[];
  lang: string;
  wordType?: number;
}

export interface MultiSearchWordIdResDTO {
  queries: { searchValue: string; wordIds: number[] }[];
}
