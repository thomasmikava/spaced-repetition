import { z } from '../../../utils/z';

// =============================================================================
// TYPESCRIPT ENUMS
// =============================================================================

export enum AnswerStatus {
  CORRECT = 'correct',
  PARTIAL = 'partial',
  INCORRECT = 'incorrect',
  REVEALED = 'revealed',
  UNANSWERED = 'unanswered',
}

export enum QuestionType {
  FILL_BLANKS = 'fill-blanks',
  MATCHING = 'matching',
}
// Base question interface
export interface BaseQuestionDTO {
  type: string;
  title?: string;
}

// =============================================================================
// FILL-IN-THE-BLANKS QUESTION TYPES
// =============================================================================

const FillBlanksTextItemSchema = z.object({
  type: z.literal('text'),
  value: z.string().min(1),
});
export interface FillBlanksTextItem {
  type: 'text';
  value: string;
}

const FillBlanksMissingItemSchema = z.object({
  type: z.literal('missing'),
  officialAnswers: z.array(z.string().min(1)).min(1),
  additionalAnswers: z.array(z.string().min(1)).optional(),
  explanation: z.string().optional(),
});

export interface FillBlanksMissingItem {
  type: 'missing';
  officialAnswers: string[];
  additionalAnswers?: string[];
  explanation?: string;
}

const FillBlanksContentItemSchema = z.discriminatedUnion('type', [
  FillBlanksTextItemSchema,
  FillBlanksMissingItemSchema,
]);

export type FillBlanksContentItem = FillBlanksTextItem | FillBlanksMissingItem;

const FillBlanksQuestionSchema = z.object({
  type: z.literal(QuestionType.FILL_BLANKS),
  title: z.string().optional(),
  items: z.array(FillBlanksContentItemSchema).min(1),
});

export interface FillBlanksQuestionDTO extends BaseQuestionDTO {
  type: QuestionType.FILL_BLANKS;
  items: FillBlanksContentItem[];
}

const FillBlanksInputItemSchema = z.object({
  index: z.number().min(0),
  value: z.string(),
  isRevealed: z.boolean().optional(),
  isFirstTrial: z.boolean().optional(),
});
export interface FillBlanksInputItemDTO {
  index: number; // Index of the missing item
  value: string; // User's input
  isRevealed?: boolean;
  isFirstTrial?: boolean; // Whether this was the first trial for this input
}

export const FillBlanksUserInputSchema = z.object({
  type: z.literal(QuestionType.FILL_BLANKS),
  answers: z.array(FillBlanksInputItemSchema),
});

// User input for fill-in-the-blanks questions
export interface FillBlanksUserInputDTO {
  type: QuestionType.FILL_BLANKS;
  answers: FillBlanksInputItemDTO[];
}

// =============================================================================
// MATCHING QUESTION TYPES
// =============================================================================

// Matching validation schemas
const MatchingTextItemSchema = z.object({
  type: z.literal('text'),
  value: z.string().min(1),
});

export interface MatchingTextItemDTO {
  type: 'text';
  value: string;
}

const MatchingBlankItemSchema = z.object({
  type: z.literal('blank'),
  correctAnswers: z.array(z.string().min(1)).min(1),
  explanation: z.string().optional(),
});

export interface MatchingBlankItemDTO {
  type: 'blank';
  correctAnswers: string[];
  explanation?: string;
}

const MatchingContentItemSchema = z.discriminatedUnion('type', [MatchingTextItemSchema, MatchingBlankItemSchema]);

export type MatchingContentItemDTO = MatchingTextItemDTO | MatchingBlankItemDTO;

const MatchingAnswerOptionSchema = z.object({
  value: z.string().min(1),
  usageLimit: z.number().min(1).optional(),
});

export interface MatchingAnswerOptionDTO {
  value: string;
  usageLimit?: number; // defaults to 1
}

const MatchingQuestionSchema = z.object({
  type: z.literal(QuestionType.MATCHING),
  title: z.string().optional(),
  items: z.array(MatchingContentItemSchema).min(1),
  answerOptions: z.array(MatchingAnswerOptionSchema).min(1),
});

