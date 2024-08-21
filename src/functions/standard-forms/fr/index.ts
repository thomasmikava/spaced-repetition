/* eslint-disable sonarjs/cognitive-complexity */
import { AttributeMapper } from '../../../database/attributes';
import { CardTypeMapper } from '../../../database/card-types';
import type { ImperativePronoun, StandardCard, StandardCardVariant } from '../../../database/types';
import { VerbForm, VerbMood, VerbTense, VerbPronoun } from '../../../database/types';
import { NounNumber, NounGender, AdjectiveDegree } from '../../../database/types';
import { getAttrEnumValue, isSomeFormStandard, isStandardEqual } from '../utils';
import {
  generateNounPluralStandardVariant,
  getAdjectiveStandardForm,
  getAdjectiveTrioStandardForm,
  getParticiplePastForm,
  getParticiplePresentForm,
  getVerbImperativeStandardForm,
  getVerbStandardForm,
} from './forms';

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

  if (card.type === CardTypeMapper.VERB) {
    const present1stPlural = allCardVariants.find(
      (variant) =>
        variant.attrs &&
        variant.attrs[AttributeMapper.MOOD.id] === AttributeMapper.MOOD.records[VerbMood.Indikativ] &&
        variant.attrs[AttributeMapper.TENSE.id] === AttributeMapper.TENSE.records[VerbTense.Präsens] &&
        variant.attrs[AttributeMapper.PRONOUN.id] === AttributeMapper.PRONOUN.records[VerbPronoun.wir],
    )?.value;

    return (variant: StandardCardVariant) => {
      if (variant.category === INITIAL_CARD_CATEGORY) return false;
      const { value: verbForm } = getAttrEnumValue<VerbForm>(variant.attrs, AttributeMapper.VERB_FORMS);
      if (verbForm === VerbForm.InfinitiveCompound) {
        const pstP = getParticiplePastForm(card.value);
        return !!pstP && isStandardEqual(variant.value, `avoir ${pstP}`);
      }
      if (verbForm === VerbForm.ParticiplePresent) {
        return isStandardEqual(variant.value, getParticiplePresentForm(present1stPlural));
      }
      if (verbForm === VerbForm.ParticiplePast) {
        return true; // we'll ask for the participle separately in infinitive compound form
      }
      const { value: mood } = getAttrEnumValue<VerbMood>(variant.attrs, AttributeMapper.MOOD);
      const { value: tense } = getAttrEnumValue<VerbTense>(variant.attrs, AttributeMapper.TENSE);
      const { value: pronoun } = getAttrEnumValue<VerbPronoun>(variant.attrs, AttributeMapper.PRONOUN);
      if (mood === undefined || tense === undefined || (mood !== VerbMood.Imperativ && pronoun === undefined))
        return false;
      if (mood === VerbMood.Indikativ) {
        if (
          tense === VerbTense.PasséComposé ||
          tense === VerbTense.PlusQueParfait ||
          tense === VerbTense.PasséAntérieur ||
          tense === VerbTense.FuturAntérieur
        ) {
          return true; // multiword constructions
        }
      } else if (mood === VerbMood.Subjunctive) {
        if (tense === VerbTense.Past || tense === VerbTense.PlusQueParfait) {
          return true; // multiword constructions
        }
      } else if (mood === VerbMood.Conditional && tense === VerbTense.Passé1èreforme) {
        return true; // multiword constructions
      } else if (mood === VerbMood.Imperativ && tense === VerbTense.Past) {
        return true; // multiword constructions
      }
      if (mood === VerbMood.Imperativ) {
        const { value: imperativePronoun } = getAttrEnumValue<ImperativePronoun>(
          variant.attrs,
          AttributeMapper.IMPERATIVE_PRONOUN,
        );
        if (imperativePronoun === undefined) return false;
        const imperativeForm = getVerbImperativeStandardForm(card.value, tense, imperativePronoun);
        return isStandardEqual(variant.value, imperativeForm);
      }
      const standardForm = getVerbStandardForm(card.value, mood, tense, pronoun!);
      return isStandardEqual(variant.value, standardForm);
    };
  }

  return () => false;
};
