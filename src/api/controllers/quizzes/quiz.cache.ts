import type {
  CreateQuizResDTO,
  UpdateQuizResDTO,
  GetQuizzesResDTO,
  GetQuizDetailsResDTO,
  GetCourseQuizzesResDTO,
  StartQuizAttemptResDTO,
  SubmitQuestionAnswerResDTO,
  FinalizeQuizAttemptResDTO,
  ResetQuizAttemptResDTO,
  GetUserQuizProgressResDTO,
} from './quiz.schema';
import { QuestionType, AnswerStatus } from '../questions/question-content.schema';
import { HttpResponse } from 'msw';
import { createMockEndpoint } from '../_mocker';

const getQuizzes: GetQuizzesResDTO = [
  {
    id: 1,
    lessonId: 1,
    courseId: 1,
    title: 'German Vocabulary Quiz',
    description: 'Test your knowledge of basic German vocabulary',
    totalPoints: 10,
    questionCount: 5,
    isHidden: false,
    priority: 1,
    isDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    userProgress: {
      completionPercentage: 80,
      accuracyPercentage: 75,
    },
  },
  {
    id: 2,
    lessonId: 1,
    courseId: 1,
    title: 'Grammar Basics',
    description: 'Understanding German grammar fundamentals',
    totalPoints: 15,
    questionCount: 3,
    isHidden: false,
    priority: 2,
    isDeleted: false,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    userProgress: {
      completionPercentage: 60,
      accuracyPercentage: 90,
    },
  },
];

const getQuizDetails: GetQuizDetailsResDTO = {
  id: 1,
  lessonId: 1,
  courseId: 1,
  title: 'German Vocabulary Quiz',
  description: 'Test your knowledge of basic German vocabulary',
  totalPoints: 10,
  questionCount: 5,
  isHidden: false,
  priority: 1,
  isDeleted: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  questions: [
    {
      id: 1,
      questionId: 101,
      order: 1,
      points: 2,
      question: {
        id: 101,
        title: 'Fill in the blanks',
        content: {
          type: QuestionType.FILL_BLANKS,
          items: [
            { type: 'text', value: 'The German word for "house" is ' },
            {
              type: 'missing',
              officialAnswers: ['Haus'],
              additionalAnswers: ['haus'],
              explanation: 'Haus is a neuter noun in German',
            },
            { type: 'text', value: '.' },
          ],
        },
        isOfficial: true,
      },
    },
    {
      id: 2,
      questionId: 102,
      order: 2,
      points: 3,
      question: {
        id: 102,
        title: 'Matching exercise',
        content: {
          type: QuestionType.MATCHING,
          items: [
            { type: 'text', value: 'Match the German words with their English translations:' },
            { type: 'blank', correctAnswers: ['cat'], explanation: 'Katze means cat in English' },
            { type: 'text', value: ' - Katze, ' },
            { type: 'blank', correctAnswers: ['dog'], explanation: 'Hund means dog in English' },
            { type: 'text', value: ' - Hund' },
          ],
          answerOptions: [
            { value: 'cat', usageLimit: 1 },
            { value: 'dog', usageLimit: 1 },
            { value: 'bird', usageLimit: 1 },
          ],
        },
        isOfficial: true,
      },
    },
  ],
  userProgress: {
    completionPercentage: 80,
    accuracyPercentage: 75,
  },
};

const createQuiz: CreateQuizResDTO = {
  id: 3,
  lessonId: 2,
  courseId: 1,
  title: 'New Quiz',
  description: 'A newly created quiz',
  totalPoints: 5,
  questionCount: 2,
  isHidden: false,
  priority: 0,
  isDeleted: false,
  createdAt: new Date('2024-01-03T00:00:00Z'),
  updatedAt: new Date('2024-01-03T00:00:00Z'),
};

const updateQuiz: UpdateQuizResDTO = {
  id: 1,
  lessonId: 1,
  courseId: 1,
  title: 'Updated German Vocabulary Quiz',
  description: 'Updated test of German vocabulary knowledge',
  totalPoints: 12,
  questionCount: 6,
  isHidden: false,
  priority: 1,
  isDeleted: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-03T12:00:00Z'),
};

