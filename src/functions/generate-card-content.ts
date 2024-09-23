/* eslint-disable no-case-declarations */
/* eslint-disable sonarjs/cognitive-complexity */
import type {
  AdvancedAnswerCheckerOptions,
  AnyContent,
  ContentTag,
  ContentTagLike,
  ContentVoice,
} from '../content-types';
import { AttributeMapper } from '../database/attributes';
import type { AudioAffix, CategoryAttrsMatcher, ViewLine } from '../database/card-types';
import { ViewLineType, type CardTypeRecord } from '../database/card-types';
import type {
  Attribute,
  AttributeRecord,
  Category,
  IdType,
  Label,
  StandardCardAttributes,
  StandardCardVariant,
  TranslationVariant,
} from '../database/types';
import { isNonNullable, uniquelize } from '../utils/array';
import { pickKeys } from '../utils/object';
import { slashSplit } from '../utils/split';
import { getConditionalOrRawValue, isMatch } from '../utils/matcher';
import type { StandardTestableCard } from './reviews';
import { CardViewMode } from './reviews';
import { getArticle, getWithArticle, getWithSymbolArticle } from './texts';
import type { WordUsageExampleDTO } from '../api/controllers/words/words.schema';
import { getAttributeTransformer } from './transformers';
import { ALL_LANGS, sortByLangs } from '../Pages/hooks/useTranslationLang';
import type { Preferences } from './preferences';
import { SPECIAL_VIEW_IDS } from './consts';
import { generatePossibleAnswers } from './compare-answers';
import { TranslationPosition } from '../api/controllers/users/users.schema';

const getTopRow = (lang: string, tags: ContentTagLike[], word: string): AnyContent => {
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
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
  };
};

