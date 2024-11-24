import { INIT_GROUP_ID, SKIP_GROUP_ID, type VariantGroup } from '../database/card-types';
import type { Helper } from '../functions/generate-card-content';
import { isNonNullable } from './array';

export const getGroupName = (variantGroup: VariantGroup, lang: string, helper: Helper) => {
  if (variantGroup.id === SKIP_GROUP_ID) return null;
  if (variantGroup.id === INIT_GROUP_ID) return null;

  let name = '';
  if (!!variantGroup.name && typeof variantGroup.name === 'object') {
    name = variantGroup.name.attrs
      .map((attrId) => helper.getAttributeRecord(attrId, lang)?.name)
      .filter(isNonNullable)
      .join(variantGroup.name.separator ?? ' ');
  } else if (typeof variantGroup.name === 'undefined' && !!variantGroup.matcher && !!variantGroup.matcher.attrs) {
    name = Object.values(variantGroup.matcher.attrs)
      .map((attrId) => (typeof attrId === 'number' ? helper.getAttributeRecord(attrId, lang)?.name : null))
      .filter(isNonNullable)
      .join(', ');
  } else name = variantGroup.name ?? '';
  if (variantGroup.name !== '' && name === '') name = variantGroup.id;
  return name || null;
};