export interface MatchingQuestionDTO extends BaseQuestionDTO {
  type: QuestionType.MATCHING;
  items: MatchingContentItemDTO[];
  answerOptions: MatchingAnswerOptionDTO[];
}

const MatchingInputItemSchema = z.object({
  index: z.number().min(0),
  value: z.string(),
  isRevealed: z.boolean().optional(),
  isFirstTrial: z.boolean().optional(),
});

export interface MatchingInputItemDTO {
  index: number; // Index of the blank item
  value: string; // Selected option value
  isRevealed?: boolean;
  isFirstTrial?: boolean; // Whether this was the first trial for this input
}

export const MatchingUserInputSchema = z.object({
  type: z.literal(QuestionType.MATCHING),
  answers: z.array(MatchingInputItemSchema),
});

// User input for matching questions
export interface MatchingUserInputDTO {
  type: QuestionType.MATCHING;
  answers: MatchingInputItemDTO[];
}

// Union schema for all question types
export const QuestionContentSchemaSchema = z.discriminatedUnion('type', [
  FillBlanksQuestionSchema,
  MatchingQuestionSchema,
]);

export type QuestionContentDTO = FillBlanksQuestionDTO | MatchingQuestionDTO;

export const UserInputSchema = z.discriminatedUnion('type', [FillBlanksUserInputSchema, MatchingUserInputSchema]);

export type UserInputDTO = FillBlanksUserInputDTO | MatchingUserInputDTO;

// =============================================================================
// PROCESSED USER ANSWER VALIDATION SCHEMAS
// =============================================================================

const FillBlanksAnswerItemSchema = z.object({
  index: z.number().min(0),
  value: z.string(),
  isFirstTrial: z.boolean(),
  status: z.nativeEnum(AnswerStatus),
  pointsEarned: z.number().min(0),
  correctAnswer: z.string(),
});
interface FillBlanksAnswerItemDTO {
  index: number;
  value: string;
  isFirstTrial: boolean;
  status: AnswerStatus;
  pointsEarned: number;
  correctAnswer: string;
}

export const FillBlanksUserAnswerSchema = z.object({
  type: z.literal(QuestionType.FILL_BLANKS),
  answers: z.array(FillBlanksAnswerItemSchema),
});

// Processed answer for fill-in-the-blanks questions (with calculated status)
export interface FillBlanksUserAnswerDTO {
  type: QuestionType.FILL_BLANKS;
  answers: FillBlanksAnswerItemDTO[];
}

const MatchingAnswerItemSchema = z.object({
  index: z.number().min(0),
  value: z.string(),
  isFirstTrial: z.boolean(),
  status: z.nativeEnum(AnswerStatus),
  pointsEarned: z.number().min(0),
  correctAnswer: z.string(),
});

interface MatchingAnswerItemDTO {
  index: number;
  value: string;
  isFirstTrial: boolean;
  status: AnswerStatus;
  pointsEarned: number;
  correctAnswer: string;
}

export const MatchingUserAnswerSchema = z.object({
  type: z.literal(QuestionType.MATCHING),
  answers: z.array(MatchingAnswerItemSchema),
});

// Processed answer for matching questions (with calculated status)
export interface MatchingUserAnswerDTO {
  type: QuestionType.MATCHING;
  answers: MatchingAnswerItemDTO[];
}

export const UserAnswerSchema = z.discriminatedUnion('type', [FillBlanksUserAnswerSchema, MatchingUserAnswerSchema]);

export type UserAnswerDTO = FillBlanksUserAnswerDTO | MatchingUserAnswerDTO;

// =============================================================================
// ANSWER CHECKING RESULT TYPES
// =============================================================================

export interface AnswerCheckResultDTO {
  index: number;
  userInput: string;
  correctAnswer: string;
  status: AnswerStatus;
  pointsEarned: number;
  maxPoints: number;
  isFirstTrial: boolean;
}

export interface QuestionCheckResultDTO {
  totalBlanks: number;
  attemptedBlanks: number;
  correctBlanks: number;
  maxPoints: number;
  earnedPoints: number;
  pointsAttempted: number;
  answers: AnswerCheckResultDTO[];
  processedAnswer: UserAnswerDTO;
}
