import { Category } from './types';

export const categories: Category[] = [
  {
    id: 1,
    name: 'Initial card',
  },
  {
    id: 2,
    name: 'Comparative',
  },
  {
    id: 3,
    name: 'Superlative',
  },
];

interface CategoryLocalized {
  lang: string;
  categoryId: number;
  name: string;
}

export const categoriesLocalized: CategoryLocalized[] = [
  { lang: 'de', categoryId: 1, name: 'Anfangswort' },
  { lang: 'de', categoryId: 2, name: 'Komparativ' },
  { lang: 'de', categoryId: 3, name: 'Superlativ' },
];

export const CATEGORY_MAPPER = {
  initialCard: 1,
  comparative: 2,
  superlative: 3,
};
