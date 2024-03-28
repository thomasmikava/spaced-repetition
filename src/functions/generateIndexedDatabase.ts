import { adjectives } from '../database/adjectives';
import { articles } from '../database/articles';
import { nouns } from '../database/nouns';
import type { Adjective, Article, Noun, Verb } from '../database/types';
import { CardType } from '../database/types';
import { verbs } from '../database/verbs';

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
    [CardType.PRONOUNS]: createIndexedObject([] as Verb[]),
    [CardType.ADVERB]: createIndexedObject([] as Verb[]),
    [CardType.PREPOSITION]: createIndexedObject([] as Verb[]),
    [CardType.CONJUNCTION]: createIndexedObject([] as Verb[]),
    [CardType.INTERJECTION]: createIndexedObject([] as Verb[]),
    [CardType.NUMBERS]: createIndexedObject([] as Verb[]),
  } satisfies Record<CardType, unknown>;
};

export const generateAllVariants = (): Record<CardType, Map<string, string>> => {
  return {
    [CardType.VERB]: getAllVerbVariantsSet(verbs),
    [CardType.ARTICLE]: getAllArticlesSet(articles),
    [CardType.NOUN]: getAllNounsSet(nouns),
    [CardType.ADJECTIVE]: getAllAdjectivesSet(adjectives),
    [CardType.PRONOUNS]: new Map([
      ['ich', 'ich'],
      ['du', 'du'],
      ['er', 'er'],
      ['sie', 'sie'],
      ['es', 'es'],
      ['wir', 'wir'],
      ['ihr', 'ihr'],
      ['sie', 'sie'],
      ['Sie', 'Sie'],
    ]),
    [CardType.ADVERB]: new Map(),
    [CardType.PREPOSITION]: new Map(),
    [CardType.CONJUNCTION]: new Map(),
    [CardType.INTERJECTION]: new Map(),
    [CardType.NUMBERS]: new Map([
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
  };
};

function getAllVerbVariantsSet(verbs: Verb[]) {
  const words = new Map<string, string>();
  for (const verb of verbs) {
    const uniqueValue = verb.value;
    words.set(verb.value, uniqueValue);
    for (const mood of verb.variants) {
      for (const tense of mood.tenses) {
        for (const variant of tense.conjugations) {
          words.set(variant.value, uniqueValue);
        }
      }
    }
  }
  return words;
}

function getBasicSet(array: { uniqueValue?: string; value: string; variants: { value: string }[] }[]) {
  const words = new Map<string, string>();
  for (const each of array) {
    const uniqueValue = each.value;
    words.set(each.value, uniqueValue);
    for (const variant of each.variants) {
      words.set(variant.value, uniqueValue);
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
    words.set(adjective.value, uniqueValue);
    adjective.komparativ && words.set(adjective.komparativ, uniqueValue);
    adjective.superlativ && words.set(adjective.superlativ, uniqueValue);
    for (const variant of adjective.variants) {
      for (const v of variant.values) {
        words.set(v[1], uniqueValue);
        words.set(v[2], uniqueValue);
        words.set(v[3], uniqueValue);
        words.set(v[4], uniqueValue);
      }
    }
  }
  return words;
}
