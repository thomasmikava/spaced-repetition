import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-explicit-any */
const StandardCardAttributesSchema = z.record(z.number());
export type StandardCardAttributes = Record<string, number>; // key: attribute id, value: attribute record id

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
  userId: number | null;
  isOfficial: boolean;
}

interface TranslationDTO {
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

///

export interface GetWordsReqDTO {
  courseId: number;
  lessonId?: number;
}

export type GetWordsResDTO = WordWithTranslationAndLessonsDTO[];

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