const getCourseQuizzes: GetCourseQuizzesResDTO = [
  {
    quiz: {
      id: 1,
      lessonId: 1,
      courseId: 1,
      title: 'German Vocabulary Quiz',
      description: 'Test your knowledge of basic German vocabulary',
      totalPoints: 10,
      questionCount: 5,
      isHidden: false,
      priority: 1,
      isDeleted: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    userAttempt: {
      id: 1,
      userId: 1,
      quizId: 1,
      lessonId: 1,
      courseId: 1,
      pointsAttempted: 10,
      pointsEarned: 8,
      isCompleted: true,
      completedAt: new Date('2024-01-01T10:00:00Z'),
      createdAt: new Date('2024-01-01T09:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
  },
  {
    quiz: {
      id: 2,
      lessonId: 1,
      courseId: 1,
      title: 'Grammar Basics',
      description: 'Understanding German grammar fundamentals',
      totalPoints: 15,
      questionCount: 3,
      isHidden: false,
      priority: 2,
      isDeleted: false,
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    },
    userAttempt: null,
  },
];

const startQuizAttempt: StartQuizAttemptResDTO = {
  id: 2,
  userId: 1,
  quizId: 2,
  lessonId: 1,
  courseId: 1,
  pointsAttempted: 0,
  pointsEarned: 0,
  isCompleted: false,
  completedAt: null,
  createdAt: new Date('2024-01-03T15:00:00Z'),
  updatedAt: new Date('2024-01-03T15:00:00Z'),
};

const submitQuestionAnswer: SubmitQuestionAnswerResDTO = {
  questionAttempt: {
    id: 1,
    userId: 1,
    questionId: 101,
    quizAttemptId: 2,
    userAnswer: {
      type: QuestionType.FILL_BLANKS,
      answers: [
        {
          index: 0,
          value: 'Haus',
          isFirstTrial: true,
          status: AnswerStatus.CORRECT,
          pointsEarned: 2,
          correctAnswer: 'Haus',
        },
      ],
    },
    pointsAttempted: 2,
    pointsEarned: 2,
    maxPoints: 2,
    submittedAt: new Date('2024-01-03T15:05:00Z'),
  },
  quizAttempt: {
    id: 2,
    userId: 1,
    quizId: 2,
    lessonId: 1,
    courseId: 1,
    pointsAttempted: 2,
    pointsEarned: 2,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date('2024-01-03T15:00:00Z'),
    updatedAt: new Date('2024-01-03T15:05:00Z'),
  },
  isQuizCompleted: false,
};

const finalizeQuizAttempt: FinalizeQuizAttemptResDTO = {
  id: 2,
  userId: 1,
  quizId: 2,
  lessonId: 1,
  courseId: 1,
  pointsAttempted: 15,
  pointsEarned: 12,
  isCompleted: true,
  completedAt: new Date('2024-01-03T15:30:00Z'),
  createdAt: new Date('2024-01-03T15:00:00Z'),
  updatedAt: new Date('2024-01-03T15:30:00Z'),
};

const getUserQuizProgress: GetUserQuizProgressResDTO = {
  quiz: {
    id: 1,
    lessonId: 1,
    courseId: 1,
    title: 'German Vocabulary Quiz',
    description: 'Test your knowledge of basic German vocabulary',
    totalPoints: 10,
    questionCount: 5,
    isHidden: false,
    priority: 1,
    isDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    questions: [
      {
        id: 1,
        questionId: 101,
        order: 1,
        points: 2,
        question: {
          id: 101,
          title: 'Fill in the blanks',
          content: {
            type: QuestionType.FILL_BLANKS,
            items: [
              { type: 'text', value: 'The German word for "house" is ' },
              {
                type: 'missing',
                officialAnswers: ['Haus'],
                additionalAnswers: ['haus'],
                explanation: 'Haus is a neuter noun in German',
              },
              { type: 'text', value: '.' },
            ],
          },
          isOfficial: true,
        },
      },
    ],
  },
  attempt: {
    id: 1,
    userId: 1,
    quizId: 1,
    lessonId: 1,
    courseId: 1,
    pointsAttempted: 10,
    pointsEarned: 8,
    isCompleted: true,
    completedAt: new Date('2024-01-01T10:00:00Z'),
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  questionAttempts: [
    {
      id: 1,
      userId: 1,
      questionId: 101,
      quizAttemptId: 1,
      userAnswer: {
        type: QuestionType.FILL_BLANKS,
        answers: [
          {
            index: 0,
            value: 'Haus',
            isFirstTrial: true,
            status: AnswerStatus.CORRECT,
            pointsEarned: 2,
            correctAnswer: 'Haus',
          },
        ],
      },
      pointsAttempted: 2,
      pointsEarned: 2,
      maxPoints: 2,
      submittedAt: new Date('2024-01-01T09:30:00Z'),
    },
  ],
  completionPercentage: 80,
  accuracyPercentage: 75,
};

const basePath = `${import.meta.env.VITE_API_URL}`;

const urls = {
  getQuizzes: `${basePath}/lessons/:lessonId/quizzes`,
  getQuizDetails: `${basePath}/quizzes/:quizId`,
  createQuiz: `${basePath}/lessons/:lessonId/quizzes`,
  updateQuiz: `${basePath}/quizzes/:quizId`,
  deleteQuiz: `${basePath}/quizzes/:quizId`,
  startQuizAttempt: `${basePath}/quizzes/:quizId/attempts`,
  submitQuestionAnswer: `${basePath}/quiz-attempts/:quizAttemptId/answers`,
  finalizeQuizAttempt: `${basePath}/quiz-attempts/:quizAttemptId/finalize`,
  resetQuizAttempt: `${basePath}/quiz-attempts/:quizAttemptId/reset`,
  getUserQuizProgress: `${basePath}/quizzes/:quizId/progress`,
  getCourseQuizzes: `${basePath}/courses/:courseId/quizzes`,
};

const requests = {
  getQuizzes: createMockEndpoint<GetQuizzesResDTO>('get', urls.getQuizzes),
  getQuizDetails: createMockEndpoint<GetQuizDetailsResDTO>('get', urls.getQuizDetails),
  createQuiz: createMockEndpoint<CreateQuizResDTO>('post', urls.createQuiz),
  updateQuiz: createMockEndpoint<UpdateQuizResDTO>('put', urls.updateQuiz),
  deleteQuiz: createMockEndpoint<void>('delete', urls.deleteQuiz),
  startQuizAttempt: createMockEndpoint<StartQuizAttemptResDTO>('post', urls.startQuizAttempt),
  submitQuestionAnswer: createMockEndpoint<SubmitQuestionAnswerResDTO>('post', urls.submitQuestionAnswer),
  finalizeQuizAttempt: createMockEndpoint<FinalizeQuizAttemptResDTO>('post', urls.finalizeQuizAttempt),
  resetQuizAttempt: createMockEndpoint<ResetQuizAttemptResDTO>('delete', urls.resetQuizAttempt),
  getUserQuizProgress: createMockEndpoint<GetUserQuizProgressResDTO>('get', urls.getUserQuizProgress),
  getCourseQuizzes: createMockEndpoint<GetCourseQuizzesResDTO>('get', urls.getCourseQuizzes),
};

const deleteQuiz = new HttpResponse(null, { status: 204 });
const resetQuizAttempt = new HttpResponse(null, { status: 204 });

const handlers = [
  requests.getQuizzes.successResponse(getQuizzes),
  requests.getQuizDetails.successResponse(getQuizDetails),
  requests.createQuiz.successResponse(createQuiz),
  requests.updateQuiz.successResponse(updateQuiz),
  requests.deleteQuiz.anyResponse(() => deleteQuiz),
  requests.startQuizAttempt.successResponse(startQuizAttempt),
  requests.submitQuestionAnswer.successResponse(submitQuestionAnswer),
  requests.finalizeQuizAttempt.successResponse(finalizeQuizAttempt),
  requests.resetQuizAttempt.anyResponse(() => resetQuizAttempt),
  requests.getUserQuizProgress.successResponse(getUserQuizProgress),
  requests.getCourseQuizzes.successResponse(getCourseQuizzes),
];

export const quizMocks = {
  responses: {
    getQuizzes,
    getQuizDetails,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getCourseQuizzes,
    startQuizAttempt,
    submitQuestionAnswer,
    finalizeQuizAttempt,
    resetQuizAttempt,
    getUserQuizProgress,
  },
  requests,
  handlers,
  urls,
};
