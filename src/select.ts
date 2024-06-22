import { selectArray } from "./selectArray.ts";
import { selectRecords } from "./selectRecords.ts";
import type { IterableLike, Slot } from "./types.ts";

export function select<T, R = T>(
  generators:
    | (IterableLike<T> | (() => IterableLike<T>))[]
    | Record<
        keyof T,
        IterableLike<T[keyof T]> | (() => IterableLike<T[keyof T]>)
      >,
  transform: ((val: T[]) => R | Promise<R>) | ((val: T) => R | Promise<R>) = (
    v: any
  ) => v as R
): Slot<R> {
  return Array.isArray(generators)
    ? selectArray(generators, transform as (val: T[]) => R | Promise<R>)
    : selectRecords(generators, transform as (val: T) => R | Promise<R>);
}
