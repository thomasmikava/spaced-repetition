/* eslint-disable sonarjs/cognitive-complexity */
import { AttributeMapper, CardTypeMapper } from '../database/attributes';
import type {
  StandardCard,
  StandardCardVariant,
  VerbVariant,
  IdType,
  NounVariant,
  AdjectiveVariant,
  PronounVariant,
} from '../database/types';
import { AdjectiveDegree, CardType, NounGender, NounNumber, PronounFunction } from '../database/types';
import { isNonNullable } from '../utils/array';
import type { RawCard } from './generateIndexedDatabase';

export const convertToStandardCard = (rawCard: RawCard): StandardCard => {
  switch (rawCard.type) {
    case CardType.VERB: {
      const { variants, priorities } = getVarbConjuctions(rawCard.variants);
      return {
        type: CardTypeMapper[CardType.VERB],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
        childrenAttributesPriority: priorities,
        variants,
        translationVariants:
          rawCard.translations.length > 0
            ? rawCard.translations.map(([schema, translation]) => ({
                schema,
                translation,
              }))
            : undefined,
      };
    }
    case CardType.NOUN: {
      return {
        type: CardTypeMapper[CardType.NOUN],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
        attributes: {
          [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[rawCard.gender],
        },
        variants: getNounVariants(rawCard.variants),
      };
    }
    case CardType.ADJECTIVE: {
      return {
        type: CardTypeMapper[CardType.ADJECTIVE],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
        topVariants: [
          rawCard.komparativ
            ? {
                attrs: { [AttributeMapper.DEGREE.id]: AttributeMapper.DEGREE.records[AdjectiveDegree.Komparativ] },
                value: rawCard.komparativ,
              }
            : null,
          rawCard.superlativ
            ? {
                attrs: { [AttributeMapper.DEGREE.id]: AttributeMapper.DEGREE.records[AdjectiveDegree.Superlativ] },
                value: rawCard.superlativ,
              }
            : null,
        ].filter(isNonNullable),
        variants: getAdjectiveVariants(rawCard.variants),
      };
    }
    case CardType.ARTICLE: {
      return {
        type: CardTypeMapper[CardType.ARTICLE],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
        attributes: {
          [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[rawCard.gender],
          [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[rawCard.number],
          [AttributeMapper.DEFINITENESS.id]:
            AttributeMapper.DEFINITENESS.records[rawCard.isDefinite ? 'true' : 'false'],
        },
        variants: rawCard.variants.map(
          (variant): StandardCardVariant => ({
            value: variant.value,
            attrs: {
              [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[variant.case],
            },
          }),
        ),
      };
    }
    case CardType.PHRASE: {
      return {
        type: CardTypeMapper[CardType.PHRASE],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
        mainType: rawCard.mainType ? CardTypeMapper[rawCard.mainType] : undefined,
      };
    }
    case CardType.CONJUNCTION: {
      return {
        type: CardTypeMapper[CardType.CONJUNCTION],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
      };
    }
    case CardType.PREPOSITION: {
      return {
        type: CardTypeMapper[CardType.PREPOSITION],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
        translationVariants: rawCard.variations.map((v) => ({
          attrs: { [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[v.cases[0]] },
          translation: v.translation,
        })),
      };
    }
    case CardType.PRONOUN: {
      return {
        type: CardTypeMapper[CardType.PRONOUN],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        translation: rawCard.translation,
        variants: getPronounVariants(rawCard.variants),
      };
    }
    default:
      throw new Error('Unknown card type');
  }
};

const getVarbConjuctions = (variants: VerbVariant[]) => {
  const newVariants: StandardCardVariant[] = [];
  const priorities: { n: number; mood: IdType; tense: IdType }[] = [];
  for (const variant of variants) {
    const mood = variant.mood;
    for (const tenseV of variant.tenses) {
      const tense = tenseV.tense;
      if (typeof tenseV.priority === 'number') {
        priorities.push({
          n: tenseV.priority,
          mood: AttributeMapper.MOOD.records[mood],
          tense: AttributeMapper.TENSE.records[tense],
        });
      }
      for (const conjugationV of tenseV.conjugations) {
        const pronoun = conjugationV.pronoun;
        newVariants.push({
          value: conjugationV.value,
          attrs: {
            [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood],
            [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[tense],
            [AttributeMapper.PRONOUN.id]: AttributeMapper.PRONOUN.records[pronoun],
          },
        });
      }
    }
  }
  const pr: StandardCard['childrenAttributesPriority'] = priorities
    .sort((a, b) => a.n - b.n)
    .map((v) => ({ [AttributeMapper.MOOD.id]: v.mood, [AttributeMapper.TENSE.id]: v.tense }));
  return { variants: newVariants, priorities: pr && pr.length > 0 ? pr : undefined };
};

const getNounVariants = (variants: NounVariant[]) => {
  return variants.map(
    (variant): StandardCardVariant => ({
      value: variant.value,
      attrs: {
        [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[variant.number],
        [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[variant.case],
      },
    }),
  );
};

const getGenderByInd = (ind: 1 | 2 | 3 | 4) => {
  switch (ind) {
    case 1:
      return NounGender.Maskulinum;
    case 2:
      return NounGender.Femininum;
    case 3:
      return NounGender.Neutrum;
    case 4:
      return NounGender.Plural;
  }
};

const getAdjectiveVariants = (variants: AdjectiveVariant[]) => {
  const newVariants: StandardCardVariant[] = [];
  for (const variant of variants) {
    for (const v of variant.values) {
      const attrs: StandardCardVariant['attrs'] = {
        [AttributeMapper.DEGREE.id]: AttributeMapper.DEGREE.records[variant.degree],
        [AttributeMapper.INFLECTION.id]: AttributeMapper.INFLECTION.records[variant.inflection],
        [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[v[0]],
      };
      for (let i = 1; i < v.length; i++) {
        const ind = i as 1 | 2 | 3 | 4;
        if (isNonEmpty(v[ind])) {
          newVariants.push({
            value: v[ind],
            attrs: { ...attrs, [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[getGenderByInd(ind)] },
          });
        }
      }
    }
  }
  return newVariants;
};

const getPronounVariants = (variants: PronounVariant[]): StandardCardVariant[] => {
  const newVariants: StandardCardVariant[] = [];
  for (const variant of variants) {
    if (variant.function === PronounFunction.Declanation && variant.values.length < 4) {
      // [Case, singularValue: string | null, pluralValue: string | null]
      for (const v of variant.values) {
        if (isNonEmpty(v[1])) {
          newVariants.push({
            value: v[1],
            attrs: {
              [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[v[0]],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular],
            },
          });
        }
        if (isNonEmpty(v[2])) {
          newVariants.push({
            value: v[2],
            attrs: {
              [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[v[0]],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular],
            },
          });
        }
      }
    } else {
      // [Case, masculineValue: string, feminineValue: string, neutralValue: string, pluralValue: string]
      for (const v of variant.values) {
        for (let i = 1; i < v.length; i++) {
          const ind = i as 1 | 2 | 3 | 4;
          if (isNonEmpty(v[ind])) {
            newVariants.push({
              value: v[ind] as string,
              attrs: {
                [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[v[0]],
                [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[getGenderByInd(ind)],
              },
            });
          }
        }
      }
    }
  }
  return newVariants;
};

function isNonEmpty(str: string | null | undefined): str is string {
  return typeof str === 'string' && str !== '' && str !== '-';
}
