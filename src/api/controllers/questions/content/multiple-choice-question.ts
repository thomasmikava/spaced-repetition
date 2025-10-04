/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import type {
  MultipleChoiceQuestionDTO,
  MultipleChoiceUserInputDTO,
  MultipleChoiceUserAnswerDTO,
  MultipleChoiceGroupItemDTO,
  AnswerCheckResultDTO,
  QuestionCheckResultDTO,
  MultipleChoiceInputItemDTO,
  UserAnswerDTO,
} from '../question-content.schema';
import { AnswerStatus, QuestionType } from '../question-content.schema';
import type { IQuestion, MapOptions } from './base-question.interface';
import type { UserInputDTO } from '../question-content.schema';

/**
 * Multiple choice question implementation
 */
export class MultipleChoiceQuestion implements IQuestion {
  constructor(private readonly content: MultipleChoiceQuestionDTO) {}

  /**
   * Check user's answers for multiple choice question
   */
  checkAnswers(args: { userInput: unknown; maxPoints: number }): QuestionCheckResultDTO | null {
    const { userInput, maxPoints } = args;

    // Validate and cast user input
    if (!this.isValidUserInput(userInput)) {
      return null;
    }

    const choiceGroups = this.content.items.filter(
      (item): item is MultipleChoiceGroupItemDTO => item.type === 'choice-group',
    );
    const totalBlanks = choiceGroups.length;

    if (totalBlanks === 0) {
      throw new Error('Multiple choice question must have at least one choice group');
    }

    const pointsPerGroup = maxPoints / totalBlanks;
    const answers: AnswerCheckResultDTO[] = [];
    let earnedPoints = 0;
    let attemptedBlanks = 0;
    let correctBlanks = 0;
    let pointsAttempted = 0;

    // Process each choice group
    choiceGroups.forEach((choiceGroup, index) => {
      const userAnswer = userInput.answers.find((a) => a.index === index);

      // Only process if user actually provided an answer
      if (!userAnswer || userAnswer.value === undefined || userAnswer.value === null) {
        return; // Skip items that weren't answered at all
      }

      const userValue = userAnswer.value;
      const isFirstTrial = userAnswer.isFirstTrial ?? true;
      const isMultiSelect = choiceGroup.isMultiSelect ?? false;

      // Get correct answer indices
      const correctIndices = choiceGroup.options
        .map((opt, idx) => (opt.isCorrect ? idx : -1))
        .filter((idx) => idx !== -1);

      let status: AnswerStatus = AnswerStatus.UNANSWERED;
      let pointsEarned = 0;

      // Count as attempted since we received an answer
      attemptedBlanks++;
      pointsAttempted += pointsPerGroup;

      if (!isMultiSelect) {
        // Single selection logic
        const selectedIndex = userValue as number;

        if (correctIndices.includes(selectedIndex)) {
          if (isFirstTrial) {
            status = AnswerStatus.CORRECT;
            pointsEarned = pointsPerGroup;
            correctBlanks++;
          } else {
            status = AnswerStatus.PARTIAL;
            pointsEarned = pointsPerGroup * 0.5; // 50% for non-first trial
            correctBlanks += 0.5;
          }
        } else {
          status = AnswerStatus.INCORRECT;
          pointsEarned = 0;
        }
      } else {
        // Multiple selection logic
        const selectedIndices = userValue as number[];
        const selectedSet = new Set(selectedIndices);
        const correctSet = new Set(correctIndices);

        // Check if all correct options are selected
        const allCorrectSelected = correctIndices.every((idx) => selectedSet.has(idx));
        // Check if any incorrect options are selected
        const hasIncorrect = selectedIndices.some((idx) => !correctSet.has(idx));

        if (allCorrectSelected && !hasIncorrect) {
          if (isFirstTrial) {
            status = AnswerStatus.CORRECT;
            pointsEarned = pointsPerGroup;
            correctBlanks++;
          } else {
            status = AnswerStatus.PARTIAL;
            pointsEarned = pointsPerGroup * 0.5;
            correctBlanks += 0.5;
          }
        } else if (selectedIndices.some((idx) => correctSet.has(idx))) {
          // At least some correct options selected
          status = AnswerStatus.PARTIAL;
          pointsEarned = pointsPerGroup * 0.5;
          correctBlanks += 0.5;
        } else {
          // No correct options selected
          status = AnswerStatus.INCORRECT;
          pointsEarned = 0;
        }
      }

      earnedPoints += pointsEarned;

      // Prepare correct answer for display
      const correctAnswer = !isMultiSelect ? correctIndices[0] : correctIndices;

      answers.push({
        index,
        userInput: JSON.stringify(userValue), // Store as string for consistency
        correctAnswer: JSON.stringify(correctAnswer),
        status,
        pointsEarned,
        maxPoints: pointsPerGroup,
        isFirstTrial,
      });
    });

    // Create processed answer
    const processedAnswer: MultipleChoiceUserAnswerDTO = {
      type: QuestionType.MULTIPLE_CHOICE,
      answers: answers.map((a) => ({
        index: a.index,
        value: JSON.parse(a.userInput),
        isFirstTrial: a.isFirstTrial,
        status: a.status,
        pointsEarned: a.pointsEarned,
        correctAnswer: JSON.parse(a.correctAnswer),
      })),
    };

    // Calculate if every choice group is either revealed or correct
    const isEveryBlankRevealedOrCorrect = choiceGroups.every((_, index) => {
      const answer = answers.find((a) => a.index === index);
      return (
        answer &&
        (answer.status === AnswerStatus.REVEALED ||
          answer.status === AnswerStatus.CORRECT ||
          answer.status === AnswerStatus.PARTIAL)
      );
    });

    return {
      totalBlanks,
      attemptedBlanks,
      correctBlanks: Math.round(correctBlanks * 100) / 100,
      maxPoints,
      earnedPoints: Math.round(earnedPoints * 100) / 100,
      pointsAttempted: Math.round(pointsAttempted * 100) / 100,
      answers,
      processedAnswer,
      isEveryBlankRevealedOrCorrect,
    };
  }

