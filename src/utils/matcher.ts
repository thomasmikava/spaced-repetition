/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SELF_REF = '#self';

export type Matcher<T extends {}> = {
  [k in keyof T]?: T[k] extends Record<PropertyKey, unknown> ? Matcher<T[k]> : Values<T[k]>;
};

type Values<T> =
  | T
  | typeof SELF_REF
  | null
  | T[]
  | { $not: T | (T | null)[] | null }
  | { $and: (T | null)[] }
  | { $or: (T | null)[] }
  | (T extends Array<infer R> ? R : never);

export const isMatch = <T extends {}>(comparisonValue: T, matcher: Matcher<T>, selfValue?: T): boolean => {
  let rule = matcher as unknown;
  if (rule === SELF_REF) {
    rule = selfValue as never;
  }
  if (rule === comparisonValue) return true;
  if (rule === null) {
    return comparisonValue === null || comparisonValue === undefined;
  }
  if (Array.isArray(rule)) {
    if (Array.isArray(comparisonValue)) {
      return comparisonValue.every((v) => rule.includes(v));
    }
    return rule.includes(comparisonValue);
  }
  if (typeof rule === 'object' && isMatcherObject(rule)) {
    const op = Object.keys(rule)[0] as '$not' | '$and' | '$or';
    if (op === '$not') return !isMatch(comparisonValue, rule[op] as never, selfValue);
    if (op === '$and') return (rule[op] as Matcher<T>[]).every((m) => isMatch(comparisonValue, m, selfValue));
    if (op === '$or') return (rule[op] as Matcher<T>[]).some((m) => isMatch(comparisonValue, m, selfValue));
    return false;
  }
  if (typeof rule === 'object') {
    if (typeof comparisonValue !== 'object' || comparisonValue === null) return false;
    for (const key in rule) {
      if (!isMatch(comparisonValue[key as never], rule[key as never] as never, selfValue?.[key as never])) return false;
    }
    return true;
  }
  if (Array.isArray(comparisonValue)) {
    return comparisonValue.includes(rule);
  }
  return false;
};

const isMatcherObject = (obj: unknown): obj is Matcher<any> => {
  if (typeof obj !== 'object' || obj === null) return false;
  const keys = Object.keys(obj);
  return keys.length === 1 && keys[0].startsWith('$');
};

export type IfThenStatement<T extends {}, V> = {
  $if: Matcher<T>;
  then: V | IfThenStatement<T, V>;
  else: V | IfThenStatement<T, V>;
};

export const getConditionalValue = <T extends {}, V>(object: IfThenStatement<T, V>, condition: Matcher<T>): V => {
  const ifStatement = object.$if;
  if (isMatch(condition, ifStatement)) {
    if (isConditionalObject<T, V>(object.then)) {
      return getConditionalValue(object.then, condition);
    }
    return object.then;
  } else {
    if (isConditionalObject<T, V>(object.else)) {
      return getConditionalValue(object.else, condition);
    }
    return object.else;
  }
};

export const isConditionalObject = <T extends {}, V>(value: unknown): value is IfThenStatement<T, V> => {
  return value !== null && typeof value === 'object' && '$if' in value;
};

export const getConditionalOrRawValue = <T extends {}, V>(
  object: IfThenStatement<T, V> | V,
  condition: Matcher<T>,
): V => {
  if (isConditionalObject<T, V>(object)) {
    return getConditionalValue(object, condition);
  }
  return object;
};
