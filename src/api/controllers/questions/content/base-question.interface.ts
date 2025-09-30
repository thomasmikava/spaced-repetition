import type { QuestionCheckResultDTO, UserAnswerDTO, UserInputDTO } from '../question-content.schema';

/**
 * Base interface that all question classes must implement
 */
export interface IQuestion {
  /**
   * Check user's answers against the correct answers
   * @param userInput - The user's input (can be any type depending on question type)
   * @param maxPoints - Maximum points available for this question
   * @returns Result containing scores, correct answers, and processed data, or null if userInput type is invalid
   */
  checkAnswers(args: { userInput: unknown; maxPoints: number }): QuestionCheckResultDTO | null;

  /**
   * Get the number of inputs required for this question
   * @returns Number of inputs/blanks that need to be filled
   */
  getInputCount(): number;

  /**
   * Map form data to backend UserInputDTO format
   * @param formData - Raw form data from the frontend (specific question type's UserInputDTO or undefined/null)
   * @returns Properly formatted UserInputDTO for backend processing
   */
  mapFormDataToUserInput(formData: UserInputDTO | undefined | null, options: MapOptions): UserInputDTO;

  mapUserInputToFormData(userInput: UserAnswerDTO): UserInputDTO;
}

export type MapOptions = {
  isFullSubmission: boolean;
};
