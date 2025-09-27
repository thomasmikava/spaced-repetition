import type {
  QuestionContentDTO,
  UserInputDTO,
  UserAnswerDTO,
} from '../../api/controllers/questions/question-content.schema';

// Base interface that all question types will implement
export interface BaseQuestionComponentProps {
  question: {
    id: number;
    questionId: number;
    order: number;
    points: number;
    question: {
      id: number;
      title: string | null;
      content: QuestionContentDTO;
      isOfficial: boolean;
    };
  };
  userAnswer?: UserAnswerDTO;
  isReadOnly?: boolean;
  onAnswerChange?: (answer: UserInputDTO) => void;
  onSubmit?: () => void;
}

// Quiz attempt state
export interface QuizAttemptState {
  attemptId: number | null;
  answers: Map<number, UserInputDTO>; // questionId -> userInput
  currentQuestionIndex: number;
  isCompleted: boolean;
}
