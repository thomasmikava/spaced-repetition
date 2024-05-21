/* eslint-disable no-case-declarations */
/* eslint-disable sonarjs/cognitive-complexity */
import type { AnyContent, ContentTag, ContentVoice } from '../content-types';
import { AttributeMapper } from '../database/attributes';
import type { AudioAffix, ViewLine } from '../database/card-types';
import { ViewLineType, type CardTypeRecord } from '../database/card-types';
import type {
  AdjectiveInflection,
  AdjectiveVariant,
  ArticleVariant,
  Attribute,
  AttributeRecord,
  IdType,
  NounVariant,
  Preposition,
  PronounFunction,
  PronounVariant,
  StandardCardAttributes,
  TranslationVariant,
  VerbConjugationVariant,
  VerbMood,
  VerbTense,
  VerbVariant as VerbVariant,
} from '../database/types';
import { NounGender } from '../database/types';
import { AdjectiveDegree, CardType, Case, NounNumber, VerbPronoun } from '../database/types';
import { isNonNullable } from '../utils/array';
import { pickKeys } from '../utils/object';
import { slashSplit } from '../utils/split';
import { isMatch } from './generate-variants';
import type { AnyTestableCard, StandardTestableCard } from './reviews';
import { CardViewMode } from './reviews';
import {
  getVerbMeta,
  getPronounDisplayName,
  getGenderDisplayName,
  getWithArticle,
  getPartOfSentenceNames,
  getWithSymbolArticle,
  getNumberDisplayName,
  getCaseDisplayName,
  getArticle,
  getDegreeDisplayName,
  getInflationDisplayName,
  getTenseColor,
  getMoodColor,
  getArticleTypeDisplayName,
  getGenderColor,
  getArticleTypeColor,
  getCaseColor,
  getNumberColor,
  getDegreeColor,
  getInflationColor,
  getPronounFunctionDisplayName,
  getPronounFunctionColor,
  getArticle2,
  getWithSymbolArticle2,
} from './texts';

const getTopRow = (tags: ContentTag[], word: string): AnyContent => {
  return {
    type: 'div',
    content: [
      { type: 'tag', content: tags },
      word
        ? {
            type: 'voice',
            language: 'de',
            text: prepareTextForAudio(word),
            autoplay: true,
            style: { alignSelf: 'baseline' },
          }
        : undefined,
    ],
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  };
};

const getDefaultViewContent = (
  tags: ContentTag[],
  word: string,
  translation: string,
): (AnyContent | null | undefined)[] => {
  return [
    getTopRow(tags, word),
    { type: 'header', variant: 'h1', content: word, style: { textAlign: 'center' } },
    { type: 'hr', style: { opacity: 0.2 } },
    { type: 'paragraph', content: translation, style: { textAlign: 'center', fontSize: 20 } },
  ];
};

const generateColumnedTable = <Row extends string[]>(
  rows: Row[],
  getVoiceText: (row: Row, index: number) => string,
  mainValueIndex: number = 1,
  locale: string = 'de',
): AnyContent[] => {
  return [
    {
      type: 'table',
      style: { fontSize: 20, margin: '0 auto' },
      content: rows.map((row, index): AnyContent[] => {
        return [
          ...row.slice(0, row.length - 1).map((value, ind): AnyContent => {
            return {
              type: 'div',
              content: [{ type: 'text', content: value }],
              style: { textAlign: ind === 0 ? 'right' : 'center' },
            };
          }),
          {
            type: 'div',
            content: [
              {
                type: 'div',
                content: [{ type: 'text', content: row[row.length - 1] }],
                style: {
                  flex: 1,
                  padding: '0 10px 0 5px',
                },
              },
              {
                type: 'div',
                content: [
                  {
                    type: 'voice',
                    language: locale,
                    text: getVoiceText(row, index),
                    autoplay: false,
                    size: 'mini',
                  },
                ],
                style: { display: row[mainValueIndex] === '-' ? 'none' : undefined },
              },
            ],
            style: { display: 'flex' },
          },
        ];
      }),
      getCellStyles: (rowIndex, columnIndex) => {
        const isFaded = rows[rowIndex][mainValueIndex] === '-';
        const commonStyles = { opacity: isFaded ? 0.5 : 1 };
        if (columnIndex === 0) return { ...commonStyles, width: '0', paddingRight: '5px' };
        return { ...commonStyles, minWidth: '50%' };
      },
    },
  ];
};

