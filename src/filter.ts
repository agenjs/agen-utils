import {
  type AcceptFilter,
  type IterableLike,
  toAsyncIterator,
} from "./types.ts";

export function filter<T>(
  accept: AcceptFilter<T>
): (it: IterableLike<T> | (() => IterableLike<T>)) => AsyncGenerator<T> {
  return async function* (it: IterableLike<T> | (() => IterableLike<T>)) {
    let idx = 0;
    for await (let value of toAsyncIterator(it)) {
      if (await accept(value, idx++)) yield value;
    }
  };
}
