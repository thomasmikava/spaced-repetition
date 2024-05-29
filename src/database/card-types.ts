import { CardViewMode } from '../functions/reviews';
import { Matcher, SELF_REF } from '../utils/matcher';
import { AttributeMapper } from './attributes';
import {
  AdjectiveDegree,
  AdjectiveInflection,
  CardType,
  Case,
  IdType,
  NounGender,
  NounNumber,
  PronounFunction,
  StandardCardAttributes,
  VerbMood,
  VerbPronoun,
  VerbTense,
} from './types';

export const CardTypeMapper = {
  [CardType.PHRASE]: 1,
  [CardType.NOUN]: 2,
  [CardType.VERB]: 3,
  [CardType.PRONOUN]: 4,
  [CardType.ADJECTIVE]: 5,
  [CardType.PREPOSITION]: 6,
  [CardType.CONJUNCTION]: 7,
  [CardType.NUMBER]: 8,
  [CardType.ARTICLE]: 9,
};

export interface CardTypeRecord {
  id: IdType;
  name: string;
  cardDisplayName: string;
  abbr: string;
  // TODO: should be locale specific
  configuration?: CardTypeConfiguration;
}

export interface CardTypeRecordLocalization {
  lang: string;
  cardTypeRecordId: IdType;
  name: string;
  abbr: string;
  cardDisplayName: string;
  configuration?: CardTypeConfiguration;
}

type CategoryAttrsMatcher<T = {}> = Matcher<
  T & {
    category: IdType;
    attrs: StandardCardAttributes;
  }
>;

type MatcherWithView = CategoryAttrsMatcher<{ viewMode: CardViewMode }>;

export enum ViewLineType {
  Separator,
  NewLine,
  CardValue,
  CustomCardValue,
  VariantValue,
  AttrValue,
  Translation,
  TranslationVariants,
  Table,
  Input,
  Audio,
  AfterAnswer,
  AfterAnswerDropdown,
}

type ViewTableLine = {
  type: ViewLineType.Table;
  columns: (
    | { type: 'value' }
    | { type: 'article' }
    | { type: 'attr'; attr: IdType; main?: boolean; attrRecordValues?: (IdType | IdType[])[] }
    | { type: 'audio'; values: string[] }
  )[];
};

const groupTables = {
  NOUN: {
    type: ViewLineType.Table,
    columns: [
      { type: 'attr', main: true, attr: AttributeMapper.CASE.id },
      { type: 'article' },
      { type: 'value' },
      { type: 'audio', values: ['1.0', '2'] },
    ],
  },
  ARTICLE: {
    type: ViewLineType.Table,
    columns: [
      { type: 'attr', main: true, attr: AttributeMapper.CASE.id },
      { type: 'value' },
      { type: 'audio', values: ['1'] },
    ],
  },
  VERB: {
    type: ViewLineType.Table,
    columns: [
      {
        type: 'attr',
        main: true,
        attr: AttributeMapper.PRONOUN.id,
        attrRecordValues: [
          AttributeMapper.PRONOUN.records[VerbPronoun.ich],
          AttributeMapper.PRONOUN.records[VerbPronoun.du],
          [AttributeMapper.PRONOUN.records[VerbPronoun.er_sie_es], AttributeMapper.PRONOUN.records[VerbPronoun.es]],
          AttributeMapper.PRONOUN.records[VerbPronoun.wir],
          AttributeMapper.PRONOUN.records[VerbPronoun.ihr],
          AttributeMapper.PRONOUN.records[VerbPronoun.sie_Sie],
        ],
      },
      { type: 'value' },
      { type: 'audio', values: ['0.0', '1'] },
    ],
  },
  PRONOUN: {
    type: ViewLineType.Table,
    columns: [
      { type: 'attr', main: true, attr: AttributeMapper.CASE.id },
      { type: 'value' },
      { type: 'audio', values: ['1'] },
    ],
  },
  ADJECTIVE: {
    type: ViewLineType.Table,
    columns: [
      { type: 'attr', main: true, attr: AttributeMapper.CASE.id },
      { type: 'value' },
      { type: 'audio', values: ['1'] },
    ],
  },
} satisfies Record<string, ViewTableLine>;

