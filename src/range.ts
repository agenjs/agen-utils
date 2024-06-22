import { type IterableLike, toAsyncIterator } from "./types.ts";

export function range<T>(
  from: number = 0,
  count: number = Infinity
): (it: IterableLike<T> | (() => IterableLike<T>)) => AsyncGenerator<T> {
  return async function* (it: IterableLike<T> | (() => IterableLike<T>)) {
    let idx = 0;
    if (count <= 0) return;
    for await (const value of toAsyncIterator(it)) {
      if (idx >= from) yield value;
      idx++;
      if (idx >= from + count) break;
    }
  };
}
