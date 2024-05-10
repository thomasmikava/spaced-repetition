/* eslint-disable sonarjs/cognitive-complexity */
import { AttributeMapper, CardTypeMapper } from '../database/attributes';
import { CATEGORY_MAPPER } from '../database/categories';
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
import { getWithArticle } from './texts';

const defaultLang = 'de';

const getInitialVariant = (value: string): StandardCardVariant => {
  return {
    value,
    attrs: null,
    category: 1,
  };
};

export const convertToStandardCard = (rawCard: RawCard): StandardCard => {
  switch (rawCard.type) {
    case CardType.VERB: {
      const { variants, priorities } = getVerbConjugations(rawCard.variants);
      return {
        type: CardTypeMapper[CardType.VERB],
        value: rawCard.value,
        uniqueValue: rawCard.uniqueValue,
        lang: defaultLang,
        id: rawCard.uniqueValue ?? rawCard.value,
        translation: rawCard.translation,
        groupPriorities: priorities,
        variants: [getInitialVariant(rawCard.value)].concat(variants),
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
        value: getWithArticle(rawCard.value, rawCard.gender),
        lang: defaultLang,
        uniqueValue: rawCard.uniqueValue,
        id: rawCard.uniqueValue ?? rawCard.value,
        translation: rawCard.translation,
        attributes: {
          [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[rawCard.gender],
        },
        variants: [getInitialVariant(rawCard.value)].concat(getNounVariants(rawCard.variants)),
      };
    }
    case CardType.ADJECTIVE: {
      const topVariants: (StandardCardVariant | null)[] = [
        getInitialVariant(rawCard.value),
        rawCard.komparativ
          ? {
              attrs: { [AttributeMapper.DEGREE.id]: AttributeMapper.DEGREE.records[AdjectiveDegree.Komparativ] },
              value: rawCard.komparativ,
              category: CATEGORY_MAPPER.comparative,
            }
          : null,
        rawCard.superlativ
          ? {
              attrs: { [AttributeMapper.DEGREE.id]: AttributeMapper.DEGREE.records[AdjectiveDegree.Superlativ] },
              value: rawCard.superlativ,
              category: CATEGORY_MAPPER.superlative,
            }
          : null,
      ];
      return {
        type: CardTypeMapper[CardType.ADJECTIVE],
        value: rawCard.value,
        lang: defaultLang,
        uniqueValue: rawCard.uniqueValue,
        id: rawCard.uniqueValue ?? rawCard.value,
        translation: rawCard.translation,
        variants: topVariants.filter(isNonNullable).concat(getAdjectiveVariants(rawCard.variants)),
      };
    }
    case CardType.ARTICLE: {
      return {
        type: CardTypeMapper[CardType.ARTICLE],
        value: rawCard.value,
        lang: defaultLang,
        uniqueValue: rawCard.uniqueValue,
        id: rawCard.uniqueValue ?? rawCard.value,
        translation: rawCard.translation,
        attributes: {
          [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[rawCard.gender],
          [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[rawCard.number],
          [AttributeMapper.DEFINITENESS.id]:
            AttributeMapper.DEFINITENESS.records[rawCard.isDefinite ? 'true' : 'false'],
        },
        variants: [getInitialVariant(rawCard.value)].concat(
          rawCard.variants.map(
            (variant): StandardCardVariant => ({
              value: variant.value,
              attrs: {
                [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[variant.case],
              },
            }),
          ),
        ),
      };
    }
    case CardType.PHRASE: {
      return {
        type: CardTypeMapper[CardType.PHRASE],
        value: rawCard.value,
        lang: defaultLang,
        uniqueValue: rawCard.uniqueValue,
        id: rawCard.uniqueValue ?? rawCard.value,
        translation: rawCard.translation,
        mainType: rawCard.mainType ? CardTypeMapper[rawCard.mainType] : undefined,
        variants: [getInitialVariant(rawCard.value)],
      };
    }
    case CardType.CONJUNCTION: {
      return {
        type: CardTypeMapper[CardType.CONJUNCTION],
        value: rawCard.value,
        lang: defaultLang,
        uniqueValue: rawCard.uniqueValue,
        id: rawCard.uniqueValue ?? rawCard.value,
        translation: rawCard.translation,
        variants: [getInitialVariant(rawCard.value)],
      };
    }
    case CardType.PREPOSITION: {
      return {
        type: CardTypeMapper[CardType.PREPOSITION],
        value: rawCard.value,
        lang: defaultLang,
        uniqueValue: rawCard.uniqueValue,
        id: rawCard.uniqueValue ?? rawCard.value,
        variants: [getInitialVariant(rawCard.value)],
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
        lang: defaultLang,
        uniqueValue: rawCard.uniqueValue,
        id: rawCard.uniqueValue ?? rawCard.value,
        translation: rawCard.translation,
        variants: [getInitialVariant(rawCard.value)].concat(getPronounVariants(rawCard.variants)),
      };
    }
    default:
      throw new Error('Unknown card type');
  }
};

const getVerbConjugations = (variants: VerbVariant[]) => {
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
  const pr: StandardCard['groupPriorities'] = priorities.sort((a, b) => a.n - b.n).map((v) => `m${v.mood}-t${v.tense}`);
  return { variants: newVariants, priorities: pr && pr.length > 0 ? ['init', ...pr] : undefined };
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
    if (variant.function === PronounFunction.Declanation && variant.values[0]?.length < 4) {
      // [Case, singularValue: string | null, pluralValue: string | null]
      for (const v of variant.values) {
        if (isNonEmpty(v[1])) {
          newVariants.push({
            value: v[1],
            attrs: {
              [AttributeMapper.FUNCTION.id]: AttributeMapper.FUNCTION.records[variant.function],
              [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[v[0]],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular],
            },
          });
        }
        if (isNonEmpty(v[2])) {
          newVariants.push({
            value: v[2],
            attrs: {
              [AttributeMapper.FUNCTION.id]: AttributeMapper.FUNCTION.records[variant.function],
              [AttributeMapper.CASE.id]: AttributeMapper.CASE.records[v[0]],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural],
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
                [AttributeMapper.FUNCTION.id]: AttributeMapper.FUNCTION.records[variant.function],
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