export type AudioAffix = { type: 'attr'; attrId: IdType } | { type: 'text'; text: string };

export type ViewLine =
  | { type: ViewLineType.Separator | ViewLineType.NewLine }
  | {
      type: ViewLineType.CardValue | ViewLineType.VariantValue | ViewLineType.CustomCardValue;
      matcher?: CategoryAttrsMatcher; // required in case of ViewLineType.CustomCardValue
      bigText?: boolean;
      useForMainAudio?: boolean;
      paragraph?: boolean;
      includeArticleSymbol?: boolean;
      useArticleAsPrefix?: boolean;
    }
  | {
      type: ViewLineType.Translation;
      /** Include the text that it's a translation */
      includeLegend?: boolean;
      includeArticleSymbol?: boolean;
    }
  | { type: ViewLineType.TranslationVariants; partiallyHiddenBeforeAnswer?: boolean }
  | { type: ViewLineType.AttrValue; attrs: IdType[]; separator?: string }
  | ViewTableLine
  | {
      type: ViewLineType.Input;
      useArticleAsPrefix?: boolean;
      audioPrefix?: AudioAffix;
    }
  | {
      type: ViewLineType.Audio;
      useArticleAsPrefix?: boolean;
    }
  | { type: ViewLineType.AfterAnswer; lines: ViewLine[] }
  | { type: ViewLineType.AfterAnswerDropdown; lines: ViewLine[] };

export type SortBy = { attrId: number; attrRecords: number[] };
export interface VariantGroup {
  id: string;
  matcher: CategoryAttrsMatcher | null;
  skipTest?: boolean | { only1variant: boolean };
  skip?: boolean;
  skipIfStandard?: boolean;
  groupViewId?: string;
  indViewId?: string;
  testViewId?: string;
  forcefullyGroup?: boolean;
  sortBy?: SortBy[];
}

export interface CardTypeConfiguration {
  caseSensitive?: boolean;
  tags?: {
    attrId: IdType;
    matcher: MatcherWithView | null;
    type: 'primary' | 'secondary' | null;
    defValue?: IdType;
  }[];
  variantGroups?: VariantGroup[];
  views?: {
    id: string;
    lines: ViewLine[];
  }[];
  maxNumOfGroups?: number;
  groupPriorities?: {
    cardMatcher: Matcher<{
      attrs: StandardCardAttributes;
    }> | null;
    groupIds: string[];
  }[];
  /** It determines how many non-standard form group might have to still be regarded as standard group; default = 0 */
  maxAllowedNonStandardForms?: number;
}

const nounSortBy: SortBy = {
  attrId: AttributeMapper.CASE.id,
  attrRecords: [
    AttributeMapper.CASE.records[Case.Nominativ],
    AttributeMapper.CASE.records[Case.Akkusativ],
    AttributeMapper.CASE.records[Case.Dativ],
    AttributeMapper.CASE.records[Case.Genitiv],
  ],
};

