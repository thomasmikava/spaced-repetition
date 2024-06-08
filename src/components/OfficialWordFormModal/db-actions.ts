import type { FormData } from './types';
import type { CreateWordDTO } from '../../api/controllers/words/words.schema';

export const getWordUpdateActions = (oldWord: Form, newData: FormData) => {};

export const getCreateWordDTO = (data: FormData): CreateWordDTO => ({
  isOfficial: true,
  lang: data.lang,
  type: data.type,
  mainType: data.mainType,
  value: data.value,
  attributes: data.attributes,
  labels: data.labels,
  translations: data.translations,
  variants: data.variants,
  variantsIncludeTopCard: true,
});
