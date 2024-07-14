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
    isOfficial: data.isOfficial,
    translations: data.translations
      .map((translation): FormTranslation => {
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
      })
      .filter((translation) => !!translation.lang),
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
  if (!Object.keys(withoutUndefined).length) return null;
  return withoutUndefined;
};

const handleNullArray = <T>(arr: T[] | null | undefined): T[] | null => {
  if (!arr || !arr.length) return null;
  return arr;
};

export const getWholeWordFromPastedData = (clipboardData: DataTransfer | null): FormData | null => {
  try {
    if (!clipboardData) return null;
    const pastedData = clipboardData.getData('text');

    if (!pastedData) return null;

    const data = JSON.parse(pastedData);

    if (data === null || typeof data !== 'object') return null;

    if (!('variants' in data) || !Array.isArray(data.variants)) return null;

    return {
      value: data.value,
      lang: data.lang,
      mainType: data.mainType === data.type ? null : data.mainType,
      type: data.type,
      attributes: data.attributes,
      isOfficial: data.isOfficial,
      translations: data.translations ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants: data.variants.map((variant: any): FormVariant => {
        return {
          fieldUniqueId: Math.random().toString(),
          categoryId: variant.categoryId,
          value: variant.value,
          attrs: handleEmptyObject(variant.attrs) ?? null,
        };
      }),
      labels: handleNullArray(data.labels) ?? null,
    };
  } catch (e) {
    return null;
  }
};
