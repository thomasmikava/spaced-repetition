import { CardViewMode } from '../functions/reviews';
import { IfThenStatement, Matcher, SELF_REF } from '../utils/matcher';
import { AttributeMapper } from './attributes';
import { LabelMapper } from './labels';
import {
  AdjectiveDegree,
  AdjectiveInflection,
  CardType,
  Case,
  IdType,
  ImperativePronoun,
  NounGender,
  NounNumber,
  PronounFunction,
  StandardCardAttributes,
  VerbForm,
  VerbMood,
  VerbPronoun,
  VerbTense,
} from './types';

export const CardTypeMapper = {
  [CardType.PHRASE]: 1,
  [CardType.NOUN]: 2,
  [CardType.VERB]: 3,
  [CardType.PRONOUN]: 4,
  [CardType.ADJECTIVE_ADVERB]: 5,
  [CardType.REAL_ADJECTIVE]: 10,
  [CardType.REAL_ADVERB]: 11,
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
  includeArticleSymbol?: boolean;
}

export interface CardTypeRecordLocalization {
  lang: string;
  cardTypeRecordId: IdType;
  name: string;
  abbr: string;
  cardDisplayName: string;
  configuration?: CardTypeConfiguration;
  includeArticleSymbol?: boolean;
}

export type CategoryAttrsMatcher<T = {}> = Matcher<
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
  AttrRecordValues,
  Translation,
  TranslationVariants,
  TranslationLangSelector,
  Table,
  Input,
  Audio,
  AfterAnswer,
  AfterAnswerDropdown,
  Dropdown,
  Section,
}

type ColumnBasicType =
  | { type: 'variantMatcher'; matcher: CategoryAttrsMatcher; children: (ColumnBasicType | ColumnConditionalType)[] }
  | { type: 'value' }
  | { type: 'article' }
  | {
      type: 'attr';
      attr: IdType;
      main?: boolean;
      attrRecordValues?: (IdType | IdType[])[];
      hidden?: boolean;
      transformer?: string;
    }
  | { type: 'matchers'; main: true; hidden: true; matchers: CategoryAttrsMatcher[] }
  | { type: 'audio'; values: string[] };

export type ColumnMatcherArg = { groupMetaArgs?: Record<string, unknown> };
type ColumnConditionalType = IfThenStatement<ColumnMatcherArg, ColumnBasicType> & { type?: undefined };

type ViewTableLine = {
  type: ViewLineType.Table;
  columns: (ColumnBasicType | ColumnConditionalType)[];
  matcher?: CategoryAttrsMatcher;
  useAllVariants?: boolean;
  customGroupMetaArgs?: ColumnMatcherArg['groupMetaArgs'];
};

