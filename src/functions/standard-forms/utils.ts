import type { StandardCardAttributes } from '../../database/types';
import { areSplittedEqual, areSplittedOverlapping, slashSplit } from '../../utils/split';

const reverseMapper = new Map<object, Map<number, unknown>>();

export function getAttrEnumValue<T extends number>(
  attrs: StandardCardAttributes | null | undefined,
  enumObject: { id: number; records: Record<T, number> },
): { value: T | undefined; id: number | undefined } {
  if (!attrs) return { value: undefined, id: undefined };
  const recordValueId = attrs[enumObject.id];
  if (recordValueId === undefined) return { value: undefined, id: undefined };

  let rMapper = reverseMapper.has(enumObject.records) ? reverseMapper.get(enumObject.records) : null;
  if (!rMapper) {
    rMapper = reverseObject(enumObject.records);
    reverseMapper.set(enumObject.records, rMapper);
  }
  return { value: ((rMapper as Map<number, T>).get(recordValueId) ?? undefined) as T, id: recordValueId };
}

const reverseObject = <T extends number, K extends string | number>(obj: Record<T, K>) => {
  const result = new Map<K, T>();
  for (const key in obj) {
    const value = obj[key];
    result.set(value, +key as unknown as T);
  }
  return result;
};

export function isStandardEqual(value: string, standardForm: string | null | string[]) {
  if (!standardForm) return false;
  if (typeof standardForm === 'string') return areSplittedEqual(value, standardForm);
  return standardForm.some((form) => areSplittedEqual(value, form));
}

export function isStandardEqualSoft(value: string, standardForm: string | null | string[]) {
  if (!standardForm) return false;
  if (value === standardForm) return true;
  if (typeof standardForm === 'string') return areSplittedOverlapping(value, standardForm);
  return standardForm.some((form) => areSplittedOverlapping(value, form));
}

export function isSomeFormStandard(value: string, standardForm: string | null | string[]) {
  if (!standardForm) return false;
  if (value === standardForm) return true;
  if (!value.includes('/')) {
    return isStandardEqualSoft(value, standardForm);
  }
  return slashSplit(value).some((splittedValue) => isStandardEqualSoft(splittedValue, standardForm));
}
