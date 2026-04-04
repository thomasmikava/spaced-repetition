import { by } from 'testing-library-queries';

export const quizPageSelector = {
  reset: () => {
    return by.role<HTMLButtonElement>('button', { name: /Reset Quiz/i });
  },
};
