import { toAsyncIterator, type IterableLike } from "./types.ts";

export function compose<O, I = any, T = I>(
  ...list: ((
    it: IterableLike<T> | (() => IterableLike<T>)
  ) => IterableLike<T>)[]
): (it?: IterableLike<I> | (() => IterableLike<I>)) => AsyncGenerator<O> {
  return async function* (
    it: IterableLike<I> | (() => IterableLike<I>) = []
  ): AsyncGenerator<O> {
    let f: IterableLike<any> = toAsyncIterator(it);
    for (const transform of list) {
      f = transform(f);
    }
    yield* toAsyncIterator<O>(f as IterableLike<O>);
  };
}
