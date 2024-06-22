import { listenArray } from "./listenArray.ts";
import { slot } from "./slot.ts";
import type { IterableLike, Slot } from "./types.ts";

export function selectArray<T, R = T>(
  generators: (IterableLike<T> | (() => IterableLike<T>))[],
  transform: (val: T[]) => R | Promise<R> = (v: any) => v as R
): Slot<R> {
  const s = slot<R>();
  s.promise.finally(
    listenArray(generators, async (v: any) => {
      await s.observer.next(await transform(v));
    })
  );
  return s;
}
