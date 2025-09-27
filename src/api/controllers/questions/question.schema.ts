import { z } from '../../../utils/z';
import type { QuestionContentDTO } from './question-content.schema';
import { QuestionContentSchemaSchema, QuestionType, type AnswerStatus } from './question-content.schema';

// =============================================================================
// QUESTION CRUD SCHEMAS
// =============================================================================

export const CreateQuestionReq = z.object({
  title: z.string().max(255).optional(),
  content: QuestionContentSchemaSchema,
  isOfficial: z.boolean().optional().default(false),
});

export interface CreateQuestionReqDTO {
  title?: string;
  content: QuestionContentDTO;
  isOfficial?: boolean;
}

export const UpdateQuestionReq = z.object({
  questionId: z.number(),
  title: z.string().max(255).optional(),
  content: QuestionContentSchemaSchema.optional(),
  isOfficial: z.boolean().optional(),
});

export interface UpdateQuestionReqDTO {
  questionId: number;
  title?: string;
  content?: QuestionContentDTO;
  isOfficial?: boolean;
}

export const GetQuestionsReq = z.object({
  skip: z.number().min(0).optional().default(0),
  limit: z.number().min(1).max(100).optional().default(20),
  isOfficial: z.boolean().optional(),
  type: z.nativeEnum(QuestionType).optional(),
});

export interface GetQuestionsReqDTO {
  skip?: number;
  limit?: number;
  isOfficial?: boolean;
  type?: QuestionType;
}

export const DeleteQuestionReq = z.object({
  questionId: z.number(),
});

export interface DeleteQuestionReqDTO {
  questionId: number;
}

// =============================================================================
// QUESTION RESPONSE DTOS
// =============================================================================

export interface QuestionDTO {
  id: number;
  title: string | null;
  content: QuestionContentDTO;
  userId: number | null;
  isOfficial: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateQuestionResDTO = QuestionDTO;
export type UpdateQuestionResDTO = QuestionDTO;
export type GetQuestionsResDTO = {
  questions: QuestionDTO[];
  total?: number;
  hasMore: boolean;
};

// =============================================================================
// QUESTION SCORING RESULT TYPES
// =============================================================================

export interface QuestionScoreResultDTO {
  totalBlanks: number;
  attemptedBlanks: number;
  correctBlanks: number;
  maxPoints: number;
  earnedPoints: number;
  answers: Array<{
    index: number;
    userInput: string;
    correctAnswer: string;
    status: AnswerStatus;
    pointsEarned: number;
  }>;
}