  /**
   * Get the number of choice groups in this question
   */
  getInputCount(): number {
    return this.content.items.filter((item) => item.type === 'choice-group').length;
  }

  /**
   * Map form data to backend UserInputDTO format
   * Filters out null/undefined answers for partial submission
   */
  mapFormDataToUserInput(formData: UserInputDTO | undefined | null, options: MapOptions): UserInputDTO {
    // Handle null/undefined input - return empty valid structure
    if (!formData || !this.isValidUserInput(formData)) {
      return {
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [],
      };
    }

    // Cast to MultipleChoiceUserInputDTO since we validated it
    const multipleChoiceInput = formData as MultipleChoiceUserInputDTO;

    // Filter out answers with null/undefined values
    const filteredAnswers = multipleChoiceInput.answers
      .filter(Boolean)
      .map(
        (answer): MultipleChoiceInputItemDTO => ({
          index: answer.index,
          value: answer.value,
          isRevealed: answer.isRevealed ?? undefined,
          isFirstTrial: answer.isFirstTrial ?? true,
        }),
      )
      .filter(
        (answer) =>
          options.isFullSubmission ||
          !answer.isFirstTrial ||
          !!answer.isRevealed ||
          (answer.value !== null && answer.value !== undefined),
      );

    return {
      type: QuestionType.MULTIPLE_CHOICE,
      answers: filteredAnswers,
    };
  }

  /**
   * Map user input from backend to form data format
   * Ensures the answers array is indexed by choice group position
   */
  mapUserInputToFormData(userInput: UserAnswerDTO): UserInputDTO {
    if (!userInput || !this.isValidUserInput(userInput)) {
      return {
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [],
      };
    }

    const multipleChoiceInput = userInput as MultipleChoiceUserAnswerDTO;
    const choiceGroupCount = this.content.items.filter((item) => item.type === 'choice-group').length;

    return {
      type: QuestionType.MULTIPLE_CHOICE,
      answers: Array.from({ length: choiceGroupCount }, (_, idx) => {
        const input = multipleChoiceInput.answers.find((a) => a.index === idx);
        if (input) {
          return {
            ...input,
            isRevealed: input.status === AnswerStatus.REVEALED,
          };
        }
        return {
          index: idx,
          value: null,
          isFirstTrial: true,
        };
      }),
    };
  }

  /**
   * Validate that the user input is a valid MultipleChoiceUserInputDTO
   */
  private isValidUserInput(userInput: unknown): userInput is MultipleChoiceUserInputDTO {
    return (
      typeof userInput === 'object' &&
      userInput !== null &&
      'type' in userInput &&
      (userInput as any).type === QuestionType.MULTIPLE_CHOICE &&
      'answers' in userInput &&
      Array.isArray((userInput as any).answers)
    );
  }
}