const GermanGroupTables = {
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
      {
        $if: { groupMetaArgs: { mood: AttributeMapper.MOOD.records[VerbMood.Imperativ] } },
        then: { type: 'audio', values: ['1.0'] },
        else: { type: 'audio', values: ['0.0', '1'] },
      },
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

const FrenchGroupTables = {
  VERB: {
    type: ViewLineType.Table,
    columns: [
      {
        $if: { groupMetaArgs: { mood: AttributeMapper.MOOD.records[VerbMood.Imperativ] } },
        then: {
          type: 'attr',
          main: true,
          attr: AttributeMapper.IMPERATIVE_PRONOUN.id,
          attrRecordValues: [
            AttributeMapper.IMPERATIVE_PRONOUN.records[ImperativePronoun.Pers2Sing],
            AttributeMapper.IMPERATIVE_PRONOUN.records[ImperativePronoun.Pers1Plr],
            AttributeMapper.IMPERATIVE_PRONOUN.records[ImperativePronoun.Pers2Plr],
          ],
        },
        else: {
          $if: { groupMetaArgs: { mood: AttributeMapper.MOOD.records[VerbMood.Subjunctive] } },
          then: {
            type: 'attr',
            main: true,
            attr: AttributeMapper.PRONOUN.id,
            attrRecordValues: [
              AttributeMapper.PRONOUN.records[VerbPronoun.ich],
              AttributeMapper.PRONOUN.records[VerbPronoun.du],
              AttributeMapper.PRONOUN.records[VerbPronoun.er_sie_es],
              AttributeMapper.PRONOUN.records[VerbPronoun.wir],
              AttributeMapper.PRONOUN.records[VerbPronoun.ihr],
              AttributeMapper.PRONOUN.records[VerbPronoun.they],
            ],
            transformer: 'subjunctivePronoun',
          },
          else: {
            type: 'attr',
            main: true,
            attr: AttributeMapper.PRONOUN.id,
            attrRecordValues: [
              AttributeMapper.PRONOUN.records[VerbPronoun.ich],
              AttributeMapper.PRONOUN.records[VerbPronoun.du],
              AttributeMapper.PRONOUN.records[VerbPronoun.er_sie_es],
              AttributeMapper.PRONOUN.records[VerbPronoun.wir],
              AttributeMapper.PRONOUN.records[VerbPronoun.ihr],
              AttributeMapper.PRONOUN.records[VerbPronoun.they],
            ],
          },
        },
      },
      { type: 'value' },
      { type: 'audio', values: ['1.0'] },
    ],
  },
  VERBFORMS: {
    type: ViewLineType.Table,
    columns: [
      {
        type: 'attr',
        main: true,
        attr: AttributeMapper.VERB_FORMS.id,
        attrRecordValues: [
          AttributeMapper.VERB_FORMS.records[VerbForm.InfinitiveCompound],
          AttributeMapper.VERB_FORMS.records[VerbForm.ParticiplePresent],
          AttributeMapper.VERB_FORMS.records[VerbForm.ParticiplePast],
        ],
      },
      { type: 'value' },
      { type: 'audio', values: ['1.0'] },
    ],
  },
  VERB_PARTICIPLE_PAST: {
    type: ViewLineType.Table,
    columns: [
      {
        type: 'matchers',
        main: true,
        hidden: true,
        matchers: [
          {
            attrs: {
              [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[NounGender.Maskulinum],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular],
            },
          },
          {
            attrs: {
              [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[NounGender.Femininum],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular],
            },
          },
          {
            attrs: {
              [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[NounGender.Maskulinum],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural],
            },
          },
          {
            attrs: {
              [AttributeMapper.GENDER.id]: AttributeMapper.GENDER.records[NounGender.Femininum],
              [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural],
            },
          },
        ],
      },
      {
        type: 'attr',
        attr: AttributeMapper.NUMBER.id,
      },
      {
        type: 'attr',
        attr: AttributeMapper.GENDER.id,
      },
      { type: 'value' },
      { type: 'audio', values: ['3'] },
    ],
  },
  ADJECTIVE: {
    type: ViewLineType.Table,
    columns: [
      {
        type: 'attr',
        main: true,
        attr: AttributeMapper.GENDER.id,
        attrRecordValues: [
          AttributeMapper.GENDER.records[NounGender.Maskulinum],
          AttributeMapper.GENDER.records[NounGender.Femininum],
        ],
      },
      {
        type: 'variantMatcher',
        matcher: {
          attrs: {
            [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular],
          },
        },
        children: [{ type: 'value' }, { type: 'audio', values: ['1.0'] }],
      },
      {
        type: 'variantMatcher',
        matcher: {
          attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural] },
        },
        children: [{ type: 'value' }, { type: 'audio', values: ['3.0'] }],
      },
    ],
    matcher: { category: { $or: [1, null] } },
    useAllVariants: true,
  },
} satisfies Record<string, ViewTableLine>;

export type AudioAffix = { type: 'attr'; attrId: IdType; splitIndex?: number } | { type: 'text'; text: string };

type ViewLineCardValueLike = {
  type: ViewLineType.CardValue | ViewLineType.VariantValue | ViewLineType.CustomCardValue;
  matcher?: CategoryAttrsMatcher; // required in case of ViewLineType.CustomCardValue
  prefix?: { type: 'text'; text: string };
  bigText?: boolean;
  useForMainAudio?: boolean;
  paragraph?: boolean;
  includeArticleSymbol?: boolean;
  useArticleAsPrefix?: boolean;
};

type ViewLineCardTranslationLike =
  | {
      type: ViewLineType.Translation;
      /** Include the text that it's a translation */
      includeLegend?: boolean;
      includeArticleSymbol?: boolean;
    }
  | { type: ViewLineType.TranslationVariants; partiallyHiddenBeforeAnswer?: boolean }
  | { type: ViewLineType.TranslationLangSelector };

export type ViewLine =
  | { type: ViewLineType.Separator | ViewLineType.NewLine }
  | ViewLineCardValueLike
  | ViewLineCardTranslationLike
  | {
      type: ViewLineType.AttrRecordValues;
      attrs: IdType[];
      separator?: string;
      customAttrRecords?: StandardCardAttributes;
    }
  | ViewTableLine
  | {
      type: ViewLineType.Input;
      useArticleAsPrefix?: boolean;
      audioPrefix?: IfThenStatement<CategoryAttrsMatcher, AudioAffix | null> | AudioAffix | null;
      hashReplacer?: { attrId: IdType };
      placeholder?: string;
      skipAudio?: boolean;
      shouldNotReplaceWithCorrectAnswer?: boolean;
      useTranslationsAsValue?: boolean;
    }
  | {
      type: ViewLineType.Audio;
      useArticleAsPrefix?: boolean;
    }
  | { type: ViewLineType.AfterAnswer; lines: ViewLine[] }
  | { type: ViewLineType.AfterAnswerDropdown; lines: ViewLine[]; showMoreText?: string; showLessText?: string }
  | { type: ViewLineType.Dropdown; lines: ViewLine[]; showMoreText?: string; showLessText?: string }
  | { type: ViewLineType.Section; title: string | ViewLine[]; lines: ViewLine[]; size?: 'big' | 'medium' };

