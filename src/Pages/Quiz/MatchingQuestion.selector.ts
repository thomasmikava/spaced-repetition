import type { AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import { by, buildSelector } from 'testing-library-queries';

export const matchingSelector = {
  draggableOptions: () => {
    return by.selector<HTMLDivElement>('div[datatype="draggable-option"]');
  },
  dropZone: () => {
    return by.selector<HTMLDivElement>('[datatype="drop-zone"]');
  },
  dropdown: () => {
    return by.selector<HTMLElement>('[role="menu"]');
  },
  revealButton: () => {
    return by.selector<HTMLButtonElement>('button[datatype="reveal-answer"]');
  },
  explanationIcon: () => {
    return by.selector<HTMLSpanElement>('span[datatype="explanation-icon"]');
  },
  byStatus: (status: AnswerStatus) => {
    return by.selector(`span[data-status="${status}"]`);
  },
  byStatusWithText: buildSelector.withText((status: string) => `span[data-status="${status}"]`, {
    name: 'status span',
    textMatcher: 'partial',
  }),
};
