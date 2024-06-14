import { type IterableLike, toAsyncIterator } from "./types.ts";

export function fin<E = Error, T = any>(
  action: (error: E | undefined, idx: number) => unknown | Promise<unknown>
): (it: IterableLike<T>) => AsyncGenerator<T> {
  return async function* (it: IterableLike<T>) {
    let error: E | undefined;
    let idx: number = 0;
    try {
      for await (let value of toAsyncIterator(it)) {
        idx++;
        yield value;
      }
    } catch (err) {
      error = err as E;
      throw error;
    } finally {
      await action(error, idx);
    }
  };
}
