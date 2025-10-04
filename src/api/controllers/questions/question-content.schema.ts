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
  MULTIPLE_CHOICE = 'multiple-choice',
}
// Base question interface
export interface BaseQuestionDTO {
  type: string;
  title?: string;
}

// =============================================================================
// FILL-IN-THE-BLANKS QUESTION TYPES
// =============================================================================

export enum FillBlanksInputSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

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
  size: z.nativeEnum(FillBlanksInputSize).optional(),
});

export interface FillBlanksMissingItem {
  type: 'missing';
  officialAnswers: string[];
  additionalAnswers?: string[];
  explanation?: string;
  size?: FillBlanksInputSize;
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
  usageLimit: z.number().min(1).nullish(),
});

export interface MatchingAnswerOptionDTO {
  value: string;
  usageLimit?: number | null; // defaults to 1. null means unlimited
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

// =============================================================================
// MULTIPLE CHOICE QUESTION TYPES
// =============================================================================

export enum ChoiceDisplayMode {
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  DROPDOWN = 'dropdown',
}

// Text item for multiple choice
const MultipleChoiceTextItemSchema = z.object({
  type: z.literal('text'),
  value: z.string().min(1),
});

export interface MultipleChoiceTextItemDTO {
  type: 'text';
  value: string;
}

// Individual option within a choice group
const MultipleChoiceOptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean().optional(),
});

export interface MultipleChoiceOptionDTO {
  text: string;
  isCorrect?: boolean;
}

// Choice group item (renamed from "options area")
const MultipleChoiceGroupItemSchema = z.object({
  type: z.literal('choice-group'),
  options: z.array(MultipleChoiceOptionSchema).min(1),
  isMultiSelect: z.boolean().optional(),
  displayMode: z.nativeEnum(ChoiceDisplayMode).optional(),
  isInlineDropdown: z.boolean().optional(),
  explanation: z.string().optional(),
});

export interface MultipleChoiceGroupItemDTO {
  type: 'choice-group';
  options: MultipleChoiceOptionDTO[];
  isMultiSelect?: boolean; // defaults to false (single select)
  displayMode?: ChoiceDisplayMode;
  isInlineDropdown?: boolean;
  explanation?: string;
}

const MultipleChoiceContentItemSchema = z.discriminatedUnion('type', [
  MultipleChoiceTextItemSchema,
  MultipleChoiceGroupItemSchema,
]);

export type MultipleChoiceContentItemDTO = MultipleChoiceTextItemDTO | MultipleChoiceGroupItemDTO;

const MultipleChoiceQuestionSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  title: z.string().optional(),
  items: z.array(MultipleChoiceContentItemSchema).min(1),
});

export interface MultipleChoiceQuestionDTO extends BaseQuestionDTO {
  type: QuestionType.MULTIPLE_CHOICE;
  items: MultipleChoiceContentItemDTO[];
}

// User input item for a single choice group
const MultipleChoiceInputItemSchema = z.object({
  index: z.number().min(0),
  value: z.union([z.number(), z.array(z.number()), z.null()]),
  isRevealed: z.boolean().optional(),
  isFirstTrial: z.boolean().optional(),
});

export interface MultipleChoiceInputItemDTO {
  index: number; // Index of the choice group item
  value: number | number[] | null; // Selected option index(es) or null
  isRevealed?: boolean;
  isFirstTrial?: boolean;
}

export const MultipleChoiceUserInputSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  answers: z.array(MultipleChoiceInputItemSchema),
});

export interface MultipleChoiceUserInputDTO {
  type: QuestionType.MULTIPLE_CHOICE;
  answers: MultipleChoiceInputItemDTO[];
}

// Union schema for all question types
export const QuestionContentSchemaSchema = z.discriminatedUnion('type', [
  FillBlanksQuestionSchema,
  MatchingQuestionSchema,
  MultipleChoiceQuestionSchema,
]);

export type QuestionContentDTO = FillBlanksQuestionDTO | MatchingQuestionDTO | MultipleChoiceQuestionDTO;

export const UserInputSchema = z.discriminatedUnion('type', [
  FillBlanksUserInputSchema,
  MatchingUserInputSchema,
  MultipleChoiceUserInputSchema,
]);

export type UserInputDTO = FillBlanksUserInputDTO | MatchingUserInputDTO | MultipleChoiceUserInputDTO;

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

// Processed answer item for multiple choice
const MultipleChoiceAnswerItemSchema = z.object({
  index: z.number().min(0),
  value: z.union([z.number(), z.array(z.number()), z.null()]),
  isFirstTrial: z.boolean(),
  status: z.nativeEnum(AnswerStatus),
  pointsEarned: z.number().min(0),
  correctAnswer: z.union([z.number(), z.array(z.number())]),
});

interface MultipleChoiceAnswerItemDTO {
  index: number;
  value: number | number[] | null;
  isFirstTrial: boolean;
  status: AnswerStatus;
  pointsEarned: number;
  correctAnswer: number | number[];
}

export const MultipleChoiceUserAnswerSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  answers: z.array(MultipleChoiceAnswerItemSchema),
});

export interface MultipleChoiceUserAnswerDTO {
  type: QuestionType.MULTIPLE_CHOICE;
  answers: MultipleChoiceAnswerItemDTO[];
}

export const UserAnswerSchema = z.discriminatedUnion('type', [
  FillBlanksUserAnswerSchema,
  MatchingUserAnswerSchema,
  MultipleChoiceUserAnswerSchema,
]);

export type UserAnswerDTO = FillBlanksUserAnswerDTO | MatchingUserAnswerDTO | MultipleChoiceUserAnswerDTO;

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
  isEveryBlankRevealedOrCorrect: boolean;
}
