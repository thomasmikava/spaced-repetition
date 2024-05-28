/* eslint-disable sonarjs/cognitive-complexity */
import { AttributeMapper } from '../../../database/attributes';
import { CardTypeMapper } from '../../../database/card-types';
import type {
  AdjectiveInflection,
  PronounFunction,
  StandardCard,
  StandardCardVariant,
  VerbMood,
  VerbTense,
} from '../../../database/types';
import { AdjectiveDegree, VerbPronoun, Case, NounGender, NounNumber } from '../../../database/types';
import { getAttrEnumValue, isStandardEqual } from '../utils';
import {
  generateNounStandardVariant,
  getAdjectiveStandardForm,
  getAdjectiveTrioStandardForm,
  getPronounStandardForm,
  getVerbStandardForm,
} from './forms';

const INITIAL_CARD_CATEGORY = 1;

export const getGermanStandardFormFn = (
  card: StandardCard,
  allCardVariants: StandardCardVariant[],
): ((variant: StandardCardVariant) => boolean) => {
  if (card.type === CardTypeMapper.VERB) {
    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const mood = getAttrEnumValue<VerbMood>(variant.attrs, AttributeMapper.MOOD);
      const tense = getAttrEnumValue<VerbTense>(variant.attrs, AttributeMapper.TENSE);
      const pronoun = getAttrEnumValue<VerbPronoun>(variant.attrs, AttributeMapper.PRONOUN);
      if (mood === undefined || tense === undefined || pronoun === undefined) return false;
      const standardForm = getVerbStandardForm(
        card.value,
        mood,
        tense,
        pronoun,
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.MOOD.id] === mood &&
            x.attrs[AttributeMapper.TENSE.id] === tense &&
            x.attrs[AttributeMapper.PRONOUN.id] === AttributeMapper.PRONOUN.records[VerbPronoun.ich],
        )?.value,
      );
      return isStandardEqual(variant.value, standardForm);
    };
  }
  if (card.type === CardTypeMapper.ADJECTIVE) {
    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      if (variant.category === 2) {
        return isStandardEqual(variant.value, getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Komparativ));
      }
      if (variant.category === 3) {
        return isStandardEqual(variant.value, getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Superlativ));
      }

      const degree = getAttrEnumValue<AdjectiveDegree>(variant.attrs, AttributeMapper.DEGREE);
      const inflection = getAttrEnumValue<AdjectiveInflection>(variant.attrs, AttributeMapper.INFLECTION);
      const gender = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER);
      const caseValue = getAttrEnumValue<Case>(variant.attrs, AttributeMapper.CASE);

      if (degree === undefined || inflection === undefined || gender === undefined || caseValue === undefined) {
        return false;
      }

      const nominativeMasculine =
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.DEGREE.id] === degree &&
            x.attrs[AttributeMapper.INFLECTION.id] === inflection,
        )?.value ?? null;

      const standardForm = getAdjectiveStandardForm(
        card.value,
        caseValue === Case.Nominativ && gender === NounGender.Maskulinum ? null : nominativeMasculine,
        degree,
        inflection,
        gender,
        caseValue,
      );
      return isStandardEqual(variant.value, standardForm);
    };
  }

  if (card.type === CardTypeMapper.NOUN) {
    const pluralNominative = allCardVariants.find(
      (x) =>
        x.attrs &&
        x.attrs[AttributeMapper.NUMBER.id] === AttributeMapper.NUMBER.records[NounNumber.plural] &&
        x.attrs[AttributeMapper.CASE.id] === AttributeMapper.CASE.records[Case.Nominativ],
    )?.value;

    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const gender = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER);
      const number = getAttrEnumValue<number>(variant.attrs, AttributeMapper.NUMBER);
      const caseValue = getAttrEnumValue<Case>(variant.attrs, AttributeMapper.CASE);

      if (gender === undefined || number === undefined || caseValue === undefined) return false;

      const standardForm = generateNounStandardVariant(card.value, pluralNominative, gender, number, caseValue);
      return isStandardEqual(variant.value, standardForm);
    };
  }

  if (card.type === CardTypeMapper.PRONOUN) {
    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const function_ = getAttrEnumValue<PronounFunction>(variant.attrs, AttributeMapper.FUNCTION);
      const gender = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER) ?? null;
      const number = getAttrEnumValue<number>(variant.attrs, AttributeMapper.NUMBER);
      const caseValue = getAttrEnumValue<Case>(variant.attrs, AttributeMapper.CASE);

      if (function_ === undefined || number === undefined || caseValue === undefined) {
        return false;
      }

      const nominativeValue =
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.FUNCTION.id] === function_ &&
            x.attrs[AttributeMapper.NUMBER.id] === AttributeMapper.NUMBER.records[NounNumber.singular] &&
            x.attrs[AttributeMapper.CASE.id] === AttributeMapper.CASE.records[Case.Nominativ],
        )?.value ?? null;
      const nominativeMasculine =
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.FUNCTION.id] === function_ &&
            x.attrs[AttributeMapper.NUMBER.id] === AttributeMapper.NUMBER.records[NounNumber.singular] &&
            x.attrs[AttributeMapper.CASE.id] === AttributeMapper.CASE.records[Case.Nominativ] &&
            x.attrs[AttributeMapper.GENDER.id] === AttributeMapper.GENDER.records[NounGender.Maskulinum],
        )?.value ?? null;

      const standardForm = getPronounStandardForm(
        card.value,
        caseValue === Case.Nominativ ? null : nominativeValue,
        (caseValue === Case.Nominativ && gender === NounGender.Maskulinum) || gender === null
          ? null
          : nominativeMasculine,
        function_,
        number,
        gender,
        caseValue,
      );
      return isStandardEqual(variant.value, standardForm);
    };
  }

  return () => false;
};
