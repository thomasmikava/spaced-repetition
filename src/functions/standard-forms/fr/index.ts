/* eslint-disable sonarjs/cognitive-complexity */
import { AttributeMapper } from '../../../database/attributes';
import { CardTypeMapper } from '../../../database/card-types';
import type { StandardCard, StandardCardVariant } from '../../../database/types';
import { NounNumber, NounGender, AdjectiveDegree } from '../../../database/types';
import { getAttrEnumValue, isSomeFormStandard } from '../utils';
import { generateNounPluralStandardVariant, getAdjectiveStandardForm, getAdjectiveTrioStandardForm } from './forms';

const INITIAL_CARD_CATEGORY = 1;

export const getFrenchStandardFormFn = (
  card: StandardCard,
  allCardVariants: StandardCardVariant[],
): ((variant: StandardCardVariant) => boolean) => {
  if (card.type === CardTypeMapper.NOUN) {
    const initialValue = allCardVariants.find((x) => x.category === INITIAL_CARD_CATEGORY)?.value ?? card.value;

    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const { value: gender } = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER);
      const { value: number } = getAttrEnumValue<NounNumber>(variant.attrs, AttributeMapper.NUMBER);

      if (gender === undefined || number !== NounNumber.plural) return false;

      const standardForm = generateNounPluralStandardVariant(initialValue);
      return isSomeFormStandard(variant.value, standardForm);
    };
  }

  if (card.type === CardTypeMapper.REAL_ADJECTIVE) {
    const initialValue = allCardVariants.find((x) => x.category === INITIAL_CARD_CATEGORY)?.value ?? card.value; // initial is always singular masculine
    const feminineSingular =
      allCardVariants.find(
        (v) =>
          !v.category &&
          v.attrs &&
          v.attrs[AttributeMapper.GENDER.id] === AttributeMapper.GENDER.records[NounGender.Femininum] &&
          v.attrs[AttributeMapper.NUMBER.id] === AttributeMapper.NUMBER.records[NounNumber.singular],
      )?.value ?? null;
    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      if (variant.category === 2) {
        return isSomeFormStandard(variant.value, getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Komparativ));
      }
      if (variant.category === 3) {
        return isSomeFormStandard(variant.value, getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Superlativ));
      }

      const { value: gender } = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER);
      const { value: nnumber } = getAttrEnumValue<NounNumber>(variant.attrs, AttributeMapper.NUMBER);

      if (gender === undefined || nnumber === undefined) {
        return false;
      }

      const standardForm = getAdjectiveStandardForm(
        initialValue,
        nnumber === NounNumber.singular ? null : feminineSingular,
        gender,
        nnumber,
      );
      return isSomeFormStandard(variant.value, standardForm);
    };
  }

  return () => false;
};