const GermanCardTypeConfigurationMapper: Record<IdType, CardTypeConfiguration> = {
  [CardTypeMapper.VERB]: {
    variantGroups: [
      { id: 'init', matcher: { category: 1 } },
      ...cartesianProduct(
        [VerbMood.Indikativ, VerbMood.Konjunktiv, VerbMood.Imperativ],
        [
          VerbTense.Präsens,
          VerbTense.Perfekt,
          VerbTense.Präteritum,
          VerbTense.Plusquamperfekt,
          VerbTense.Futur1,
          VerbTense.Futur2,
        ],
      ).map(
        ([mood, tense]): VariantGroup => ({
          id: `m${AttributeMapper.MOOD.records[mood]}-t${AttributeMapper.TENSE.records[tense]}`,
          matcher: {
            category: null,
            attrs: {
              [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood],
              [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[tense],
            },
          },
          groupViewId: 'gr',
          testViewId: 'gr-test',
          forcefullyGroup: true,
        }),
      ),
      { id: 'skip', matcher: null, skip: true },
    ],
    views: [
      {
        id: 'gr',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.CardValue, useForMainAudio: true },
          { type: ViewLineType.Separator },
          {
            type: ViewLineType.AttrValue,
            attrs: [AttributeMapper.MOOD.id, AttributeMapper.TENSE.id],
            separator: ' - ',
          },
          { type: ViewLineType.Separator },
          groupTables.VERB,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.CardValue, paragraph: true, useForMainAudio: true },
          { type: ViewLineType.Audio },
          { type: ViewLineType.AttrValue, attrs: [AttributeMapper.PRONOUN.id] },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.Input, audioPrefix: { type: 'attr', attrId: AttributeMapper.PRONOUN.id } },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.Translation, includeLegend: true }, { type: ViewLineType.Separator }],
          },
          {
            type: ViewLineType.AfterAnswerDropdown,
            lines: [groupTables.VERB],
          },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.TranslationVariants }],
          },
        ],
      },
    ],
    tags: [
      { attrId: AttributeMapper.MOOD.id, type: 'secondary', matcher: { category: null } },
      { attrId: AttributeMapper.TENSE.id, type: 'primary', matcher: { category: null } },
    ],
    groupPriorities: [
      {
        cardMatcher: { attrs: { [AttributeMapper.SPECIALITY.id]: AttributeMapper.SPECIALITY.records.modalVerb } },
        groupIds: [
          'init',
          `m${AttributeMapper.MOOD.records[VerbMood.Indikativ]}-t${AttributeMapper.TENSE.records[VerbTense.Präsens]}`,
          `m${AttributeMapper.MOOD.records[VerbMood.Indikativ]}-t${AttributeMapper.TENSE.records[VerbTense.Präteritum]}`,
        ],
      },
    ],
    maxNumOfGroups: 3,
    maxAllowedNonStandardForms: 1,
  },
  [CardTypeMapper.NOUN]: {
    caseSensitive: true,
    tags: [
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'secondary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
      {
        attrId: AttributeMapper.NUMBER.id,
        type: 'secondary',
        matcher: { viewMode: CardViewMode.groupView },
      },
      {
        attrId: AttributeMapper.NUMBER.id,
        type: 'secondary',
        matcher: { viewMode: CardViewMode.test, category: null },
      },
      {
        attrId: AttributeMapper.CASE.id,
        type: 'primary',
        matcher: { viewMode: CardViewMode.test, category: null },
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 }, indViewId: 'init-view', testViewId: 'init-test' },
      {
        id: 'sng',
        matcher: {
          category: null,
          attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular] },
        },
        groupViewId: 'gr-view',
        testViewId: 'gr-test',
        sortBy: [nounSortBy],
      },
      {
        id: 'pl',
        matcher: {
          category: null,
          attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural] },
        },
        groupViewId: 'gr-view',
        testViewId: 'gr-test',
        sortBy: [nounSortBy],
      },
      { id: 'skip', matcher: null, skip: true },
    ],
    views: [
      {
        id: 'init-view',
        lines: [
          { type: ViewLineType.Audio, useArticleAsPrefix: true },
          { type: ViewLineType.VariantValue, bigText: true, useArticleAsPrefix: true },
          { type: ViewLineType.Separator },
          { type: ViewLineType.Translation },
          { type: ViewLineType.TranslationVariants },
        ],
      },
      {
        id: 'init-test',
        lines: [
          { type: ViewLineType.Translation },
          { type: ViewLineType.Input, useArticleAsPrefix: true },
          { type: ViewLineType.TranslationVariants, partiallyHiddenBeforeAnswer: true },
        ],
      },
      {
        id: 'gr-view',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.CardValue, useForMainAudio: true },
          { type: ViewLineType.Separator },
          {
            type: ViewLineType.AttrValue,
            attrs: [AttributeMapper.NUMBER.id],
          },
          { type: ViewLineType.Separator },
          groupTables.NOUN,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.CustomCardValue, paragraph: true, matcher: { category: 1 } },
          {
            type: ViewLineType.Input,
            useArticleAsPrefix: true,
          },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.Translation, includeLegend: true }, { type: ViewLineType.Separator }],
          },
          {
            type: ViewLineType.AfterAnswerDropdown,
            lines: [groupTables.NOUN],
          },
        ],
      },
    ],
  },
  [CardTypeMapper.ADJECTIVE]: {
    caseSensitive: true,
    tags: [
      {
        attrId: AttributeMapper.DEGREE.id,
        type: 'primary',
        matcher: { category: { $not: null } },
      },
      {
        attrId: AttributeMapper.DEGREE.id,
        type: 'secondary',
        matcher: { category: null },
      },
      {
        attrId: AttributeMapper.INFLECTION.id,
        type: 'secondary',
        matcher: { category: null },
      },
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'primary',
        matcher: { category: null },
      },
      {
        attrId: AttributeMapper.CASE.id,
        type: 'primary',
        matcher: { category: null, viewMode: CardViewMode.test },
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 } },
      { id: 'comp', matcher: { category: 2 } },
      { id: 'super', matcher: { category: 3 } },
      // `${variant.degree}.${variant.inflection}.${gender}`
      ...cartesianProduct(
        [AdjectiveDegree.Positiv, AdjectiveDegree.Komparativ, AdjectiveDegree.Superlativ],
        [AdjectiveInflection.Weak, AdjectiveInflection.Strong, AdjectiveInflection.Mixed],
        [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural],
      ).map(([degree, inflection, gender]) => ({
        id: 'rest',
        matcher: {
          category: null,
          attrs: {
            [AttributeMapper.DEGREE.id]: AttributeMapper.DEGREE.records[degree],
            [AttributeMapper.INFLECTION.id]: AttributeMapper.INFLECTION.records[inflection],
            [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[gender],
          },
        },
        groupViewId: 'gr',
        testViewId: 'gr-test',
        skipIfStandard: true,
      })),
      { id: 'skip', matcher: null, skip: true },
    ],
    views: [
      {
        id: 'gr',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.CardValue, useForMainAudio: true, includeArticleSymbol: true },
          { type: ViewLineType.Separator },
          groupTables.ADJECTIVE,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.Audio },
          {
            type: ViewLineType.CustomCardValue,
            matcher: { category: { $not: null }, attrs: { [AttributeMapper.DEGREE.id]: SELF_REF } },
            useForMainAudio: true,
            includeArticleSymbol: true,
            paragraph: true,
          },
          { type: ViewLineType.Input },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.Translation, includeLegend: true }, { type: ViewLineType.Separator }],
          },
          { type: ViewLineType.AfterAnswerDropdown, lines: [groupTables.ADJECTIVE] },
        ],
      },
    ],
  },
  [CardTypeMapper.ARTICLE]: {
    tags: [
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'secondary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
      {
        attrId: AttributeMapper.DEFINITENESS.id,
        type: 'secondary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
      {
        attrId: AttributeMapper.DEFINITENESS.id,
        type: 'secondary',
        matcher: { viewMode: CardViewMode.test },
      },
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'primary',
        matcher: { viewMode: CardViewMode.test, category: { $not: null } },
      },
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'secondary',
        matcher: { viewMode: CardViewMode.test, category: null },
      },
      {
        attrId: AttributeMapper.CASE.id,
        type: 'primary',
        matcher: { viewMode: CardViewMode.test, category: null },
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 }, indViewId: 'init', testViewId: 'init-test' },
      { id: 'rest', matcher: { category: null }, groupViewId: 'gr-view', testViewId: 'gr-test' },
    ],
    views: [
      {
        id: 'init',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.VariantValue, bigText: true },
          { type: ViewLineType.Separator },
          { type: ViewLineType.Translation, includeArticleSymbol: true },
        ],
      },
      {
        id: 'init-test',
        lines: [{ type: ViewLineType.Translation, includeArticleSymbol: true }, { type: ViewLineType.Input }],
      },
      {
        id: 'gr-view',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.CardValue },
          { type: ViewLineType.Separator },
          groupTables.ARTICLE,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.Translation },
          { type: ViewLineType.Input },
          { type: ViewLineType.TranslationVariants, partiallyHiddenBeforeAnswer: true },
          { type: ViewLineType.AfterAnswer, lines: [{ type: ViewLineType.Separator }] },
          groupTables.ARTICLE,
        ],
      },
    ],
  },
  [CardTypeMapper.PRONOUN]: {
    tags: [
      {
        attrId: AttributeMapper.FUNCTION.id,
        type: 'primary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'secondary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
      {
        attrId: AttributeMapper.NUMBER.id,
        type: 'primary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
      {
        attrId: AttributeMapper.FUNCTION.id,
        type: 'secondary',
        matcher: { viewMode: CardViewMode.test },
      },
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'primary',
        matcher: { viewMode: CardViewMode.test },
      },
      {
        attrId: AttributeMapper.CASE.id,
        type: 'primary',
        matcher: { viewMode: CardViewMode.test },
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 }, skipTest: { only1variant: false } },
      ...cartesianProduct([PronounFunction.Declanation], [NounNumber.singular, NounNumber.plural]).map(
        ([func, number]): VariantGroup => ({
          id: `f${AttributeMapper.FUNCTION.records[func]}-n${AttributeMapper.NUMBER.records[number]}`,
          matcher: {
            category: null,
            attrs: {
              [AttributeMapper.FUNCTION.id]: AttributeMapper.FUNCTION.records[func],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[number],
              [AttributeMapper.GENDER.id]: null,
            },
          },
          groupViewId: 'gr',
          testViewId: 'gr-test',
          forcefullyGroup: true,
          skipIfStandard: true,
        }),
      ),
      ...cartesianProduct(
        [
          PronounFunction.Declanation,
          PronounFunction.Attributive,
          PronounFunction.Interrogative,
          PronounFunction.NonAttributiveWithArticle,
          PronounFunction.NonAttributiveWithoutArticle,
          PronounFunction.Relative,
          PronounFunction.Representative,
        ],
        [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural],
      ).map(
        ([func, gender]): VariantGroup => ({
          id: `f${AttributeMapper.FUNCTION.records[func]}-g${AttributeMapper.GENDER.records[gender]}`,
          matcher: {
            category: null,
            attrs: {
              [AttributeMapper.FUNCTION.id]: AttributeMapper.FUNCTION.records[func],
              [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[gender],
            },
          },
          groupViewId: 'gr',
          testViewId: 'gr-test',
          forcefullyGroup: true,
          skipIfStandard: true,
        }),
      ),
      { id: 'rest', matcher: { category: null }, skip: true },
    ],
    views: [
      {
        id: 'gr',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.CardValue, useForMainAudio: true, includeArticleSymbol: true },
          { type: ViewLineType.Separator },
          { type: ViewLineType.Translation },
          { type: ViewLineType.Separator },
          groupTables.PRONOUN,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.Translation, includeArticleSymbol: true, includeLegend: true },
          { type: ViewLineType.Input },
          { type: ViewLineType.TranslationVariants, partiallyHiddenBeforeAnswer: true },
          { type: ViewLineType.AfterAnswer, lines: [{ type: ViewLineType.Separator }] },
          { type: ViewLineType.AfterAnswerDropdown, lines: [groupTables.PRONOUN] },
        ],
      },
    ],
  },
  [CardTypeMapper.PREPOSITION]: {
    variantGroups: [{ id: 'init', matcher: { category: 1 }, indViewId: 'init', testViewId: 'init-test' }],
    views: [
      {
        id: 'init',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.VariantValue, bigText: true },
          { type: ViewLineType.Separator },
          { type: ViewLineType.TranslationVariants },
        ],
      },
      {
        id: 'init-test',
        lines: [
          { type: ViewLineType.TranslationVariants },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.Input },
        ],
      },
    ],
  },
};

