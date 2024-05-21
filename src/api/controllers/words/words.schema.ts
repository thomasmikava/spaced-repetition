/* eslint-disable @typescript-eslint/no-explicit-any */
type StandardCardAttributes = Record<string, number>; // key: attribute id, value: attribute record id

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
  advancedTranslation: any | null;
  userId: number | null;
  isMain: boolean;
}

type WordWithTranslationDTO = WordDTO & {
  translation?: TranslationDTO['translation'] | null;
  advancedTranslation?: TranslationDTO['advancedTranslation'] | null;
};

///

export interface GetWordsReqDTO {
  courseId: number;
  lessonId?: number;
}

export type GetWordsResDTO = WordWithTranslationDTO[];
