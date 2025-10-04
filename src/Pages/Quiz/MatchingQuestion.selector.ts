import type { AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import { createTestingQuery, createSelector, type TestingQueryParams } from '../../test/query-extension';

export const matchingSelector = {
  draggableOptions: (): TestingQueryParams<HTMLDivElement> => {
    return createTestingQuery.selector('div[datatype="draggable-option"]');
  },
  dropZone: (): TestingQueryParams<HTMLDivElement> => {
    return createTestingQuery.selector('[datatype="drop-zone"]');
  },
  dropdown: (): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector('[role="menu"]');
  },
  revealButton: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.selector('button[datatype="reveal-answer"]');
  },
  explanationIcon: (): TestingQueryParams<HTMLSpanElement> => {
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
