import type { FormData } from './types';
import type {
  CRUDWordStandardCardVariantDTO,
  CreateInsideWordTranslationDTO,
  CreateWordDTO,
  CreateWordStandardCardVariantDTO,
  CreateWordTranslationDTO,
  DeleteStandardCardVariantDTO,
  DeleteTranslationDTO,
  UpdateStandardCardVariantDTO,
  UpdateTranslationDTO,
  UpdateWordReqDTO,
} from '../../api/controllers/words/words.schema';

export const getWordUpdateActions = (id: number, oldWord: FormData, newData: FormData): UpdateWordReqDTO | null => {
  const wordUpdates = getWordUpdates(oldWord, newData);
  const variants = getVariantUpdates(oldWord, newData);
  const translations = getTranslationUpdates(oldWord, newData);

  if (!wordUpdates && !variants?.length && !translations?.length) {
    return null;
  }

  return {
    id,
    wordUpdates,
    variants,
    translations,
  };
};

const getWordUpdates = (oldWord: FormData, newData: FormData): UpdateWordReqDTO['wordUpdates'] | undefined => {
  const keys = getKeys<UpdateWordReqDTO['wordUpdates']>({
    attributes: true,
    labels: true,
    mainType: true,
    type: true,
    value: true,
  });
  return getUpdatedValues(oldWord, newData, keys);
};

const getKeys = <T>(obj: Record<keyof NonNullable<T>, boolean>): (keyof T)[] => Object.keys(obj) as (keyof T)[];
// CreateWordStandardCardVariantDTO

const getUpdatedValues = <T>(oldValues: T, newValues: T, keys: (keyof T)[]): Partial<T> | undefined => {
  const updateObj: Partial<T> = {};
  let hasUpdates = false;
  for (const key of keys) {
    if (oldValues[key] !== newValues[key]) {
      hasUpdates = true;
      updateObj[key] = newValues[key];
    }
  }
  return hasUpdates ? updateObj : undefined;
};

const getVariantUpdates = (oldWord: FormData, newData: FormData): CRUDWordStandardCardVariantDTO[] | undefined => {
  const variants = newData.variants || [];
  const oldVariants = oldWord.variants || [];
  const updatedVariants: UpdateStandardCardVariantDTO[] = [];
  const createdVariants: CRUDWordStandardCardVariantDTO[] = [];
  const deletedVariants: DeleteStandardCardVariantDTO[] = [];

  const variantComparisonKeys = getKeys<CreateWordStandardCardVariantDTO>({
    attrs: true,
    categoryId: true,
    value: true,
  });

  for (const variant of variants) {
    const oldVariant = variant.id ? oldVariants.find((v) => v.id === variant.id) : undefined;
    if (!oldVariant) {
      createdVariants.push({
        ...variant,
        type: 'create',
      });
    } else {
      const updatedValues = getUpdatedValues(oldVariant, variant, variantComparisonKeys);
      if (updatedValues) {
        updatedVariants.push({
          id: variant.id as number,
          type: 'update',
          ...updatedValues,
        });
      }
    }
  }

  for (const oldVariant of oldVariants) {
    if (oldVariant.id && !variants.find((v) => v.id === oldVariant.id)) {
      deletedVariants.push({
        id: oldVariant.id as number,
        type: 'delete',
      });
    }
  }

  const actions: CRUDWordStandardCardVariantDTO[] = [...updatedVariants, ...createdVariants, ...deletedVariants];

  return actions.length ? actions : undefined;
};

const getTranslationUpdates = (oldWord: FormData, newData: FormData): UpdateWordReqDTO['translations'] | undefined => {
  const translations = newData.translations || [];
  const oldTranslations = oldWord.translations || [];
  const updatedTranslations: UpdateTranslationDTO[] = [];
  const createdTranslations: CreateInsideWordTranslationDTO[] = [];
  const deletedTranslations: DeleteTranslationDTO[] = [];

  const translationComparisonKeys = getKeys<CreateWordTranslationDTO>({
    lang: true,
    translation: true,
    advancedTranslation: true,
  });

  for (const translation of translations) {
    const oldTranslation = translation.id ? oldTranslations.find((t) => t.id === translation.id) : undefined;
    if (!oldTranslation) {
      createdTranslations.push({
        ...translation,
        type: 'create',
      });
    } else {
      const updatedValues = getUpdatedValues(oldTranslation, translation, translationComparisonKeys);
      if (updatedValues) {
        updatedTranslations.push({
          id: translation.id as number,
          type: 'update',
          ...updatedValues,
        });
      }
    }
  }

  for (const oldTranslation of oldTranslations) {
    if (oldTranslation.id && !translations.find((v) => v.id === oldTranslation.id)) {
      deletedTranslations.push({
        id: oldTranslation.id as number,
        type: 'delete',
      });
    }
  }

  const actions: UpdateWordReqDTO['translations'] = [
    ...updatedTranslations,
    ...createdTranslations,
    ...deletedTranslations,
  ];

  return actions.length ? actions : undefined;
};

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
