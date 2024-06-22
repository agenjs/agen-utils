import { type IterableLike, toAsyncIterator } from "./types.ts";

export function each<T>(
  before: undefined | ((val: T, idx: number) => unknown | Promise<unknown>),
  after?: undefined | ((val: T, idx: number) => unknown | Promise<unknown>)
): (it: IterableLike<T> | (() => IterableLike<T>)) => AsyncGenerator<T> {
  return async function* (it: IterableLike<T> | (() => IterableLike<T>)) {
    let idx = 0;
    for await (const value of toAsyncIterator(it)) {
      try {
        before && (await before(value, idx));
        yield value;
      } finally {
        after && (await after(value, idx));
        idx++;
      }
    }
  };
}