const getTableViewContent = (record: AnyTestableCard): AnyContent[] => {
  if (record.type === CardType.VERB && !record.initial) {
    const conjugationTable = getConjugationTable(
      getConjugations(record.variant.mood, record.variant.tense, record.card.variants) || [],
    );
    return generateColumnedTable(conjugationTable, (row) =>
      prepareTextForAudio(getValueBeforeSlash(row[0]) + ' ' + row[1]),
    );
  }

  if (record.type === CardType.NOUN && !record.initial) {
    const casesTable = getCasesTable(record.card.variants, record.variant.number, record.card.gender);
    return [
      {
        type: 'table',
        style: { fontSize: 20, margin: '0 auto' },
        content: casesTable.map((row) => {
          return [
            {
              type: 'div',
              content: [{ type: 'text', content: row[0] }],
              style: { textAlign: 'right' },
            },
            {
              type: 'div',
              content: [{ type: 'text', content: row[1] }],
              style: { textAlign: 'center' },
            },
            {
              type: 'div',
              content: [
                {
                  type: 'div',
                  content: [{ type: 'text', content: row[2] }],
                  style: {
                    flex: 1,
                    padding: '0 10px 0 5px',
                  },
                },
                {
                  type: 'div',
                  content: [
                    {
                      type: 'voice',
                      language: 'de',
                      text: prepareTextForAudio(row[2]),
                      autoplay: false,
                      size: 'mini',
                    },
                  ],
                  style: { display: row[2] === '-' ? 'none' : undefined },
                },
              ],
              style: { display: 'flex' },
            },
          ];
        }),
        getCellStyles: (rowIndex, columnIndex) => {
          const isFaded = casesTable[rowIndex][1] === '-';
          const commonStyles = { opacity: isFaded ? 0.5 : 1 };
          if (columnIndex === 0) return { ...commonStyles, width: '0', paddingRight: '5px' };
          return { ...commonStyles, minWidth: '50%' };
        },
      },
    ];
  }

  if (record.type === CardType.ARTICLE && !record.initial) {
    const casesTable = getArticleCasesTable(record.card.variants);
    return generateColumnedTable(casesTable, (row) => prepareTextForAudio(row[1]));
  }

  if (record.type === CardType.ADJECTIVE && !record.isInitialTrio) {
    const casesTable = getAdjectiveCasesTable(
      record.variant.degree,
      record.variant.inflection,
      record.variant.gender,
      record.card.variants,
    );
    return generateColumnedTable(casesTable, (row) => prepareTextForAudio(row[1]));
  }

  if (record.type === CardType.PRONOUN && !record.initial) {
    const casesTable = getPronounCasesTable(
      record.variant.function,
      record.variant.gender,
      record.variant.number,
      record.card.variants,
    );
    return generateColumnedTable(casesTable, (row) => prepareTextForAudio(row[1]));
  }

  return [];
};

const getPrepositionsTranslation = (variations: Preposition['variations']): AnyContent[] => {
  return variations.flatMap((variation): AnyContent[] => {
    return [
      {
        type: 'div',
        content: [
          {
            type: 'tag',
            content: variation.cases.map(getCaseDisplayName),
          },
          { type: 'paragraph', content: variation.translation, style: { textAlign: 'center' } },
        ],
        style: { display: 'flex', columnGap: 10, alignItems: 'center', justifyContent: 'center' },
      },
    ];
  });
};

