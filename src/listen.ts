import {
  type IterableLike,
  type ObserverLike,
  toObserver,
  toAsyncIterator,
} from "./types.ts";

export function listen<T, E = Error>(
  params: IterableLike<T> | (() => IterableLike<T>),
  observer: ObserverLike<T, E>,
): () => void {
  let it: AsyncGenerator<T, void>;
  (async () => {
    const o = toObserver<T, E>(observer);
    let error: E | undefined;
    try {
      it = toAsyncIterator<T>(params);
      for await (const value of it) {
        await o.next(value);
      }
    } catch (e) {
      error = e as E;
    } finally {
      if (error) {
        o.error && (await o.error(error));
      } else {
        o.complete && (await o.complete());
      }
    }
  })();
  return () => {
    it?.return?.();
  };
}
