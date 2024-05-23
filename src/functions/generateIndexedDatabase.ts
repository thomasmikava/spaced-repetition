/* eslint-disable @typescript-eslint/no-explicit-any */
import { adjectives } from '../database/adjectives';
import { articles } from '../database/articles';
import { conjunctions } from '../database/conjunctions';
import { nouns } from '../database/nouns';
import { phrases } from '../database/phrases';
import { prepositions } from '../database/prepositions';
import { pronouns } from '../database/pronouns';
import type { Adjective, Article, Noun, Phrase, Pronoun, StandardCard, Verb } from '../database/types';
import { CardType } from '../database/types';
import { verbs } from '../database/verbs';
import { groupArray } from '../utils/array';
import { slashSplit } from '../utils/split';
import { convertToStandardCard } from './old-convertor';

const createIndexedObject = <T extends { value: string; uniqueValue?: string }>(array: T[]) => {
  const indexedObject: Record<string, T | undefined> = {};
  for (const item of array) {
    if (item.uniqueValue) {
      indexedObject[item.uniqueValue] = item;
    } else {
      indexedObject[item.value] = item;
    }
  }
  return indexedObject;
};

export const generateIndexedDatabase = () => {
  return {
    [CardType.VERB]: createIndexedObject(verbs),
    [CardType.ARTICLE]: createIndexedObject(articles),
    [CardType.NOUN]: createIndexedObject(nouns),
    [CardType.ADJECTIVE]: createIndexedObject(adjectives),
    [CardType.PRONOUN]: createIndexedObject(pronouns),
    [CardType.PREPOSITION]: createIndexedObject(prepositions),
    [CardType.CONJUNCTION]: createIndexedObject(conjunctions),
    [CardType.NUMBER]: createIndexedObject([] as Verb[]),
    [CardType.PHRASE]: createIndexedObject(phrases),
  } satisfies Record<CardType, unknown>;
};

export const generateCardTypeThings = () => {
  return {
    [CardType.VERB]: verbs,
    [CardType.ARTICLE]: articles,
    [CardType.NOUN]: nouns,
    [CardType.ADJECTIVE]: adjectives,
    [CardType.PRONOUN]: pronouns,
    [CardType.PREPOSITION]: prepositions,
    [CardType.CONJUNCTION]: conjunctions,
    [CardType.NUMBER]: [],
    [CardType.PHRASE]: phrases,
  } satisfies Record<CardType, unknown>;
};

export const generateIndexedDatabase2 = () => {
  const database = generateIndexedDatabase();
  const cache: { [key in CardType]?: Map<string, StandardCard> } = {};
  const getCard = (type: CardType, uniqueValue: string) => {
    let map = cache[type];
    if (!map) map = cache[type] = new Map();
    const vl = map.get(uniqueValue);
    if (vl) return vl;
    const rawValue = database[type][uniqueValue];
    if (!rawValue) return null;
    const standardValue = convertToStandardCard(rawValue);
    map.set(uniqueValue, standardValue);
    return standardValue;
  };
  return { getCard };
};

// const ina = generateIndexedDatabase2();
// console.log(
//   'article',
//   ['der', 'dieF', 'das', 'dieP', 'einM', 'eine', 'einN']
//     .map((v) => ina.getCard(CardType.ARTICLE, v))
//     .map((e) => generateTestableCards(e!)),
// );

type DbT = ReturnType<typeof generateIndexedDatabase>;
export type RawCard = NonNullable<DbT[keyof DbT][string]>;

export const generateAllVariants = (): Record<CardType, Map<string, string>> => {
  return {
    [CardType.ARTICLE]: getAllArticlesSet(articles),
    [CardType.PREPOSITION]: getBasicSet(prepositions),
    [CardType.CONJUNCTION]: getBasicSet(conjunctions),
    [CardType.PRONOUN]: getAllPronounsSet(pronouns),
    [CardType.VERB]: getAllVerbVariantsSet(verbs),
    [CardType.ADJECTIVE]: getAllAdjectivesSet(adjectives),
    [CardType.NOUN]: getAllNounsSet(nouns),
    [CardType.NUMBER]: new Map([
      ['null', 'null'],
      ['eins', 'eins'],
      ['zwei', 'zwei'],
      ['drei', 'drei'],
      ['vier', 'vier'],
      ['fünf', 'fünf'],
      ['sechs', 'sechs'],
      ['sieben', 'sieben'],
      ['acht', 'acht'],
      ['neun', 'neun'],
      ['zehn', 'zehn'],
      ['elf', 'elf'],
      ['zwölf', 'zwölf'],
      ['dreizehn', 'dreizehn'],
      ['vierzehn', 'vierzehn'],
      ['fünfzehn', 'fünfzehn'],
      ['sechzehn', 'sechzehn'],
      ['siebzehn', 'siebzehn'],
      ['achtzehn', 'achtzehn'],
      ['neunzehn', 'neunzehn'],
      ['zwanzig', 'zwanzig'],
      ['zwanzig', 'zwanzig'],
      ['dreißig', 'dreißig'],
      ['vierzig', 'vierzig'],
      ['fünfzig', 'fünfzig'],
      ['sechzig', 'sechzig'],
      ['siebzig', 'siebzig'],
      ['achtzig', 'achtzig'],
      ['neunzig', 'neunzig'],
      ['hundert', 'hundert'],
    ]),
    [CardType.PHRASE]: getAllPhrasesSet(phrases),
  };
};

