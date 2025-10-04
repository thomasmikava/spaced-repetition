/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import type {
  MatchingQuestionDTO,
  MatchingUserInputDTO,
  MatchingUserAnswerDTO,
  MatchingBlankItemDTO,
  AnswerCheckResultDTO,
  QuestionCheckResultDTO,
  MatchingInputItemDTO,
  UserAnswerDTO,
} from '../question-content.schema';
import { AnswerStatus, QuestionType } from '../question-content.schema';
import type { IQuestion, MapOptions } from './base-question.interface';
import type { UserInputDTO } from '../question-content.schema';

/**
 * Matching question implementation
 */
export class MatchingQuestion implements IQuestion {
  constructor(private readonly content: MatchingQuestionDTO) {}

  /**
   * Check user's answers for matching question
   */
  checkAnswers(args: { userInput: unknown; maxPoints: number }): QuestionCheckResultDTO | null {
    const { userInput, maxPoints } = args;
    // Validate and cast user input
    if (!this.isValidUserInput(userInput)) {
      return null;
    }

    const blankItems = this.content.items.filter((item): item is MatchingBlankItemDTO => item.type === 'blank');
    const totalBlanks = blankItems.length;

    if (totalBlanks === 0) {
      throw new Error('Matching question must have at least one blank item');
    }

    const pointsPerBlank = maxPoints / totalBlanks;
    const answers: AnswerCheckResultDTO[] = [];
    let earnedPoints = 0;
    let attemptedBlanks = 0;
    let correctBlanks = 0;
    let pointsAttempted = 0;

    // Track usage of answer options
    const optionUsage = new Map<string, number>();
    this.content.answerOptions.forEach((option) => {
      optionUsage.set(option.value, 0);
    });

    // Process each blank item
    blankItems.forEach((blankItem, index) => {
      const userAnswer = userInput.answers.find((a) => a.index === index);

      // Only process if user actually provided an answer (not just missing)
      if (!userAnswer || userAnswer.value === undefined || userAnswer.value === null) {
        return; // Skip items that weren't answered at all
      }

      const userValue = userAnswer.value.trim();
      const isFirstTrial = userAnswer.isFirstTrial ?? true;

      // Get correct answers
      const correctAnswers = blankItem.correctAnswers.map((a) => a.trim());

      let status: AnswerStatus = AnswerStatus.UNANSWERED;
      let pointsEarned = 0;

      // Count as attempted since we received an answer (even if empty string)
      attemptedBlanks++;
      pointsAttempted += pointsPerBlank;

      // Check if answer is correct and within usage limits
      const answerOption = this.content.answerOptions.find((opt) => opt.value === userValue);
      const currentUsage = optionUsage.get(userValue) || 0;
      const usageLimit = answerOption?.usageLimit || 1;

      if (correctAnswers.includes(userValue) && currentUsage < usageLimit) {
        status = AnswerStatus.CORRECT;
        pointsEarned = pointsPerBlank;
        correctBlanks++;
        optionUsage.set(userValue, currentUsage + 1);
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
        correctAnswer: blankItem.correctAnswers[0], // Primary correct answer
        status,
        pointsEarned,
        maxPoints: pointsPerBlank,
        isFirstTrial,
      });
    });

    // Create processed answer
    const processedAnswer: MatchingUserAnswerDTO = {
      type: QuestionType.MATCHING,
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
      correctBlanks,
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
    return this.content.items.filter((item) => item.type === 'blank').length;
  }

  /**
   * Validate that the user input is a valid MatchingUserInputDTO
   */
  /**
   * Map form data to backend UserInputDTO format
   * Maps form data to proper MatchingUserInputDTO structure
   */
  mapFormDataToUserInput(formData: UserInputDTO | undefined | null, options: MapOptions): UserInputDTO {
    // Handle null/undefined input - return empty valid structure
    if (!formData || !this.isValidUserInput(formData)) {
      return {
        type: QuestionType.MATCHING,
        answers: [],
      };
    }

    // Cast to MatchingUserInputDTO since we validated it
    const matchingInput = formData as MatchingUserInputDTO;

    // Filter out empty answers and ensure proper format
    const filteredAnswers = matchingInput.answers
      .filter(Boolean)
      .map(
        (answer): MatchingInputItemDTO => ({
          index: answer.index,
          value: (answer.value || '').trim(),
          isRevealed: answer.isRevealed ?? undefined,
          isFirstTrial: answer.isFirstTrial ?? true,
        }),
      )
      .filter(
        (answer) => options.isFullSubmission || !answer.isFirstTrial || !!answer.isRevealed || answer.value !== '',
      ); // Filter empty answers for matching as well

    return {
      type: QuestionType.MATCHING,
      answers: filteredAnswers,
    };
  }

  /**
   * Map user input from backend to form data format
   * Ensures the answers array is indexed by blank position, using correct types.
   */
  mapUserInputToFormData(userInput: UserAnswerDTO): UserInputDTO {
    if (!userInput || !this.isValidUserInput(userInput)) {
      return {
        type: QuestionType.MATCHING,
        answers: [],
      };
    }
    const matchingInput = userInput as MatchingUserAnswerDTO;
    return {
      type: QuestionType.MATCHING,
      answers: Array.from({ length: this.content.items.filter((item) => item.type === 'blank').length }, (_, idx) => {
        const input = matchingInput.answers.find((a) => a.index === idx);
        if (input) return { ...input, isRevealed: input.status === AnswerStatus.REVEALED };
        return {
          index: idx,
          value: '',
          isFirstTrial: true,
        };
      }),
    };
  }

  /**
   * Validate that the user input is a valid MatchingUserInputDTO
   */
  private isValidUserInput(userInput: unknown): userInput is MatchingUserInputDTO {
    return (
      typeof userInput === 'object' &&
      userInput !== null &&
      'type' in userInput &&
      (userInput as any).type === QuestionType.MATCHING &&
      'answers' in userInput &&
      Array.isArray((userInput as any).answers)
    );
  }
}
