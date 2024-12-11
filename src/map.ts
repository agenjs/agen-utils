import { type IterableLike, toAsyncIterator } from "./types.ts";

export function map<F, T>(
  f: (val: F, idx: number) => T
): (it: IterableLike<F> | (() => IterableLike<F>)) => AsyncGenerator<T> {
  return async function* (it: IterableLike<F> | (() => IterableLike<F>)) {
    let idx = 0;
    for await (const value of toAsyncIterator(it)) {
      yield await f(value, idx++);
    }
  };
}
