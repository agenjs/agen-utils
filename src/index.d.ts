declare module "@agen/utils" {
  export type AsyncIterable<T> = AsyncGenerator<T> | (() => AsyncGenerator<T>);
  export type SyncIterable<T> = Generator<T> | (() => Generator<T>);
  export type Iterable<T> = SyncIterable<T> | AsyncIterable<T>;

  export type Observer<T = any, E = Error> = {
    // Pushes a new value to all listeners.
    next(val: T): Promise<void>;
    // Finalizes iterations and notifies all listeners about it
    complete(): Promise<void>;
    // Notify about an error and interrupts iterations
    error(err: E): Promise<void>;
  };

  // https://github.com/agenjs/agen-utils/ v0.11.0 Copyright 2023 Mikhail Kotelnikov
  export function asIterator<T>(
    value: Iterable<T>
  ): AsyncGenerator<T, void, unknown>;

  export function batch<T = any>(
    batchSize: number = 1
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export function compose<T = any, R = T>(
    ...list: Iterable<T>[]
  ): (it: Iterable<T>) => AsyncGenerator<R>;

  export function each<T>(
    before?: (value: T) => void,
    after?: (value: T) => void
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export function filter<T>(
    accept: (value: T) => boolean
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export function flatten<T = any>(): (it: any) => AsyncGenerator<T>;

  export function fin<T = any>(
    action: (error: Error, index: number) => void | Promise<T>
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export function interrupt<T = any>(
    before?: (value: T, index: number) => boolean,
    after: (value: T, index: number) => boolean
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export type Unsubscribe = () => void;

  export type Queue<T = any> = {
    push: (value: T) => void | Promise<T>;
    shift: () => void | Promise<T>;
  };
  export function iterator<T, E = Error>(
    init: (observer: Observer<T, E>) => void | Unsubscribe,
    newQueue?: Queue<T>
  ): () => AsyncGenerator<T>;

  export function iterate<T, E>(
    init: (observer: Observer<T, E>) => void | Unsubscribe
  ): AsyncGenerator<T>;

  export function listen<T>(
    generators: Iterable<T>,
    observer: Observer<T> | ((value: T) => void | Promise<void>)
  ): Unsubscribe;

  export function listenAll<T = any>(
    generators: Record<string, Iterable<T>> | Iterable<T>[] = [],
    observer: Observer<T> | ((values: T[]) => void | Promise<void>)
  ): Unsubscribe;

  export function map<T>(
    f: (value: T, index: number) => any
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export function multiplexer<T>(
    it: Iterable<T>,
    newQueue?: Queue<T>,
    awaitNew?: boolean = false
  ): () => AsyncGenerator<T>;

  export function newSkipQueue<T = any>(): Queue<T>;

  export function range<T>(
    from: number = 0,
    count: number = Infinity
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export function series<T>(
    split: (value: T) => boolean
  ): (it: Iterable<T>) => AsyncGenerator<T>;

  export type Slot<T> = () => AsyncGenerator<T> &
    Observer<T> & {
      value: T;
    } & {
      promise: Promise<void>;
    };

  export function slot<T>(
    value: T,
    newQueue?: Queue<T> = newSkipQueue
  ): Slot<T>;

  export function select<T = any>(
    generators: Iterable<T>[] = [],
    transform: (values: T[]) => T
  ): (it: Iterable<T>) => AsyncGenerator<T>;
}