const getVerbTranslationsContent = (translations: [string, string][], cardValue: string | null): AnyContent[] => {
  return translations
    .map(([info, translation]): AnyContent | AnyContent[] => {
      return [
        {
          type: 'div',
          content: [
            {
              type: 'paragraph',
              content: cardValue ? info.replace(/#/g, cardValue) : info,
              style: { display: 'inline', background: '#fffe002b', padding: '2px 10px' },
            },
            {
              type: 'paragraph',
              content: translation,
              style: { display: 'inline', border: '1px solid rgba(255, 254, 0, 0.17)', padding: '1px 10px' },
            },
          ],
          style: { margin: '10px 0', fontSize: 18 },
        },
      ];
    })
    .flat(1);
};

const getVerbTranslationsContent2 = (
  translations: TranslationVariant[],
  cardValue: string | null,
  helper: Helper,
): AnyContent[] => {
  return translations.flatMap(({ schema, attrs, translation }): AnyContent | AnyContent[] => {
    if (schema) {
      return {
        type: 'div',
        content: [
          {
            type: 'paragraph',
            content: cardValue ? schema.replace(/#/g, cardValue) : schema,
            style: { display: 'inline', background: '#fffe002b', padding: '2px 10px' },
          },
          {
            type: 'paragraph',
            content: translation,
            style: { display: 'inline', border: '1px solid rgba(255, 254, 0, 0.17)', padding: '1px 10px' },
          },
        ],
        style: { margin: '10px 0', fontSize: 18 },
      };
    }
    return {
      type: 'div',
      content: [
        attrs
          ? {
              type: 'tag',
              content: getTranslationVariantTags(attrs, helper),
            }
          : null,
        { type: 'paragraph', content: translation, style: { textAlign: 'center' } },
      ],
      style: { display: 'flex', columnGap: 10, alignItems: 'center', justifyContent: 'center' },
    };
  });
};

const getTranslationVariantTags = (attrs: NonNullable<TranslationVariant['attrs']>, helper: Helper): ContentTag[] => {
  const tags: string[] = [];
  for (const attrId in attrs) {
    const valueId = attrs[attrId];
    const valueIds = Array.isArray(valueId) ? valueId : [valueId];
    for (const id of valueIds) {
      const value = helper.attributeRecords[id];
      if (value) tags.push(value.name);
    }
  }
  return tags;
};

const getVerbTranslationBeforeAndAfterAnswer = (translations: [string, string][], cardValue: string): AnyContent[] => {
  return [
    { type: 'beforeAnswer', content: getVerbTranslationsContent(translations, '*') },
    { type: 'afterAnswer', content: getVerbTranslationsContent(translations, cardValue) },
  ];
};

const getVerbTranslationBeforeAndAfterAnswer2 = (
  translations: TranslationVariant[],
  cardValue: string,
  helper: Helper,
): AnyContent[] => {
  return [
    { type: 'beforeAnswer', content: getVerbTranslationsContent2(translations, '*', helper) },
    { type: 'afterAnswer', content: getVerbTranslationsContent2(translations, cardValue, helper) },
  ];
};

export interface Helper {
  cardTypes: Record<string, CardTypeRecord | undefined>;
  attributes: Record<string, Attribute | undefined>;
  attributeRecords: Record<string, AttributeRecord | undefined>;
}

const getTags = (record: StandardTestableCard, mode: CardViewMode, helper: Helper) => {
  const viewAttrs = helper.cardTypes[record.displayType]?.configuration?.tags;
  const tags: ContentTag[] = [helper.cardTypes[record.displayType]?.name ?? ''];

  const getAttrInfo = (attrId: IdType | string, value: IdType) => {
    const attr = helper.attributes[attrId];
    if (!attr) return null;
    const record = helper.attributeRecords[value];
    if (!record) return null;
    return { color: record.color || '', text: record.name };
  };
  if (viewAttrs) {
    viewAttrs.forEach(({ attrId, type, defValue, matcher }) => {
      if (
        matcher &&
        !isMatch<{ category?: IdType | null; attr?: StandardCardAttributes | null; viewMode: CardViewMode }>(
          { category: record.variant.category, attr: record.variant.attrs, viewMode: mode },
          matcher,
        )
      ) {
        return null;
      }
      const attr = record.variant.attrs?.[attrId] ?? defValue;
      if (attr === undefined) return null;
      const info = getAttrInfo(attrId, attr);
      if (!info) return null;
      tags.push({
        text: info.text,
        color: info.color,
        variant: type ?? 'regular',
      });
    });
  } else if (record.card.attributes) {
    for (const id in record.card.attributes) {
      const attr = record.card.attributes[id];
      const info = getAttrInfo(id, attr);
      if (!info) continue;
      tags.push({
        text: info.text,
        color: info.color,
        variant: 'regular',
      });
    }
  }
  return tags;
};

const getAffix = (affix: AudioAffix, attrs: StandardCardAttributes | null | undefined, helper: Helper): string => {
  if (affix.type === 'text') {
    return affix.text + ' ';
  }
  const attrRecordId = attrs ? attrs[affix.attrId] : undefined;
  const attributeValueName = helper.attributeRecords[attrRecordId ?? '']?.name;
  return attributeValueName ? attributeValueName + ' ' : '';
};

export const getCardViewContent2 = (
  record: StandardTestableCard,
  mode: CardViewMode,
  helper: Helper,
): (AnyContent | null | undefined)[] => {
  const config = helper.cardTypes[record.displayType]?.configuration;
  // const mathcer = config?.variantGroups?.find((e) => e.id === record.groupMeta.matcherId)?.matcher;
  const myViewId =
    mode === CardViewMode.test
      ? record.groupMeta.testViewId
      : mode === CardViewMode.groupView
        ? record.groupMeta.groupViewId
        : record.groupMeta.indViewId;
  const view = myViewId ? config?.views?.find((e) => e.id === myViewId) : undefined;
  const defaultLines: ViewLine[] =
    mode === CardViewMode.test
      ? [
          { type: ViewLineType.Translation },
          { type: ViewLineType.Input },
          { type: ViewLineType.TranslationVariants, partiallyHiddenBeforeAnswer: true },
        ]
      : [
          { type: ViewLineType.Audio },
          { type: ViewLineType.VariantValue, bigText: true },
          { type: ViewLineType.Separator },
          { type: ViewLineType.Translation },
          { type: ViewLineType.TranslationVariants },
        ];
  const viewLines = view?.lines ?? defaultLines;
  // debugger;

  const textStyle: React.CSSProperties = { textAlign: 'center', fontSize: 20, display: 'block' };

  const withArticle = (
    word: string,
    attributes: StandardCardAttributes | null | undefined,
    options: { includeArticleSymbol?: boolean; useArticleAsPrefix?: boolean; includeLegend?: boolean },
    forAudio = false,
  ) => {
    if ((!options.includeArticleSymbol && !options.useArticleAsPrefix && !options.includeLegend) || !attributes) {
      return word;
    }
    let newWord = options.useArticleAsPrefix ? getArticle2(record.card.lang, attributes, true) + ' ' + word : word;
    if (!forAudio && options.includeArticleSymbol && AttributeMapper.GENDER.id in attributes) {
      newWord = getWithSymbolArticle2(record.card.lang, newWord, attributes[AttributeMapper.GENDER.id]);
    }
    if (!forAudio && options.includeLegend) {
      newWord = 'Translation: ' + newWord; // TODO: translate according to locale
    }
    return newWord;
  };

  let mainAudioText = null as string | null;

  const mapLine = (line: ViewLine): (AnyContent | null | undefined)[] | AnyContent | null | undefined => {
    switch (line.type) {
      case ViewLineType.Audio:
        return null;
      case ViewLineType.Separator:
        return { type: 'hr', style: { opacity: 0.2 } };
      case ViewLineType.NewLine:
        return { type: 'hr', style: { opacity: 0 } };
      case ViewLineType.CardValue:
      case ViewLineType.VariantValue: {
        const rawValue = line.type === ViewLineType.CardValue ? record.card.value : record.variant.value;
        const displayValue = withArticle(rawValue, record.variant.attrs, line);
        if (line.useForMainAudio) mainAudioText = withArticle(rawValue, record.variant.attrs, line, true);
        if (line.bigText) {
          return { type: 'header', variant: 'h1', content: displayValue, style: { textAlign: 'center' } };
        }
        return { type: line.paragraph ? 'paragraph' : 'text', content: displayValue, style: textStyle };
      }
      case ViewLineType.CustomCardValue: {
        if (!line.matcher) return null;
        const cardVariant = record.card.allStandardizedVariants.find((e) =>
          isMatch<{ category?: IdType | null; attrs?: StandardCardAttributes | null }>(
            e,
            line.matcher!,
            record.variant,
          ),
        );
        if (!cardVariant) return null;
        const displayValue = withArticle(cardVariant.value, cardVariant.attrs, line);
        if (line.useForMainAudio) mainAudioText = withArticle(cardVariant.value, cardVariant.attrs, line, true);
        if (line.bigText) {
          return { type: 'header', variant: 'h1', content: displayValue, style: { textAlign: 'center' } };
        }
        return { type: line.paragraph ? 'paragraph' : 'text', content: displayValue, style: textStyle };
      }
      case ViewLineType.Translation:
        const displayValue = withArticle(record.card.translation, record.variant.attrs, line);
        return { type: 'paragraph', content: displayValue, style: textStyle };
      case ViewLineType.TranslationVariants:
        if (!record.card.advancedTranslation || record.card.advancedTranslation.length < 1) return null;
        if (line.partiallyHiddenBeforeAnswer) {
          return getVerbTranslationBeforeAndAfterAnswer2(record.card.advancedTranslation, record.card.value, helper);
        }
        return getVerbTranslationsContent2(record.card.advancedTranslation, record.card.value, helper);
      case ViewLineType.AttrValue:
        const attrs = record.variant.attrs || {};
        const attrValueIds = line.attrs.map((attrId) => attrs[attrId]);
        const attrValues = attrValueIds
          .map((attrValueId) => {
            const record = helper.attributeRecords[attrValueId];
            return record ? record.name : null;
          })
          .filter(isNonNullable);
        return { type: 'text', content: attrValues.join(line.separator ?? ', '), style: textStyle };
      case ViewLineType.Input:
        const displayValue2 = withArticle(record.variant.value, record.variant.attrs, line);
        const correctValues = slashSplit(displayValue2); // TODO: implement articles
        return {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp', // TODO: localize placeholder
          fullWidth: true,
          autoFocus: true,
          correctValues,
          caseInsensitive: record.caseSensitive,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(
            correctValues,
            line.audioPrefix ? getAffix(line.audioPrefix, record.variant.attrs, helper) : undefined,
          ),
        };
      case ViewLineType.AfterAnswer:
        return {
          type: 'afterAnswer',
          content: line.lines.map(mapLine).flat(1),
        };
      case ViewLineType.AfterAnswerDropdown:
        return getAfterAnswerMetaInfo2(line.lines.map(mapLine).flat(1));
      case ViewLineType.Table:
        const mainAttr = line.columns.find((e) => e.type === 'attr' && e.main);
        if (!mainAttr) return undefined;
        const attrId = mainAttr.type === 'attr' ? mainAttr.attr : 0;
        const attr = helper.attributes[attrId];
        if (!attr) return undefined;
        const myAttrObjects =
          mainAttr.type === 'attr' && mainAttr.attrRecordValues
            ? mainAttr.attrRecordValues
                .map((id) => {
                  if (Array.isArray(id)) {
                    const firstRecord = id.find((realId) =>
                      record.groupMeta.variants.some((e) => e.attrs?.[attrId] === realId),
                    );
                    return helper.attributeRecords[firstRecord ?? id[0]];
                  }
                  return helper.attributeRecords[id];
                })
                .filter(isNonNullable)
            : Object.values(helper.attributeRecords)
                .filter((e) => e?.attributeId === attrId)
                .filter(isNonNullable)
                .sort((a, b) => (a.id as number) - (b.id as number));
        const audioInfo: string[] = [];
        const rows = myAttrObjects
          .map((attrValue) => {
            return { variant: record.groupMeta.variants.find((e) => e.attrs?.[attrId] === attrValue.id), attrValue };
          })
          .map(({ variant, attrValue }, index): string[] => {
            const row: (string | null)[] = [];
            let audioValueMeta = null as string[] | null;
            for (const column of line.columns) {
              if (column.type === 'value') {
                row.push(variant?.value ?? '-');
              } else if (column.type === 'attr') {
                const attrId = column.attr;
                const valueId = variant?.attrs?.[attrId];
                const valueRecord =
                  attrValue.attributeId === attrId ? attrValue : valueId ? helper.attributeRecords[valueId] : undefined;
                row.push(valueRecord?.name ?? '');
              } else if (column.type === 'article') {
                if (!variant) row.push('');
                else
                  row.push(
                    getArticle2(
                      record.card.lang,
                      pickKeys(
                        (variant.attrs || {}) as Record<number, number>,
                        AttributeMapper.NUMBER.id,
                        AttributeMapper.GENDER.id,
                        AttributeMapper.CASE.id,
                      ),
                    ) ?? '',
                  );
              } else if (column.type === 'audio') {
                row.push(null);
                audioValueMeta = column.values;
              } else row.push(null);
            }
            if (audioValueMeta) {
              audioInfo[index] = getColumnsFromRow(row, audioValueMeta).join(' ');
            }
            return row.filter(isNonNullable);
          });
        return generateColumnedTable(rows, (_row, index) => prepareTextForAudio(audioInfo[index] || ''));
      //
      default:
        return undefined;
    }
  };

  const lineContents = viewLines.map(mapLine).flat(1);

  let audioText = mainAudioText ?? '';
  const audio = viewLines.find((e) => e.type === ViewLineType.Audio);
  if (!mainAudioText && audio && audio.type === ViewLineType.Audio) {
    const rawValue = record.variant.value;
    audioText = withArticle(rawValue, record.variant.attrs, audio, true);
  }

  const tags = getTags(record, mode, helper);
  return [getTopRow(tags, audioText), ...lineContents];
};

const getColumnsFromRow = (row: (string | null)[], metaKeys: string[]) => {
  const values: (string | null | undefined)[] = [];
  for (const meta of metaKeys) {
    if (!meta.includes('.')) {
      values.push(row[parseInt(meta, 10)]);
    } else {
      const [rowIndex, slashVariantIndex] = meta.split('.');
      const rowValue = row[parseInt(rowIndex, 10)];
      if (!rowValue) values.push(null);
      else {
        const slashValues = slashSplit(rowValue);
        values.push(slashValues[parseInt(slashVariantIndex, 10)]);
      }
    }
  }
  return values.filter(isNonNullable);
};

export const getCardViewContent = (
  record: AnyTestableCard,
  mode: CardViewMode.individualView | CardViewMode.groupView,
): (AnyContent | null | undefined)[] => {
  if (record.type === CardType.VERB) {
    if (record.initial) {
      const tags = [getPartOfSentenceNames(record.type)];
      return [
        getTopRow(tags, record.card.value),
        { type: 'header', variant: 'h1', content: record.card.value, style: { textAlign: 'center' } },
        { type: 'hr', style: { opacity: 0.2 } },
        { type: 'paragraph', content: record.card.translation, style: { textAlign: 'center', fontSize: 20 } },
        ...getVerbTranslationsContent(record.card.translations, record.card.value),
      ];
    } else if (mode === CardViewMode.groupView) {
      const meta = getVerbMeta(record.variant.mood, record.variant.tense);
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        { variant: 'secondary', text: meta.mood, color: getMoodColor(record.variant.mood) },
        { variant: 'primary', text: meta.tense, color: getTenseColor(record.variant.tense) },
      ];

      return [
        {
          type: 'div',
          content: [{ type: 'tag', content: tags }],
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        },
        { type: 'hr', style: { opacity: 0 } },
        { type: 'text', content: record.card.value, style: { textAlign: 'center', fontSize: 20, display: 'block' } },
        { type: 'hr', style: { opacity: 0.2 } },
        {
          type: 'text',
          content: meta.mood + ' - ' + meta.tense,
          style: { textAlign: 'center', fontSize: 20, display: 'block' },
        },
        { type: 'hr', style: { opacity: 0.2 } },
        ...getTableViewContent(record),
      ];
    }
  } else if (record.type === CardType.NOUN) {
    if (record.initial) {
      const withArticle = getWithArticle(record.card.value, record.card.gender);
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getGenderDisplayName(record.card.gender),
          color: getGenderColor(record.card.gender),
        },
      ];
      return getDefaultViewContent(tags, withArticle, record.card.translation);
    } else if (mode === CardViewMode.groupView) {
      const withArticle = getWithArticle(record.card.value, record.card.gender);
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getNumberDisplayName(record.variant.number),
          color: getNumberColor(record.variant.number),
        },
      ];
      return [
        getTopRow(tags, withArticle),
        { type: 'hr', style: { opacity: 0 } },
        { type: 'text', content: withArticle, style: { textAlign: 'center', fontSize: 20, display: 'block' } },
        { type: 'hr', style: { opacity: 0.2 } },
        {
          type: 'text',
          content: getNumberDisplayName(record.variant.number),
          style: { textAlign: 'center', fontSize: 20, display: 'block' },
        },
        { type: 'hr', style: { opacity: 0.2 } },
        ...getTableViewContent(record),
      ];
    }
  } else if (record.type === CardType.ARTICLE) {
    if (record.initial) {
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getGenderDisplayName(record.card.gender),
          color: getGenderColor(record.card.gender),
        },
        {
          variant: 'secondary',
          text: getArticleTypeDisplayName(record.card.isDefinite),
          color: getArticleTypeColor(record.card.isDefinite),
        },
      ];
      return getDefaultViewContent(
        tags,
        record.card.value,
        getWithSymbolArticle(record.card.translation, record.card.gender),
      );
    } else if (mode === CardViewMode.groupView) {
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getGenderDisplayName(record.card.gender),
          color: getGenderColor(record.card.gender),
        },
        {
          variant: 'secondary',
          text: getArticleTypeDisplayName(record.card.isDefinite),
          color: getArticleTypeColor(record.card.isDefinite),
        },
      ];
      return [
        getTopRow(tags, record.card.value),
        { type: 'hr', style: { opacity: 0 } },
        { type: 'text', content: record.card.value, style: { textAlign: 'center', fontSize: 20, display: 'block' } },
        { type: 'hr', style: { opacity: 0.2 } },
        ...getTableViewContent(record),
      ];
    }
  } else if (record.type === CardType.ADJECTIVE) {
    if (record.isInitialTrio) {
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        { variant: 'primary', text: getDegreeDisplayName(record.degree), color: getDegreeColor(record.degree) },
      ];
      return getDefaultViewContent(tags, record.value, record.card.translation);
    } else {
      let rootValue = record.card.value;
      if (record.variant.degree === AdjectiveDegree.Komparativ) rootValue = record.card.komparativ as string;
      if (record.variant.degree === AdjectiveDegree.Superlativ) rootValue = record.card.superlativ as string;
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getDegreeDisplayName(record.variant.degree),
          color: getDegreeColor(record.variant.degree),
        },
        {
          variant: 'secondary',
          text: getInflationDisplayName(record.variant.inflection),
          color: getInflationColor(record.variant.inflection),
        },
        {
          variant: 'primary',
          text: getGenderDisplayName(record.variant.gender),
          color: getGenderColor(record.variant.gender),
        },
      ];
      return [
        getTopRow(tags, rootValue),
        { type: 'hr', style: { opacity: 0 } },
        {
          type: 'text',
          content: getWithSymbolArticle(rootValue, record.variant.gender),
          style: { textAlign: 'center', fontSize: 20, display: 'block' },
        },
        { type: 'hr', style: { opacity: 0.2 } },
        ...getTableViewContent(record),
      ];
    }
  } else if (record.type === CardType.PREPOSITION) {
    const tags: ContentTag[] = [getPartOfSentenceNames(record.type)];
    return [
      getTopRow(tags, record.card.value),
      { type: 'header', variant: 'h1', content: record.card.value, style: { textAlign: 'center' } },
      { type: 'hr', style: { opacity: 0.2 } },
      ...getPrepositionsTranslation(record.card.variations),
    ];
  } else if (record.type === CardType.PRONOUN) {
    const rootValue = record.card.value;
    const tags: ContentTag[] = [
      getPartOfSentenceNames(record.type),
      {
        variant: 'secondary',
        text: getPronounFunctionDisplayName(record.function),
        color: getPronounFunctionColor(record.function),
      },
      record.variant.gender !== null
        ? {
            variant: 'primary',
            text: getGenderDisplayName(record.variant.gender),
            color: getGenderColor(record.variant.gender),
          }
        : undefined,
    ];
    const translation = record.card.translation;
    return [
      getTopRow(tags, rootValue),
      { type: 'hr', style: { opacity: 0 } },
      {
        type: 'text',
        content: record.variant.gender !== null ? getWithSymbolArticle(rootValue, record.variant.gender) : rootValue,
        style: { textAlign: 'center', fontSize: 20, display: 'block' },
      },
      { type: 'hr', style: { opacity: 0.2 } },
      { type: 'paragraph', content: translation, style: { textAlign: 'center', fontSize: 20 } },
      { type: 'hr', style: { opacity: 0.2 } },
      ...getTableViewContent(record),
    ];
  } else if (record.type === null) {
    const tags: ContentTag[] = record.typeTag ? [record.typeTag] : [];
    return getDefaultViewContent(tags, record.card.value, record.card.translation);
  }

  return [];
};

