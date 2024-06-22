import { type IterableLike, type Observer, toObserver } from "./types.ts";
import { listenArray } from "./listenArray.ts";
import { listenRecords } from "./listenRecords.ts";

export function listenAll<T>(
  generators:
    | (IterableLike<T> | (() => IterableLike<T>))[]
    | Record<
        keyof T,
        IterableLike<T[keyof T]> | (() => IterableLike<T[keyof T]>)
      >,
  observer: ((val: T) => void | Promise<void>) | Observer<T>
): () => void {
  return Array.isArray(generators)
    ? listenArray(
        generators as IterableLike<T>[],
        toObserver(observer) as Observer<T[]>
      )
    : listenRecords(generators, observer);
}
