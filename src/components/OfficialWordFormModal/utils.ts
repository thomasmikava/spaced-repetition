import type { FormAdvancedTranslationItem, FormData, FormTranslation, FormVariant } from './types';
import { removeUndefinedValues } from '../../utils/object';

export const replaceEmptyObjects = (data: FormData): FormData => {
  const wordType = data.type ?? 1;
  return {
    value: data.value,
    lang: data.lang,
    mainType: data.mainType === wordType ? null : data.mainType,
    type: wordType,
    attributes: handleEmptyObject(data.attributes),
    translations: data.translations.map((translation): FormTranslation => {
      return {
        id: translation.id,
        lang: translation.lang,
        translation: translation.translation,
        fieldUniqueId: translation.fieldUniqueId,
        advancedTranslation: handleNullArray(
          translation.advancedTranslation
            ?.map((advanced): FormAdvancedTranslationItem => {
              return {
                fieldUniqueId: advanced.fieldUniqueId,
                schema: advanced.schema || undefined,
                translation: advanced.translation,
                attrs: handleEmptyObject(advanced.attrs) ?? undefined,
              };
            })
            .filter((advanced) => advanced.translation || advanced.schema || advanced.attrs),
        ),
      };
    }),
    variants: data.variants.map((variant): FormVariant => {
      return {
        id: variant.id,
        fieldUniqueId: variant.fieldUniqueId,
        categoryId: variant.categoryId,
        value: variant.value,
        attrs: handleEmptyObject(variant.attrs),
      };
    }),
    labels: handleNullArray(data.labels),
  };
};

const handleEmptyObject = <T extends Record<string, unknown>>(obj: T | null | undefined): T | null => {
  if (!obj || typeof obj !== 'object') return null;
  const withoutUndefined = removeUndefinedValues(obj);
  if (!Object.keys(withoutUndefined)) return null;
  return obj;
};

const handleNullArray = <T>(arr: T[] | null | undefined): T[] | null => {
  if (!arr || !arr.length) return null;
  return arr;
};
