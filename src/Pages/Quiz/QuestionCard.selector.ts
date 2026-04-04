import { by, buildSelector } from 'testing-library-queries';

export const questionCardSelector = {
  partialSubmit: () => {
    return by.role<HTMLButtonElement>('button', { name: /Submit Non-Empty/i });
  },
  fullSubmit: () => {
    return by.role<HTMLButtonElement>('button', { name: 'Submit' });
  },
  questionHeaderByQNumber: (questionNumber: number) => {
    return by.role('heading', { name: new RegExp(`Question ${questionNumber}`) });
  },
  questionCard: (questionNumber: number) =>
    buildSelector.transform<HTMLElement, HTMLElement>(
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
