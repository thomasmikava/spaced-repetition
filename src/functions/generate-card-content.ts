/* eslint-disable no-case-declarations */
/* eslint-disable sonarjs/cognitive-complexity */
import type { AnyContent, ContentTag, ContentVoice } from '../content-types';
import { AttributeMapper } from '../database/attributes';
import type { AudioAffix, ViewLine } from '../database/card-types';
import { ViewLineType, type CardTypeRecord } from '../database/card-types';
import type { Attribute, AttributeRecord, IdType, StandardCardAttributes, TranslationVariant } from '../database/types';
import { isNonNullable } from '../utils/array';
import { pickKeys } from '../utils/object';
import { slashSplit } from '../utils/split';
import { isMatch } from '../utils/matcher';
import type { StandardTestableCard } from './reviews';
import { CardViewMode } from './reviews';
import { getArticle, getWithSymbolArticle } from './texts';

const getTopRow = (lang: string, tags: ContentTag[], word: string): AnyContent => {
  return {
    type: 'div',
    content: [
      { type: 'tag', content: tags },
      word
        ? {
            type: 'voice',
            language: lang,
            text: prepareTextForAudio(word),
            autoplay: true,
            style: { alignSelf: 'baseline' },
          }
        : undefined,
    ],
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  };
};

const generateColumnedTable = <Row extends string[]>(
  rows: Row[],
  getVoiceText: (row: Row, index: number) => string,
  lang: string,
  mainValueIndex: number = 1,
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
                    language: lang,
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

const getVerbTranslationsContent2 = (
  translations: TranslationVariant[],
  cardValue: string | null,
  langToLearn: string,
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
              content: getTranslationVariantTags(attrs, langToLearn, helper),
            }
          : null,
        { type: 'paragraph', content: translation, style: { textAlign: 'center' } },
      ],
      style: { display: 'flex', columnGap: 10, alignItems: 'center', justifyContent: 'center' },
    };
  });
};

const getTranslationVariantTags = (
  attrs: NonNullable<TranslationVariant['attrs']>,
  lang: string,
  helper: Helper,
): ContentTag[] => {
  const tags: string[] = [];
  for (const attrId in attrs) {
    const valueId = attrs[attrId];
    const valueIds = Array.isArray(valueId) ? valueId : [valueId];
    for (const id of valueIds) {
      const value = helper.getAttributeRecord(id, lang);
      if (value) tags.push(value.name);
    }
  }
  return tags;
};

const getVerbTranslationBeforeAndAfterAnswer2 = (
  translations: TranslationVariant[],
  cardValue: string,
  langToLearn: string,
  helper: Helper,
): AnyContent[] => {
  return [
    { type: 'beforeAnswer', content: getVerbTranslationsContent2(translations, '*', langToLearn, helper) },
    { type: 'afterAnswer', content: getVerbTranslationsContent2(translations, cardValue, langToLearn, helper) },
  ];
};

export interface Helper {
  getCardType: (cardTypeId: number, lang: string) => CardTypeRecord | undefined;
  getSupportedCardTypes(lang: string): CardTypeRecord[];
  getAttribute: (attributeId: number | string, lang: string) => Attribute | undefined;
  getAttributeRecord: (attrRecordId: number | string, lang: string) => AttributeRecord | undefined;
  getAttributeRecordsByAttributeId: (attributeId: number | string, lang: string) => AttributeRecord[];
}

