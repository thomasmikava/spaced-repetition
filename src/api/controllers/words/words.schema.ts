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
  groupPriorities: z.array(z.string()).nullable(),
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
  groupPriorities: string[] | null;
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

///

export interface GetWordsReqDTO {
  courseId: number;
  lessonId?: number;
}

export type GetWordsResDTO = WordWithTranslationDTO[];

///

export interface SearchWordReqDTO {
  searchValue: string;
  lang: string;
}

export interface SearchWordResDTO {
  words: WordWithTranslationDTO[];
}
