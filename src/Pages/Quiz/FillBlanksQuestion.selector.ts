import type { AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import { by, buildSelector, type ByParams } from 'testing-library-queries';

export const fillingBlanksSelector = {
  blankInputs: (): ByParams<HTMLInputElement> => {
    return by.role('textbox');
  },
  hintButton: (): ByParams<HTMLButtonElement> => {
    return by.selector('button[datatype="hint"]');
  },
  revealButton: (): ByParams<HTMLButtonElement> => {
    return by.selector('button[datatype="reveal-answer"]');
  },
  explanationIcon: (): ByParams<HTMLButtonElement> => {
    return by.selector('span[datatype="explanation-icon"]');
  },
  byStatus: (status: AnswerStatus): ByParams<HTMLElement> => {
    return by.selector(`span[data-status="${status}"]`);
  },
  byStatusWithText: buildSelector.withText((status: string) => `span[data-status="${status}"]`, {
    name: 'status span',
    textMatcher: 'partial',
  }),
};
