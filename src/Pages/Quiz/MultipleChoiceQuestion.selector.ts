import type { AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import { createTestingQuery, type TestingQueryParams } from '../../test/query-extension';

export const multipleChoiceQuestionSelector = {
  // Radio button input
  radioButton: (optionText: string): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector(`div:has(> span:contains("${optionText}"))`);
  },

  // Checkbox input
  checkbox: (optionText: string): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector(`div:has(> span:contains("${optionText}"))`);
  },

  // Dropdown select
  dropdown: (): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector('.ant-select');
  },

  // Reveal button
  revealButton: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.selector('button[datatype="reveal-answer"]');
  },

  // Answer display by status
  byStatus: (status: AnswerStatus): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector(`span[data-status="${status}"]`);
  },

  // Explanation tooltip
  explanationTooltip: (): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector('span[datatype="explanation-tooltip"]');
  },

  // Get all choice options
  allOptions: (): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector('div[style*="cursor: pointer"]');
  },

  // Get selected radio/checkbox indicator
  selectedIndicator: (): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector('div[style*="backgroundColor"][style*="#3b82f6"]');
  },
};
