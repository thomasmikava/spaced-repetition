import { chunkArray } from './array';

export const inParallel = async <T>(promiseFns: (() => Promise<T>)[], chunkSize: number): Promise<T[]> => {
  const chunks = chunkArray(promiseFns, chunkSize);
  const results: T[] = [];
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map((fn) => fn()));
    results.push(...chunkResults);
  }
  return results;
};