const prepareTextForAudio = (text: string) => slashSplit(text).join('. ');
const prepareInputAudio = (correctValues: string[], prefix: string = ''): Omit<ContentVoice, 'type'> => ({
  language: 'de',
  text: prepareTextForAudio(correctValues.map((e) => `(${prefix + e})`).join('/')),
  autoplay: true,
  size: 'mini',
});

export const getCardTestContent = (record: AnyTestableCard): (AnyContent | null | undefined)[] => {
  if (record.type === CardType.VERB) {
    if (record.initial) {
      const tags = [getPartOfSentenceNames(record.type)];
      const correctValues = slashSplit(record.card.value);
      return [
        { type: 'tag', content: tags },
        { type: 'paragraph', content: record.card.translation, style: { textAlign: 'center', fontSize: 20 } },
        {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(correctValues),
        },
        ...getVerbTranslationBeforeAndAfterAnswer(record.card.translations, record.card.value),
        ...getAfterAnswerMetaInfo(record),
      ];
    } else {
      const meta = getVerbMeta(record.variant.mood, record.variant.tense);
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        { variant: 'secondary', text: meta.mood, color: getMoodColor(record.variant.mood) },
        { variant: 'primary', text: meta.tense, color: getTenseColor(record.variant.tense) },
      ];
      const correctValues = slashSplit(record.variant.conjugation.value);
      return [
        getTopRow(tags, record.card.value),
        {
          type: 'paragraph',
          content: record.card.value,
          style: { textAlign: 'center', fontSize: 20, display: 'block' },
        },
        {
          type: 'div',
          style: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexDirection: 'column' },
          content: [
            {
              type: 'text',
              content: getPronounDisplayName(record.variant.conjugation.pronoun),
              style: { fontSize: 20, display: 'inline-block' },
            },
            {
              type: 'input',
              inputId: '1',
              placeholder: 'tipp',
              autoFocus: true,
              correctValues,
              style: { textAlign: 'center', marginBottom: 10 },
              fullWidth: true,
              audioProps: prepareInputAudio(
                correctValues,
                getValueBeforeSlash(getPronounDisplayName(record.variant.conjugation.pronoun)) + ' ',
              ),
            },
          ],
        },
        ...getAfterAnswerTranslation(record.card.translation),
        ...getAfterAnswerMetaInfo(record),
        { type: 'afterAnswer', content: getVerbTranslationsContent(record.card.translations, record.card.value) },
      ];
    }
  } else if (record.type === CardType.NOUN) {
    if (record.initial) {
      const tags: ContentTag[] = [getPartOfSentenceNames(record.type)];
      const correctValues = slashSplit(record.card.value).map((word) => getWithArticle(word, record.card.gender));
      return [
        { type: 'tag', content: tags },
        { type: 'paragraph', content: record.card.translation, style: { textAlign: 'center', fontSize: 20 } },
        {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(correctValues),
        },
        ...getAfterAnswerMetaInfo(record),
      ];
    } else {
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getNumberDisplayName(record.variant.number),
          color: getNumberColor(record.variant.number),
        },
        { variant: 'primary', text: getCaseDisplayName(record.variant.case), color: getCaseColor(record.variant.case) },
      ];
      const possibleArticles =
        record.variant.number === NounNumber.plural
          ? [getArticle(record.variant.number, record.card.gender, true, record.variant.case) as string]
          : [
              getArticle(record.variant.number, record.card.gender, true, record.variant.case) as string,
              getArticle(record.variant.number, record.card.gender, false, record.variant.case) as string,
            ];
      const correctValues = slashSplit(record.variant.value)
        .map((word) => possibleArticles.map((article) => `${article} ${word}`))
        .flat();
      return [
        getTopRow(tags, record.card.value),
        {
          type: 'paragraph',
          content: record.card.value,
          style: { textAlign: 'center', fontSize: 20, display: 'block' },
        },
        {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(correctValues),
        },
        ...getAfterAnswerTranslation(record.card.translation),
        ...getAfterAnswerMetaInfo(record),
      ];
    }
  } else if (record.type === CardType.ARTICLE) {
    if (record.initial) {
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getArticleTypeDisplayName(record.card.isDefinite),
          color: getArticleTypeColor(record.card.isDefinite),
        },
        {
          variant: 'primary',
          text: getGenderDisplayName(record.card.gender),
          color: getGenderColor(record.card.gender),
        },
      ];
      const correctValues = slashSplit(record.card.value);
      return [
        { type: 'tag', content: tags },
        {
          type: 'paragraph',
          content: getWithSymbolArticle(record.card.translation, record.card.gender),
          style: { textAlign: 'center', fontSize: 20 },
        },
        {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(correctValues),
        },
        ...getAfterAnswerMetaInfo(record),
      ];
    } else {
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getGenderDisplayName(record.card.gender),
          color: getGenderColor(record.card.gender),
        },
        {
          variant: 'secondary',
          text: getArticleTypeDisplayName(record.card.isDefinite),
          color: getArticleTypeColor(record.card.isDefinite),
        },
        { variant: 'primary', text: getCaseDisplayName(record.variant.case), color: getCaseColor(record.variant.case) },
      ];
      const correctValues = slashSplit(record.variant.value);
      return [
        getTopRow(tags, record.card.value),
        {
          type: 'paragraph',
          content: record.card.value,
          style: { textAlign: 'center', fontSize: 20, display: 'block' },
        },
        {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(correctValues),
        },
        ...getAfterAnswerMetaInfo(record),
      ];
    }
  } else if (record.type === CardType.ADJECTIVE) {
    if (record.isInitialTrio) {
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        { variant: 'primary', text: getDegreeDisplayName(record.degree), color: getDegreeColor(record.degree) },
      ];
      const correctValues = slashSplit(record.value);
      return [
        { type: 'tag', content: tags },
        {
          type: 'paragraph',
          content: record.card.translation,
          style: { textAlign: 'center', fontSize: 20 },
        },
        {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(correctValues),
        },
      ];
    } else {
      let rootValue = record.card.value;
      if (record.variant.degree === AdjectiveDegree.Komparativ) rootValue = record.card.komparativ as string;
      if (record.variant.degree === AdjectiveDegree.Superlativ) rootValue = record.card.superlativ as string;
      const tags: ContentTag[] = [
        getPartOfSentenceNames(record.type),
        {
          variant: 'secondary',
          text: getDegreeDisplayName(record.variant.degree),
          color: getDegreeColor(record.variant.degree),
        },
        {
          variant: 'secondary',
          text: getInflationDisplayName(record.variant.inflection),
          color: getInflationColor(record.variant.inflection),
        },
        {
          variant: 'primary',
          text: getGenderDisplayName(record.variant.gender),
          color: getGenderColor(record.variant.gender),
        },
        { variant: 'primary', text: getCaseDisplayName(record.variant.case), color: getCaseColor(record.variant.case) },
      ];
      const correctValues = slashSplit(record.variant.value);
      return [
        getTopRow(tags, rootValue),
        {
          type: 'paragraph',
          content: getWithSymbolArticle(rootValue, record.variant.gender),
          style: { textAlign: 'center', fontSize: 20, display: 'block' },
        },
        {
          type: 'input',
          inputId: '1',
          placeholder: 'tipp',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(correctValues),
        },
        ...getAfterAnswerTranslation(record.card.translation),
        ...getAfterAnswerMetaInfo(record),
      ];
    }
  } else if (record.type === CardType.PREPOSITION) {
    const tags: ContentTag[] = [getPartOfSentenceNames(record.type)];
    const correctValues = slashSplit(record.card.value);
    return [
      { type: 'tag', content: tags },
      ...getPrepositionsTranslation(record.card.variations),
      {
        type: 'input',
        inputId: '1',
        placeholder: 'tipp',
        fullWidth: true,
        autoFocus: true,
        correctValues,
        caseInsensitive: true,
        style: { textAlign: 'center' },
        audioProps: prepareInputAudio(correctValues),
      },
      ...getAfterAnswerMetaInfo(record),
    ];
  } else if (record.type === CardType.PRONOUN) {
    let displayValue = record.card.value;
    const shouldHideValue = record.variant.case === Case.Nominativ;
    if (shouldHideValue) displayValue = `Übersetzung: ${record.card.translation}`;
    const tags: ContentTag[] = [
      getPartOfSentenceNames(record.type),
      {
        variant: 'secondary',
        text: getPronounFunctionDisplayName(record.function),
        color: getPronounFunctionColor(record.function),
      },
      record.variant.gender !== null
        ? {
            variant: 'primary',
            text: getGenderDisplayName(record.variant.gender),
            color: getGenderColor(record.variant.gender),
          }
        : undefined,
      { variant: 'primary', text: getCaseDisplayName(record.variant.case), color: getCaseColor(record.variant.case) },
    ];
    const correctValues = slashSplit(record.variant.value);
    return [
      getTopRow(tags, shouldHideValue ? '' : displayValue),
      {
        type: 'paragraph',
        content:
          record.variant.gender !== null ? getWithSymbolArticle(displayValue, record.variant.gender) : displayValue,
        style: { textAlign: 'center', fontSize: 20, display: 'block' },
      },
      {
        type: 'input',
        inputId: '1',
        placeholder: 'tipp',
        fullWidth: true,
        autoFocus: true,
        correctValues,
        style: { textAlign: 'center' },
        audioProps: prepareInputAudio(correctValues),
      },
      ...(shouldHideValue ? [] : getAfterAnswerTranslation(record.card.translation)),
      ...getAfterAnswerMetaInfo(record),
    ];
  } else if (record.type === null) {
    const tags: ContentTag[] = record.typeTag ? [record.typeTag] : [];
    const correctValues = slashSplit(record.card.value);
    return [
      { type: 'tag', content: tags },
      { type: 'paragraph', content: record.card.translation, style: { textAlign: 'center', fontSize: 20 } },
      {
        type: 'input',
        inputId: '1',
        placeholder: 'tipp',
        fullWidth: true,
        autoFocus: true,
        correctValues,
        caseInsensitive: !record.card.caseSensitive,
        style: { textAlign: 'center' },
        audioProps: prepareInputAudio(correctValues),
      },
      ...getAfterAnswerMetaInfo(record),
    ];
  }
  return [];
};

