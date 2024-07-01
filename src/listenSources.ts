import { compareArrays } from "./compareArrays.ts";
import { listen } from "./listen.ts";
import {
  type IterableLike,
  type Observer,
  toAsyncIterator,
  toObserver,
} from "./types.ts";

export function listenSources<T, E = Error>(
  sources: IterableLike<IterableLike<T>[]>,
  observer:
    | ((
        val: (T | undefined)[]
      ) => unknown | boolean | Promise<unknown | boolean>)
    | Observer<(T | undefined)[], E>,
  equal: (
    first: (T | undefined)[],
    second: (T | undefined)[]
  ) => boolean = compareArrays
): () => void {
  type IteratorInfo<T> = {
    iterator: AsyncGenerator<T>;
    value: T | undefined;
    cleanup: () => void;
    initialized: boolean;
  };
  const o = toObserver<(T | undefined)[], E>(observer);
  let indexes = new Map<IterableLike<T>, IteratorInfo<T>>();
  let prevValues: undefined | (T | undefined)[] = undefined;
  const notify = async () => {
    const values = [...indexes.values()]
      .filter((info) => info.initialized)
      .map((info) => info.value);
    if (prevValues === undefined || !equal(prevValues, values)) {
      await o.next(values);
    }
    prevValues = values;
    return true;
  }; 
  return listen(sources, {
    ...o,
    next: async (iterators) => {
      const newIndexes = new Map<IterableLike<T>, IteratorInfo<T>>();
      for (const it of iterators) {
        let info = indexes.get(it);
        if (info) {
          indexes.delete(it);
        } else {
          const iterator = toAsyncIterator(it);
          const iteratorInfo = {
            iterator,
            value: undefined,
            initialized: false,
          } as IteratorInfo<T>;
          const cleanup = () => {
            indexes.delete(it);
            return notify();
          };
          iteratorInfo.cleanup = listen<T>(iterator, {
            next: (value) => {
              iteratorInfo.initialized = true;
              iteratorInfo.value = value;
              return notify();
            },
            complete: cleanup,
            error: cleanup,
          });
          info = iteratorInfo;
        }
        newIndexes.set(it, info);
      }
      [...indexes.values()].forEach((info) => info.cleanup());
      indexes = newIndexes;
      return notify();
    },
  });
}
