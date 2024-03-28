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
