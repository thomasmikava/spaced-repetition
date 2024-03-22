import { adjectives } from '../database/adjectives';
import { articles } from '../database/articles';
import { nouns } from '../database/nouns';
import type { Verb } from '../database/types';
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
  } satisfies Record<CardType, unknown>;
};
