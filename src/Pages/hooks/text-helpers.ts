import { attrbiutes, attributeRecords } from '../../database/attributes';
import { cardTypeRecords } from '../../database/card-types';
import type { Helper } from '../../functions/generate-card-content';
import { arrayToObject } from '../../utils/array';

export const useHelper = (): Helper | null => {
  const helper: Helper = {
    cardTypes: arrayToObject(cardTypeRecords, 'id'), // TODO: take care of translations
    attributes: arrayToObject(attrbiutes, 'id'),
    attributeRecords: arrayToObject(attributeRecords, 'id'),
  };
  return 1 < 2 ? helper : null;
};
