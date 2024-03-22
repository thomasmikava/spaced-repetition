import { CardType } from '../database/types';

export interface LessonCard {
  type: CardType;
  value: string;
}

interface Lesson {
  id: number;
  title: string;
  cards: LessonCard[];
}

interface Course {
  id: number;
  title: string;
  lessons: Lesson[];
}

export const courses: Course[] = [
  {
    id: 1,
    title: 'My German',
    lessons: [
      {
        id: 1,
        title: 'Lesson 1',
        cards: [
          {
            type: CardType.ARTICLE,
            value: 'der',
          },
          {
            type: CardType.VERB,
            value: 'sein',
          },
          {
            type: CardType.ARTICLE,
            value: 'dieF',
          },
          {
            type: CardType.NOUN,
            value: 'Jahr',
          },
          {
            type: CardType.VERB,
            value: 'haben',
          },
          {
            type: CardType.NOUN,
            value: 'Mal',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Memrise German 1',
    lessons: [
      {
        id: 1,
        title: 'Lesson 1',
        cards: [],
      },
    ],
  },
];