const getAfterAnswerMetaInfo = (record: AnyTestableCard): AnyContent[] => {
  const table = getTableViewContent(record);
  if (table.length === 0) return [];
  return [
    {
      type: 'afterAnswer',
      content: [
        { type: 'hr', style: { opacity: 0.2 } },
        {
          type: 'expandable',
          showMoreText: 'Mehr anzeigen',
          showLessText: 'Weniger anzeigen',
          childContent: {
            type: 'div',
            content: table,
          },
        },
      ],
    },
  ];
};

const getAfterAnswerMetaInfo2 = (content: (AnyContent | null | undefined)[]): AnyContent[] => {
  if (content.filter(isNonNullable).length === 0) return [];
  return [
    {
      type: 'afterAnswer',
      content: [
        {
          type: 'expandable',
          showMoreText: 'Mehr anzeigen',
          showLessText: 'Weniger anzeigen',
          childContent: {
            type: 'div',
            content,
          },
        },
      ],
    },
  ];
};

const getAfterAnswerTranslation = (translation: string): AnyContent[] => {
  return [
    {
      type: 'afterAnswer',
      content: [
        { type: 'paragraph', content: 'Übersetzung: ' + translation, style: { textAlign: 'center', fontSize: 20 } },
      ],
    },
  ];
};