const generateColumnedTable = <Row extends (string | AnyContent)[]>(
  rows: Row[],
  mainValueIndex: number = 1,
): AnyContent[] => {
  return [
    {
      type: 'table',
      style: { fontSize: 20, margin: '0 auto' },
      content: rows.map((row): AnyContent[] => {
        return row.map((value, ind): AnyContent => {
          return typeof value === 'string'
            ? {
                type: 'div',
                content: [{ type: 'text', content: value }],
                style: { textAlign: ind === 0 ? 'right' : 'center' },
              }
            : value;
        });
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
  isAnswerRevealed: boolean,
): AnyContent[] => {
  return translations.flatMap(({ schema, attrs, translation, examples }): AnyContent | AnyContent[] => {
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
        {
          type: 'div',
          content: [
            attrs
              ? {
                  type: 'tag',
                  content: getTranslationVariantTags(attrs, langToLearn, helper),
                }
              : null,
            { type: 'paragraph', content: translation, style: { textAlign: 'center', margin: 0 } },
          ],
          style: { display: 'flex', columnGap: 10, alignItems: 'center', justifyContent: 'center' },
        },
        examples && isAnswerRevealed ? getExamplesContent(examples) : undefined,
      ],
      style: { margin: '15px 0', fontSize: 20, borderTop: '1px solid black' },
    };
  });
};

const getExamplesContent = (examples: WordUsageExampleDTO[]): AnyContent => {
  return {
    type: 'div',
    content: examples.map(
      (example): AnyContent => ({
        type: 'div',
        content: [
          { type: 'paragraph', content: `Example: ${example.text}`, style: { margin: 0 } },
          example.translation
            ? { type: 'paragraph', content: `Translation: ${example.translation}`, style: { margin: 0 } }
            : undefined,
        ],
        style: { marginBottom: 10 },
      }),
    ),
    style: { fontSize: 18 },
  };
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
    { type: 'beforeAnswer', content: getVerbTranslationsContent2(translations, '*', langToLearn, helper, false) },
    { type: 'afterAnswer', content: getVerbTranslationsContent2(translations, cardValue, langToLearn, helper, true) },
  ];
};

export interface Helper {
  getCardType: (cardTypeId: number, lang: string) => CardTypeRecord | undefined;
  getSupportedCardTypes(lang: string): CardTypeRecord[];
  getAttribute: (attributeId: number | string, lang: string) => Attribute | undefined;
  getAttributeRecord: (attrRecordId: number | string, lang: string) => AttributeRecord | undefined;
  getAttributeRecordsByAttributeId: (attributeId: number | string, lang: string) => AttributeRecord[];
  getLabels: (lang: string) => Label[];
  getCategories: (lang: string) => Category[];
}

const getTags = (record: StandardTestableCard, mode: CardViewMode, helper: Helper) => {
  const viewAttrs = helper.getCardType(record.displayType, record.card.lang)?.configuration?.tags;
  const cardTypeDisplayName = helper.getCardType(record.displayType, record.card.lang)?.cardDisplayName;
  const tags: ContentTagLike[] = !cardTypeDisplayName ? [] : [cardTypeDisplayName];

  const getAttrInfo = (attrId: IdType | string, value: IdType) => {
    const attr = helper.getAttribute(attrId, record.card.lang);
    if (!attr) return null;
    const attrRecord = helper.getAttributeRecord(value, record.card.lang);
    if (!attrRecord) return null;
    return { color: attrRecord.color || '', text: attrRecord.name };
  };
  if (viewAttrs) {
    viewAttrs.forEach(({ attrId, type, defValue, matcher, displayAfterAnswer }) => {
      if (
        matcher &&
        !isMatch<{ category?: IdType | null; attrs?: StandardCardAttributes | null; viewMode: CardViewMode }>(
          { category: record.variant.category, attrs: record.variant.attrs, viewMode: mode },
          matcher,
        )
      ) {
        return null;
      }
      const attr = record.variant.attrs?.[attrId] ?? defValue;
      if (attr === undefined) return null;
      const info = getAttrInfo(attrId, attr);
      if (!info) return null;
      const tag: ContentTag = {
        text: info.text,
        color: info.color,
        variant: type ?? 'regular',
      };
      if (displayAfterAnswer) {
        tags.push({
          type: 'afterAnswer',
          content: tag,
        });
      } else {
        tags.push(tag);
      }
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

const getDefaultLines = (mode: CardViewMode, viewId: string | null | undefined): ViewLine[] => {
  if (mode === CardViewMode.test && viewId === SPECIAL_VIEW_IDS.inverseTest) {
    return [
      { type: ViewLineType.CardValue, useForMainAudio: true },
      { type: ViewLineType.NewLine },
      {
        type: ViewLineType.Input,
        placeholder: 'type translation',
        skipAudio: true,
        shouldNotReplaceWithCorrectAnswer: true,
        useTranslationsAsValue: true,
      },
      {
        type: ViewLineType.AfterAnswer,
        lines: [{ type: ViewLineType.Translation }, { type: ViewLineType.TranslationVariants }],
      },
    ];
  }
  if (mode === CardViewMode.test) {
    return [
      {
        type: ViewLineType.Trio,
        trans: { type: ViewLineType.Translation },
        input: { type: ViewLineType.Input },
        transVariants: { type: ViewLineType.TranslationVariants, partiallyHiddenBeforeAnswer: true },
      },
    ];
  }

  return [
    { type: ViewLineType.Audio },
    { type: ViewLineType.VariantValue, bigText: true },
    { type: ViewLineType.Separator },
    { type: ViewLineType.Translation },
    { type: ViewLineType.TranslationVariants },
  ];
};

const getViewLines = (record: StandardTestableCard, mode: CardViewMode, helper: Helper) => {
  const config = helper.getCardType(record.displayType, record.card.lang)?.configuration;
  // const mathcer = config?.variantGroups?.find((e) => e.id === record.groupMeta.matcherId)?.matcher;
  const myViewId =
    mode === CardViewMode.test
      ? record.groupMeta.testViewId
      : mode === CardViewMode.groupView
        ? record.groupMeta.groupViewId
        : record.groupMeta.indViewId;
  const view = myViewId ? config?.views?.find((e) => e.id === myViewId) : undefined;
  return view?.lines ?? getDefaultLines(mode, myViewId);
};

export const getCardViewContent = (
  record: StandardTestableCard,
  mode: CardViewMode,
  helper: Helper,
  preferences: Preferences,
): (AnyContent | null | undefined)[] => {
  const viewLines = getViewLines(record, mode, helper);

  const { lineContents, mainAudioText } = viewLinesToContentLines(viewLines, helper, record, preferences);

  let audioText = mainAudioText ?? '';
  const audio = viewLines.find((e) => e.type === ViewLineType.Audio);
  if (!audioText && audio && audio.type === ViewLineType.Audio) {
    const rawValue = record.variant.value;
    audioText = withArticle(rawValue, record.card.lang, helper, record.variant.attrs, audio, true);
  }

  const tags = getTags(record, mode, helper);
  return [getTopRow(record.card.lang, tags, audioText), ...lineContents];
};

const withArticle = (
  word: string,
  lang: string,
  helper: Helper,
  attributes: StandardCardAttributes | null | undefined,
  options: {
    includeArticleSymbol?: boolean;
    useArticleAsPrefix?: boolean;
    includeLegend?: boolean;
    hashReplacer?: { attrId: IdType };
    prefix?: { type: 'text'; text: string };
  },
  forAudio = false,
) => {
  if (
    (!options.includeArticleSymbol &&
      !options.useArticleAsPrefix &&
      !options.includeLegend &&
      !options.hashReplacer &&
      !options.prefix) ||
    !attributes
  ) {
    return word;
  }
  let newWord = options.useArticleAsPrefix ? getWithArticle(lang, word, attributes) : word;
  if (options.hashReplacer && attributes && hasHash(word)) {
    const recordId = attributes[options.hashReplacer.attrId];
    if (recordId !== undefined) {
      const attrRecord = helper.getAttributeRecord(recordId, lang);
      if (attrRecord) {
        newWord = normalizeDisplayValue(newWord, attrRecord.name);
      }
    }
  }
  if (!forAudio && options.includeArticleSymbol && AttributeMapper.GENDER.id in attributes) {
    newWord = getWithSymbolArticle(lang, newWord, attributes[AttributeMapper.GENDER.id]);
  }
  if (options.prefix) {
    newWord = options.prefix.text + newWord;
  }
  if (!forAudio && options.includeLegend) {
    newWord = 'Translation: ' + newWord; // TODO: translate according to locale
  }
  return newWord;
};

const findVariant = (
  allStandardizedVariants: StandardCardVariant[],
  matcher: CategoryAttrsMatcher | CategoryAttrsMatcher[],
  currentVariant?: StandardCardVariant,
): StandardCardVariant | undefined => {
  if (Array.isArray(matcher)) {
    // find first match
    for (const singleMatcher of matcher) {
      const foundVariant = findVariant(allStandardizedVariants, singleMatcher, currentVariant);
      if (foundVariant) return foundVariant;
    }
    return undefined;
  } else {
    return allStandardizedVariants.find((e) =>
      isMatch<{ category?: IdType | null; attrs?: StandardCardAttributes | null }>(e, matcher, currentVariant),
    );
  }
};

export const viewLinesToContentLines = (
  lines: ViewLine[],
  helper: Helper,
  record: Pick<StandardTestableCard, 'caseSensitive' | 'card' | 'variant' | 'groupMeta'>,
  preferences: Preferences,
) => {
  const textStyle: React.CSSProperties = { textAlign: 'center', fontSize: 20, display: 'block' };

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
        const displayValue = withArticle(rawValue, record.card.lang, helper, record.variant.attrs, line);
        if (line.useForMainAudio)
          mainAudioText = withArticle(rawValue, record.card.lang, helper, record.variant.attrs, line, true);
        if (line.bigText) {
          return { type: 'header', variant: 'h1', content: displayValue, style: { textAlign: 'center' } };
        }
        return { type: line.paragraph ? 'paragraph' : 'text', content: displayValue, style: textStyle };
      }
      case ViewLineType.CustomCardValue: {
        if (!line.matcher) return null;
        const cardVariant = findVariant(record.card.allStandardizedVariants, line.matcher, record.variant);
        if (!cardVariant) return null;
        const displayValue = withArticle(cardVariant.value, record.card.lang, helper, cardVariant.attrs, line);
        if (line.useForMainAudio)
          mainAudioText = withArticle(cardVariant.value, record.card.lang, helper, cardVariant.attrs, line, true);
        if (line.bigText) {
          return { type: 'header', variant: 'h1', content: displayValue, style: { textAlign: 'center' } };
        }
        return { type: line.paragraph ? 'paragraph' : 'text', content: displayValue, style: textStyle };
      }
      case ViewLineType.TranslationLangSelector:
        return { type: 'translation-lang-selector' };
      case ViewLineType.Translation:
        return {
          type: 'under-translation-lang',
          getContent: (lang, langOptions) => {
            const translations =
              lang === ALL_LANGS
                ? sortByLangs(record.card.translations, langOptions)
                : record.card.translations.filter((e) => e.lang === lang);
            if (translations.length === 0) return null;
            if (preferences.hideRegularTranslationIfAdvanced) {
              const advancedTranslations = translations.filter(
                (e) => e.advancedTranslation && e.advancedTranslation.length,
              );
              if (advancedTranslations.length) return null;
            }
            const displayValues = translations.map((translation) =>
              withArticle(translation.translation, record.card.lang, helper, record.variant.attrs, line),
            );
            if (displayValues.length === 1) return { type: 'paragraph', content: displayValues[0], style: textStyle };
            return {
              type: 'div',
              content: displayValues.map((e) => ({ type: 'paragraph', content: e, style: textStyle })),
            };
          },
        };
      case ViewLineType.TranslationVariants:
        return {
          type: 'under-translation-lang',
          getContent: (lang, langOptions): AnyContent | null => {
            const translations =
              lang === ALL_LANGS
                ? sortByLangs(record.card.translations, langOptions)
                : record.card.translations.filter((e) => e.lang === lang);
            if (translations.length === 0) return null;
            const displayValues = translations.map((translation) => {
              if (!translation.advancedTranslation || translation.advancedTranslation.length < 1) return null;
              if (line.partiallyHiddenBeforeAnswer) {
                return getVerbTranslationBeforeAndAfterAnswer2(
                  translation.advancedTranslation,
                  record.card.value,
                  record.card.lang,
                  helper,
                );
              }
              return getVerbTranslationsContent2(
                translation.advancedTranslation,
                record.card.value,
                record.card.lang,
                helper,
                true,
              );
            });
            return {
              type: 'div',
              content: displayValues.flat(1),
            };
          },
        };
      case ViewLineType.Trio: {
        if (preferences.transPos === TranslationPosition.top) {
          return [mapLine(line.trans), mapLine(line.transVariants), mapLine(line.input)].flat();
        }
        if (preferences.transPos === TranslationPosition.bottom) {
          return [mapLine(line.input), mapLine(line.trans), mapLine(line.transVariants)].flat();
        }
        return [mapLine(line.trans), mapLine(line.input), mapLine(line.transVariants)].flat();
      }
      case ViewLineType.AttrRecordValues:
        const attrs = (line.customAttrRecords ?? record.variant.attrs) || {};
        const attrValueIds = line.attrs.map((attrId) => attrs[attrId]);
        const attrValues = attrValueIds
          .map((attrValueId) => {
            const attrRecord = helper.getAttributeRecord(attrValueId, record.card.lang);
            return attrRecord ? attrRecord.name : null;
          })
          .filter(isNonNullable);
        return { type: 'text', content: attrValues.join(line.separator ?? ', '), style: textStyle };
      case ViewLineType.Input:
        const displayValue2 = withArticle(record.variant.value, record.card.lang, helper, record.variant.attrs, line);
        const getCorrectValues = (displayValue2: string, caseInsensitive: boolean) => {
          if (!line.useTranslationsAsValue) return slashSplit(displayValue2);
          const translations = record.card.translations;
          return uniquelize(
            translations.flatMap((e) =>
              generatePossibleAnswers(e.translation, caseInsensitive, e.lang).concat(
                (e.advancedTranslation || []).flatMap((adv) =>
                  generatePossibleAnswers(adv.translation, caseInsensitive, e.lang),
                ),
              ),
            ),
          );
        };
        const correctValues = slashSplit(displayValue2);
        const audioPrefixObj = getConditionalOrRawValue(line.audioPrefix, record.variant);
        return {
          type: 'input',
          inputId: '1',
          placeholder: line.placeholder ?? 'type',
          fullWidth: true,
          autoFocus: true,
          correctValues: getCorrectValues(displayValue2, record.caseSensitive),
          caseInsensitive: !record.caseSensitive,
          advancedAnswerChecker: line.useTranslationsAsValue ? undefined : getAnswerChecker(displayValue2),
          shouldNotReplaceWithCorrectAnswer: !!line.shouldNotReplaceWithCorrectAnswer,
          style: { textAlign: 'center' },
          audioProps: line.skipAudio
            ? undefined
            : prepareInputAudio(
                record.card.lang,
                correctValues,
                audioPrefixObj ? getPrefix(audioPrefixObj, record.variant.attrs, record.card.lang, helper) : undefined,
              ),
          autoCheck: preferences.autoSubmitCorrectAnswers,
        };
      case ViewLineType.AfterAnswer:
        return {
          type: 'afterAnswer',
          content: line.lines.map(mapLine).flat(1),
        };
      case ViewLineType.AfterAnswerDropdown:
        return getAfterAnswerMetaInfo2(line.lines.map(mapLine).flat(1), line);
      case ViewLineType.Dropdown:
        return getDropdown(line.lines.map(mapLine).flat(1), line);
      case ViewLineType.Section:
        return {
          type: 'section',
          size: line.size,
          title: typeof line.title === 'string' ? line.title : line.title.map(mapLine).flat(1),
          content: line.lines.map(mapLine).flat(1),
        };
      case ViewLineType.Table:
        const groupMetaArgs = line.customGroupMetaArgs ?? record.groupMeta.groupMetaArgs;
        const columns = line.columns.map((column) => {
          return getConditionalOrRawValue(column, { groupMetaArgs });
        });
        const mainColumn = columns.find((e) => (e.type === 'attr' || e.type === 'matchers') && e.main);
        if (!mainColumn) return undefined;
        const attrId = mainColumn.type === 'attr' ? mainColumn.attr : 0;
        const attr = helper.getAttribute(attrId, record.card.lang);
        if (mainColumn.type === 'attr' && !attr) return undefined;
        const anyVariants = line.useAllVariants ? record.card.allStandardizedVariants : record.groupMeta.variants;
        const variants = line.matcher
          ? anyVariants.filter((someVariant) =>
              isMatch<{ category?: IdType | null; attrs?: StandardCardAttributes | null }>(
                { category: someVariant.category, attrs: someVariant.attrs },
                line.matcher!,
              ),
            )
          : anyVariants;
        const myAttrObjects =
          mainColumn.type === 'attr' && mainColumn.attrRecordValues
            ? mainColumn.attrRecordValues
                .map((id) => {
                  if (Array.isArray(id)) {
                    const firstRecord = id.find((realId) => variants.some((e) => e.attrs?.[attrId] === realId));
                    return helper.getAttributeRecord(firstRecord ?? id[0], record.card.lang);
                  }
                  return helper.getAttributeRecord(id, record.card.lang);
                })
                .filter(isNonNullable)
            : mainColumn.type === 'attr'
              ? helper.getAttributeRecordsByAttributeId(attrId, record.card.lang)
              : null;
        const hiddenColumnIndices = columns
          .map((e, indx) => ((e as { hidden?: boolean }).hidden ? indx : null))
          .filter(isNonNullable);

        let mainValueIndex = line.columns.findIndex((e) => e.type === 'value');
        if (mainValueIndex === -1) mainValueIndex = 0;
        const mainColumnRows = myAttrObjects
          ? myAttrObjects.map((attrValue) => {
              const matchedVariants = variants.filter((e) => e.attrs?.[attrId] === attrValue.id);
              return { variants: matchedVariants, attrValue };
            })
          : mainColumn.type === 'matchers'
            ? mainColumn.matchers.map((matcher) => {
                const matchedVariants = variants.filter((e) =>
                  isMatch<{ category?: IdType | null; attrs?: StandardCardAttributes | null }>(e, matcher),
                );
                return { variants: matchedVariants, attrValue: undefined };
              })
            : [];
        const rows = mainColumnRows
          .map(({ variants, attrValue }): (string | AnyContent | null)[] => {
            const row: (string | AnyContent | null)[] = [];
            const iterateColumn = (rawColumn: (typeof line.columns)[0], variant: StandardCardVariant | undefined) => {
              const column = getConditionalOrRawValue(rawColumn, { groupMetaArgs });
              if (column.type === 'variantMatcher') {
                const matched = variants.find((e) =>
                  isMatch<{ category?: IdType | null; attrs?: StandardCardAttributes | null }>(e, column.matcher),
                );
                column.children.forEach((e) => iterateColumn(e, matched));
              } else if (column.type === 'value') {
                row.push(variant && variant.value ? normalizeDisplayValue(variant.value, attrValue?.name) : '-');
              } else if (column.type === 'attr') {
                const attrId = column.attr;
                const valueId = variant?.attrs?.[attrId];
                const valueRecord =
                  attrValue?.attributeId === attrId
                    ? attrValue
                    : valueId
                      ? helper.getAttributeRecord(valueId, record.card.lang)
                      : undefined;
                if (!valueRecord || !valueRecord.name) {
                  row.push('');
                } else {
                  const attributeTransformer = column.transformer
                    ? getAttributeTransformer(column.transformer, record.card.lang)
                    : undefined;
                  row.push(
                    attributeTransformer ? attributeTransformer(valueRecord, record.card.lang) : valueRecord.name,
                  );
                }
              } else if (column.type === 'article') {
                if (!variant) row.push('');
                else
                  row.push(
                    getArticle(
                      record.card.lang,
                      variant.value,
                      pickKeys(
                        (variant.attrs || {}) as Record<number, number>,
                        AttributeMapper.NUMBER.id,
                        AttributeMapper.GENDER.id,
                        AttributeMapper.CASE.id,
                      ),
                    ) ?? '',
                  );
              } else if (column.type === 'audio') {
                const prevColValue = row[row.length - 1];
                const content: AnyContent = {
                  type: 'div',
                  content: [
                    {
                      type: 'div',
                      content:
                        typeof prevColValue === 'string' ? [{ type: 'text', content: prevColValue }] : [prevColValue],
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
                          language: record.card.lang,
                          text: prepareTextForAudio(getColumnsFromRow(row as string[], column.values).join(' ')),
                          autoplay: false,
                          size: 'mini',
                        },
                      ],
                      style: { display: row[mainValueIndex] === '-' ? 'none' : undefined },
                    },
                  ],
                  style: { display: 'flex' },
                };
                row[row.length - 1] = content;
                row.push(null);
              } else if (column.type === 'matchers') {
                row.push(null);
              } else row.push(null);
            };
            for (const rawColumn of line.columns) {
              iterateColumn(rawColumn, variants[0]);
            }
            return row;
          })
          .map((row) => {
            return row.filter((_, i) => !hiddenColumnIndices.includes(i)).filter(isNonNullable);
          });
        return generateColumnedTable(rows, mainValueIndex);
      //
      default:
        return undefined;
    }
  };

  const lineContents = lines.map(mapLine).flat(1);

  return { lineContents, mainAudioText };
};

