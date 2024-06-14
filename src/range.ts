import { type IterableLike, toAsyncIterator } from "./types.ts";

export function range<T>(
  from: number = 0,
  count: number = Infinity
): (it: IterableLike<T>) => AsyncGenerator<T> {
  return async function* (it: IterableLike<T>) {
    let idx = 0;
    if (count <= 0) return;
    for await (let value of toAsyncIterator(it)) {
      if (idx >= from) yield value;
      idx++;
      if (idx >= from + count) break;
    }
  };
}