function getAllVerbVariantsSet(verbs: Verb[]) {
  const words = new Map<string, string>();
  for (const verb of verbs) {
    const uniqueValue = verb.value;
    addVariant(words, verb.value, uniqueValue);
    for (const mood of verb.variants) {
      for (const tense of mood.tenses) {
        for (const variant of tense.conjugations) {
          slashSplit(variant.value).forEach((v) =>
            v.split(' ').forEach((x) => !nonVerbWords.has(x) && !words.has(x) && words.set(x, uniqueValue)),
          );
        }
      }
    }
  }
  return words;
}

const nonVerbWords = new Set([
  'mich',
  'dich',
  'sich',
  'uns',
  'euch',
  'sich',
  'mir',
  'dir',
  'ihm',
  'ihr',
  'uns',
  'euch',
  'ihnen',
  'los',
]);

function getBasicSet(array: { uniqueValue?: string; value: string; variants?: { value: string }[] }[]) {
  const words = new Map<string, string>();
  for (const each of array) {
    const vls = slashSplit(each.value);
    for (const v of vls) {
      addVariant(words, v, each.value);
    }
    const uniqueValue = vls[0];
    if (vls.length > 1) addVariant(words, each.value, uniqueValue);
    if (each.variants) {
      for (const variant of each.variants) {
        addVariants(words, variant.value, uniqueValue);
      }
    }
  }
  return words;
}

function getAllArticlesSet(articles: Article[]) {
  return getBasicSet(articles);
}

function getAllNounsSet(nouns: Noun[]) {
  return getBasicSet(nouns);
}

function getAllAdjectivesSet(adjectives: Adjective[]) {
  const words = new Map<string, string>();
  for (const adjective of adjectives) {
    const uniqueValue = adjective.value;
    addVariant(words, adjective.value, uniqueValue);
    adjective.komparativ && addVariant(words, adjective.komparativ, uniqueValue);
    adjective.superlativ && addVariant(words, adjective.superlativ, uniqueValue);
    for (const variant of adjective.variants) {
      for (const v of variant.values) {
        addVariant(words, v[1], uniqueValue);
        addVariant(words, v[2], uniqueValue);
        addVariant(words, v[3], uniqueValue);
        addVariant(words, v[4], uniqueValue);
      }
    }
  }
  return words;
}

function getAllPhrasesSet(phrases: Phrase[]) {
  return getBasicSet(phrases);
}

function getAllPronounsSet(pronouns: Pronoun[]) {
  const words = new Map<string, string>();
  for (const adjective of pronouns) {
    const uniqueValue = adjective.value;
    addVariant(words, adjective.value, uniqueValue);
    for (const variant of adjective.variants) {
      for (const v of variant.values as string[][]) {
        addVariants(words, v[1], uniqueValue);
        addVariants(words, v[2], uniqueValue);
        addVariants(words, v[3], uniqueValue);
        addVariants(words, v[4], uniqueValue);
      }
    }
  }
  return words;
}

function addVariants(words: Map<string, string>, value: string | null, uniqueValue: string) {
  if (!value) return;
  slashSplit(value).forEach((v) => !words.has(v) && words.set(v, uniqueValue));
}

function addVariant(words: Map<string, string>, value: string | null, uniqueValue = value) {
  if (!value || !uniqueValue) return;
  !words.has(value) && words.set(value, uniqueValue);
}

export function logSameTranslations() {
  const duplicateTranslations = groupArray(
    verbs,
    (v) => v.translation,
    (grouped) => {
      if (grouped.length === 1) return [];
      return [grouped];
    },
  ).flat(1);
  console.log('ggg', duplicateTranslations);
}
export function logSameValues() {
  const arr: { type: CardType; value: string }[] = [];
  const db = generateIndexedDatabase();
  for (const key in db) {
    const type = key as CardType;
    const obj = db[key as keyof typeof db];
    for (const cardValue in obj) {
      arr.push({ type, value: cardValue });
    }
  }
  const duplicateValues = groupArray(
    arr,
    (v) => v.value,
    (grouped) => {
      if (grouped.length === 1) return [];
      return [grouped];
    },
  )
    .flat(1)
    .sort((a, b) => a[1].type.localeCompare(b[1].type));
  console.log('ggg2', duplicateValues);
}
(window as any).logSameTranslations = logSameTranslations;
(window as any).logSameValues = logSameValues;
(window as any).generateIndexedDatabase2 = generateIndexedDatabase2;
