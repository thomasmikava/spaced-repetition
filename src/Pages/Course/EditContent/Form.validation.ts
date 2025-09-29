import { z } from 'zod';
import { useValidators } from '../../../utils/useValidators';
import { WordWithTranslationSchema } from '../../../api/controllers/words/words.schema';
import { QuestionContentSchemaSchema } from '../../../api/controllers/questions/question-content.schema';
import type { LessonInfo } from './Form';
import { zodAddShape } from '../../../utils/z';

export const useValidation = (translationLangs: string[]) => {
  const { createObjectResolver } = useValidators();

  const firstTransLang = translationLangs[0];

  const WordInfoSchema = z
    .object({
      fieldUniqueId: z.string(),
      type: z.literal('word'),
      subType: z.literal('search-word'),
      wordValue: z.string().trim(),
      wordDisplayType: z.number().optional(),
      word: WordWithTranslationSchema.optional(),
      makeOfficial: z.boolean().optional(),
      translations: z.record(
        z.object({
          lang: z.string(),
          translation: z.string().trim(),
          advancedTranslation: z
            .array(
              z.object({
                schema: z.string().optional(),
                attrs: z.record(z.union([z.number(), z.array(z.number())])).optional(),
                translation: z.string().trim(),
                examples: z
                  .array(
                    z.object({
                      text: z.string(),
                      translation: z.string().trim().optional(),
                    }),
                  )
                  .optional(),
              }),
            )
            .nullable(),
        }),
      ),
    })
    .superRefine((obj, ctx) => {
      const hasSomeTranslation = hasAtLeastOneTranslation(obj.translations);
      if (obj.wordValue && !hasSomeTranslation) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          message: 'Cannot be empty',
          path: ['translations', firstTransLang, 'translation'],
          minimum: 1,
          inclusive: true,
          type: 'string',
        });
      } else if (hasSomeTranslation && !obj.wordValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          message: 'Cannot be empty',
          path: ['wordValue'],
          minimum: 1,
          inclusive: true,
          type: 'string',
        });
      }
    });

  const QuizQuestionSchema = z.object({
    fieldUniqueId: z.string(),
    type: z.enum(['existing', 'new', 'update']),
    questionId: z.number().optional(),
    order: z.number(),
    points: z.number().min(0),
    title: z.string().optional(),
    content: QuestionContentSchemaSchema.optional(),
    isOfficial: z.boolean().optional(),
  });

  const QuizInfoSchema = z
    .object({
      fieldUniqueId: z.string(),
      type: z.literal('quiz'),
      id: z.number().optional(),
      title: z.string().min(1, 'Quiz title is required'),
      description: z.string(),
      priority: z.number().optional(),
      isHidden: z.boolean().optional(),
      questions: z.array(QuizQuestionSchema),
    })
    .superRefine((obj, ctx) => {
      if (obj.questions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          message: 'Quiz must have at least one question',
          path: ['questions'],
          minimum: 1,
          inclusive: true,
          type: 'array',
        });
      }

      // Validate that questions with content have valid points
      obj.questions.forEach((question, index) => {
        if (question.content && question.points <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            message: 'Points must be greater than 0',
            path: ['questions', index, 'points'],
            minimum: 0,
            inclusive: false,
            type: 'number',
          });
        }
      });
    });

  // HACK: zod doesn't support discrimination of discriminated unions
  zodAddShape(WordInfoSchema, { type: z.literal('word') });
  zodAddShape(QuizInfoSchema, { type: z.literal('quiz') });

  const LessonInfoBaseSchema = z.object({
    fieldUniqueId: z.string(),
    type: z.literal('lesson'),
    id: z.number().optional(),
    title: z.string().min(1),
    description: z.string(),
  });

  type LessonInfoSchemaType = z.infer<typeof LessonInfoBaseSchema> & {
    children: unknown[];
  };

  type LessonItem = LessonInfo['children'][number];
  const filterEmptyItems = (item: LessonItem) => {
    if (item.type === 'word') {
      return item.wordValue !== '';
    }
    if (item.type === 'quiz') {
      return item.title !== '';
    }
    return true;
  };

  const LessonInfoSchema: z.ZodType<LessonInfoSchemaType> = LessonInfoBaseSchema.extend({
    children: z.lazy(() =>
      z
        .array(z.discriminatedUnion('type', [LessonInfoSchema, WordInfoSchema, QuizInfoSchema] as never))
        .refine((arr) => Array.isArray(arr) && arr.length > 0 && arr.some(filterEmptyItems), {
          message: 'Cannot be empty',
        })
        .transform((array) => array.filter(filterEmptyItems)),
    ),
  });

  return {
    resolver: createObjectResolver({
      children: z.array(LessonInfoSchema),
    }),
  };
};

// const getFirstEmptyTranslationLang = (translations: Record<string, { translation: string }>) => {
//   return Object.keys(translations).find((lang) => !translations[lang].translation);
// };
const hasAtLeastOneTranslation = (translations: Record<string, { translation: string }>) => {
  return Object.values(translations).some((t) => t.translation);
};
