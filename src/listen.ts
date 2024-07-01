import {
  type IterableLike,
  type Observer,
  toObserver,
  toAsyncIterator,
} from "./types.ts";

export function listen<T, E = Error>(
  params: IterableLike<T> | (() => IterableLike<T>),
  observer: ((val: T) => unknown | Promise<unknown>) | Partial<Observer<T, E>>
): () => void {
  let done = false;
  let it: AsyncGenerator<T, void>;
  (async () => {
    const o = toObserver<T, E>(observer);
    try {
      it = toAsyncIterator<T>(params);
      let slot;
      while (!done && (slot = await it.next())) {
        if (done || slot.done) break;
        await o.next(await slot.value);
      }
      o.complete && (await o.complete());
    } catch (error) {
      o.error && (await o.error(error as E));
    }
  })();
  return () => {
    done = true;
    it && it.return && it.return();
  };
}
