import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import QuizPage from './QuizPage';
import { QuestionType, AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import type {
  QuizDTO,
  UserQuizAttemptDTO,
  UserQuestionAttemptDTO,
  GetQuizDetailsResDTO,
  GetUserQuizProgressResDTO,
} from '../../api/controllers/quizzes/quiz.schema';
import type { FillBlanksUserAnswerDTO } from '../../api/controllers/questions/question-content.schema';
import { quizMocks } from '../../api/controllers/quizzes/quiz.cache';
import { screen, within } from '../../test';
import { fillingBlanksSelector } from './FillBlanksQuestion.selector';
import { questionCardSelector } from './QuestionCard.selector';

// Mock server setup
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test data factory functions
const createFillBlanksQuizDetails = (overrides?: Partial<QuizDTO>): GetQuizDetailsResDTO => ({
  id: 1,
  lessonId: 1,
  courseId: 1,
  title: 'Fill in the Blanks Quiz',
  description: 'Test your knowledge with fill-in-the-blanks questions',
  totalPoints: 2,
  questionCount: 2,
  isHidden: false,
  priority: 0,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [
    {
      id: 1,
      questionId: 1,
      order: 0,
      points: 1,
      question: {
        id: 1,
        title: 'Capital Cities',
        isOfficial: false,
        content: {
          type: QuestionType.FILL_BLANKS,
          items: [
            { type: 'text', value: 'The capital of France is ' },
            {
              type: 'missing',
              officialAnswers: ['Paris'],
              explanation: 'Paris has been the capital of France since 987 AD',
            },
            { type: 'text', value: '.' },
          ],
        },
      },
    },
    {
      id: 2,
      questionId: 2,
      order: 1,
      points: 1,
      question: {
        id: 2,
        title: 'Planets',
        isOfficial: false,
        content: {
          type: QuestionType.FILL_BLANKS,
          items: [
            { type: 'text', value: 'The largest planet is ' },
            {
              type: 'missing',
              officialAnswers: ['Jupiter'],
              additionalAnswers: ['jupiter', 'JUPITER'],
              explanation: 'Jupiter is the fifth planet from the Sun',
            },
            { type: 'text', value: '.' },
          ],
        },
      },
    },
  ],
  ...overrides,
});

const createEmptyUserProgress = (): GetUserQuizProgressResDTO => ({
  quiz: {} as QuizDTO, // Will be filled by the quiz details
  attempt: null,
  questionAttempts: [],
  completionPercentage: 0,
  accuracyPercentage: 0,
});

const createUserProgressWithAttempt = (
  attemptId: number,
  questionAttempts: UserQuestionAttemptDTO[] = [],
): GetUserQuizProgressResDTO => ({
  quiz: {} as QuizDTO,
  attempt: {
    id: attemptId,
    userId: 1,
    quizId: 1,
    lessonId: 1,
    courseId: 1,
    pointsAttempted: 0,
    pointsEarned: 0,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  questionAttempts,
  completionPercentage: 50,
  accuracyPercentage: 50,
});

const createQuestionAttempt = (
  questionId: number,
  userAnswer: FillBlanksUserAnswerDTO,
  options?: Partial<UserQuestionAttemptDTO>,
): UserQuestionAttemptDTO => ({
  id: questionId * 10,
  userId: 1,
  questionId,
  quizAttemptId: 1,
  userAnswer,
  pointsAttempted: 1,
  pointsEarned: options?.pointsEarned ?? 0,
  maxPoints: 1,
  submittedAt: options?.submittedAt ?? null,
  ...options,
});

// Helper function to render the component with all necessary providers
const renderQuizPage = (initialRoute = '/course/1/lesson/1/quiz/1') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path='/course/:courseId/lesson/:lessonId/quiz/:quizId' element={<QuizPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return {
    ...utils,
    queryClient,
    user: userEvent.setup(),
  };
};

// Helper functions for interacting with the UI
const getBlankInput = (blankIndex: number): HTMLInputElement | null => {
  const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
  return inputs[blankIndex] || null;
};

// Helper to check if blank input is styled as incorrect
const isInputIncorrect = (input: HTMLInputElement | null): boolean => {
  if (!input) return false;
  const style = window.getComputedStyle(input);
  return style.borderColor === 'rgb(248, 113, 113)' || style.borderColor === '#f87171';
};

describe('Section B.1: Fill-in-the-Blanks Test Type', () => {
  describe('B.1.1 Data Structure', () => {
    beforeEach(() => {
      const quiz = createFillBlanksQuizDetails();
      const userProgress = createEmptyUserProgress();
      const newAttempt = quizMocks.requests.startQuizAttempt.createResponsePayload({
        id: 1,
        userId: 1,
        quizId: 1,
        lessonId: 1,
        courseId: 1,
        pointsAttempted: 0,
        pointsEarned: 0,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(userProgress),
        quizMocks.requests.startQuizAttempt.successResponse(newAttempt),
      );
    });

    it('should support text items with value property', async () => {
      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText(/The capital of France is/)).toBeInTheDocument();
        expect(screen.getByText(/The largest planet is/)).toBeInTheDocument();
      });
    });

    it('should support missing items with officialAnswers', async () => {
      const { user } = renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);
      });

      const firstInput = getBlankInput(0);
      await user.type(firstInput!, 'Paris');

      const submitResponse = quizMocks.requests.submitQuestionAnswer.createResponsePayload({
        questionAttempt: createQuestionAttempt(
          1,
          {
            type: QuestionType.FILL_BLANKS,
            answers: [
              {
                index: 0,
                value: 'Paris',
                isFirstTrial: true,
                status: AnswerStatus.CORRECT,
                pointsEarned: 1,
                correctAnswer: 'Paris',
              },
            ],
          },
          { pointsEarned: 1 },
        ),
        quizAttempt: {} as UserQuizAttemptDTO,
        isQuizCompleted: false,
      });

      server.use(quizMocks.requests.submitQuestionAnswer.successResponse(submitResponse));

      const submitButton = screen.get(questionCardSelector.partialSubmit());
      await user.click(submitButton);
    });

    it('should support missing items with additionalAnswers', async () => {
      const { user } = renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);
      });

      const secondInput = getBlankInput(1);
      await user.type(secondInput!, 'jupiter');

      const submitResponse = quizMocks.requests.submitQuestionAnswer.createResponsePayload({
        questionAttempt: createQuestionAttempt(2, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'jupiter',
              isFirstTrial: true,
              status: AnswerStatus.PARTIAL,
              pointsEarned: 1,
              correctAnswer: 'Jupiter',
            },
          ],
        }),
        quizAttempt: {} as UserQuizAttemptDTO,
        isQuizCompleted: false,
      });

      server.use(quizMocks.requests.submitQuestionAnswer.successResponse(submitResponse));

      const submitButton = screen.get(questionCardSelector.partialSubmit());
      await user.click(submitButton);
    });

    it('should support missing items with explanation', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.FILL_BLANKS,
            answers: [
              {
                index: 0,
                value: 'Paris',
                isFirstTrial: true,
                status: AnswerStatus.CORRECT,
                pointsEarned: 1,
                correctAnswer: 'Paris',
              },
            ],
          },
          { submittedAt: new Date(), pointsEarned: 1 },
        ),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithCorrect),
      );

      renderQuizPage();

      const questionCard = await screen.find(questionCardSelector.questionCard(1));
      const infoIcon = within(questionCard).get(fillingBlanksSelector.explanationIcon());
      expect(infoIcon).toHaveAccessibleDescription('Paris has been the capital of France since 987 AD');
    });
  });

  describe('B.1.2 Rendering in Test View', () => {
    const setupBasicQuiz = () => {
      const quiz = createFillBlanksQuizDetails();
      const userProgress = createEmptyUserProgress();
      const newAttempt = quizMocks.requests.startQuizAttempt.createResponsePayload({
        id: 1,
        userId: 1,
        quizId: 1,
        lessonId: 1,
        courseId: 1,
        pointsAttempted: 0,
        pointsEarned: 0,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(userProgress),
        quizMocks.requests.startQuizAttempt.successResponse(newAttempt),
      );
    };

    it('should render text items as plain text', async () => {
      setupBasicQuiz();
      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText(/The capital of France is/)).toBeInTheDocument();
        expect(screen.getByText(/The largest planet is/)).toBeInTheDocument();
      });
    });

    it('should render missing items as input fields', async () => {
      setupBasicQuiz();
      renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);

        inputs.forEach((input) => {
          expect(input).toHaveAttribute('type', 'text');
          expect(input).toHaveValue('');
        });
      });
    });

    it('should render previously correct answers as non-editable styled text when resuming', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.FILL_BLANKS,
            answers: [
              {
                index: 0,
                value: 'Paris',
                isFirstTrial: true,
                status: AnswerStatus.CORRECT,
                pointsEarned: 1,
                correctAnswer: 'Paris',
              },
            ],
          },
          { submittedAt: new Date(), pointsEarned: 1 },
        ),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithCorrect),
      );

      renderQuizPage();
      const questionCard = await screen.find(questionCardSelector.questionCard(1));

      await within(questionCard).find(fillingBlanksSelector.byStatusWithText(AnswerStatus.CORRECT, 'Paris'));

      const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
      expect(inputs).toHaveLength(1); // Only second question input remains
    });

    it('should render previously incorrect answers as pre-filled inputs with red border when resuming', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'London',
              isFirstTrial: true,
              status: AnswerStatus.INCORRECT,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);

        expect(inputs[0]).toHaveValue('London');
        expect(isInputIncorrect(inputs[0])).toBe(true);

        const revealButton = screen.get(fillingBlanksSelector.revealButton());
        expect(revealButton).toBeInTheDocument();
      });
    });

    it('should render previously revealed answers as non-editable styled text when resuming', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithRevealed = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'London',
              isFirstTrial: false,
              status: AnswerStatus.REVEALED,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithRevealed),
      );

      renderQuizPage();

      const questionCard = await screen.find(questionCardSelector.questionCard(1));
      const revealedSpan = within(questionCard).getByText('London');
      expect(revealedSpan).toHaveStyle({ textDecoration: 'line-through' });

      const correctAnswer = within(questionCard).getByText('Paris');
      expect(correctAnswer).toHaveStyle({ color: 'rgb(74, 222, 128)' });

      const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
      expect(inputs).toHaveLength(1); // Only second question input remains
    });
  });

  describe('B.1.3 User Interaction & Features', () => {
    it('should remove red border immediately when user starts typing in incorrect field', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'London',
              isFirstTrial: true,
              status: AnswerStatus.INCORRECT,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      const { user } = renderQuizPage();

      await waitFor(() => {
        const firstInput = getBlankInput(0);
        expect(firstInput).toHaveValue('London');
        expect(isInputIncorrect(firstInput)).toBe(true);
      });

      const firstInput = getBlankInput(0);
      await user.clear(firstInput!);
      await user.type(firstInput!, 'P');

      await waitFor(() => {
        expect(isInputIncorrect(firstInput)).toBe(false);
      });
    });

    it('should show hint button (💡) next to all inputs', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'London',
              isFirstTrial: true,
              status: AnswerStatus.INCORRECT,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);
      });

      const hintButtons = screen.getAll(fillingBlanksSelector.hintButton());
      expect(hintButtons).toHaveLength(2); // One for each input
      hintButtons.forEach((button) => {
        expect(button).toHaveAccessibleDescription('Get a hint');
      });
    });

    it('should show reveal answer icon (?) next to incorrect inputs', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'London',
              isFirstTrial: true,
              status: AnswerStatus.INCORRECT,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      renderQuizPage();

      const revealButton = await screen.find(fillingBlanksSelector.revealButton());
      expect(revealButton).toHaveAccessibleDescription('Reveal answer (forfeit points)');
    });

    it('should show hint button for all input fields', async () => {
      const quiz = createFillBlanksQuizDetails();
      const userProgress = createEmptyUserProgress();
      const newAttempt = quizMocks.requests.startQuizAttempt.createResponsePayload({
        id: 1,
        userId: 1,
        quizId: 1,
        lessonId: 1,
        courseId: 1,
        pointsAttempted: 0,
        pointsEarned: 0,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(userProgress),
        quizMocks.requests.startQuizAttempt.successResponse(newAttempt),
      );

      renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);
      });

      const hintButtons = screen.getAll(fillingBlanksSelector.hintButton());
      expect(hintButtons).toHaveLength(2); // One hint button for each input
    });

    it('should show hint button for unanswered inputs', async () => {
      const quiz = createFillBlanksQuizDetails();
      const userProgress = createEmptyUserProgress();
      const newAttempt = quizMocks.requests.startQuizAttempt.createResponsePayload({
        id: 1,
        userId: 1,
        quizId: 1,
        lessonId: 1,
        courseId: 1,
        pointsAttempted: 0,
        pointsEarned: 0,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(userProgress),
        quizMocks.requests.startQuizAttempt.successResponse(newAttempt),
      );

      renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);
      });

      const hintButtons = screen.getAll(fillingBlanksSelector.hintButton());
      expect(hintButtons).toHaveLength(2); // Hint buttons should be shown for all inputs
    });

    it('should update input value when hint button is clicked', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'Par',
              isFirstTrial: true,
              status: AnswerStatus.INCORRECT,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      const { user } = renderQuizPage();

      await waitFor(() => {
        const firstInput = getBlankInput(0);
        expect(firstInput).toHaveValue('Par');
      });

      // Get the first hint button (for the first input)
      const hintButtons = screen.getAll(fillingBlanksSelector.hintButton());
      await user.click(hintButtons[0]);

      await waitFor(() => {
        const firstInput = getBlankInput(0);
        expect(firstInput).toHaveValue('Pari'); // getMinimalChange should add one character
      });
    });

    it('should maintain input focus when hint button is clicked', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'Par',
              isFirstTrial: true,
              status: AnswerStatus.INCORRECT,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      const { user } = renderQuizPage();

      await waitFor(() => {
        const firstInput = getBlankInput(0);
        expect(firstInput).toHaveValue('Par');
      });

      const firstInput = getBlankInput(0);

      // Focus the input
      await user.click(firstInput!);
      expect(firstInput).toHaveFocus();

      // Click hint button
      const hintButtons = screen.getAll(fillingBlanksSelector.hintButton());
      await user.click(hintButtons[0]);

      // Verify input still has focus after hint is applied
      await waitFor(() => {
        expect(firstInput).toHaveValue('Pari');
        expect(firstInput).toHaveFocus();
      });
    });

    it('should reveal official answer and make blank non-editable when reveal icon is clicked', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'London',
              status: AnswerStatus.INCORRECT,
              correctAnswer: 'Paris',
              isFirstTrial: true,
              pointsEarned: 0,
            },
          ],
        }),
      ]);

      // Update progress after reveal
      const attemptWithRevealed = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'London',
              isFirstTrial: false,
              status: AnswerStatus.REVEALED,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      const { user } = renderQuizPage();

      await waitFor(() => {
        const revealButton = screen.get(fillingBlanksSelector.revealButton());
        expect(revealButton).toBeInTheDocument();
      });

      const revealButton = screen.get(fillingBlanksSelector.revealButton());

      // Update server to return revealed state
      server.use(quizMocks.requests.getUserQuizProgress.successResponse(attemptWithRevealed));

      await user.click(revealButton);

      // The component should update the form state internally when reveal is clicked
      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(1); // Only second question input remains
      });
    });

    it('should show explanation icon (i) after blank is answered when explanation is available', async () => {
      const quiz = createFillBlanksQuizDetails();
      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.FILL_BLANKS,
            answers: [
              {
                index: 0,
                value: 'Paris',
                isFirstTrial: true,
                status: AnswerStatus.CORRECT,
                pointsEarned: 1,
                correctAnswer: 'Paris',
              },
            ],
          },
          { submittedAt: new Date(), pointsEarned: 1 },
        ),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithCorrect),
      );

      renderQuizPage();

      const questionCard = await screen.find(questionCardSelector.questionCard(1));
      const tooltipTrigger = within(questionCard).queryByText('i');
      expect(tooltipTrigger).toBeInTheDocument();
    });

    it('should handle partial answers from additionalAnswers correctly', async () => {
      const quiz = createFillBlanksQuizDetails();
      const userProgress = createEmptyUserProgress();

      const startAttemptResponse = quizMocks.requests.startQuizAttempt.createResponsePayload({
        id: 1,
        userId: 1,
        quizId: 1,
        lessonId: 1,
        courseId: 1,
        pointsAttempted: 0,
        pointsEarned: 0,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(userProgress),
        quizMocks.requests.startQuizAttempt.successResponse(startAttemptResponse),
      );

      const { user } = renderQuizPage();

      await waitFor(() => {
        const inputs = screen.getAll(fillingBlanksSelector.blankInputs());
        expect(inputs).toHaveLength(2);
      });

      const secondInput = getBlankInput(1);
      await user.type(secondInput!, 'jupiter');

      const submitResponse = quizMocks.requests.submitQuestionAnswer.createResponsePayload({
        questionAttempt: createQuestionAttempt(2, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'jupiter',
              isFirstTrial: true,
              status: AnswerStatus.PARTIAL,
              pointsEarned: 1,
              correctAnswer: 'Jupiter',
            },
          ],
        }),
        quizAttempt: {} as UserQuizAttemptDTO,
        isQuizCompleted: false,
      });

      const attemptWithPartial = createUserProgressWithAttempt(1, [
        createQuestionAttempt(2, {
          type: QuestionType.FILL_BLANKS,
          answers: [
            {
              index: 0,
              value: 'jupiter',
              isFirstTrial: true,
              status: AnswerStatus.PARTIAL,
              pointsEarned: 1,
              correctAnswer: 'Jupiter',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.submitQuestionAnswer.successResponse(submitResponse),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithPartial),
      );

      const submitButton = screen.get(questionCardSelector.partialSubmit());
      await user.click(submitButton);

      const questionCard = await screen.find(questionCardSelector.questionCard(2));
      const partialSpan = within(questionCard).get(
        fillingBlanksSelector.byStatusWithText(AnswerStatus.PARTIAL, 'jupiter'),
      );
      expect(partialSpan).toBeInTheDocument();
    });
  });
});
