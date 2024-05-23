import { useEffect } from 'react';
import { wordController } from '../api/controllers/words/words.controller';
import type { CreateManyWordsDTO } from '../api/controllers/words/words.schema';
import { CardType } from '../database/types';
import { generateCardTypeThings, generateIndexedDatabase2 } from '../functions/generateIndexedDatabase';
import { isNonNullable } from '../utils/array';

const TestingThingsPage = () => {
  const createWordsInDB = (cardType = CardType.VERB, limit: number, skip: number) => {
    const oldDb = generateCardTypeThings();
    const originalWords = oldDb[cardType];
    if (!originalWords) {
      throw new Error('Invalid card type ' + cardType);
    }
    if (typeof limit !== 'number') {
      throw new Error('Invalid limit ' + limit);
    }
    if (typeof skip !== 'number') {
      throw new Error('Invalid skip ' + skip);
    }
    const db = generateIndexedDatabase2();

    const someWords = originalWords.slice(skip, skip + limit);
    const wordCards = someWords.map((v) => db.getCard(cardType, v.uniqueValue ?? v.value)).filter(isNonNullable);

    console.log(wordCards);

    wordController
      .createManyWords(
        wordCards.map((card): CreateManyWordsDTO[number] => {
          return {
            lang: card.lang,
            type: card.type,
            mainType: card.mainType,
            value: card.value,
            attributes: card.attributes,
            isOfficial: true,
            variantsIncludeTopCard: true,
            variants: card.variants.map((variant) => ({
              value: variant.value,
              attrs: variant.attrs,
              category: variant.category,
            })),
            translation: {
              lang: 'en',
              translation: card.translation,
              advancedTranslation: card.advancedTranslation,
            },
          };
        }),
      )
      .then(() => {
        console.log('created');
      });
  };
  useEffect(() => {
    (window as unknown).createWordsInDB = createWordsInDB;
  });
  return <div className='body'>Test</div>;
};

export default TestingThingsPage;
