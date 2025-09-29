import { createTestingQuery, createSelector, type TestingQueryParams } from '../../test/query-extension';

export const questionCardSelector = {
  partialSubmit: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.role('button', { name: /Submit Non-Empty/i });
  },
  fullSubmit: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.role('button', { name: /Submit/i });
  },
  questionHeaderByQNumber: (questionNumber: number): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.role('heading', { name: new RegExp(`Question ${questionNumber}`) });
  },
  questionCard: (questionNumber: number) =>
    createSelector.transform<HTMLElement, HTMLElement>(
      // Find headers with the question number
      (container) => {
        const regex = new RegExp(`Question ${questionNumber}`);
        const headings = Array.from(container.querySelectorAll('h3'));
        return headings.filter((h) => regex.test(h.textContent || '')) as HTMLElement[];
      },
      // Transform to parent question card
      (header) => header.closest<HTMLElement>('div[datatype="question-card"]'),
      {
        name: `question card for question ${questionNumber}`,
        filterNull: true, // Remove nulls from results
      },
    ),
};
