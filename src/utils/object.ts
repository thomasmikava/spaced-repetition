/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
export function removeKeys<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const obj2 = { ...obj };
  for (let i = 0; i < keys.length; ++i) {
    delete obj2[keys[i]];
  }
  return obj2;
}

export function pickKeys<T extends {}, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const obj2 = {} as Pick<T, K>;
  for (let i = 0; i < keys.length; ++i) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(keys[i]) || obj[keys[i]] !== undefined) {
      obj2[keys[i]] = obj[keys[i]];
    }
  }
  return obj2;
}

export function removeUndefinedValues<T extends {}>(obj: T): T {
  const obj2 = { ...obj } as T;
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (obj2[key as never] === undefined) {
      delete obj2[key as never];
    }
  }
  return obj2;
}
