import { z, type ZodTypeAny } from 'zod';

export const zodAddShape = (WordInfoSchema: ZodTypeAny, shape: Record<string, ZodTypeAny>) => {
  (WordInfoSchema as never as Record<string, unknown>).shape = {
    ...(WordInfoSchema as never as Record<'shape', Record<string, unknown>>).shape,
    ...shape,
  };
};

export const numberSchema = z.preprocess((val) => {
  if (typeof val === 'string') return parseInt(val, 10);
  return val;
}, z.number());

export const arraySchema = <T extends ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  }, z.array(schema));

export const booleanSchema = z.preprocess((val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}, z.boolean());

export { z };
