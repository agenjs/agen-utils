import { compose } from "./compose.ts";
import { fin } from "./fin.ts";
import { iterator } from "./iterator.ts";
import { multiplexer } from "./multiplexer.ts";
import { newSkipQueue } from "./newSkipQueue.ts";
import { type Observer, type QueueFactory, type Slot } from "./types.ts";

export function slot<T, E = Error>(
  value?: T,
  newQueue: QueueFactory = newSkipQueue
): Slot<T, E> {
  let done: boolean = false;
  let resolve: () => void;
  let reject: (error: E) => void;
  let promise = new Promise<void>((y, n) => ((resolve = y), (reject = n)));
  let observer: Observer<T, E>;
  const m = multiplexer<T, E>(
    compose<T>(
      iterator((o: Observer<T, E>) => {
        observer = {
          ...o,
          next: (v: T) => o.next((value = v)),
        };
        (values as Slot<T, E>).observer = observer;
      }, newQueue),
      fin((error?: E) => {
        done = true;
        error ? reject(error) : resolve();
      })
    )([]),
    newQueue
  );
  async function* values<R = T>(
    filter: (v: T) => R = (v: T) => v as unknown as R
  ) {
    for await (let value of m()) {
      yield await filter(value);
    }
  }
  values.promise = promise;
  Object.defineProperty(values, "done", {
    get: () => done,
  });
  Object.defineProperty(values, "value", {
    get: () => value,
    set: (v) => {
      observer.next(v);
    },
  });
  value !== undefined && (values.value = value);
  return values as Slot<T, E>;
}
