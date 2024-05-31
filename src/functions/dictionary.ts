import type { BaseWordVariantDTO, GetLanguageDictionaryResDTO, WordDTO } from '../api/controllers/words/words.schema';

export type IndexedDatabase = {
  wordMap: Map<string, { id: number; variantId: number; word: WordDTO; variant: BaseWordVariantDTO }[]>;
  wordsByIds: Map<number, WordDTO>;
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