const getColumnsFromRow = (row: (string | null)[], metaKeys: string[]) => {
  const values: (string | null | undefined)[] = [];
  for (const meta of metaKeys) {
    if (!meta.includes('.')) {
      values.push(row[parseInt(meta, 10)]);
    } else {
      const [rowIndex, slashVariantIndex] = meta.split('.');
      const rowValue = row[parseInt(rowIndex, 10)];
      if (typeof rowValue !== 'string' || !rowValue) values.push(null);
      else {
        const slashValues = slashSplit(rowValue);
        values.push(slashValues[parseInt(slashVariantIndex, 10)]);
      }
    }
  }
  return values.filter(isNonNullable);
};

const getAnswerChecker = (correctValue: string) => (userInput: string, options: AdvancedAnswerCheckerOptions) => {
  if (correctValue === userInput) return true;
  if (options.caseInsensitive && correctValue.toLocaleLowerCase() === userInput.toLocaleLowerCase()) return true;
  const sanitizedCorrectValue = correctValue
    .replace(/\(.+?\)/g, '')
    .replace(/(\s){2,}/g, '$1')
    .trim();
  if (sanitizedCorrectValue === correctValue) return false; // it was unchanged
  if (options.caseInsensitive && sanitizedCorrectValue.toLocaleLowerCase() === userInput.toLocaleLowerCase()) {
    return true;
  }
  return sanitizedCorrectValue === userInput;
};

