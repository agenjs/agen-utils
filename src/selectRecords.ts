import { listenRecords } from "./listenRecords.ts";
import { slot } from "./slot.ts";
import type { IterableLike, Slot } from "./types.ts";

export function selectRecords<T, R = T>(
  generators: Record<
    keyof T,
    IterableLike<T[keyof T]> | (() => IterableLike<T[keyof T]>)
  >,
  transform: (val: T) => R | Promise<R> = (v: T) => v as any as R
): Slot<R> {
  const s = slot<R>();
  s.promise.finally(
    listenRecords(generators, async (v: any) => {
      await s.observer.next(await transform(v));
    })
  );
  return s;
}
