/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionContentSchemaSchema, type QuestionContentDTO } from '../questions/question-content.schema';
import { booleanSchema, numberSchema, z } from '../../../utils/z';
import { TranslationObjSchema, type TranslationObjDTO } from '../words/words.schema';
import { QuizModeSchema, type QuizMode } from '../quizzes/quiz.schema';

export const Lesson = z.object({
  id: z.number(),
  courseId: z.number(),
  parentLessonId: z.number().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface LessonDTO {
  id: number;
  courseId: number;
  parentLessonId: number | null;
  title: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const LessonUpdateAction = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('existing-word'),
    wordId: z.number(),
    isNewRecord: z.boolean(),
    customTranslations: z.array(TranslationObjSchema).optional(),
  }),
  z.object({
    type: z.literal('new-word'),
    wordType: z.literal('phrase'),
    value: z.string().min(1),
    displayType: z.number().nullable().optional(),
    translations: z.array(TranslationObjSchema),
    official: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('update-lesson'),
    lessonId: z.number(),
    parentLessonId: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    items: z.lazy(() => z.array(LessonUpdateAction)).optional(),
  }),
  z.object({
    type: z.literal('new-lesson'),
    title: z.string(),
    description: z.string().nullable(),
    parentLessonId: z.number().nullable().optional(),
    items: z.lazy(() => z.array(LessonUpdateAction)).optional(),
  }),
  z.object({
    type: z.literal('new-quiz'),
    title: z.string(),
    description: z.string().nullable().optional(),
    priority: z.number().optional(),
    isHidden: z.boolean().optional(),
    mode: QuizModeSchema.optional(),
    questions: z
      .array(
        z.discriminatedUnion('type', [
          z.object({
            type: z.literal('existing'),
            questionId: z.number(),
            order: z.number(),
            points: z.number(),
          }),
          z.object({
            type: z.literal('new'),
            order: z.number(),
            points: z.number(),
            title: z.string().max(255).optional(),
            content: QuestionContentSchemaSchema,
            isOfficial: z.boolean().optional().default(false),
          }),
        ]),
      )
      .optional(),
  }),
  z.object({
    type: z.literal('update-quiz'),
    quizId: z.number(),
    title: z.string().optional(),
    description: z.string().nullable().optional(),
    priority: z.number().optional(),
    isHidden: z.boolean().optional(),
    mode: QuizModeSchema.optional(),
    questions: z
      .array(
        z.discriminatedUnion('type', [
          z.object({
            type: z.literal('existing'),
            questionId: z.number(),
            order: z.number(),
            points: z.number(),
          }),
          z.object({
            type: z.literal('new'),
            order: z.number(),
            points: z.number(),
            title: z.string().max(255).optional(),
            content: QuestionContentSchemaSchema,
            isOfficial: z.boolean().optional().default(false),
          }),
          z.object({
            type: z.literal('update'),
            questionId: z.number(),
            order: z.number(),
            points: z.number(),
            title: z.string().max(255).optional(),
            content: QuestionContentSchemaSchema.optional(),
            isOfficial: z.boolean().optional(),
          }),
        ]),
      )
      .optional(),
  }),
  z.object({ type: z.literal('delete-word'), wordId: z.number() }),
  z.object({ type: z.literal('delete-lesson'), lessonId: z.number() }),
  z.object({ type: z.literal('delete-quiz'), quizId: z.number() }),
]) as any;

export type LessonUpdateActionDTO =
  | {
      type: 'existing-word';
      isNewRecord: boolean;
      wordId: number;
      customTranslations?: TranslationObjDTO[];
    }
  | {
      type: 'new-word';
      wordType: 'phrase';
      value: string;
      displayType?: number | null;
      translations: TranslationObjDTO[];
      official?: boolean;
    }
  | {
      type: 'update-lesson';
      lessonId: number;
      parentLessonId?: number | null;
      title?: string;
      description?: string | null;
      items?: LessonUpdateActionDTO[];
    }
  | {
      type: 'new-lesson';
      title: string;
      description: string | null;
      parentLessonId?: number | null;
      items?: LessonUpdateActionDTO[];
    }
  | {
      type: 'new-quiz';
      title: string;
      description?: string | null;
      priority?: number;
      isHidden?: boolean;
      mode?: QuizMode;
      questions?: Array<
        | {
            type: 'existing';
            questionId: number;
            order: number;
            points: number;
          }
        | {
            type: 'new';
            order: number;
            points: number;
            title?: string;
            content: QuestionContentDTO;
            isOfficial?: boolean;
          }
      >;
    }
  | {
      type: 'update-quiz';
      quizId: number;
      title?: string;
      description?: string | null;
      priority?: number;
      isHidden?: boolean;
      mode?: QuizMode;
      questions?: Array<
        | {
            type: 'existing';
            questionId: number;
            order: number;
            points: number;
          }
        | {
            type: 'new';
            order: number;
            points: number;
            title?: string;
            content: QuestionContentDTO;
            isOfficial?: boolean;
          }
        | {
            type: 'update';
            questionId: number;
            order: number;
            points: number;
            title?: string;
            content?: QuestionContentDTO;
            isOfficial?: boolean;
          }
      >;
    }
  | { type: 'delete-word'; wordId: number }
  | { type: 'delete-lesson'; lessonId: number }
  | { type: 'delete-quiz'; quizId: number };

export const CreateLessonReq = z.object({
  courseId: z.number(),
  parentLessonId: z.number().nullable().optional(),
  title: z.string(),
  description: z.string().nullable(),
  items: z.array(LessonUpdateAction).optional(),
});

export interface CreateLessonReqDTO {
  courseId: number;
  parentLessonId?: number | null;
  title: string;
  description: string | null;
  items?: LessonUpdateActionDTO[];
}

export const CreateLessonRes = Lesson;
export type CreateLessonResDTO = LessonDTO;

///

export const UpdateLessonReq = z.object({
  lessonId: z.number(),
  courseId: z.number(),
  parentLessonId: z.number().nullable().optional(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  items: z.array(LessonUpdateAction).optional(),
});
export interface UpdateLessonReqDTO {
  lessonId: number;
  courseId: number;
  parentLessonId?: number | null;
  title?: string;
  description?: string | null;
  items?: LessonUpdateActionDTO[];
}

export const UpdateLessonRes = Lesson;
export type UpdateLessonResDTO = LessonDTO;

///

export const GetLessonsReq = z.object({
  courseId: numberSchema,
  lessonId: numberSchema.nullable().optional(),
  returnAllChildrenLessons: booleanSchema.optional(),
});
export interface GetLessonsReqDTO {
  courseId: number;
  lessonId?: number | null;
  returnAllChildrenLessons?: boolean;
}

export const GetLessonsRes = z.array(Lesson);
export type GetLessonsResDTO = LessonDTO[];

///

export const DeleteLessonReq = z.object({
  courseId: numberSchema,
  lessonId: numberSchema,
});
export interface DeleteLessonReqDTO {
  courseId: number;
  lessonId: number;
}