// console.log('CardTypeConfigurationMapper', CardTypeConfigurationMapper[CardTypeMapper.VERB]);

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
  { id: CardTypeMapper.PHRASE, name: 'Phrase', cardDisplayName: 'Phrase', abbr: '' },
  {
    id: CardTypeMapper.NOUN,
    name: 'Noun',
    cardDisplayName: 'Noun',
    abbr: '',
  },
  { id: CardTypeMapper.VERB, name: 'Verb', cardDisplayName: 'Verb', abbr: '' },
  { id: CardTypeMapper.PRONOUN, name: 'Pronoun', cardDisplayName: 'Pronoun', abbr: '' },
  {
    id: CardTypeMapper.ADJECTIVE,
    name: 'Adjective',
    cardDisplayName: 'Adjective',
    abbr: '',
  },
  {
    id: CardTypeMapper.PREPOSITION,
    name: 'Preposition',
    cardDisplayName: 'Preposition',
    abbr: '',
  },
  { id: CardTypeMapper.CONJUNCTION, name: 'Conjunction', cardDisplayName: 'Conjunction', abbr: '' },
  { id: CardTypeMapper.NUMBER, name: 'Number', cardDisplayName: 'Number', abbr: '' },
  { id: CardTypeMapper.ARTICLE, name: 'Article', cardDisplayName: 'Article', abbr: '' },
];

