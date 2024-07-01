export type IterableLike<T> =
  // | Generator<T>
  | Iterable<T>
  | Iterator<T>
  // | AsyncGenerator<T>
  | AsyncIterable<T>
  | AsyncIterator<T>;

export async function* toAsyncIterator<T>(
  value: IterableLike<T> | ((...args: any[]) => IterableLike<T>)
): AsyncGenerator<T> {
  const val: any = typeof value === "function" ? value() : value;
  if (val !== null && typeof val === "object") {
    if (typeof val[Symbol.asyncIterator] === "function") {
      yield* val[Symbol.asyncIterator]();
    } else if (typeof val[Symbol.iterator] === "function") {
      yield* val[Symbol.iterator]();
    }
  } else {
    yield val;
  }
}
export const asIterator = toAsyncIterator;

// ------------------------------------
export type Observer<T = any, E = Error> = {
  // Pushes a new value to all listeners.
  next: (val: T) => boolean | Promise<boolean>;
  // Finalizes iterations and notifies all listeners about it
  complete: () => boolean | Promise<boolean>;
  // Notify about an error and interrupts iterations
  error: (err: E) => boolean | Promise<boolean>;
};

export type Observable<T, E = Error> = (
  o: Observer<T, E>
) => void | (() => unknown | Promise<unknown>);

/**
 * Slots are functions returning AsyncGenerators for values of the specfied type.
 *
 * The `value` field allows to get the current value of the slot or push the next value to all clients.
 * The `observer` allows to push the next value, rise an error or interrupt iterations.
 * The `promise` allows to listen the end of all iterations.
 */
export type Slot<T, E = Error> = (<R = T>(
  filter?: (value: T) => R
) => AsyncGenerator<T>) & {
  value: T;
  done: boolean;
  promise: Promise<void>;
  observer: Observer<T, E>;
};

export type ObserverLike<T, E = Error> =
  | ((val: T) => unknown | Promise<unknown>)
  | Partial<Observer<T, E>>;

export function toObserver<T, E = Error>(
  observer: ObserverLike<T, E>
): Observer<T, E> {
  const o = (
    typeof observer === "function"
      ? {
          next: observer,
        }
      : observer
  ) as Partial<Observer<T, E>>;
  return {
    next: async (val: T) => {
      const result = await o.next?.(val);
      return result === undefined || !!result;
    },
    complete: o.complete ? o.complete.bind(o) : () => true,
    error: o.error ? o.error.bind(o) : () => true,
  } as Observer<T, E>;
}

export type AcceptFilter<T> = (
  val: T,
  idx: number
) => undefined | boolean | Promise<undefined | boolean>;

export type QueueFactory<T = any> = () => {
  push(val: T): number | void | Promise<number | void>;
  shift(): undefined | T | Promise<T | undefined>;
};
