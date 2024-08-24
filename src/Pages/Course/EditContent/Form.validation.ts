import { z } from 'zod';
import { useValidators } from '../../../utils/useValidators';
import { WordWithTranslationSchema } from '../../../api/controllers/words/words.schema';
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

// const getFirstEmptyTranslationLang = (translations: Record<string, { translation: string }>) => {
//   return Object.keys(translations).find((lang) => !translations[lang].translation);
// };
const hasAtLeastOneTranslation = (translations: Record<string, { translation: string }>) => {
  return Object.values(translations).some((t) => t.translation);
};