export const cardTypeRecordLocalizations: CardTypeRecordLocalization[] = [
  { lang: 'de', cardTypeRecordId: CardTypeMapper.PHRASE, abbr: '', cardDisplayName: '', name: 'Phrase' },
  {
    lang: 'de',
    cardTypeRecordId: CardTypeMapper.NOUN,
    abbr: 'N.',
    name: 'Nomen',
    cardDisplayName: 'Nomen',
    configuration: GermanCardTypeConfigurationMapper[CardTypeMapper.NOUN],
  },
  {
    lang: 'de',
    cardTypeRecordId: CardTypeMapper.VERB,
    abbr: 'V.',
    name: 'Verb',
    cardDisplayName: 'Verb',
    configuration: GermanCardTypeConfigurationMapper[CardTypeMapper.VERB],
  },
  {
    lang: 'de',
    cardTypeRecordId: CardTypeMapper.PRONOUN,
    abbr: 'Pron.',
    name: 'Pronomen',
    cardDisplayName: 'Pronomen',
    configuration: GermanCardTypeConfigurationMapper[CardTypeMapper.PRONOUN],
  },
  {
    lang: 'de',
    cardTypeRecordId: CardTypeMapper.ADJECTIVE,
    abbr: 'Adj./Adv.',
    name: 'Adjektiv / Adverb',
    cardDisplayName: 'Adj. Adv.',
    configuration: GermanCardTypeConfigurationMapper[CardTypeMapper.ADJECTIVE],
  },
  {
    lang: 'de',
    cardTypeRecordId: CardTypeMapper.PREPOSITION,
    abbr: 'Präp.',
    name: 'Präposition',
    cardDisplayName: 'Präp.',
    configuration: GermanCardTypeConfigurationMapper[CardTypeMapper.PREPOSITION],
  },
  {
    lang: 'de',
    cardTypeRecordId: CardTypeMapper.CONJUNCTION,
    abbr: 'Konj.',
    cardDisplayName: 'Konj.',
    name: 'Konjunktion',
  },
  { lang: 'de', cardTypeRecordId: CardTypeMapper.NUMBER, abbr: 'Nu.', cardDisplayName: 'Nummer', name: 'Nummer' },
  {
    lang: 'de',
    cardTypeRecordId: CardTypeMapper.ARTICLE,
    abbr: 'Art.',
    name: 'Artikel',
    cardDisplayName: 'Artikel',
    configuration: GermanCardTypeConfigurationMapper[CardTypeMapper.ARTICLE],
  },
];
