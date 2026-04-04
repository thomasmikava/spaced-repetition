import type { AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import { by, type ByParams } from 'testing-library-queries';

export const multipleChoiceQuestionSelector = {
  // Radio button input
  radioButton: (optionText: string): ByParams<HTMLElement> => {
    return by.selector(`div:has(> span:contains("${optionText}"))`);
  },

  // Checkbox input
  checkbox: (optionText: string): ByParams<HTMLElement> => {
    return by.selector(`div:has(> span:contains("${optionText}"))`);
  },

  // Dropdown select
  dropdown: (): ByParams<HTMLElement> => {
    return by.selector('.ant-select');
  },

  // Reveal button
  revealButton: (): ByParams<HTMLButtonElement> => {
    return by.selector('button[datatype="reveal-answer"]');
  },

  // Answer display by status
  byStatus: (status: AnswerStatus): ByParams<HTMLElement> => {
    return by.selector(`span[data-status="${status}"]`);
  },

  // Explanation tooltip
  explanationTooltip: (): ByParams<HTMLElement> => {
    return by.selector('span[datatype="explanation-tooltip"]');
  },

  // Get all choice options
  allOptions: (): ByParams<HTMLElement> => {
    return by.selector('div[style*="cursor: pointer"]');
  },

  // Get selected radio/checkbox indicator
  selectedIndicator: (): ByParams<HTMLElement> => {
    return by.selector('div[style*="backgroundColor"][style*="#3b82f6"]');
  },
};
