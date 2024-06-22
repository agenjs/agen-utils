import { type IterableLike, toAsyncIterator } from "./types.ts";

export function flatten<T>(): (
  it: IterableLike<any> | (() => IterableLike<any>)
) => AsyncGenerator<T> {
  return async function* exp(
    it: IterableLike<any> | (() => IterableLike<any>)
  ): AsyncGenerator<T> {
    for await (const value of toAsyncIterator(it)) {
      if (typeof value === "object" && value) {
        yield* exp(value as IterableLike<any>);
      } else {
        yield value;
      }
    }
  };
}
