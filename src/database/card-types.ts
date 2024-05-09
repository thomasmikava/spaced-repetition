import { CardViewMode } from '../functions/reviews';
import { AttributeMapper, CardTypeMapper } from './attributes';
import { AdjectiveDegree, IdType, StandardCardAttributes, VerbMood, VerbTense } from './types';

export interface CardTypeRecord {
  id: IdType;
  name: string;
  // TODO: should be locale specific
  configuration?: CardTypeConfiguration;
}

type CategoryAttrsMatcher<T = {}> = Matcher<
  T & {
    category: IdType;
    attrs: StandardCardAttributes;
  }
>;

export interface CardTypeConfiguration {
  caseSensitive?: boolean;
  tags?: {
    attrId: IdType;
    matcher: CategoryAttrsMatcher<{ viewMode: CardViewMode }> | null;
    type: 'primary' | 'secondary' | null;
    defValue?: IdType;
  }[];
  variantGroups?: {
    id: string;
    matcher: CategoryAttrsMatcher | null;
    skip?: boolean;
  }[];
}

export type Matcher<T extends {}> = {
  [k in keyof T]?: T[k] extends Record<PropertyKey, unknown> ? Matcher<T[k]> : Values<T[k]>;
};

type Values<T> = T | null | T[] | { $not: T | T[] } | { $and: T[] } | { $or: T[] };

export const CardTypeConfigurationMapper: Record<IdType, CardTypeConfiguration> = {
  [CardTypeMapper.VERB]: {
    variantGroups: [
      { id: 'init', matcher: { category: 1 } },
      ...cartesianProduct(
        [VerbMood.Indikativ, VerbMood.Konjunktiv, VerbMood.Imperativ],
        [VerbTense.Präsens, VerbTense.Präteritum, VerbTense.Perfekt],
      ).map(([mood, tense]) => ({
        id: `m${mood}-t${tense}`,
        matcher: {
          category: null,
          attrs: {
            [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood],
            [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[tense],
          },
        },
      })),
      { id: 'skip', matcher: null, skip: true },
    ],
  },
  [CardTypeMapper.NOUN]: {
    caseSensitive: true,
    tags: [
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'secondary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 } },
      { id: 'skip', matcher: null, skip: true },
    ],
  },
  [CardTypeMapper.ADJECTIVE]: {
    caseSensitive: true,
    tags: [
      {
        attrId: AttributeMapper.DEGREE.id,
        type: 'primary',
        defValue: AttributeMapper.DEGREE.records[AdjectiveDegree.Positiv],
        matcher: null,
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 } },
      { id: 'comp', matcher: { category: 2 } },
      { id: 'super', matcher: { category: 3 } },
      { id: 'skip', matcher: null, skip: true },
    ],
  },
};

console.log('CardTypeConfigurationMapper', CardTypeConfigurationMapper[CardTypeMapper.VERB]);

type FirstElements<T extends any[][]> = T extends [infer U extends any[], ...infer Rest extends any[][]]
  ? [U[number], ...FirstElements<Rest>]
  : [];

function cartesianProduct<T extends number[][]>(...arrays: T): FirstElements<T>[] {
  // A recursive function to generate the cartesian product
  function cartesianHelper(currentIndex: number, currentResult: number[]): void {
    if (currentIndex === arrays.length) {
      result.push(currentResult.slice());
      return;
    }

    for (let value of arrays[currentIndex]) {
      currentResult.push(value);
      cartesianHelper(currentIndex + 1, currentResult);
      currentResult.pop();
    }
  }

  let result: number[][] = [];
  cartesianHelper(0, []);
  return result as never;
}

export const cardTypeRecords: CardTypeRecord[] = [
  { id: CardTypeMapper.ARTICLE, name: 'Article' },
  {
    id: CardTypeMapper.NOUN,
    name: 'Noun',
    configuration: CardTypeConfigurationMapper[CardTypeMapper.NOUN],
  },
  { id: CardTypeMapper.VERB, name: 'Verb' },
  { id: CardTypeMapper.PRONOUN, name: 'Pronoun' },
  {
    id: CardTypeMapper.ADJECTIVE,
    name: 'Adjective',
    configuration: CardTypeConfigurationMapper[CardTypeMapper.ADJECTIVE],
  },
  { id: CardTypeMapper.PREPOSITION, name: 'Preposition' },
  { id: CardTypeMapper.CONJUNCTION, name: 'Conjunction' },
  { id: CardTypeMapper.NUMBER, name: 'Number' },
  { id: CardTypeMapper.PHRASE, name: 'Phrase' },
];
