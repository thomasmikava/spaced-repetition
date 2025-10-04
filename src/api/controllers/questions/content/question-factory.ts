/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QuestionContentDTO } from '../question-content.schema';
import { QuestionType } from '../question-content.schema';
import type { IQuestion } from './base-question.interface';
import { FillBlanksQuestion } from './fill-blanks-question';
import { MatchingQuestion } from './matching-question';
import { MultipleChoiceQuestion } from './multiple-choice-question';

/**
 * Factory function to create question instances based on question content
 * @param questionContent - The question content containing type and data
 * @returns Instance of the appropriate question class
 */
export function createQuestion(questionContent: QuestionContentDTO): IQuestion {
  switch (questionContent.type) {
    case QuestionType.FILL_BLANKS:
      return new FillBlanksQuestion(questionContent);

    case QuestionType.MATCHING:
      return new MatchingQuestion(questionContent);

    case QuestionType.MULTIPLE_CHOICE:
      return new MultipleChoiceQuestion(questionContent);

    default:
      // This should never happen with proper typing, but provides a safety net
      throw new Error(`Unsupported question type: ${(questionContent as any).type}`);
  }
}
