import type { QuestionContentDTO, UserAnswerDTO, UserInputDTO } from '../questions/question-content.schema';
import { QuestionContentSchemaSchema, UserInputSchema } from '../questions/question-content.schema';
import { booleanSchema, z } from '../../../utils/z';

// Question input schemas for quiz creation/updating
const QuizQuestionByIdSchema = z.object({
  type: z.literal('existing'),
  questionId: z.number(),
  order: z.number().min(0),
  points: z.number().min(0.1),
});

export interface QuizQuestionByIdInput {
  type: 'existing';
  questionId: number;
  order: number;
  points: number;
}

const QuizQuestionByContentSchema = z.object({
  type: z.literal('new'),
  order: z.number().min(0),
  points: z.number().min(0.1),
  title: z.string().max(255).optional(),
  content: QuestionContentSchemaSchema,
  isOfficial: z.boolean().optional().default(false),
});

export interface QuizQuestionByContentInput {
  type: 'new';
  order: number;
  points: number;
  title?: string;
  content: QuestionContentDTO;
  isOfficial?: boolean;
}

const QuizQuestionByContentUpdateSchema = z.object({
  type: z.literal('update'),
  questionId: z.number(),
  order: z.number().min(0),
  points: z.number().min(0.1),
  title: z.string().max(255).optional(),
  content: QuestionContentSchemaSchema.optional(),
  isOfficial: z.boolean().optional(),
});

export interface QuizQuestionByContentUpdateInput {
  type: 'update';
  questionId: number;
  order: number;
  points: number;
  title?: string;
  content?: QuestionContentDTO;
  isOfficial?: boolean;
}

const QuizQuestionSchema = z.discriminatedUnion('type', [
  QuizQuestionByIdSchema,
  QuizQuestionByContentSchema,
  QuizQuestionByContentUpdateSchema,
]);

export type QuizQuestionInput = QuizQuestionByIdInput | QuizQuestionByContentInput | QuizQuestionByContentUpdateInput;

// Quiz CRUD schemas
export const CreateQuizReq = z.object({
  lessonId: z.number(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.number().optional().default(0),
  isHidden: z.boolean().optional().default(false),
  questions: z.array(QuizQuestionSchema).optional().default([]),
});

export interface CreateQuizReqDTO {
  lessonId: number;
  courseId: number;
  title: string;
  description?: string;
  priority?: number;
  isHidden?: boolean;
  questions?: QuizQuestionInput[];
}

export const UpdateQuizReq = z.object({
  quizId: z.number(),
  lessonId: z.number().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.number().optional(),
  isHidden: z.boolean().optional(),
  questions: z.array(QuizQuestionSchema).optional(),
});

export interface UpdateQuizReqDTO {
  quizId: number;
  lessonId?: number;
  title?: string;
  description?: string;
  priority?: number;
  isHidden?: boolean;
  questions?: QuizQuestionInput[];
}

export const GetQuizzesReq = z.object({
  lessonId: z.coerce.number(),
  includeHidden: booleanSchema.optional().default(false),
  includeQuestions: booleanSchema.optional().default(false),
  includeUserProgress: booleanSchema.optional().default(false),
});

export interface GetQuizzesReqDTO {
  lessonId: number;
  includeHidden?: boolean;
  includeQuestions?: boolean;
  includeUserProgress?: boolean;
}

export const GetQuizDetailsReq = z.object({
  quizId: z.coerce.number(),
  includeUserProgress: booleanSchema.optional().default(false),
});

export interface GetQuizDetailsReqDTO {
  quizId: number;
  includeUserProgress?: boolean;
}

export const DeleteQuizReq = z.object({
  quizId: z.coerce.number(),
});

export interface DeleteQuizReqDTO {
  quizId: number;
}

// Quiz attempt schemas
export const StartQuizAttemptReq = z.object({
  quizId: z.coerce.number(),
});

export interface StartQuizAttemptReqDTO {
  quizId: number;
}

export const SubmitQuestionAnswerReq = z.object({
  quizAttemptId: z.coerce.number(),
  questionId: z.number(),
  userInput: UserInputSchema,
  isPartialSubmission: z.boolean().optional().default(true),
});

export interface SubmitQuestionAnswerReqDTO {
  quizAttemptId: number;
  questionId: number;
  userInput: UserInputDTO;
  isPartialSubmission?: boolean;
}

export const FinalizeQuizAttemptReq = z.object({
  quizAttemptId: z.coerce.number(),
});

export interface FinalizeQuizAttemptReqDTO {
  quizAttemptId: number;
}

export const ResetQuizAttemptReq = z.object({
  quizAttemptId: z.coerce.number(),
});

export interface ResetQuizAttemptReqDTO {
  quizAttemptId: number;
}

export const GetCourseQuizzesReq = z.object({
  courseId: z.coerce.number(),
  includeAttempts: z.boolean().optional().default(true),
});

export interface GetCourseQuizzesReqDTO {
  courseId: number;
  includeAttempts?: boolean;
}

export const GetUserQuizProgressReq = z.object({
  quizId: z.number(),
});

export interface GetUserQuizProgressReqDTO {
  quizId: number;
}

// Response DTOs
export interface QuizQuestionDTO {
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
}

interface MinimalProgressDTO {
  completionPercentage: number;
  accuracyPercentage: number;
}

export interface QuizDTO {
  id: number;
  lessonId: number;
  courseId: number;
  title: string;
  description: string | null;
  totalPoints: number;
  questionCount: number;
  isHidden: boolean;
  priority: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  questions?: QuizQuestionDTO[];
  userProgress?: MinimalProgressDTO;
}

export interface UserQuizAttemptDTO {
  id: number;
  userId: number;
  quizId: number;
  lessonId: number;
  courseId: number;
  pointsAttempted: number;
  pointsEarned: number;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserQuestionAttemptDTO {
  id: number;
  userId: number;
  questionId: number;
  quizAttemptId: number;
  userAnswer: UserAnswerDTO;
  pointsAttempted: number;
  pointsEarned: number;
  maxPoints: number;
  submittedAt: Date | null;
}

export interface QuizProgressDTO {
  quiz: QuizDTO;
  attempt: UserQuizAttemptDTO | null;
  questionAttempts: UserQuestionAttemptDTO[];
  completionPercentage: number;
  accuracyPercentage: number;
}

export interface CourseQuizWithAttemptDTO {
  quiz: QuizDTO;
  userAttempt: UserQuizAttemptDTO | null;
}

export type CreateQuizResDTO = QuizDTO;
export type UpdateQuizResDTO = QuizDTO;
export type GetQuizzesResDTO = QuizDTO[];
export type GetQuizDetailsResDTO = QuizDTO;
export type GetCourseQuizzesResDTO = CourseQuizWithAttemptDTO[];
export type StartQuizAttemptResDTO = UserQuizAttemptDTO;
export type SubmitQuestionAnswerResDTO = {
  questionAttempt: UserQuestionAttemptDTO;
  quizAttempt: UserQuizAttemptDTO;
  isQuizCompleted: boolean;
};
export type FinalizeQuizAttemptResDTO = UserQuizAttemptDTO;
export type ResetQuizAttemptResDTO = void;
export type GetUserQuizProgressResDTO = QuizProgressDTO;
