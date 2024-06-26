import { type IterableLike, toAsyncIterator } from "./types.ts";

export function batch<T>(
  batchSize: number = 1
): (it: IterableLike<T> | (() => IterableLike<T>)) => AsyncGenerator<T[]> {
  return async function* (
    it: IterableLike<T> | (() => IterableLike<T>)
  ): AsyncGenerator<T[]> {
    let batch: T[] = [];
    for await (const value of toAsyncIterator(it)) {
      batch.push(value);
      if (batch.length === batchSize) {
        yield batch;
        batch = [];
      }
    }
    if (batch.length) yield batch;
  };
}