export type SortBy = { attrId: number; attrRecords: number[] };
export interface VariantGroup {
  id: string;
  matcher: CategoryAttrsMatcher | null;
  skipTest?: boolean | { only1variant: boolean };
  skip?: boolean;
  skipIfStandard?: boolean;
  skipStandardVariantsMatchers?: CategoryAttrsMatcher[];
  groupViewId?: string;
  indViewId?: string;
  testViewId?: string;
  groupMetaArgs?: Record<string, unknown>;
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
    displayAfterAnswer?: boolean;
  }[];
  variantGroups?: VariantGroup[];
  views?: {
    id: string;
    lines: ViewLine[];
  }[];
  dictionaryView?: ViewLine[];
  maxNumOfGroups?: number;
  groupPriorities?: {
    cardMatcher: Matcher<{
      attrs?: StandardCardAttributes;
      labels?: number[];
    }> | null;
    groupIds: string[];
  }[];
  /** It determines how many non-standard form group might have to still be regarded as standard group; default = 0 */
  maxAllowedNonStandardForms?: number;
}

const caseSortBy: SortBy = {
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
          groupMetaArgs: { mood: AttributeMapper.MOOD.records[mood], tense: AttributeMapper.TENSE.records[tense] },
          groupViewId: 'gr',
          testViewId: 'gr-test',
          forcefullyGroup: true,
          ...((mood === VerbMood.Indikativ && tense === VerbTense.Präsens
            ? {
                skipStandardVariantsMatchers: [
                  {
                    attrs: {
                      [AttributeMapper.PRONOUN.id]: [
                        AttributeMapper.PRONOUN.records[VerbPronoun.wir],
                        AttributeMapper.PRONOUN.records[VerbPronoun.ihr],
                        AttributeMapper.PRONOUN.records[VerbPronoun.sie_Sie],
                      ],
                    },
                  },
                ],
              }
            : {}) satisfies Partial<VariantGroup>),
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
            type: ViewLineType.AttrRecordValues,
            attrs: [AttributeMapper.MOOD.id, AttributeMapper.TENSE.id],
            separator: ' - ',
          },
          { type: ViewLineType.Separator },
          GermanGroupTables.VERB,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.CardValue, paragraph: true, useForMainAudio: true },
          { type: ViewLineType.Audio },
          { type: ViewLineType.AttrRecordValues, attrs: [AttributeMapper.PRONOUN.id] },
          { type: ViewLineType.NewLine },
          {
            type: ViewLineType.Input,
            audioPrefix: {
              $if: { attrs: { [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[VerbMood.Imperativ] } },
              then: null,
              else: { type: 'attr', attrId: AttributeMapper.PRONOUN.id, splitIndex: 0 },
            },
            hashReplacer: { attrId: AttributeMapper.PRONOUN.id },
          },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.Translation, includeLegend: true }, { type: ViewLineType.Separator }],
          },
          {
            type: ViewLineType.AfterAnswerDropdown,
            lines: [GermanGroupTables.VERB],
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
        cardMatcher: { labels: LabelMapper.ModalVerb },
        groupIds: [
          'init',
          `m${AttributeMapper.MOOD.records[VerbMood.Indikativ]}-t${AttributeMapper.TENSE.records[VerbTense.Präsens]}`,
          `m${AttributeMapper.MOOD.records[VerbMood.Indikativ]}-t${AttributeMapper.TENSE.records[VerbTense.Präteritum]}`,
        ],
      },
    ],
    dictionaryView: [
      { type: ViewLineType.CardValue, bigText: true },
      {
        type: ViewLineType.Dropdown,
        showMoreText: 'Show translations',
        showLessText: 'Hide translations',
        lines: [
          { type: ViewLineType.TranslationLangSelector },
          { type: ViewLineType.Translation, includeLegend: true },
          { type: ViewLineType.TranslationVariants },
        ],
      },
      { type: ViewLineType.NewLine },
      ...[VerbMood.Indikativ, VerbMood.Konjunktiv, VerbMood.Imperativ]
        .map(
          (mood): ViewLine => ({
            type: ViewLineType.Section,
            size: 'big',
            title: [
              {
                type: ViewLineType.AttrRecordValues,
                attrs: [AttributeMapper.MOOD.id],
                customAttrRecords: { [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood] },
              },
            ],
            lines:
              mood !== VerbMood.Imperativ
                ? [
                    VerbTense.Präsens,
                    VerbTense.Perfekt,
                    VerbTense.Präteritum,
                    VerbTense.Plusquamperfekt,
                    VerbTense.Futur1,
                    VerbTense.Futur2,
                  ].map(
                    (tense): ViewLine => ({
                      type: ViewLineType.Section,
                      title: [
                        {
                          type: ViewLineType.AttrRecordValues,
                          attrs: [AttributeMapper.TENSE.id],
                          customAttrRecords: { [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[tense] },
                        },
                      ],
                      lines: [
                        {
                          ...GermanGroupTables.VERB,
                          useAllVariants: true,
                          matcher: {
                            attrs: {
                              [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood],
                              [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[tense],
                            },
                          },
                          customGroupMetaArgs: {
                            mood: AttributeMapper.MOOD.records[mood],
                            tense: AttributeMapper.TENSE.records[tense],
                          },
                        },
                      ],
                    }),
                  )
                : [
                    {
                      ...GermanGroupTables.VERB,
                      useAllVariants: true,
                      matcher: {
                        attrs: {
                          [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood],
                          [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[VerbTense.Präsens],
                        },
                      },
                      customGroupMetaArgs: {
                        mood: AttributeMapper.MOOD.records[mood],
                        tense: AttributeMapper.TENSE.records[VerbTense.Präsens],
                      },
                    },
                  ],
          }),
        )
        .map((el, ind, arr) => (ind < arr.length - 1 ? [el, { type: ViewLineType.NewLine } as ViewLine] : [el]))
        .flat(1),
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
        sortBy: [caseSortBy],
      },
      {
        id: 'pl',
        matcher: {
          category: null,
          attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural] },
        },
        groupViewId: 'gr-view',
        testViewId: 'gr-test',
        sortBy: [caseSortBy],
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
            type: ViewLineType.AttrRecordValues,
            attrs: [AttributeMapper.NUMBER.id],
          },
          { type: ViewLineType.Separator },
          GermanGroupTables.NOUN,
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
            lines: [GermanGroupTables.NOUN],
          },
        ],
      },
    ],
    dictionaryView: [
      { type: ViewLineType.CardValue, bigText: true },
      {
        type: ViewLineType.Dropdown,
        showMoreText: 'Show translations',
        showLessText: 'Hide translations',
        lines: [
          { type: ViewLineType.TranslationLangSelector },
          { type: ViewLineType.Translation, includeLegend: true },
          { type: ViewLineType.TranslationVariants },
        ],
      },
      { type: ViewLineType.NewLine },

      {
        type: ViewLineType.Section,
        title: 'Cases',
        lines: [
          {
            type: ViewLineType.Table,
            columns: [
              { type: 'attr', main: true, attr: AttributeMapper.CASE.id },
              {
                type: 'variantMatcher',
                matcher: {
                  attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.singular] },
                },
                children: [{ type: 'article' }, { type: 'value' }, { type: 'audio', values: ['1.0', '2'] }],
              },
              {
                type: 'variantMatcher',
                matcher: {
                  attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural] },
                },
                children: [{ type: 'article' }, { type: 'value' }, { type: 'audio', values: ['4.0', '5'] }],
              },
            ],
            useAllVariants: true,
          },
        ],
      },
    ],
    maxAllowedNonStandardForms: 4,
  },
  [CardTypeMapper.ADJECTIVE_ADVERB]: {
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
        id: `d${AttributeMapper.DEGREE.records[degree]}-i${AttributeMapper.INFLECTION.records[inflection]}-g${AttributeMapper.GENDER.records[gender]}`,
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
          GermanGroupTables.ADJECTIVE,
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
          { type: ViewLineType.AfterAnswerDropdown, lines: [GermanGroupTables.ADJECTIVE] },
        ],
      },
    ],

    dictionaryView: [
      { type: ViewLineType.CardValue, bigText: true },
      {
        type: ViewLineType.CustomCardValue,
        matcher: { category: 2 },
        prefix: { type: 'text', text: 'Komparativ: ' },
        bigText: true,
      },
      {
        type: ViewLineType.CustomCardValue,
        matcher: { category: 3 },
        prefix: { type: 'text', text: 'Superlativ: ' },
        bigText: true,
      },
      {
        type: ViewLineType.Dropdown,
        showMoreText: 'Show translations',
        showLessText: 'Hide translations',
        lines: [
          { type: ViewLineType.TranslationLangSelector },
          { type: ViewLineType.Translation, includeLegend: true },
          { type: ViewLineType.TranslationVariants },
        ],
      },
    ],
    maxAllowedNonStandardForms: 4,
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
          GermanGroupTables.ARTICLE,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.Translation },
          { type: ViewLineType.Input },
          { type: ViewLineType.TranslationVariants, partiallyHiddenBeforeAnswer: true },
          { type: ViewLineType.AfterAnswer, lines: [{ type: ViewLineType.Separator }] },
          GermanGroupTables.ARTICLE,
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
          sortBy: [caseSortBy],
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
          sortBy: [caseSortBy],
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
          GermanGroupTables.PRONOUN,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.Translation, includeArticleSymbol: true, includeLegend: true },
          { type: ViewLineType.Input },
          { type: ViewLineType.TranslationVariants, partiallyHiddenBeforeAnswer: true },
          { type: ViewLineType.AfterAnswer, lines: [{ type: ViewLineType.Separator }] },
          { type: ViewLineType.AfterAnswerDropdown, lines: [GermanGroupTables.PRONOUN] },
        ],
      },
    ],
    maxAllowedNonStandardForms: 4,
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

