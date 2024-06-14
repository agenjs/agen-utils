import { listenAll } from "./listenAll.ts";
import { slot } from "./slot.ts";
import { IterableLike } from "./types.ts";

export function select<T, R = T>(
  generators: IterableLike<T>[] | Record<keyof T, IterableLike<T[keyof T]>>[],
  transform: ((v: T[]) => R) | ((v: T) => R) = (v: any) => v as R
) {
  const s = slot<R>();
  s.promise.finally(
    listenAll(generators, async (v: any) => {
      await s.observer.next(await transform(v));
    })
  );
  return s;
}
