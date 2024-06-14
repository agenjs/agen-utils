import {
  type AcceptFilter,
  type IterableLike,
  toAsyncIterator,
} from "./types.ts";

export function each<T>(
  before: AcceptFilter<T>,
  after: AcceptFilter<T>
): (it: IterableLike<T>) => AsyncGenerator<T> {
  return async function* (it: IterableLike<T>) {
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
