/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { wordController } from '../api/controllers/words/words.controller';
import type { CreateManyWordsDTO, WordWithTranslationDTO } from '../api/controllers/words/words.schema';
import type { Phrase } from '../database/types';
import { CardType } from '../database/types';
import {
  generateCardTypeThings,
  generateIndexedDatabase,
  generateIndexedDatabase2,
} from '../functions/generateIndexedDatabase';
import { isNonNullable } from '../utils/array';
import type { Course } from '../courses/lessons';
import { courses } from '../courses/lessons';
import { courseController } from '../api/controllers/courses/courses.controller';
import type { LessonUpdateActionDTO } from '../api/controllers/lessons/lessons.schema';
import { AttributeMapper } from '../database/attributes';
import { getWithArticleOld } from '../functions/texts';
import { CardTypeMapper } from '../database/card-types';

const TestingThingsPage = () => {
  const oldDb = generateCardTypeThings();
  const db = generateIndexedDatabase2();
  const dbIndexed = generateIndexedDatabase();

  const createWordsInDBHelper = async (cardType = CardType.VERB, limit: number, skip: number) => {
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

    const someWords = originalWords.slice(skip, skip + limit);
    const wordCards = someWords.map((v) => db.getCard(cardType, v.uniqueValue ?? v.value)).filter(isNonNullable);

    return wordController
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
        return { count: wordCards.length };
      });
  };
  const createWordsInDB = () => {
    const cardTypes = Object.keys(oldDb) as CardType[];

    (async function () {
      for (const cardType of cardTypes) {
        const limit = 50;
        let skip = 0;
        let isOver = false;
        while (!isOver) {
          const { count } = await createWordsInDBHelper(cardType, limit, skip);
          skip += limit;
          if (count === 0) isOver = true;
        }
      }
      console.log('created all words');
    })();
  };

  async function importFullCourse(course: Course) {
    const { title, lessons } = course;
    const courseRes = await courseController.createCourse({
      isPublic: true,
      description: null,
      langToLearn: 'de',
      translationLang: 'en',
      title,
      isOfficial: true,
    });
    const courseId = courseRes.id;

    const isSameWord = (a: WordWithTranslationDTO, card: NonNullable<(typeof dbIndexed)[CardType][string]>) => {
      if (card.type === CardType.NOUN) {
        const withArticle = getWithArticleOld(card.value, card.gender);
        return a.value === withArticle;
      }
      if (card.type === CardType.ARTICLE) {
        if (a.value !== card.value) return false;
        const definiteness = card.isDefinite
          ? AttributeMapper.DEFINITENESS.records.true
          : AttributeMapper.DEFINITENESS.records.false;
        const genderValue = AttributeMapper.GENDER.records[card.gender];
        return (
          a.attributes &&
          a.attributes[AttributeMapper.DEFINITENESS.id] === definiteness &&
          a.attributes[AttributeMapper.GENDER.id] === genderValue
        );
      }
      return a.value === card.value;
    };

    let actions: LessonUpdateActionDTO[] = [];

    for (const lesson of lessons) {
      const promises = lesson.cards.map(async (word): Promise<LessonUpdateActionDTO | null> => {
        if (word.hidden) return null;
        const card = dbIndexed[word.type][word.value];
        if (!card) {
          console.error('Card not found ' + word.type + ' ' + word.value);
          return null;
        }
        const searchValue = card.value;
        const typeToSearch = (card as Phrase).mainType ?? card.type;
        const typeId = CardTypeMapper[typeToSearch];
        const { words: foundWords } = await wordController.searchWords({
          lang: 'de',
          translationLang: 'en',
          wordType: typeId,
          searchValue,
          limit: 100,
          skip: 0,
        });
        const foundWord = foundWords.find((v) => isSameWord(v, card));
        if (!foundWord) {
          console.error('Word not found ' + word.type + ' ' + word.value);
          return null;
        }
        return {
          type: 'existing-word',
          isNewRecord: true,
          wordId: foundWord.id,
        };
      });
      const items = (await Promise.all(promises)).filter(isNonNullable);
      const wordIds = items.reduce((acc, v) => {
        return v.type === 'existing-word' ? [...acc, v.wordId] : acc;
      }, [] as number[]);
      const duplicates = wordIds.filter((v, i, a) => a.indexOf(v) !== i);
      if (duplicates.length > 0) {
        throw new Error(
          'Duplicates found ' + duplicates.join(', ') + ' for lesson ' + lesson.title + 'in course ' + title,
        );
      }
      actions.push({
        type: 'new-lesson',
        title: lesson.title,
        description: null,
        items,
      });
    }

    if (course.id === 6) {
      actions = [
        {
          type: 'new-lesson',
          title: 'Episode 1',
          description: null,
          items: actions,
        },
      ];
    }

    await courseController.updateCourseContent({
      courseId,
      actions,
    });
    console.log('imported course ', course.title);
  }

  const importCourses = () => {
    (async function () {
      for (const course of courses) {
        await importFullCourse(course);
      }
      console.log('imported all courses');
    })();
  };
  useEffect(() => {
    (window as any).createWordsInDB = createWordsInDB;
    (window as any).importFullCourse = (index: number) => importFullCourse(courses[index]);
    (window as any).importCourses = () => importCourses();
  });
  return <div className='body'>Test</div>;
};

export default TestingThingsPage;