function getValueBeforeSlash(value: string) {
  const index = value.indexOf('/');
  return index === -1 ? value : value.slice(0, index);
}

function getConjugations(mood: VerbMood, tense: VerbTense, variants: VerbVariant[]) {
  const tenseVariants = variants.find((variant) => variant.mood === mood);
  const variant = tenseVariants?.tenses.find((t) => t.tense === tense);
  return variant?.conjugations;
}

const defaultCases = [Case.Nominativ, Case.Akkusativ, Case.Dativ, Case.Genitiv];

function getCasesTable(variants: NounVariant[], number: NounNumber, gender: NounGender) {
  return defaultCases.map((caseId): [string, string, string] => {
    const variant = variants.find((v) => v.case === caseId && v.number === number);
    if (!variant) return [getCaseDisplayName(caseId), '', '-'];
    const article =
      variant.number === NounNumber.plural
        ? (getArticle(variant.number, gender, true, variant.case) as string)
        : `${getArticle(variant.number, gender, true, variant.case)}/${getArticle(variant.number, gender, false, variant.case)}`;
    return [getCaseDisplayName(caseId), article, variant.value];
  });
}
function getArticleCasesTable(variants: ArticleVariant[]) {
  return defaultCases.map((caseId): [string, string] => {
    const variant = variants.find((v) => v.case === caseId);
    return [getCaseDisplayName(caseId), variant?.value || '-'];
  });
}

