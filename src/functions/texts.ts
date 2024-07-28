import { AttributeMapper } from '../database/attributes';
import { CardTypeMapper } from '../database/card-types';
import type { IdType, StandardCardAttributes } from '../database/types';
import { NounGender, NounNumber } from '../database/types';
import { isMatch } from '../utils/matcher';
import { removeKeys } from '../utils/object';

const GermanArticleObjects: { value: string; attrs: StandardCardAttributes }[] = [
  {
    value: 'der',
    attrs: {
      '1': 1,
      '2': 3,
      '10': 43,
    },
  },
  {
    value: 'der',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 7,
      '10': 43,
    },
  },
  {
    value: 'den',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 8,
      '10': 43,
    },
  },
  {
    value: 'dem',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 9,
      '10': 43,
    },
  },
  {
    value: 'des',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 10,
      '10': 43,
    },
  },
  {
    value: 'die',
    attrs: {
      '1': 1,
      '2': 4,
      '10': 43,
    },
  },
  {
    value: 'die',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 7,
      '10': 43,
    },
  },
  {
    value: 'die',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 8,
      '10': 43,
    },
  },
  {
    value: 'der',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 9,
      '10': 43,
    },
  },
  {
    value: 'der',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 10,
      '10': 43,
    },
  },
  {
    value: 'das',
    attrs: {
      '1': 1,
      '2': 5,
      '10': 43,
    },
  },
  {
    value: 'das',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 7,
      '10': 43,
    },
  },
  {
    value: 'das',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 8,
      '10': 43,
    },
  },
  {
    value: 'dem',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 9,
      '10': 43,
    },
  },
  {
    value: 'des',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 10,
      '10': 43,
    },
  },
  {
    value: 'die',
    attrs: {
      '1': 2,
      '2': 6,
      '10': 43,
    },
  },
  {
    value: 'die',
    attrs: {
      '1': 2,
      '2': 6,
      '3': 7,
      '10': 43,
    },
  },
  {
    value: 'die',
    attrs: {
      '1': 2,
      '2': 6,
      '3': 8,
      '10': 43,
    },
  },
  {
    value: 'den',
    attrs: {
      '1': 2,
      '2': 6,
      '3': 9,
      '10': 43,
    },
  },
  {
    value: 'der',
    attrs: {
      '1': 2,
      '2': 6,
      '3': 10,
      '10': 43,
    },
  },
  {
    value: 'ein',
    attrs: {
      '1': 1,
      '2': 3,
      '10': 44,
    },
  },
  {
    value: 'ein',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 7,
      '10': 44,
    },
  },
  {
    value: 'einen',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 8,
      '10': 44,
    },
  },
  {
    value: 'einem',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 9,
      '10': 44,
    },
  },
  {
    value: 'eines',
    attrs: {
      '1': 1,
      '2': 3,
      '3': 10,
      '10': 44,
    },
  },
  {
    value: 'eine',
    attrs: {
      '1': 1,
      '2': 4,
      '10': 44,
    },
  },
  {
    value: 'eine',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 7,
      '10': 44,
    },
  },
  {
    value: 'eine',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 8,
      '10': 44,
    },
  },
  {
    value: 'einer',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 9,
      '10': 44,
    },
  },
  {
    value: 'einer',
    attrs: {
      '1': 1,
      '2': 4,
      '3': 10,
      '10': 44,
    },
  },
  {
    value: 'ein',
    attrs: {
      '1': 1,
      '2': 5,
      '10': 44,
    },
  },
  {
    value: 'ein',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 7,
      '10': 44,
    },
  },
  {
    value: 'ein',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 8,
      '10': 44,
    },
  },
  {
    value: 'einem',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 9,
      '10': 44,
    },
  },
  {
    value: 'eines',
    attrs: {
      '1': 1,
      '2': 5,
      '3': 10,
      '10': 44,
    },
  },
];

function getGermanArticle(searchAttrs: Record<PropertyKey, number>, onlyFirst = false) {
  const normalizedSearchAttrs =
    searchAttrs[AttributeMapper.NUMBER.id] === AttributeMapper.NUMBER.records[NounNumber.plural]
      ? removeKeys(searchAttrs, AttributeMapper.GENDER.id)
      : searchAttrs;
  const articles = GermanArticleObjects.filter((art) => isMatch(art.attrs, normalizedSearchAttrs));
  if (onlyFirst) return articles[0]?.value ?? '';
  return articles.map((e) => e.value).join('/');
}

export function getArticle(lang: string, word: string, searchAttrs: Record<PropertyKey, number>, onlyFirst = false) {
  if (lang === 'de') return getGermanArticle(searchAttrs, onlyFirst);
  if (lang === 'fr') return getFrenchArticle(searchAttrs, word);
  return '';
}

function getFrenchArticle(searchAttrs: Record<PropertyKey, number>, word: string) {
  const number = searchAttrs[AttributeMapper.NUMBER.id];
  if (number === AttributeMapper.NUMBER.records[NounNumber.plural]) return 'les';
  const gender = searchAttrs[AttributeMapper.GENDER.id];
  if (gender == undefined || gender === null) return '';
  const isSoft = startsWithFrenchVowel(word);
  if (isSoft) return "l'";
  if (gender === AttributeMapper.GENDER.records[NounGender.Maskulinum]) return 'le';
  return 'la';
}

export function getWithArticle(lang: string, word: string, searchAttrs: Record<PropertyKey, number>) {
  const article = getArticle(lang, word, searchAttrs, true);
  if (!article) return word;
  if (lang === 'fr') return article[article.length - 1] === "'" ? article + word : article + ' ' + word;
  return article + ' ' + word;
}

const GermanArticles = new Set(GermanArticleObjects.map((e) => e.value));
const getModifiedGermanSearchValue = (searchValue: string, wordType: number | undefined): string => {
  if ((wordType === undefined || wordType === CardTypeMapper.NOUN) && searchValue.includes(' ')) {
    const searchWords = searchValue.split(' ');
    if (searchWords.length > 1 && GermanArticles.has(searchWords[0])) {
      return searchWords.slice(1).join(' ').trim();
    }
  }
  return searchValue;
};

export const getModifiedSearchValue = (searchValue: string, lang: string, wordType: number | undefined): string => {
  if (lang === 'de') {
    return getModifiedGermanSearchValue(searchValue, wordType) || searchValue;
  }
  return searchValue;
};

export function getWithSymbolArticle(_locale: string, word: string, gender: IdType) {
  const prefix = {
    [AttributeMapper.GENDER.records[NounGender.Maskulinum]]: '♂ ',
    [AttributeMapper.GENDER.records[NounGender.Femininum]]: '♀ ',
    [AttributeMapper.GENDER.records[NounGender.Neutrum]]: '⚥ ',
    [AttributeMapper.GENDER.records[NounGender.Plural]]: '',
  }[gender];
  return prefix + word;
}

export const Colors = {
  lightBlue: '#1798b6',
  green: '#5ca810',
  orange: '#b65717',
  pink: '#b617af',
  violet: '#6517b6',
  blue: '#173eb6',
};

const FrenchVowels = [
  'h',
  'a',
  'e',
  'i',
  'o',
  'u',
  'y',
  'à',
  'â',
  'ä',
  'é',
  'è',
  'ê',
  'ë',
  'î',
  'ï',
  'ô',
  'ö',
  'ù',
  'û',
  'ü',
  'ÿ',
];

function startsWithFrenchVowel(word: string) {
  const firstLetter = word.charAt(0).toLowerCase();
  return FrenchVowels.includes(firstLetter);
}
