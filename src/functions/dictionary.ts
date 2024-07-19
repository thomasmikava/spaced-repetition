import type {
  BaseWordVariantDTO,
  GetLanguageDictionaryResDTO,
  WordDTO,
  WordWithTranslationVariantsDTO,
} from '../api/controllers/words/words.schema';
import { isNonNullable } from '../utils/array';

type Match = { id: number; variantId: number; word: WordDTO; variant: BaseWordVariantDTO };

export type IndexedDatabase = {
  wordMap: Map<string, Match[]>;
  wordsByIds: Map<number, WordWithTranslationVariantsDTO>;
  wordsAllValues: Map<number, string[]>;
};

export const getIndexedDictionary = (dictionary: GetLanguageDictionaryResDTO): IndexedDatabase => {
  const wordMap: IndexedDatabase['wordMap'] = new Map();
  const wordsByIds: IndexedDatabase['wordsByIds'] = new Map();
  const wordsAllValues: IndexedDatabase['wordsAllValues'] = new Map();
  for (const word of dictionary) {
    const variants = word.variants || [];
    wordsByIds.set(word.id, word);
    if (!wordsAllValues.has(word.id)) wordsAllValues.set(word.id, []);
    for (const variant of variants) {
      const key = variant.value;
      if (!wordMap.has(key)) wordMap.set(key, []);
      wordMap.get(key)!.push({ id: word.id, variantId: variant.id, word, variant });
      wordsAllValues.get(word.id)!.push(variant.value);
    }
  }
  return { wordMap, wordsByIds, wordsAllValues };
};

export function getAllMatchingVariants(token: string, database: IndexedDatabase) {
  return database.wordMap.get(token) || [];
}

export function isInDatabase(token: string, database: IndexedDatabase) {
  return getAllMatchingVariants(token, database).length > 0;
}

export const getSearcher = (dictionary: GetLanguageDictionaryResDTO, wordToSearches: Map<string, number[]>) => {
  const database = getIndexedDictionary(dictionary);

  const search = (token: string): ReturnType<typeof getAllMatchingVariants> => {
    const matchesFromDB = getAllMatchingVariants(token, database);
    if (matchesFromDB.length > 0) return matchesFromDB;

    const foundWordIds = wordToSearches.get(token) || [];
    const foundWords = foundWordIds.map((id) => database.wordsByIds.get(id)).filter(isNonNullable);

    // debugger;

    const matches: { match: Match; diff: number }[] = [];
    for (const word of foundWords) {
      const variants = word.variants || [];
      for (const variant of variants) {
        if (variant.value.includes(token)) {
          const diff = Math.abs(variant.value.length - token.length);
          matches.push({ diff, match: { id: word.id, variantId: variant.id, word, variant } });
        }
      }
    }

    matches.sort((a, b) => a.diff - b.diff);
    console.log('matches', matches);

    return matches.map((m) => m.match);
  };

  const hasMatch = (token: string) => search(token).length > 0;

  return { search, hasMatch, wordsAllValues: database.wordsAllValues };
};
export type Searcher = ReturnType<typeof getSearcher>;
