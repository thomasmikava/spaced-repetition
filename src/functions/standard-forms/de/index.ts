/* eslint-disable sonarjs/cognitive-complexity */
import { AttributeMapper } from '../../../database/attributes';
import { CardTypeMapper } from '../../../database/card-types';
import type { AdjectiveInflection, StandardCard, StandardCardVariant } from '../../../database/types';
import { VerbTense } from '../../../database/types';
import { VerbMood } from '../../../database/types';
import { PronounFunction } from '../../../database/types';
import { AdjectiveDegree, VerbPronoun, Case, NounGender, NounNumber } from '../../../database/types';
import { slashSplit } from '../../../utils/split';
import { getAttrEnumValue, isSomeFormStandard, isStandardEqual } from '../utils';
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
    const perfectFormRaw = allCardVariants.find(
      (v) =>
        v.attrs &&
        v.attrs[AttributeMapper.MOOD.id] === AttributeMapper.MOOD.records[VerbMood.Indikativ] &&
        v.attrs[AttributeMapper.TENSE.id] === AttributeMapper.TENSE.records[VerbTense.Perfekt],
    )?.value;
    const perfectFormWithVerb = perfectFormRaw
      ? perfectFormRaw.includes('/')
        ? slashSplit(perfectFormRaw)[0]
        : perfectFormRaw
      : undefined;
    const perfectForm = perfectFormWithVerb ? perfectFormWithVerb.split(' ')[1] : undefined;
    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const { value: mood, id: moodId } = getAttrEnumValue<VerbMood>(variant.attrs, AttributeMapper.MOOD);
      const { value: tense, id: tenseId } = getAttrEnumValue<VerbTense>(variant.attrs, AttributeMapper.TENSE);
      const { value: pronoun } = getAttrEnumValue<VerbPronoun>(variant.attrs, AttributeMapper.PRONOUN);
      if (mood === undefined || tense === undefined || pronoun === undefined) return false;
      const standardForm = getVerbStandardForm(
        card.value,
        mood,
        tense,
        pronoun,
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.MOOD.id] === moodId &&
            x.attrs[AttributeMapper.TENSE.id] === tenseId &&
            x.attrs[AttributeMapper.PRONOUN.id] === AttributeMapper.PRONOUN.records[VerbPronoun.ich],
        )?.value,
        perfectForm,
      );
      return isStandardEqual(variant.value, standardForm);
    };
  }
  if (card.type === CardTypeMapper.ADJECTIVE_ADVERB) {
    const KomparativeValue = allCardVariants.find((v) => v.category === 2)?.value ?? card.value;
    const SuperlativValue = allCardVariants.find((v) => v.category === 3)?.value ?? card.value;
    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      if (variant.category === 2) {
        return isSomeFormStandard(variant.value, getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Komparativ));
      }
      if (variant.category === 3) {
        return isSomeFormStandard(variant.value, getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Superlativ));
      }

      const { value: degree, id: degreeId } = getAttrEnumValue<AdjectiveDegree>(variant.attrs, AttributeMapper.DEGREE);
      const { value: inflection, id: inflectionId } = getAttrEnumValue<AdjectiveInflection>(
        variant.attrs,
        AttributeMapper.INFLECTION,
      );
      const { value: gender } = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER);
      const { value: caseValue } = getAttrEnumValue<Case>(variant.attrs, AttributeMapper.CASE);

      if (degree === undefined || inflection === undefined || gender === undefined || caseValue === undefined) {
        return false;
      }

      const nominativeMasculine =
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.DEGREE.id] === degreeId &&
            x.attrs[AttributeMapper.INFLECTION.id] === inflectionId &&
            x.attrs[AttributeMapper.GENDER.id] === AttributeMapper.GENDER.records[NounGender.Maskulinum],
        )?.value ?? null;

      let cardValue = card.value;
      if (degree === AdjectiveDegree.Komparativ) {
        cardValue = KomparativeValue;
      }
      if (degree === AdjectiveDegree.Superlativ) {
        cardValue = SuperlativValue;
      }

      const standardForm = getAdjectiveStandardForm(
        cardValue,
        caseValue === Case.Nominativ && gender === NounGender.Maskulinum ? null : nominativeMasculine,
        degree,
        inflection,
        gender,
        caseValue,
      );
      return isSomeFormStandard(variant.value, standardForm);
    };
  }

  if (card.type === CardTypeMapper.NOUN) {
    const initialValue = allCardVariants.find((x) => x.category === INITIAL_CARD_CATEGORY)?.value ?? card.value;
    const pluralNominative = allCardVariants.find(
      (x) =>
        x.attrs &&
        x.attrs[AttributeMapper.NUMBER.id] === AttributeMapper.NUMBER.records[NounNumber.plural] &&
        x.attrs[AttributeMapper.CASE.id] === AttributeMapper.CASE.records[Case.Nominativ],
    )?.value;

    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const { value: gender } = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER);
      const { value: number } = getAttrEnumValue<number>(variant.attrs, AttributeMapper.NUMBER);
      const { value: caseValue } = getAttrEnumValue<Case>(variant.attrs, AttributeMapper.CASE);

      if (gender === undefined || number === undefined || caseValue === undefined) return false;

      const standardForm = generateNounStandardVariant(initialValue, pluralNominative, gender, number, caseValue);
      return isSomeFormStandard(variant.value, standardForm);
    };
  }

  if (card.type === CardTypeMapper.PRONOUN) {
    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const { value: function_, id: functioId } = getAttrEnumValue<PronounFunction>(
        variant.attrs,
        AttributeMapper.FUNCTION,
      );
      const { value: gender } = getAttrEnumValue<NounGender>(variant.attrs, AttributeMapper.GENDER) ?? null;
      const { value: number } = getAttrEnumValue<number>(variant.attrs, AttributeMapper.NUMBER);
      const { value: caseValue } = getAttrEnumValue<Case>(variant.attrs, AttributeMapper.CASE);

      if (function_ === PronounFunction.Declanation && caseValue === Case.Nominativ && number === NounNumber.singular) {
        return true;
      }

      if (function_ === undefined || number === undefined || caseValue === undefined) {
        return false;
      }

      const nominativeValue =
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.FUNCTION.id] === functioId &&
            x.attrs[AttributeMapper.NUMBER.id] === AttributeMapper.NUMBER.records[NounNumber.singular] &&
            x.attrs[AttributeMapper.CASE.id] === AttributeMapper.CASE.records[Case.Nominativ],
        )?.value ?? null;
      const nominativeMasculine =
        allCardVariants.find(
          (x) =>
            x.attrs &&
            x.attrs[AttributeMapper.FUNCTION.id] === functioId &&
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
        gender ?? null,
        caseValue,
      );
      return isStandardEqual(variant.value, standardForm);
    };
  }

  return () => false;
};
