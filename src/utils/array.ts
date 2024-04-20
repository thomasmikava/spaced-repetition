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

export function shuffleArrayByType<Element extends { type: string | number }>(
  elements: Element[],
  groupSize = 1,
): Element[] {
  const grouped = elements.reduce(
    (acc, element) => {
      acc[element.type] = acc[element.type] || [];
      acc[element.type].push(element);
      return acc;
    },
    {} as Record<string, Element[]>,
  );

  const result: Element[] = [];
  const totalCount = elements.length;
  const typeCounts = Object.fromEntries(Object.keys(grouped).map((type) => [type, grouped[type].length]));
  const totalTypes = Object.keys(typeCounts).length;

  let remainingCount = totalCount;

  while (remainingCount > 0) {
    for (const type of Object.keys(grouped)) {
      if (grouped[type].length > 0) {
        // Calculate the number of elements of this type to take, considering groupSize and the type's proportion
        const proportion = typeCounts[type] / totalCount;
        const countForType = Math.ceil(proportion * groupSize * totalTypes);
        const countToTake = Math.min(grouped[type].length, countForType, remainingCount);

        result.push(...grouped[type].splice(0, countToTake));
        remainingCount -= countToTake;
      }
    }
  }

  return result;
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const totalElements = array.length;
  const numberOfChunks = Math.ceil(totalElements / chunkSize);
  const baseChunkSize = Math.floor(totalElements / numberOfChunks);
  let remainder = totalElements % numberOfChunks;

  const chunks: T[][] = [];
  let startIndex = 0;

  while (startIndex < totalElements) {
    const endIndex = startIndex + baseChunkSize + (remainder > 0 ? 1 : 0);
    chunks.push(array.slice(startIndex, endIndex));
    startIndex = endIndex;
    remainder -= remainder > 0 ? 1 : 0;
  }

  return chunks;
}
