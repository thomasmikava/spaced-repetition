import { useMemo } from 'react';
import type { AttributeLocalization, AttributeRecordLocalization } from '../../database/attributes';
import {
  attributes,
  attributeRecords,
  attributeLocalizations,
  attributeRecordLocalizations,
} from '../../database/attributes';
import type { CardTypeRecord, CardTypeRecordLocalization } from '../../database/card-types';
import { cardTypeRecordLocalizations, cardTypeRecords } from '../../database/card-types';
import type { Helper } from '../../functions/generate-card-content';
import { arrayToObject, isNonNullable } from '../../utils/array';
import { objectMap } from '../../utils/object';
import type { Attribute, AttributeRecord, Category, Label } from '../../database/types';
import { labelsLocalized } from '../../database/labels';
import { categoriesLocalized } from '../../database/categories';

export const useHelper = (): Helper | null => {
  const cardTypeRecordByIds = useMemo(() => arrayToObject(cardTypeRecords, 'id'), []);
  const cardTypeRecordLocalizationByLangs = useMemo(
    () =>
      objectMap(arrayToObject(cardTypeRecordLocalizations, 'lang', true), (val) =>
        arrayToObject(val as CardTypeRecordLocalization[], 'cardTypeRecordId'),
      ),
    [],
  );
  const attributeByIds = useMemo(() => arrayToObject(attributes, 'id'), []);
  const attributeLocalizedByLangs = useMemo(
    () =>
      objectMap(arrayToObject(attributeLocalizations, 'lang', true), (val) =>
        arrayToObject(val as AttributeLocalization[], 'attributeId'),
      ),
    [],
  );
  const attributeRecordByIds = useMemo(() => arrayToObject(attributeRecords, 'id'), []);
  const attributeRecordsLocalizedByLangs = useMemo(
    () =>
      objectMap(arrayToObject(attributeRecordLocalizations, 'lang', true), (val) =>
        arrayToObject(val as AttributeRecordLocalization[], 'attributeRecordId'),
      ),
    [],
  );

  const getAttribute = (id: string | number, lang: string): Attribute | undefined => {
    const attribute = attributeByIds[id];
    if (!attribute) {
      return undefined;
    }
    const localization = attributeLocalizedByLangs[lang]?.[id];
    return localization ? { ...attribute, ...localization, id: attribute.id } : attribute;
  };

  const getAttributeRecord = (attrRecordId: number | string, lang: string): AttributeRecord | undefined => {
    const attributeRecord = attributeRecordByIds[attrRecordId];
    if (!attributeRecord) {
      return undefined;
    }
    const localization = attributeRecordsLocalizedByLangs[lang]?.[attrRecordId];
    return localization ? { ...attributeRecord, ...localization, id: attributeRecord.id } : attributeRecord;
  };

  const getAttributeRecordsByAttributeId = (attributeId: number | string, lang: string): AttributeRecord[] => {
    const localized = attributeRecordsLocalizedByLangs[lang];
    if (!localized) {
      return [];
    }
    return Object.values(localized)
      .filter((localization) => localization && localization.attributeId === attributeId)
      .map((localization) => {
        return localization && getAttributeRecord(localization.attributeRecordId, lang)!;
      })
      .filter(isNonNullable)
      .sort((a, b) => a.id - b.id);
  };

  const getCardType = (id: number, lang: string): CardTypeRecord | undefined => {
    const cardType = cardTypeRecordByIds[id];
    if (!cardType) {
      return undefined;
    }
    const localization = cardTypeRecordLocalizationByLangs[lang]?.[id];
    return localization ? { ...cardType, ...localization, id } : cardType; // TODO: memoize result
  };

  const getSupportedCardTypes = (lang: string): CardTypeRecord[] => {
    const localized = cardTypeRecordLocalizationByLangs[lang];
    if (!localized) {
      return [];
    }
    return Object.values(localized).map((localization) => {
      return getCardType(localization!.cardTypeRecordId, lang)!;
    });
  };

  const getLabels = (lang: string): Label[] => {
    return labelsLocalized
      .filter((e) => e.lang === lang)
      .map((loc) => ({
        id: loc.labelId,
        name: loc.name,
      }));
  };

  const getCategories = (lang: string): Category[] => {
    return categoriesLocalized
      .filter((e) => e.lang === lang)
      .map((loc) => ({
        id: loc.categoryId,
        name: loc.name,
      }));
  };

  const helper: Helper = {
    getAttribute,
    getAttributeRecord,
    getAttributeRecordsByAttributeId,
    getSupportedCardTypes,
    getCardType,
    getLabels,
    getCategories,
  };
  return helper;
};
