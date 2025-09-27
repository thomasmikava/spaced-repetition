/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import type {
  FillBlanksQuestionDTO,
  FillBlanksUserInputDTO,
  FillBlanksUserAnswerDTO,
  FillBlanksMissingItem,
  AnswerCheckResultDTO,
  QuestionCheckResultDTO,
  FillBlanksInputItemDTO,
} from '../question-content.schema';
import { AnswerStatus, QuestionType } from '../question-content.schema';
import type { IQuestion, MapOptions } from './base-question.interface';
import type { UserInputDTO } from '../question-content.schema';

/**
 * Fill-in-the-blanks question implementation
 */
export class FillBlanksQuestion implements IQuestion {
  constructor(private readonly content: FillBlanksQuestionDTO) {}

  /**
   * Check user's answers for fill-in-the-blanks question
   */
  checkAnswers(args: { userInput: unknown; maxPoints: number }): QuestionCheckResultDTO | null {
    const { userInput, maxPoints } = args;
    // Validate and cast user input
    if (!this.isValidUserInput(userInput)) {
      return null;
    }

    const missingItems = this.content.items.filter((item): item is FillBlanksMissingItem => item.type === 'missing');
    const totalBlanks = missingItems.length;

    if (totalBlanks === 0) {
      throw new Error('Fill-blanks question must have at least one missing item');
    }

    const pointsPerBlank = maxPoints / totalBlanks;
    const answers: AnswerCheckResultDTO[] = [];
    let earnedPoints = 0;
    let attemptedBlanks = 0;
    let correctBlanks = 0;
    let pointsAttempted = 0;

    // Process each missing item
    missingItems.forEach((missingItem, index) => {
      const userAnswer = userInput.answers.find((a) => a.index === index);

      // Only process if user actually provided an answer (not just missing)
      if (!userAnswer || userAnswer.value === undefined || userAnswer.value === null) {
        return; // Skip items that weren't answered at all
      }

      const userValue = userAnswer.value.trim().toLowerCase();
      const isFirstTrial = userAnswer.isFirstTrial ?? true;

      // Get correct answers
      const officialAnswers = missingItem.officialAnswers.map((a) => a.trim().toLowerCase());
      const additionalAnswers = missingItem.additionalAnswers?.map((a) => a.trim().toLowerCase()) || [];

      let status: AnswerStatus = AnswerStatus.UNANSWERED;
      let pointsEarned = 0;

      // Count as attempted since we received an answer (even if empty string)
      attemptedBlanks++;
      pointsAttempted += pointsPerBlank;

      // Check if answer is correct
      if (officialAnswers.includes(userValue)) {
        status = AnswerStatus.CORRECT;
        pointsEarned = pointsPerBlank;
        correctBlanks++;
      } else if (additionalAnswers.includes(userValue)) {
        status = AnswerStatus.PARTIAL;
        pointsEarned = pointsPerBlank * 0.5; // 50% points for additional answers
        correctBlanks += 0.5;
      } else {
        status = AnswerStatus.INCORRECT;
        pointsEarned = 0;
      }

      // Reduce points if not first trial
      if (!isFirstTrial) {
        pointsEarned *= 0.8; // 20% penalty for non-first trials
      }

      earnedPoints += pointsEarned;

      answers.push({
        index,
        userInput: userAnswer.value,
        correctAnswer: missingItem.officialAnswers[0], // Primary correct answer
        status,
        pointsEarned,
        maxPoints: pointsPerBlank,
        isFirstTrial,
      });
    });

    // Create processed answer
    const processedAnswer: FillBlanksUserAnswerDTO = {
      type: QuestionType.FILL_BLANKS,
      answers: answers.map((a) => ({
        index: a.index,
        value: a.userInput,
        isFirstTrial: a.isFirstTrial,
        status: a.status,
        pointsEarned: a.pointsEarned,
        correctAnswer: a.correctAnswer,
      })),
    };

    return {
      totalBlanks,
      attemptedBlanks,
      correctBlanks: Math.round(correctBlanks * 100) / 100, // Round to 2 decimals
      maxPoints,
      earnedPoints: Math.round(earnedPoints * 100) / 100, // Round to 2 decimals
      pointsAttempted: Math.round(pointsAttempted * 100) / 100, // Round to 2 decimals
      answers,
      processedAnswer,
    };
  }

  /**
   * Get the number of blanks in this question
   */
  getInputCount(): number {
    return this.content.items.filter((item) => item.type === 'missing').length;
  }

  /**
   * Validate that the user input is a valid FillBlanksUserInputDTO
   */
  /**
   * Map form data to backend UserInputDTO format
   * Filters out empty answers for fill-in-the-blanks questions
   */
  mapFormDataToUserInput(formData: UserInputDTO | undefined | null, options: MapOptions): UserInputDTO {
    // Handle null/undefined input - return empty valid structure
    if (!formData || !this.isValidUserInput(formData)) {
      return {
        type: QuestionType.FILL_BLANKS,
        answers: [],
      };
    }

    // Cast to FillBlanksUserInputDTO since we validated it
    const fillBlanksInput = formData as FillBlanksUserInputDTO;

    // Filter out empty answers and ensure proper format
    const filteredAnswers = fillBlanksInput.answers
      .filter(Boolean)
      .map(
        (answer): FillBlanksInputItemDTO => ({
          index: answer.index,
          value: (answer.value || '').trim(),
          isRevealed: answer.isRevealed ?? undefined,
          isFirstTrial: answer.isFirstTrial ?? true,
        }),
      )
      .filter((answer) => options.isFullSubmission || answer.value !== ''); // Filter out empty answers

    return {
      type: QuestionType.FILL_BLANKS,
      answers: filteredAnswers,
    };
  }

  /**
   * Map user input from backend to form data format
   * Ensures the answers array is indexed by blank position, using correct types.
   */
  mapUserInputToFormData(userInput: UserInputDTO): UserInputDTO {
    if (!userInput || !this.isValidUserInput(userInput)) {
      return {
        type: QuestionType.FILL_BLANKS,
        answers: [],
      };
    }
    const fillBlanksInput = userInput as FillBlanksUserInputDTO;
    return {
      type: QuestionType.FILL_BLANKS,
      answers: Array.from(
        { length: this.content.items.filter((item) => item.type === 'missing').length },
        (_, idx) =>
          fillBlanksInput.answers.find((a) => a.index === idx) ?? {
            index: idx,
            value: '',
            isFirstTrial: true,
          },
      ),
    };
  }

  /**
   * Validate that the user input is a valid FillBlanksUserInputDTO
   */
  private isValidUserInput(userInput: unknown): userInput is FillBlanksUserInputDTO {
    return (
      typeof userInput === 'object' &&
      userInput !== null &&
      'type' in userInput &&
      (userInput as any).type === QuestionType.FILL_BLANKS &&
      'answers' in userInput &&
      Array.isArray((userInput as any).answers)
    );
  }
}