function getAdjectiveCasesTable(
  degree: AdjectiveDegree,
  inflation: AdjectiveInflection,
  gender: NounGender,
  variants: AdjectiveVariant[],
) {
  const genderIndex = {
    [NounGender.Maskulinum]: 1,
    [NounGender.Femininum]: 2,
    [NounGender.Neutrum]: 3,
    [NounGender.Plural]: 4,
  }[gender] as 1 | 2 | 3 | 4;
  const myVariants = variants.find((v) => v.degree === degree && v.inflection === inflation);
  if (!myVariants) return [];
  return defaultCases.map((caseId): [string, string] => {
    const variant = myVariants.values.find((v) => v[0] === caseId);
    if (!variant) return [getCaseDisplayName(caseId), '-'];
    return [getCaseDisplayName(caseId), variant[genderIndex]];
  });
}

function getPronounCasesTable(
  functionId: PronounFunction,
  gender: NounGender | null,
  number: NounNumber,
  variants: PronounVariant[],
) {
  let variantIndex = 0;
  if (gender === null) {
    variantIndex = number === NounNumber.singular ? 1 : 2;
  } else {
    variantIndex = {
      [NounGender.Maskulinum]: 1,
      [NounGender.Femininum]: 2,
      [NounGender.Neutrum]: 3,
      [NounGender.Plural]: 4,
    }[gender];
  }
  //
  const myVariants = variants.find((v) => v.function === functionId);
  if (!myVariants) return [];
  return defaultCases.map((caseId): [string, string] => {
    const variant = myVariants.values.find((v) => v[0] === caseId);
    if (!variant) return [getCaseDisplayName(caseId), '-'];
    return [getCaseDisplayName(caseId), variant[variantIndex as 1 | 2] ?? '-'];
  });
}

function getConjugationTable(conjugations: VerbConjugationVariant[]) {
  const thirdPronoun = conjugations.find((c) => c.pronoun === VerbPronoun.es) ? VerbPronoun.es : VerbPronoun.er_sie_es;
  return [VerbPronoun.ich, VerbPronoun.du, thirdPronoun, VerbPronoun.wir, VerbPronoun.ihr, VerbPronoun.sie_Sie].map(
    (pronoun): [string, string] => {
      const conjugation = conjugations.find((c) => c.pronoun === pronoun);
      if (!conjugation) return [getPronounDisplayName(pronoun), '-'];
      return [getPronounDisplayName(pronoun), conjugation.value];
    },
  );
}
