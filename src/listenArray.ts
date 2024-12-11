import { listen } from "./listen.ts";
import {
  type IterableLike,
  type ObserverLike,
  toAsyncIterator,
  toObserver,
} from "./types.ts";

export function listenArray<T, E = Error>(
  generators: (IterableLike<T> | (() => IterableLike<T>))[],
  observer: ObserverLike<T[], E>
): () => void {
  const o = toObserver<T[], E>(observer);
  const promises: Promise<T>[] = new Array(generators.length);
  const registrations = generators.map((gen, idx) =>
    listen<T, E>(toAsyncIterator(gen), {
      next: async (value) => {
        promises[idx] = Promise.resolve(value);
        for (let i = 0; i < promises.length; i++) {
          if (promises[i] === undefined) return true;
        }
        return await o.next(await Promise.all(promises));
      },
      complete: o.complete,
      error: o.error,
    })
  );
  return () => registrations.forEach((r) => r());
}
