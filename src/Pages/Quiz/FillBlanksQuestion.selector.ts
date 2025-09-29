import type { AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import { createTestingQuery, createSelector, type TestingQueryParams } from '../../test/query-extension';

export const fillingBlanksSelector = {
  blankInputs: (): TestingQueryParams<HTMLInputElement> => {
    return createTestingQuery.role('textbox');
  },
  revealButton: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.role('button', { name: '?' });
  },
  explanationIcon: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.selector('span[datatype="explanation-icon"]');
  },
  byStatus: (status: AnswerStatus): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector(`span[data-status="${status}"]`);
  },
  byStatusWithText: createSelector.withText((status: string) => `span[data-status="${status}"]`, {
    name: 'status span',
    textMatcher: 'partial',
  }),
};