const getFrenchTensesByMood = (mood: VerbMood): VerbTense[] => {
  if (mood === VerbMood.Indikativ) {
    return [
      VerbTense.Präsens,
      VerbTense.Imparfait,
      VerbTense.PastSimple,
      VerbTense.FutureSimple,
      VerbTense.PasséComposé,
      VerbTense.PlusQueParfait,
      VerbTense.PasséAntérieur,
      VerbTense.FuturAntérieur,
    ];
  }
  if (mood === VerbMood.Subjunctive) {
    return [VerbTense.Präsens, VerbTense.Imparfait, VerbTense.Past, VerbTense.PlusQueParfait];
  }
  if (mood === VerbMood.Conditional) {
    return [VerbTense.Präsens, VerbTense.Passé1èreforme];
  }
  if (mood === VerbMood.Imperativ) {
    return [VerbTense.Präsens, VerbTense.Past];
  }
  return [];
};
const FrenchCardTypeConfigurationMapper: Record<IdType, CardTypeConfiguration> = {
  [CardTypeMapper.VERB]: {
    variantGroups: [
      { id: 'init', matcher: { category: 1 } },
      {
        id: `forms`,
        matcher: {
          category: null,
          attrs: {
            [AttributeMapper.VERB_FORMS.id]: { $not: null },
          },
        },
        groupViewId: 'f-gr',
        testViewId: 'f-gr-test',
        forcefullyGroup: true,
        skipIfStandard: true,
      },
      ...cartesianProduct(
        [VerbMood.Indikativ, VerbMood.Subjunctive, VerbMood.Conditional, VerbMood.Imperativ],
        (mood) => getFrenchTensesByMood(mood as VerbMood),
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
          groupMetaArgs: { mood: AttributeMapper.MOOD.records[mood], tense: AttributeMapper.TENSE.records[tense] },
          groupViewId: 'gr',
          testViewId: 'gr-test',
          forcefullyGroup: true,
          skipIfStandard: true,
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
            type: ViewLineType.AttrRecordValues,
            attrs: [AttributeMapper.MOOD.id, AttributeMapper.TENSE.id],
            separator: ' - ',
          },
          { type: ViewLineType.Separator },
          FrenchGroupTables.VERB,
        ],
      },
      {
        id: 'f-gr',
        lines: [
          { type: ViewLineType.Audio },
          { type: ViewLineType.NewLine },
          { type: ViewLineType.CardValue, useForMainAudio: true },
          { type: ViewLineType.Separator },
          FrenchGroupTables.VERBFORMS,
        ],
      },
      {
        id: 'gr-test',
        lines: [
          { type: ViewLineType.CardValue, paragraph: true, useForMainAudio: true },
          { type: ViewLineType.Audio },
          { type: ViewLineType.AttrRecordValues, attrs: [AttributeMapper.PRONOUN.id] },
          { type: ViewLineType.NewLine },
          {
            type: ViewLineType.Input,
            hashReplacer: { attrId: AttributeMapper.PRONOUN.id },
          },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.Translation, includeLegend: true }, { type: ViewLineType.Separator }],
          },
          {
            type: ViewLineType.AfterAnswerDropdown,
            lines: [FrenchGroupTables.VERB],
          },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.TranslationVariants }],
          },
        ],
      },
      {
        id: 'f-gr-test',
        lines: [
          { type: ViewLineType.CardValue, paragraph: true, useForMainAudio: true },
          { type: ViewLineType.Audio },
          { type: ViewLineType.NewLine },
          {
            type: ViewLineType.Input,
          },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.Translation, includeLegend: true }, { type: ViewLineType.Separator }],
          },
          {
            type: ViewLineType.AfterAnswerDropdown,
            lines: [FrenchGroupTables.VERBFORMS],
          },
          {
            type: ViewLineType.AfterAnswer,
            lines: [{ type: ViewLineType.TranslationVariants }],
          },
        ],
      },
    ],
    tags: [
      {
        attrId: AttributeMapper.MOOD.id,
        type: 'secondary',
        matcher: { category: null, attrs: { [AttributeMapper.VERB_FORMS.id]: null } },
      },
      {
        attrId: AttributeMapper.TENSE.id,
        type: 'primary',
        matcher: { category: null, attrs: { [AttributeMapper.VERB_FORMS.id]: null } },
      },
      {
        attrId: AttributeMapper.VERB_FORMS.id,
        type: 'primary',
        matcher: {
          attrs: { [AttributeMapper.VERB_FORMS.id]: { $not: null } },
          viewMode: { $not: CardViewMode.groupView },
        },
      },
      { attrId: AttributeMapper.GENDER.id, type: 'primary', matcher: { viewMode: CardViewMode.test } },
      { attrId: AttributeMapper.NUMBER.id, type: 'secondary', matcher: { viewMode: CardViewMode.test } },
      {
        attrId: AttributeMapper.IMPERATIVE_PRONOUN.id,
        type: 'secondary',
        matcher: { viewMode: { $not: CardViewMode.groupView } },
      },
    ],
    groupPriorities: [
      {
        cardMatcher: { labels: LabelMapper.ModalVerb },
        groupIds: [
          'init',
          `m${AttributeMapper.MOOD.records[VerbMood.Indikativ]}-t${AttributeMapper.TENSE.records[VerbTense.Präsens]}`,
          `m${AttributeMapper.MOOD.records[VerbMood.Indikativ]}-t${AttributeMapper.TENSE.records[VerbTense.Präteritum]}`,
        ],
      },
    ],
    dictionaryView: [
      { type: ViewLineType.CardValue, bigText: true },
      {
        type: ViewLineType.CustomCardValue,
        matcher: {
          attrs: {
            [AttributeMapper.VERB_FORMS.id]: AttributeMapper.VERB_FORMS.records[VerbForm.InfinitiveCompound],
          },
        },
        prefix: { type: 'text', text: 'Infinitif composé: ' },
        bigText: false,
      },
      {
        type: ViewLineType.CustomCardValue,
        matcher: {
          attrs: {
            [AttributeMapper.VERB_FORMS.id]: AttributeMapper.VERB_FORMS.records[VerbForm.ParticiplePresent],
          },
        },
        prefix: { type: 'text', text: 'Participe présent: ' },
        bigText: false,
      },
      {
        type: ViewLineType.CustomCardValue,
        matcher: {
          attrs: {
            [AttributeMapper.VERB_FORMS.id]: AttributeMapper.VERB_FORMS.records[VerbForm.ParticiplePast],
          },
        },
        prefix: { type: 'text', text: 'Participe passé: ' },
        bigText: false,
      },
      {
        type: ViewLineType.Dropdown,
        showMoreText: 'Show translations',
        showLessText: 'Hide translations',
        lines: [
          { type: ViewLineType.TranslationLangSelector },
          { type: ViewLineType.Translation, includeLegend: true },
          { type: ViewLineType.TranslationVariants },
        ],
      },
      { type: ViewLineType.NewLine },
      ...[VerbMood.Indikativ, VerbMood.Subjunctive, VerbMood.Conditional, VerbMood.Imperativ]
        .map(
          (mood): ViewLine => ({
            type: ViewLineType.Section,
            size: 'big',
            title: [
              {
                type: ViewLineType.AttrRecordValues,
                attrs: [AttributeMapper.MOOD.id],
                customAttrRecords: { [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood] },
              },
            ],
            lines: getFrenchTensesByMood(mood).map(
              (tense): ViewLine => ({
                type: ViewLineType.Section,
                title: [
                  {
                    type: ViewLineType.AttrRecordValues,
                    attrs: [AttributeMapper.TENSE.id],
                    customAttrRecords: { [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[tense] },
                  },
                ],
                lines: [
                  {
                    ...FrenchGroupTables.VERB,
                    useAllVariants: true,
                    matcher: {
                      attrs: {
                        [AttributeMapper.MOOD.id]: AttributeMapper.MOOD.records[mood],
                        [AttributeMapper.TENSE.id]: AttributeMapper.TENSE.records[tense],
                      },
                    },
                    customGroupMetaArgs: {
                      mood: AttributeMapper.MOOD.records[mood],
                      tense: AttributeMapper.TENSE.records[tense],
                    },
                  },
                ],
              }),
            ),
          }),
        )
        .map((el) => [el, { type: ViewLineType.NewLine } as ViewLine])
        .flat(1),
    ],
    // maxNumOfGroups: 3,
    maxAllowedNonStandardForms: 1,
  },

  [CardTypeMapper.NOUN]: {
    caseSensitive: true,
    tags: [
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'primary',
        matcher: { viewMode: { $not: CardViewMode.test } },
      },
      {
        attrId: AttributeMapper.GENDER.id,
        type: 'primary',
        matcher: { viewMode: CardViewMode.test },
        displayAfterAnswer: true,
      },
      {
        attrId: AttributeMapper.NUMBER.id,
        type: 'secondary',
        matcher: { attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural] } },
      },
      {
        attrId: AttributeMapper.NUMBER.id,
        type: 'secondary',
        matcher: { viewMode: CardViewMode.test, category: 1 },
        defValue: AttributeMapper.NUMBER.records[NounNumber.singular],
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 }, indViewId: 'init-view', testViewId: 'init-test' },
      {
        id: 'plural',
        matcher: {
          category: { $not: 1 },
          attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural] },
        },
        indViewId: 'init-view',
        testViewId: 'init-test',
        skipIfStandard: true,
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
    ],
    dictionaryView: [
      { type: ViewLineType.CardValue, bigText: true },
      {
        type: ViewLineType.CustomCardValue,
        matcher: {
          category: null,
          attrs: { [AttributeMapper.NUMBER.id]: AttributeMapper.NUMBER.records[NounNumber.plural] },
        },
        useArticleAsPrefix: true,
        prefix: { type: 'text', text: 'Plurielle: ' },
        bigText: true,
      },
      { type: ViewLineType.Translation, includeLegend: true },
      { type: ViewLineType.TranslationVariants },
    ],
  },
  [CardTypeMapper.REAL_ADJECTIVE]: {
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
        attrId: AttributeMapper.GENDER.id,
        type: 'primary',
        matcher: { category: null, viewMode: { $not: CardViewMode.groupView } },
      },
      {
        attrId: AttributeMapper.NUMBER.id,
        type: 'secondary',
        matcher: { category: null, viewMode: { $not: CardViewMode.groupView } },
        defValue: AttributeMapper.NUMBER.records[NounNumber.singular],
      },
    ],
    variantGroups: [
      { id: 'init', matcher: { category: 1 } },
      { id: 'comp', matcher: { category: 2 }, skipIfStandard: true },
      { id: 'super', matcher: { category: 3 }, skipIfStandard: true },
      {
        id: `rest`,
        matcher: {
          category: null,
          attrs: {
            [AttributeMapper.NUMBER.id]: { $not: null },
            [AttributeMapper.GENDER.id]: { $not: null },
          },
        },
        groupViewId: 'gr',
        testViewId: 'gr-test',
        skipIfStandard: true,
        forcefullyGroup: true,
        sortBy: [
          {
            attrId: AttributeMapper.GENDER.id,
            attrRecords: [
              AttributeMapper.GENDER.records[NounGender.Maskulinum],
              AttributeMapper.GENDER.records[NounGender.Femininum],
            ],
          },
          {
            attrId: AttributeMapper.NUMBER.id,
            attrRecords: [
              AttributeMapper.NUMBER.records[NounNumber.singular],
              AttributeMapper.NUMBER.records[NounNumber.plural],
            ],
          },
        ],
      },
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
          FrenchGroupTables.ADJECTIVE,
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
          { type: ViewLineType.AfterAnswerDropdown, lines: [FrenchGroupTables.ADJECTIVE] },
        ],
      },
    ],

    dictionaryView: [
      { type: ViewLineType.CardValue, bigText: true },
      FrenchGroupTables.ADJECTIVE,
      {
        type: ViewLineType.CustomCardValue,
        matcher: { category: 2 },
        prefix: { type: 'text', text: 'Komparativ: ' },
        bigText: true,
      },
      {
        type: ViewLineType.CustomCardValue,
        matcher: { category: 3 },
        prefix: { type: 'text', text: 'Superlativ: ' },
        bigText: true,
      },
      {
        type: ViewLineType.Dropdown,
        showMoreText: 'Show translations',
        showLessText: 'Hide translations',
        lines: [
          { type: ViewLineType.TranslationLangSelector },
          { type: ViewLineType.Translation, includeLegend: true },
          { type: ViewLineType.TranslationVariants },
        ],
      },
    ],
    maxAllowedNonStandardForms: 4,
  },
};

