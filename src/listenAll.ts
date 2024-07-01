import {
  type IterableLike,
  type Observer,
  type ObserverLike,
  toObserver,
} from "./types.ts";
import { listenArray } from "./listenArray.ts";
import { listenRecords } from "./listenRecords.ts";

export function listenAll<T, E = Error>(
  generators:
    | (IterableLike<T> | (() => IterableLike<T>))[]
    | Record<
        keyof T,
        IterableLike<T[keyof T]> | (() => IterableLike<T[keyof T]>)
      >,
  observer: ObserverLike<T, E>
): () => void {
  return Array.isArray(generators)
    ? listenArray(
        generators as IterableLike<T>[],
        toObserver(observer) as Observer<T[], E>
      )
    : listenRecords(generators, observer);
}
