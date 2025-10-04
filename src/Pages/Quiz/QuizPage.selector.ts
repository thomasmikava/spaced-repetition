import { createTestingQuery, type TestingQueryParams } from '../../test/query-extension';

export const quizPageSelector = {
  reset: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.role('button', { name: /Reset Quiz/i });
  },
};
