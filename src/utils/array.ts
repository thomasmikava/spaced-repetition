/* eslint-disable @typescript-eslint/no-explicit-any */
export function uniquelize<T extends number | string | null>(arr: T[]): T[];
export function uniquelize<T>(arr: T[], elementToKey: (el: T) => string | number | null | undefined): T[];
export function uniquelize(arr: any[], elementToKey?: (el: any) => string | number | null | undefined): any[] {
  const fixed = new Set<any>();
  const uniqueArr: any[] = [];
  for (const elem of arr) {
    const key = elementToKey ? elementToKey(elem) : elem;
    if (key !== undefined && key !== null) {
      if (fixed.has(key)) continue;
      fixed.add(key);
    }
    uniqueArr.push(elem);
  }
  return uniqueArr;
}

export function groupArray<T, K extends string | number | null | undefined>(
  arr: T[],
  elementToKey: (el: T) => K,
): T[][];
export function groupArray<T, K extends string | number | null | undefined, R>(
  arr: T[],
  elementToKey: (el: T) => K,
  groupElements: (elements: T[], key: K) => R,
): R[];
export function groupArray<T, K extends string | number | null | undefined>(
  arr: T[],
  elementToKey: (el: T) => K,
  groupElements: (elements: T[], key: K) => any = (e) => e,
): any[] {
  const keyToElements: Record<any, T[] | undefined> = {};
  for (const elem of arr) {
    const key = elementToKey(elem) as any;
    if (key !== undefined && key !== null) {
      if (!keyToElements[key]) keyToElements[key] = [];
      keyToElements[key]!.push(elem);
    }
  }
  const usedKeys = new Set<any>();
  const finalArr: any[] = [];
  for (const elem of arr) {
    const key = elementToKey(elem) as any;
    if (key !== undefined && key !== null) {
      if (usedKeys.has(key)) continue;
      usedKeys.add(key);
      const elements = keyToElements[key] || [elem];
      finalArr.push(groupElements(elements, key));
    } else {
      finalArr.push(groupElements([elem], key));
    }
  }
  return finalArr;
}

export const isNonNullable = <T>(val: T): val is NonNullable<T> => {
  return val !== undefined && val !== null;
};

export const sortArrayByOriginalArray = <T>(array: T[], originalArray: T[]) => {
  const indexMap = new Map<unknown, number>();
  for (let i = 0; i < originalArray.length; i++) {
    indexMap.set(originalArray[i], i);
  }

  return array.sort((a, b) => {
    const indexA = indexMap.get(a);
    const indexB = indexMap.get(b);
    if (indexA === undefined || indexB === undefined) return 0;
    return indexA - indexB;
  });
};
