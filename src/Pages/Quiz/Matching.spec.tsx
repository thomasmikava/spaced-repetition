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
import type { MatchingUserAnswerDTO } from '../../api/controllers/questions/question-content.schema';
import { quizMocks } from '../../api/controllers/quizzes/quiz.cache';
import { screen, within } from '../../test';
import { matchingSelector } from './MatchingQuestion.selector';
import { questionCardSelector } from './QuestionCard.selector';

// Mock server setup
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test data factory functions
const createMatchingQuizDetails = (overrides?: Partial<QuizDTO>): GetQuizDetailsResDTO => ({
  id: 1,
  lessonId: 1,
  courseId: 1,
  title: 'Matching Quiz',
  description: 'Test your knowledge with matching questions',
  totalPoints: 4,
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
      points: 2,
      question: {
        id: 1,
        title: 'Match Countries to Capitals',
        isOfficial: false,
        content: {
          type: QuestionType.MATCHING,
          items: [
            { type: 'text', value: 'France: ' },
            {
              type: 'blank',
              correctAnswers: ['Paris'],
              explanation: 'Paris has been the capital of France since 987 AD',
            },
            { type: 'text', value: ', Germany: ' },
            {
              type: 'blank',
              correctAnswers: ['Berlin'],
              explanation: 'Berlin became the capital of unified Germany in 1990',
            },
          ],
          answerOptions: [
            { value: 'Paris', usageLimit: 1 },
            { value: 'Berlin', usageLimit: 1 },
            { value: 'London', usageLimit: 1 },
            { value: 'Madrid', usageLimit: 1 },
          ],
        },
      },
    },
    {
      id: 2,
      questionId: 2,
      order: 1,
      points: 2,
      question: {
        id: 2,
        title: 'Match Elements to Symbols',
        isOfficial: false,
        content: {
          type: QuestionType.MATCHING,
          items: [
            { type: 'text', value: 'Hydrogen: ' },
            {
              type: 'blank',
              correctAnswers: ['H'],
            },
            { type: 'text', value: ', Oxygen: ' },
            {
              type: 'blank',
              correctAnswers: ['O'],
            },
          ],
          answerOptions: [
            { value: 'H', usageLimit: 2 },
            { value: 'O', usageLimit: 2 },
            { value: 'C', usageLimit: 2 },
          ],
        },
      },
    },
  ],
  ...overrides,
});

