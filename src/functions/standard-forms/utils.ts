import type { StandardCardAttributes } from '../../database/types';
import { areSplittedEqual } from '../../utils/split';

const reverseMapper = new Map<object, Map<number, unknown>>();

export function getAttrEnumValue<T extends number>(
  attrs: StandardCardAttributes | null | undefined,
  enumObject: { id: number; records: Record<T, number> },
): T | undefined {
  if (!attrs) return undefined;
  const value = attrs[enumObject.id];
  if (value === undefined) return undefined;

  let rMapper = reverseMapper.has(enumObject.records) ? reverseMapper.get(enumObject.records) : null;
  if (!rMapper) {
    rMapper = reverseObject(enumObject.records);
    reverseMapper.set(enumObject.records, rMapper);
  }
  return (rMapper as Map<number, T>).get(value) as T;
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
