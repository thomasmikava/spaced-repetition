import { z } from 'zod';
import { useValidators } from '../../../utils/useValidators';
import { WordWithTranslationSchema } from '../../../api/controllers/words/words.schema';
import type { LessonInfo } from './Form';
import { zodAddShape } from '../../../utils/z';

export const useValidation = () => {
  const { createObjectResolver } = useValidators();

  const WordInfoSchema = z
    .object({
      fieldUniqueId: z.string(),
      type: z.literal('word'),
      subType: z.literal('search-word'),
      wordValue: z.string().trim(),
      wordDisplayType: z.number().optional(),
      word: WordWithTranslationSchema.optional(),
      translation: z.string().trim(),
      advancedTranslation: z.array(z.any()).nullish(),
    })
    .superRefine((obj, ctx) => {
      if (obj.wordValue && !obj.translation) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          message: 'Cannot be empty',
          path: ['translation'],
          minimum: 1,
          inclusive: true,
          type: 'string',
        });
      } else if (obj.translation && !obj.wordValue) {
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

  // HACK: zod doesn't support discrimination of discriminated unions
  zodAddShape(WordInfoSchema, { type: z.literal('word') });

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
    return item.type !== 'word' || item.wordValue !== '';
  };

  const LessonInfoSchema: z.ZodType<LessonInfoSchemaType> = LessonInfoBaseSchema.extend({
    children: z.lazy(() =>
      z
        .array(z.discriminatedUnion('type', [LessonInfoSchema, WordInfoSchema] as never))
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