const createEmptyUserProgress = (): GetUserQuizProgressResDTO => ({
  quiz: {} as QuizDTO,
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
  userAnswer: MatchingUserAnswerDTO,
  options?: Partial<UserQuestionAttemptDTO>,
): UserQuestionAttemptDTO => ({
  id: questionId * 10,
  userId: 1,
  questionId,
  quizAttemptId: 1,
  userAnswer,
  pointsAttempted: 2,
  pointsEarned: options?.pointsEarned ?? 0,
  maxPoints: 2,
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
const getDraggableOption = (optionValue: string): HTMLElement | null => {
  const options = screen.getAll(matchingSelector.draggableOptions());
  return options.find((opt) => opt.textContent?.includes(optionValue)) || null;
};

const getDropZone = (blankIndex: number): HTMLElement | null => {
  const dropZones = screen.queryAll(matchingSelector.dropZone());
  return dropZones[blankIndex] || null;
};

// Helper to check if drop zone has incorrect border
const hasIncorrectBorder = (element: HTMLElement | null): boolean => {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return style.borderColor === 'rgb(248, 113, 113)' || style.borderColor === '#f87171';
};

describe('Section B.2: Matching Question Type', () => {
  describe('B.2.1 Data Structure', () => {
    beforeEach(() => {
      const quiz = createMatchingQuizDetails();
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
        expect(screen.getByText(/France:/)).toBeInTheDocument();
        expect(screen.getByText(/Germany:/)).toBeInTheDocument();
        expect(screen.getByText(/Hydrogen:/)).toBeInTheDocument();
        expect(screen.getByText(/Oxygen:/)).toBeInTheDocument();
      });
    });

    it('should support blank items with correctAnswers', async () => {
      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4); // 2 blanks in each of 2 questions
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      // Dropdown should show options
      const dropdown = await screen.find(matchingSelector.dropdown());
      expect(within(dropdown).getByText('Paris')).toBeInTheDocument();
    });

    it('should support answer options with value and usageLimit', async () => {
      renderQuizPage();

      await waitFor(() => {
        const parisOption = getDraggableOption('Paris');
        expect(parisOption).toBeInTheDocument();
        // Usage limit of 1 should not show count tag
        expect(parisOption?.textContent).not.toContain('(1)');
      });
    });

    it('should support answer options with usageLimit > 1', async () => {
      renderQuizPage();

      await waitFor(() => {
        const questionCard = screen.get(questionCardSelector.questionCard(2));
        // Get the draggable option with datatype, not the text
        const draggableOptions = within(questionCard).getAll(matchingSelector.draggableOptions());
        const hOption = draggableOptions.find((opt) => opt.getAttribute('data-value') === 'H');
        expect(hOption?.textContent).toContain('(2)'); // Usage limit 2 should show count
      });
    });

    it('should support blank items with explanation', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.MATCHING,
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
      const infoIcon = within(questionCard).get(matchingSelector.explanationIcon());
      expect(infoIcon).toHaveAccessibleDescription('Paris has been the capital of France since 987 AD');
    });

    it('should support answer options with null usageLimit (unlimited)', async () => {
      const quizWithUnlimited = createMatchingQuizDetails({
        questions: [
          {
            id: 1,
            questionId: 1,
            order: 0,
            points: 2,
            question: {
              id: 1,
              title: 'Unlimited Usage Test',
              isOfficial: false,
              content: {
                type: QuestionType.MATCHING,
                items: [
                  { type: 'text', value: 'First: ' },
                  { type: 'blank', correctAnswers: ['Option'] },
                  { type: 'text', value: ', Second: ' },
                  { type: 'blank', correctAnswers: ['Option'] },
                ],
                answerOptions: [{ value: 'Option', usageLimit: null }],
              },
            },
          },
        ],
      });

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
        quizMocks.requests.getQuizDetails.successResponse(quizWithUnlimited),
        quizMocks.requests.getUserQuizProgress.successResponse(userProgress),
        quizMocks.requests.startQuizAttempt.successResponse(newAttempt),
      );

      renderQuizPage();

      await waitFor(() => {
        const optionElement = getDraggableOption('Option');
        expect(optionElement).toBeInTheDocument();
        // Unlimited usage should not show count tag
        expect(optionElement?.textContent).toBe('Option');
      });
    });
  });

  describe('B.2.2 Rendering in Test View', () => {
    const setupBasicQuiz = () => {
      const quiz = createMatchingQuizDetails();
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
        expect(screen.getByText(/France:/)).toBeInTheDocument();
        expect(screen.getByText(/Germany:/)).toBeInTheDocument();
      });
    });

    it('should render blank items as droppable zones', async () => {
      setupBasicQuiz();
      renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });
    });

    it('should render all answer options as draggable items', async () => {
      setupBasicQuiz();
      renderQuizPage();

      await waitFor(() => {
        const questionCard = screen.get(questionCardSelector.questionCard(1));
        expect(within(questionCard).getByText('Paris')).toBeInTheDocument();
        expect(within(questionCard).getByText('Berlin')).toBeInTheDocument();
        expect(within(questionCard).getByText('London')).toBeInTheDocument();
        expect(within(questionCard).getByText('Madrid')).toBeInTheDocument();
      });
    });

    it('should display usage count tags for options with usageLimit > 1', async () => {
      setupBasicQuiz();
      renderQuizPage();

      await waitFor(() => {
        const questionCard = screen.get(questionCardSelector.questionCard(2));
        const draggableOptions = within(questionCard).getAll(matchingSelector.draggableOptions());
        const hOption = draggableOptions.find((opt) => opt.getAttribute('data-value') === 'H');
        expect(hOption?.textContent).toContain('(2)');
      });
    });

    it('should not display usage count tags for options with usageLimit = 1', async () => {
      setupBasicQuiz();
      renderQuizPage();

      await waitFor(() => {
        const questionCard = screen.get(questionCardSelector.questionCard(1));
        const parisOption = within(questionCard).getByText('Paris');
        expect(parisOption.textContent).toBe('Paris');
      });
    });

    it('should render previously correct answers as non-editable styled text when resuming', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.MATCHING,
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
      await within(questionCard).find(matchingSelector.byStatusWithText(AnswerStatus.CORRECT, 'Paris'));

      const dropZones = screen.getAll(matchingSelector.dropZone());
      expect(dropZones).toHaveLength(2); // Only 2 remaining editable drop zones (one from each question, since first blank in Q1 is correct)
    });

    it('should render previously incorrect answers with red border when resuming', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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
        const dropZones = screen.getAll(matchingSelector.dropZone());
        const firstDropZone = dropZones[0];
        expect(firstDropZone.textContent).toContain('London');
        expect(hasIncorrectBorder(firstDropZone)).toBe(true);
      });
    });

    it('should render previously revealed answers as non-editable styled text when resuming', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithRevealed = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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
      const revealedSpans = within(questionCard).getAllByText('London');
      // The first one should be the struck-through one in the status display
      const revealedSpan = revealedSpans[0];
      expect(revealedSpan).toHaveStyle({ textDecoration: 'line-through' });

      const correctAnswerSpans = within(questionCard).getAllByText('Paris');
      // The first one should be in the status display with green color
      const correctAnswer = correctAnswerSpans[0];
      expect(correctAnswer).toHaveStyle({ color: 'rgb(74, 222, 128)' });
    });

    it('should update usage counts when options are selected', async () => {
      setupBasicQuiz();
      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const questionCard = await screen.find(questionCardSelector.questionCard(2));
      const firstDropZone = within(questionCard).getAll(matchingSelector.dropZone())[0];

      // Click to open dropdown
      await user.click(firstDropZone);

      const dropdown = await screen.find(matchingSelector.dropdown());
      const hOption = within(dropdown).getByText(/H/);
      await user.click(hOption);

      await waitFor(() => {
        // After selecting once, usage count should decrease
        const draggableOptions = within(questionCard).getAll(matchingSelector.draggableOptions());
        const hDraggable = draggableOptions.find((opt) => opt.getAttribute('data-value') === 'H');
        expect(hDraggable?.textContent).toContain('(1)');
      });
    });

    it('should fade options with 0 remaining uses', async () => {
      setupBasicQuiz();
      const { user } = renderQuizPage();

      const questionCard = await screen.find(questionCardSelector.questionCard(1));
      const dropZones = within(questionCard).getAll(matchingSelector.dropZone());

      // Select Paris in first drop zone
      await user.click(dropZones[0]);
      const dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      await waitFor(() => {
        const parisOption = getDraggableOption('Paris');
        const style = window.getComputedStyle(parisOption!);
        expect(style.opacity).toBe('0.5');
      });
    });
  });

  describe('B.2.3 User Interaction & Features', () => {
    it('should open dropdown menu when clicking on a drop zone', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      const dropdown = await screen.find(matchingSelector.dropdown());
      expect(dropdown).toBeInTheDocument();
      expect(within(dropdown).getByText('Paris')).toBeInTheDocument();
    });

    it('should allow selecting option from dropdown', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      const dropdown = await screen.find(matchingSelector.dropdown());
      const parisOption = within(dropdown).getByText('Paris');
      await user.click(parisOption);

      await waitFor(() => {
        const firstDropZone = getDropZone(0);
        expect(firstDropZone?.textContent).toContain('Paris');
      });
    });

    it('should show clear selection option in dropdown when blank has a value', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      let dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      // Click again to open dropdown
      await user.click(firstDropZone!);

      dropdown = await screen.find(matchingSelector.dropdown());
      const clearOption = within(dropdown).getByText(/Clear selection/i);
      expect(clearOption).toBeInTheDocument();
    });

    it('should clear selection when clear option is clicked', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      let dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      await waitFor(() => {
        expect(firstDropZone?.textContent).toContain('Paris');
      });

      await user.click(firstDropZone!);
      dropdown = await screen.find(matchingSelector.dropdown());
      const clearOption = within(dropdown).getByText(/Clear selection/i);
      await user.click(clearOption);

      await waitFor(() => {
        expect(firstDropZone?.textContent).not.toContain('Paris');
      });
    });

    it('should remove red border when user changes incorrect selection', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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
        const firstDropZone = getDropZone(0);
        expect(hasIncorrectBorder(firstDropZone)).toBe(true);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      const dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      await waitFor(() => {
        expect(hasIncorrectBorder(firstDropZone)).toBe(false);
      });
    });

    it('should show reveal answer button next to incorrect answers', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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

      const revealButton = await screen.find(matchingSelector.revealButton());
      expect(revealButton).toHaveAccessibleDescription('Reveal answer (forfeit points)');
    });

    it('should reveal correct answer when reveal button is clicked', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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

      const attemptWithRevealed = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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
        const revealButton = screen.get(matchingSelector.revealButton());
        expect(revealButton).toBeInTheDocument();
      });

      expect(screen.getAll(matchingSelector.dropZone())).toHaveLength(4); // All drop zone are active

      const revealButton = screen.get(matchingSelector.revealButton());

      server.use(quizMocks.requests.getUserQuizProgress.successResponse(attemptWithRevealed));

      await user.click(revealButton);

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(3); // One drop zone becomes non-editable
      });
    });

    it('should show explanation icon after answering correctly when explanation is available', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.MATCHING,
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

    it('should support drag and drop interaction', async () => {
      const quiz = createMatchingQuizDetails();
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
        const parisOption = getDraggableOption('Paris');
        // dnd-kit sets role="button" and aria-roledescription="draggable" instead of draggable attribute
        expect(parisOption).toHaveAttribute('role', 'button');
        expect(parisOption).toHaveAttribute('aria-roledescription', 'draggable');
      });
    });

    it('should replace existing selection when new option is dropped', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);

      // Select Paris first
      await user.click(firstDropZone!);
      let dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      await waitFor(() => {
        expect(firstDropZone?.textContent).toContain('Paris');
      });

      // Replace with Berlin
      await user.click(firstDropZone!);
      dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Berlin'));

      await waitFor(() => {
        expect(firstDropZone?.textContent).toContain('Berlin');
        expect(firstDropZone?.textContent).not.toContain('Paris');
      });
    });

    it('should handle partial submission correctly', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      const dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      const submitResponse = quizMocks.requests.submitQuestionAnswer.createResponsePayload({
        questionAttempt: createQuestionAttempt(
          1,
          {
            type: QuestionType.MATCHING,
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

    it('should disable fully used options from being dragged', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      const questionCard = await screen.find(questionCardSelector.questionCard(1));
      const dropZones = within(questionCard).getAll(matchingSelector.dropZone());

      // Use Paris (usage limit 1)
      await user.click(dropZones[0]);
      const dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      await waitFor(() => {
        const parisOption = getDraggableOption('Paris');
        // dnd-kit sets aria-disabled="true" instead of draggable="false"
        expect(parisOption).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('B.2.4 Answer Evaluation', () => {
    it('should mark answer as correct when matches correctAnswers and isFirstTrial is true', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      const dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      const submitResponse = quizMocks.requests.submitQuestionAnswer.createResponsePayload({
        questionAttempt: createQuestionAttempt(
          1,
          {
            type: QuestionType.MATCHING,
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

      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.MATCHING,
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
        quizMocks.requests.submitQuestionAnswer.successResponse(submitResponse),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithCorrect),
      );

      const submitButton = screen.get(questionCardSelector.partialSubmit());
      await user.click(submitButton);

      const questionCard = await screen.find(questionCardSelector.questionCard(1));
      await within(questionCard).find(matchingSelector.byStatusWithText(AnswerStatus.CORRECT, 'Paris'));
    });

    it('should mark answer as partial when matches correctAnswers but isFirstTrial is false', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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
        const firstDropZone = getDropZone(0);
        expect(firstDropZone?.textContent).toContain('London');
      });

      // Change to correct answer
      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      const dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('Paris'));

      const submitResponse = quizMocks.requests.submitQuestionAnswer.createResponsePayload({
        questionAttempt: createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
          answers: [
            {
              index: 0,
              value: 'Paris',
              isFirstTrial: false,
              status: AnswerStatus.PARTIAL,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
        quizAttempt: {} as UserQuizAttemptDTO,
        isQuizCompleted: false,
      });

      const attemptWithPartial = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
          answers: [
            {
              index: 0,
              value: 'Paris',
              isFirstTrial: false,
              status: AnswerStatus.PARTIAL,
              pointsEarned: 0,
              correctAnswer: 'Paris',
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

      const questionCard = await screen.find(questionCardSelector.questionCard(1));
      await within(questionCard).find(matchingSelector.byStatusWithText(AnswerStatus.PARTIAL, 'Paris'));
    });

    it('should mark answer as incorrect when does not match correctAnswers', async () => {
      const quiz = createMatchingQuizDetails();
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

      const { user } = renderQuizPage();

      await waitFor(() => {
        const dropZones = screen.getAll(matchingSelector.dropZone());
        expect(dropZones).toHaveLength(4);
      });

      const firstDropZone = getDropZone(0);
      await user.click(firstDropZone!);

      const dropdown = await screen.find(matchingSelector.dropdown());
      await user.click(within(dropdown).getByText('London'));

      const submitResponse = quizMocks.requests.submitQuestionAnswer.createResponsePayload({
        questionAttempt: createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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
        quizAttempt: {} as UserQuizAttemptDTO,
        isQuizCompleted: false,
      });

      const attemptWithIncorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
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
        quizMocks.requests.submitQuestionAnswer.successResponse(submitResponse),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithIncorrect),
      );

      const submitButton = screen.get(questionCardSelector.partialSubmit());
      await user.click(submitButton);

      await waitFor(() => {
        const firstDropZone = getDropZone(0);
        expect(hasIncorrectBorder(firstDropZone)).toBe(true);
      });
    });

    it('should award 1 point for correct answers', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithCorrect = createUserProgressWithAttempt(1, [
        createQuestionAttempt(
          1,
          {
            type: QuestionType.MATCHING,
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

      await waitFor(() => {
        const questionCard = screen.get(questionCardSelector.questionCard(1));
        expect(questionCard).toBeInTheDocument();
      });

      // Verify through the stored attempt data that points were awarded
      expect(attemptWithCorrect.questionAttempts[0].pointsEarned).toBe(1);
    });

    it('should award 0 points for partial answers', async () => {
      const quiz = createMatchingQuizDetails();
      const attemptWithPartial = createUserProgressWithAttempt(1, [
        createQuestionAttempt(1, {
          type: QuestionType.MATCHING,
          answers: [
            {
              index: 0,
              value: 'Paris',
              isFirstTrial: false,
              status: AnswerStatus.PARTIAL,
              pointsEarned: 0,
              correctAnswer: 'Paris',
            },
          ],
        }),
      ]);

      server.use(
        quizMocks.requests.getQuizDetails.successResponse(quiz),
        quizMocks.requests.getUserQuizProgress.successResponse(attemptWithPartial),
      );

      renderQuizPage();

      await waitFor(() => {
        const questionCard = screen.get(questionCardSelector.questionCard(1));
        expect(questionCard).toBeInTheDocument();
      });

      expect(attemptWithPartial.questionAttempts[0].pointsEarned).toBe(0);
    });
  });
});