const getTags = (record: StandardTestableCard, mode: CardViewMode, helper: Helper) => {
  const viewAttrs = helper.getCardType(record.displayType, record.card.lang)?.configuration?.tags;
  const cardTypeDisplayName = helper.getCardType(record.displayType, record.card.lang)?.cardDisplayName;
  const tags: ContentTag[] = !cardTypeDisplayName ? [] : [cardTypeDisplayName];

  const getAttrInfo = (attrId: IdType | string, value: IdType) => {
    const attr = helper.getAttribute(attrId, record.card.lang);
    if (!attr) return null;
    const attrRecord = helper.getAttributeRecord(value, record.card.lang);
    if (!attrRecord) return null;
    return { color: attrRecord.color || '', text: attrRecord.name };
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

const getPrefix = (
  affix: AudioAffix,
  attrs: StandardCardAttributes | null | undefined,
  langToLearn: string,
  helper: Helper,
): string => {
  if (affix.type === 'text') {
    return affix.text + ' ';
  }
  const attrRecordId = attrs ? attrs[affix.attrId] : undefined;
  const attributeValueName = attrRecordId ? helper.getAttributeRecord(attrRecordId, langToLearn)?.name : undefined;
  const val =
    attributeValueName && typeof affix.splitIndex === 'number'
      ? slashSplit(attributeValueName)[affix.splitIndex]
      : attributeValueName;
  if (!val) return '';
  return val + ' ';
};

export const getCardViewContent2 = (
  record: StandardTestableCard,
  mode: CardViewMode,
  helper: Helper,
): (AnyContent | null | undefined)[] => {
  const config = helper.getCardType(record.displayType, record.card.lang)?.configuration;
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
    let newWord = options.useArticleAsPrefix ? getArticle(record.card.lang, attributes, true) + ' ' + word : word;
    if (!forAudio && options.includeArticleSymbol && AttributeMapper.GENDER.id in attributes) {
      newWord = getWithSymbolArticle(record.card.lang, newWord, attributes[AttributeMapper.GENDER.id]);
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
          return getVerbTranslationBeforeAndAfterAnswer2(
            record.card.advancedTranslation,
            record.card.value,
            record.card.lang,
            helper,
          );
        }
        return getVerbTranslationsContent2(
          record.card.advancedTranslation,
          record.card.value,
          record.card.lang,
          helper,
        );
      case ViewLineType.AttrValue:
        const attrs = record.variant.attrs || {};
        const attrValueIds = line.attrs.map((attrId) => attrs[attrId]);
        const attrValues = attrValueIds
          .map((attrValueId) => {
            const attrRecord = helper.getAttributeRecord(attrValueId, record.card.lang);
            return attrRecord ? attrRecord.name : null;
          })
          .filter(isNonNullable);
        return { type: 'text', content: attrValues.join(line.separator ?? ', '), style: textStyle };
      case ViewLineType.Input:
        const displayValue2 = withArticle(record.variant.value, record.variant.attrs, line);
        const correctValues = slashSplit(displayValue2); // TODO: implement articles
        return {
          type: 'input',
          inputId: '1',
          placeholder: 'type',
          fullWidth: true,
          autoFocus: true,
          correctValues,
          caseInsensitive: record.caseSensitive,
          style: { textAlign: 'center' },
          audioProps: prepareInputAudio(
            record.card.lang,
            correctValues,
            line.audioPrefix ? getPrefix(line.audioPrefix, record.variant.attrs, record.card.lang, helper) : undefined,
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
        const attr = helper.getAttribute(attrId, record.card.lang);
        if (!attr) return undefined;
        const myAttrObjects =
          mainAttr.type === 'attr' && mainAttr.attrRecordValues
            ? mainAttr.attrRecordValues
                .map((id) => {
                  if (Array.isArray(id)) {
                    const firstRecord = id.find((realId) =>
                      record.groupMeta.variants.some((e) => e.attrs?.[attrId] === realId),
                    );
                    return helper.getAttributeRecord(firstRecord ?? id[0], record.card.lang);
                  }
                  return helper.getAttributeRecord(id, record.card.lang);
                })
                .filter(isNonNullable)
            : helper.getAttributeRecordsByAttributeId(attrId, record.card.lang);
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
                  attrValue.attributeId === attrId
                    ? attrValue
                    : valueId
                      ? helper.getAttributeRecord(valueId, record.card.lang)
                      : undefined;
                row.push(valueRecord?.name ?? '');
              } else if (column.type === 'article') {
                if (!variant) row.push('');
                else
                  row.push(
                    getArticle(
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
        return generateColumnedTable(
          rows,
          (_row, index) => prepareTextForAudio(audioInfo[index] || ''),
          record.card.lang,
        );
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
  return [getTopRow(record.card.lang, tags, audioText), ...lineContents];
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

const prepareTextForAudio = (text: string) => slashSplit(text).join('. ');
const prepareInputAudio = (lang: string, correctValues: string[], prefix: string = ''): Omit<ContentVoice, 'type'> => ({
  language: lang,
  text: prepareTextForAudio(correctValues.map((e) => `(${prefix + e})`).join('/')),
  autoplay: true,
  size: 'mini',
});

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
