import type { ZodTypeAny } from 'zod';

export const zodAddShape = (WordInfoSchema: ZodTypeAny, shape: Record<string, ZodTypeAny>) => {
  (WordInfoSchema as never as Record<string, unknown>).shape = {
    ...(WordInfoSchema as never as Record<'shape', Record<string, unknown>>).shape,
    ...shape,
  };
};
