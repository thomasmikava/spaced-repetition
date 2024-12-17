import { AttributeMapper } from '../database/attributes';
import { CardTypeMapper } from '../database/card-types';
import { uniquelize } from '../utils/array';
import { getArticle } from './texts';

export const getHintPrefixes = (cardType: number, lang: string): string[] | undefined => {
  switch (lang) {
    case 'de':
      return getGermanHintPrefixes(cardType);
    case 'en':
      return getEnglishHintPrefixes(cardType);
    default:
      return undefined;
  }
};

const getGermanHintPrefixes = (cardType: number): string[] | undefined => {
  if (cardType === CardTypeMapper.NOUN) {
    return uniquelize(
      getArticle('de', '', { [AttributeMapper.DEFINITENESS.id]: AttributeMapper.DEFINITENESS.records.true })
        .split('/')
        .map((e) => e + ' '),
    );
  }
  return undefined;
};

const getEnglishHintPrefixes = (cardType: number): string[] | undefined => {
  if (cardType === CardTypeMapper.NOUN) {
    return ['a ', 'an ', 'the '];
  }
  if (cardType === CardTypeMapper.VERB) {
    return ['to '];
  }
  return undefined;
};
