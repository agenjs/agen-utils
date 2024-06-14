import { type IterableLike, toAsyncIterator } from "./types.ts";

export function flatten<T>(): (
  it: IterableLike<T | IterableLike<T>>
) => AsyncGenerator<T> {
  return async function* exp(
    it: IterableLike<T | IterableLike<T>>
  ): AsyncGenerator<T> {
    for await (let value of await toAsyncIterator(it)) {
      if (typeof value === "object" && value) {
        yield* exp(value as IterableLike<T | IterableLike<T>>);
      } else {
        yield value;
      }
    }
  };
}