const prepareTextForAudio = (text: string) => slashSplit(text).join('. ');
const prepareInputAudio = (lang: string, correctValues: string[], prefix: string = ''): Omit<ContentVoice, 'type'> => ({
  language: lang,
  text: prepareTextForAudio(correctValues.map((e) => `(${prefix + e})`).join('/')),
  autoplay: true,
  size: 'mini',
});

const getAfterAnswerMetaInfo2 = (
  content: (AnyContent | null | undefined)[],
  texts: { showMoreText?: string; showLessText?: string },
): AnyContent[] => {
  if (content.filter(isNonNullable).length === 0) return [];
  return [
    {
      type: 'afterAnswer',
      content: [
        {
          type: 'expandable',
          showMoreText: texts.showMoreText ?? 'Show more',
          showLessText: texts.showLessText ?? 'Show less',
          childContent: {
            type: 'div',
            content,
          },
        },
      ],
    },
  ];
};

const getDropdown = (
  content: (AnyContent | null | undefined)[],
  texts: { showMoreText?: string; showLessText?: string },
): AnyContent[] => {
  if (content.filter(isNonNullable).length === 0) return [];
  return [
    {
      type: 'expandable',
      showMoreText: texts.showMoreText ?? 'Show more',
      showLessText: texts.showLessText ?? 'Show less',
      childContent: {
        type: 'div',
        content,
      },
    },
  ];
};

const normalizeDisplayValue = (value: string, mainAttrValue?: string) => {
  if (!mainAttrValue) return value;
  const hashtagIndex = value.indexOf('#');
  if (hashtagIndex === -1) return value;
  return value.replace(/#/g, mainAttrValue);
};

const hasHash = (value: string) => value.includes('#');
