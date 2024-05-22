import { z } from 'zod';
import { useValidators } from '../../../utils/useValidators';
import { WordWithTranslationSchema } from '../../../api/controllers/words/words.schema';
import type { LessonInfo } from './Form';

export const useValidation = () => {
  const { createObjectResolver, validators } = useValidators();

  const KnownWordInfo = z.object({
    fieldUniqueId: z.string(),
    type: z.literal('word'),
    subType: z.literal('known-word'),
    word: WordWithTranslationSchema,
  });
  const SearchWordInfo = z.object({
    fieldUniqueId: z.string(),
    type: z.literal('word'),
    subType: z.literal('search-word'),
    searchValue: z.literal(''),
  });
  const CustomWordInfoSchema = z.object({
    fieldUniqueId: z.string(),
    type: z.literal('word'),
    subType: z.literal('custom-word'),
    wordDisplayType: z.number(),
    value: validators.trim(z.string().min(1)),
    translation: validators.trim(z.string().min(1)),
  });
  const WordInfoSchema = z.discriminatedUnion('subType', [KnownWordInfo, SearchWordInfo, CustomWordInfoSchema]);
  const NonSearchableWordInfoSchema = z.discriminatedUnion('subType', [KnownWordInfo, CustomWordInfoSchema]);

  // HACK: zod doesn't support discrimination of discriminated unions
  (WordInfoSchema as never as Record<string, unknown>).shape = {
    ...(WordInfoSchema as never as Record<'shape', Record<string, unknown>>).shape,
    type: z.literal('word'),
  };
  (NonSearchableWordInfoSchema as never as Record<string, unknown>).shape = {
    ...(NonSearchableWordInfoSchema as never as Record<'shape', Record<string, unknown>>).shape,
    type: z.literal('word'),
  };

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
    return item.type !== 'word' || item.subType !== 'search-word';
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
