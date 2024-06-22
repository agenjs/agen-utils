import {
  type AcceptFilter,
  type IterableLike,
  toAsyncIterator,
} from "./types.ts";

export function interrupt<T>(
  before: null | undefined | AcceptFilter<T>,
  after?: null | undefined | AcceptFilter<T>
) {
  return async function* (it: IterableLike<T> | (() => IterableLike<T>)) {
    let idx = 0;
    for await (let value of toAsyncIterator(it)) {
      if (before && (await before(value, idx))) break;
      yield value;
      if (after && (await after(value, idx))) break;
      idx++;
    }
  };
}
