import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodErrorMap, ZodTypeAny, ZodSchema } from 'zod';
import { useCallback } from 'react';

export const useValidators = () => {
  const errorMap: ZodErrorMap = useCallback((error, ctx) => {
    if (error.message) return { message: error.message };

    switch (error.code) {
      case z.ZodIssueCode.too_big: {
        return { message: `Max ${error.maximum} characters` };
      }
      case z.ZodIssueCode.too_small: {
        if (error.minimum === 1) {
          return { message: 'Cannot be empty' };
        }
        return { message: `Min ${error.minimum} characters` };
      }
      case z.ZodIssueCode.invalid_string: {
        if (error.validation === 'email') {
          return { message: 'Invalid email' };
        }
        break;
      }
      case z.ZodIssueCode.invalid_union: {
        return { message: error.unionErrors[0].errors[0].message };
      }
      case z.ZodIssueCode.invalid_type: {
        if (error.received === 'undefined' || error.received === 'null') {
          return { message: 'Cannot be empty' };
        }
        break;
      }
      default:
        break;
    }

    return { message: ctx.defaultError };
  }, []);

  const createResolver = <T extends ZodSchema<unknown>>(schema: T) => zodResolver(schema, { errorMap });
  const createObjectResolver = <T extends Record<string, ZodSchema<unknown>>>(object: T) =>
    zodResolver(z.object(object), { errorMap });

  const trim = (schema: ZodTypeAny) =>
    z.preprocess((value) => (typeof value === 'string' ? value.trim() : value), schema);

  const email = () => z.string().email();

  const validators = {
    trim,
    email,
  };

  return {
    createResolver,
    createObjectResolver,
    validators,
  };
};
