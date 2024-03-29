/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { HttpStatus, HttpStatusGroup } from '../api/http-status';
import { getHttpStatusGroup } from '../api/http-status';
import type { PartialRecord } from '../utils/types';

export interface GeneralError<Data = unknown> {
  status: number;
  data: Data;
}

export interface StandardError<Extra = unknown> {
  status: number;
  data: {
    code?: string;
    codes?: string[];
    reason: string;
    extra?: Extra;
  };
}

export function isGeneralError<Data = unknown>(error: any): error is GeneralError<Data> {
  return typeof error === 'object' && !!error && typeof error.status === 'number' && 'data' in error;
}

export function isStandardError<Data = unknown>(error: any): error is StandardError<Data> {
  return (
    typeof error === 'object' &&
    !!error &&
    typeof error.status === 'number' &&
    typeof error.data === 'object' &&
    !!error.data &&
    (typeof error.data.code === 'string' || Array.isArray(error.data.codes)) &&
    typeof error.data.reason === 'string'
  );
}

export function hasErrorCode(error: unknown, code: string): error is GeneralError<{ code: string }> {
  return (
    isStandardError<{ code?: string }>(error) &&
    (error.data.code === code || (!!error.data.codes && error.data.codes.includes(code)))
  );
}

export function mapErrorCode<Codes extends Record<PropertyKey, unknown>>(
  error: unknown,
  codes: Codes,
): Codes[keyof Codes] | undefined {
  if (!isStandardError<{ code?: string }>(error)) return undefined;
  const firstKey = Object.keys(codes).find(
    (code) => error.data.code === code || (!!error.data.codes && error.data.codes.includes(code)),
  );
  if (firstKey === undefined) return undefined;
  return codes[firstKey as keyof Codes];
}

export function mapErrorObjectCode<Codes extends Record<PropertyKey, Record<PropertyKey, unknown>>>(
  error: unknown,
  codes: Codes,
) {
  if (!isStandardError<{ code?: string }>(error)) return undefined;
  const errorObjectMap = {} as { [key in keyof Codes]: string | undefined };
  Object.keys(codes).forEach((key) => {
    const value = mapErrorCode(error, codes[key]);
    if (value !== undefined && value !== null) (errorObjectMap as Record<PropertyKey, unknown>)[key] = value;
  });
  if (Object.keys(errorObjectMap).length === 0) return undefined;
  return errorObjectMap;
}

export const iterateErrorObject = <T extends PartialRecord<string, string>>(
  errors: T = {} as T,
): { key: keyof T; value: NonNullable<T[keyof T]>; isSoleError: boolean }[] => {
  const nonEmptyKeys = Object.keys(errors).filter((key) => !!errors[key]) as (keyof T)[];
  const isSoleError = nonEmptyKeys.length === 1;
  return nonEmptyKeys.map((key) => ({
    key,
    value: errors[key] as NonNullable<T[keyof T]>,
    isSoleError,
  }));
};

type ErrorMessageMapObject<T> = PartialRecord<HttpStatus, T> & PartialRecord<HttpStatusGroup, T>;

export const mapErrorMessage = <T>(error: unknown, map: ErrorMessageMapObject<T> & { default: T }): T | undefined => {
  if (!error) return undefined;
  if (!isGeneralError(error)) return map.default;
  if (error.status in map) return map[error.status as HttpStatus];
  const group = getHttpStatusGroup(error.status);
  if (group && group in map) return map[group];
  return map.default;
};

export const useCommonErrorMessage = <T = string>(
  error: unknown,
  customMap?: ErrorMessageMapObject<T>,
): T | string | undefined => {
  return useMemo(
    () =>
      mapErrorMessage<T | string>(error, {
        [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
        [HttpStatusGroup.ClientError]: 'Check your data',
        [HttpStatusGroup.ServerError]: 'Something went wrong.. Try again soon.',
        default: 'Unknown error ocurred.. Please, Try again soon.',
        ...customMap,
      }),
    [error, customMap],
  );
};
