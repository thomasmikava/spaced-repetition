import type { TranslationObjDTO } from '../../../api/controllers/words/words.schema';
import { isNonNullable } from '../../../utils/array';
import type { TranslationField } from './Form';

export const fillLangs = (
  langs: string[],
  translations: (TranslationObjDTO | null | undefined)[] = [],
  backupTranslations: (TranslationObjDTO | null | undefined)[] = [],
) => {
  const result: { [lang in string]?: TranslationObjDTO } = {};
  for (const lang of langs) {
    const translation = translations.find((t) => t && t.lang === lang);
    if (translation) {
      result[lang] = {
        lang,
        translation: translation.translation ?? '',
        advancedTranslation: translation.advancedTranslation ?? null,
      };
    } else {
      const backupTranslation = backupTranslations.find((t) => t && t.lang === lang);
      if (backupTranslation) {
        result[lang] = {
          lang,
          translation: backupTranslation.translation ?? '',
          advancedTranslation: backupTranslation.advancedTranslation ?? null,
        };
      } else {
        result[lang] = { lang, translation: '', advancedTranslation: null };
      }
    }
  }
  return result;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const areTranslationsEqual = (a: TranslationObjDTO, b: TranslationObjDTO): boolean => {
  if (a.lang !== b.lang) return false;
  if (a.translation !== b.translation && a.translation.trim() !== b.translation.trim()) {
    return false;
  }
  if (a.advancedTranslation || b.advancedTranslation) {
    const arr1 = a.advancedTranslation || [];
    const arr2 = b.advancedTranslation || [];
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      // TODO: replace with deep equality
      if (arr1[i].translation !== arr2[i].translation && arr1[i].translation.trim() !== arr2[i].translation.trim()) {
        return false;
      }
      if (arr1[i].schema !== arr2[i].schema) {
        return false;
      }
      if (JSON.stringify(arr1[i].examples) !== JSON.stringify(arr2[i].examples)) {
        return false;
      }
      if (JSON.stringify(arr1[i].attrs) !== JSON.stringify(arr2[i].attrs)) {
        return false;
      }
    }
  }
  return true;
};

const sortByLang = (a: TranslationObjDTO, b: TranslationObjDTO) => a.lang.localeCompare(b.lang);

export const areAllTranslationsEqual = (a: TranslationObjDTO[], b: TranslationObjDTO[]): boolean => {
  if (a.length !== b.length) return false;
  const sortByLangA = [...a].sort(sortByLang);
  const sortByLangB = [...b].sort(sortByLang);
  for (let i = 0; i < a.length; i++) {
    if (!areTranslationsEqual(sortByLangA[i], sortByLangB[i])) return false;
  }
  return true;
};

export const areCustomTranslationsSameAsOfficial = (
  customTranslations: { [lang in string]?: TranslationObjDTO } | TranslationObjDTO[],
  officialTranslations: TranslationObjDTO[] | undefined,
  translationLangs: string[],
) => {
  const tr1 = Array.isArray(customTranslations)
    ? customTranslations
    : Object.values(customTranslations).filter(isNonNullable);
  const tr2 = officialTranslations
    ? Object.values(fillLangs(translationLangs, officialTranslations)).filter(isNonNullable)
    : null;
  return tr2 && areAllTranslationsEqual(tr1, tr2);
};

export const addFieldIdsToTranslationObject = (translations: { [lang in string]?: TranslationObjDTO }): {
  [lang in string]?: TranslationField;
} => {
  const result: { [lang in string]?: TranslationField } = {};
  for (const lang in translations) {
    const translation = translations[lang];
    if (!translation) continue;
    result[lang] = addTranslationFieldId(translation);
  }
  return result;
};

const addTranslationFieldId = (translation: TranslationObjDTO): TranslationField => ({
  ...translation,
  advancedTranslation:
    translation.advancedTranslation?.map((t) => ({
      ...t,
      fieldUniqueId:
        (t as never as Record<'fieldUniqueId', string | undefined>).fieldUniqueId ?? Math.random().toString(),
      examples: t.examples
        ? t.examples?.map((e) => ({
            ...e,
            fieldUniqueId:
              (e as never as Record<'fieldUniqueId', string | undefined>).fieldUniqueId ?? Math.random().toString(),
          }))
        : t.examples,
    })) ?? null,
});
