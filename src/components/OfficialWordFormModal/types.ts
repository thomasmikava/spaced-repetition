import type { BaseWordVariantDTO, WordDTO, WordWithTranslationDTO } from '../../api/controllers/words/words.schema';
import type { TranslationVariant } from '../../database/types';
import type { OptionalKeys } from '../../utils/types';

export type FormAdvancedTranslationItem = TranslationVariant & { fieldUniqueId: string };

export type DefaultTranslation = {
  translation: string;
  advancedTranslation: FormAdvancedTranslationItem[] | null;
};

export type WordModalCloseArg =
  | { justClosed: false; created: boolean; wordId: number; word: WordWithTranslationDTO }
  | { justClosed: true };

export interface FormTranslation extends DefaultTranslation {
  id?: number;
  fieldUniqueId: string;
  lang: string;
}

export type FormVariant = OptionalKeys<BaseWordVariantDTO, 'id'> & { fieldUniqueId: string };

export interface FormData extends Pick<WordDTO, 'attributes' | 'labels' | 'type' | 'mainType' | 'lang' | 'value'> {
  translations: FormTranslation[];
  variants: FormVariant[];
}
