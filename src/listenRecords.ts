import { listenArray } from "./listenArray.ts";
import { type IterableLike, type Observer, toObserver } from "./types.ts";

export function listenRecords<T, E = Error, K extends keyof T = keyof T>(
  generators: Record<K, IterableLike<T[K]>>[],
  observer: ((val: T) => void | Promise<void>) | Observer<T, E>
): () => void {
  const o = toObserver<T, E>(observer);
  const keys = Object.keys(generators) as K[];
  const list = Object.values(generators) as IterableLike<T[K]>[];
  return listenArray(list, {
    error: o.error,
    complete: o.complete,
    next: (values: T[K][]) =>
      o.next(
        keys.reduce(
          (obj: T, key: K, idx: number) => ((obj[key] = values[idx]), obj),
          {} as T
        )
      ),
  });
}
