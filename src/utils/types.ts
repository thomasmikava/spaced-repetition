/* eslint-disable @typescript-eslint/ban-types */
export type PartialRecord<Key extends PropertyKey, Value> = {
  [key in Key]?: Value;
};

type AllKeys<T extends {}> = T extends {} ? keyof T : never;

export type Xor<T1 extends {}, T2 extends {}> =
  | (T1 & { [key in Exclude<AllKeys<T2>, keyof T1>]?: never })
  | (T2 & { [key in Exclude<AllKeys<T1>, keyof T2>]?: never });

export type StrictOmit<T, K extends keyof T> = T extends {} ? Omit<T, K> : T;

type Propertic<T> = T extends PropertyKey ? T : never;
export type SwapKeysAndValues<T extends Record<string, unknown>> = {
  [key in keyof T as Propertic<T[key]>]: key;
};

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