// console.log('CardTypeConfigurationMapper', CardTypeConfigurationMapper[CardTypeMapper.VERB]);

type ValueOrReturnValue<T> = T extends (...args: any[]) => infer U ? U : T;

type FirstElements<T extends (any[] | ((...args: any[]) => any[]))[]> = T extends [
  infer U extends any[] | ((...args: any[]) => any[]),
  ...infer Rest extends (any[] | ((...args: any[]) => any[]))[],
]
  ? [ValueOrReturnValue<U>[number], ...FirstElements<Rest>]
  : [];

function cartesianProduct<T extends (number[] | ((...prevArgs: number[]) => number[]))[]>(
  ...arrays: T
): FirstElements<T>[] {
  // A recursive function to generate the cartesian product
  function cartesianHelper(currentIndex: number, currentResult: number[]): void {
    if (currentIndex === arrays.length) {
      result.push(currentResult.slice());
      return;
    }

    const arrr = arrays[currentIndex];
    const arr = typeof arrr === 'function' ? arrr(...currentResult) : arrr;

    for (let value of arr) {
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
    id: CardTypeMapper.ADJECTIVE_ADVERB,
    name: 'Adjective/Adverb',
    cardDisplayName: 'Adjective/Adverb',
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
  {
    id: CardTypeMapper.REAL_ADJECTIVE,
    name: 'Adjective',
    cardDisplayName: 'Adjective',
    abbr: '',
  },
  {
    id: CardTypeMapper.REAL_ADVERB,
    name: 'Adverb',
    cardDisplayName: 'Adverb',
    abbr: '',
  },
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
    cardTypeRecordId: CardTypeMapper.ADJECTIVE_ADVERB,
    abbr: 'Adj./Adv.',
    name: 'Adjektiv / Adverb',
    cardDisplayName: 'Adj. Adv.',
    configuration: GermanCardTypeConfigurationMapper[CardTypeMapper.ADJECTIVE_ADVERB],
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
  { lang: 'en', cardTypeRecordId: CardTypeMapper.PHRASE, abbr: '', cardDisplayName: '', name: 'Phrase' },
  {
    lang: 'en',
    cardTypeRecordId: CardTypeMapper.NOUN,
    abbr: 'n.',
    name: 'Noun',
    cardDisplayName: 'Noun',
  },
  {
    lang: 'en',
    cardTypeRecordId: CardTypeMapper.VERB,
    abbr: 'v.',
    name: 'Verb',
    cardDisplayName: 'Verb',
  },
  {
    lang: 'en',
    cardTypeRecordId: CardTypeMapper.REAL_ADJECTIVE,
    abbr: 'adj.',
    name: 'Adjective',
    cardDisplayName: 'Adjective',
  },
  {
    lang: 'en',
    cardTypeRecordId: CardTypeMapper.REAL_ADVERB,
    abbr: 'adv.',
    name: 'Adverb',
    cardDisplayName: 'Adverb',
  },
  {
    lang: 'en',
    cardTypeRecordId: CardTypeMapper.PRONOUN,
    abbr: 'pron.',
    name: 'Pronoun',
    cardDisplayName: 'Pronoun',
  },
  {
    lang: 'en',
    cardTypeRecordId: CardTypeMapper.PREPOSITION,
    abbr: 'pre.',
    name: 'Preposition',
    cardDisplayName: 'Preposition',
  },
  {
    lang: 'en',
    cardTypeRecordId: CardTypeMapper.CONJUNCTION,
    abbr: 'conj.',
    cardDisplayName: 'Conjunction',
    name: 'Conjunction',
  },
  { lang: 'en', cardTypeRecordId: CardTypeMapper.NUMBER, abbr: 'num.', cardDisplayName: 'Number', name: 'Number' },

  { lang: 'fr', cardTypeRecordId: CardTypeMapper.PHRASE, abbr: '', cardDisplayName: '', name: 'Phrase' },
  {
    lang: 'fr',
    cardTypeRecordId: CardTypeMapper.NOUN,
    abbr: 'n.',
    name: 'Nom',
    cardDisplayName: 'Nom',
    configuration: FrenchCardTypeConfigurationMapper[CardTypeMapper.NOUN],
    includeArticleSymbol: true,
  },
  {
    lang: 'fr',
    cardTypeRecordId: CardTypeMapper.VERB,
    abbr: 'v.',
    name: 'Verbe',
    cardDisplayName: 'Verbe',
    configuration: FrenchCardTypeConfigurationMapper[CardTypeMapper.VERB],
  },
  {
    lang: 'fr',
    cardTypeRecordId: CardTypeMapper.REAL_ADJECTIVE,
    abbr: 'adj.',
    name: 'Adjectif',
    cardDisplayName: 'Adjectif',
    configuration: FrenchCardTypeConfigurationMapper[CardTypeMapper.REAL_ADJECTIVE],
  },
  {
    lang: 'fr',
    cardTypeRecordId: CardTypeMapper.REAL_ADVERB,
    abbr: 'adv.',
    name: 'Adverbe',
    cardDisplayName: 'Adverbe',
  },
  {
    lang: 'fr',
    cardTypeRecordId: CardTypeMapper.PRONOUN,
    abbr: 'pron.',
    name: 'Pronom',
    cardDisplayName: 'Pronom',
  },
  {
    lang: 'fr',
    cardTypeRecordId: CardTypeMapper.PREPOSITION,
    abbr: 'pré.',
    name: 'Préposition',
    cardDisplayName: 'Préposition',
  },
  {
    lang: 'fr',
    cardTypeRecordId: CardTypeMapper.CONJUNCTION,
    abbr: 'conj.',
    cardDisplayName: 'Conjonction',
    name: 'Conjonction',
  },
  { lang: 'fr', cardTypeRecordId: CardTypeMapper.NUMBER, abbr: 'nom.', cardDisplayName: 'Nombre', name: 'Nombre' },
];
