declare module "@agen/utils" {
  export type Observer<T, E = Error> = {
    // Pushes a new value to all listeners.
    next(val: T): Promise<void>;
    // Finalizes iterations and notifies all listeners about it
    complete(): Promise<void>;
    // Notify about an error and interrupts iterations
    error(err: E): Promise<void>;
  };

  // https://github.com/agenjs/agen-utils/ v0.11.0 Copyright 2023 Mikhail Kotelnikov
  export function asIterator<T>(value: any): AsyncGenerator<T, void, unknown>;

  export function batch<T = any>(
    batchSize: number = 1
  ): AsyncGeneratorFunction<T>;

  export function compose<T = any, R = any>(
    ...list: AsyncGeneratorFunction<T>[]
  ): AsyncGeneratorFunction<R>;

  export function each<T>(
    before?: (value: T) => void,
    after?: (value: T) => void
  ): AsyncGeneratorFunction<T>;

  export function filter<T>(
    accept: (value: T) => boolean
  ): AsyncGeneratorFunction<T>;

  export function flatten<T>(): AsyncGeneratorFunction<T>;

  export function fin<T>(
    action: (error: Error, index: number) => void
  ): AsyncGeneratorFunction<T>;

  export function interrupt<T>(
    before?: (value: T, index: number) => boolean,
    after: (value: T, index: number) => boolean
  ): AsyncGeneratorFunction<T>;

  export type Unsubscribe = () => void;

  export type Queue = {
    push: (value: any) => void | Promise<void>;
    shift: () => undefined | Promise<T>;
  };
  export function iterator<T, E>(
    init: (observer: Observer<T, E>) => undefined | Unsubscribe,
    newQueue?: Queue
  ): AsyncGeneratorFunction<T>;

  export function iterate<T, E>(
    init: (observer: Observer<T, E>) => undefined | Unsubscribe
  ): AsyncGenerator<T>;

  export function listen<T>(
    it: AsyncGenerator<T>,
    observer: (value: T) => void | Promise<void>
  ): Unsubscribe;

  export function listenAll(
    generators: AsyncGenerator[] = [],
    observer: (values: any[]) => any
  ): Unsubscribe;

  export function map<T>(
    f: (value: T, index: number) => any
  ): AsyncGeneratorFunction<T>;

  export function multiplexer<T>(
    it: AsyncGenerator<T>,
    newQueue?: Queue,
    awaitNew?: boolean = false
  ): AsyncGeneratorFunction<T>;

  export function newSkipQueue(): Queue;

  export function range<T>(
    from: number = 0,
    count: number = Infinity
  ): AsyncGeneratorFunction<T>;

  export function series<T>(
    split: (value: T) => boolean
  ): AsyncGeneratorFunction<T>;

  export type Slot<T> = (() => AsyncGenerator<T>) &
    Observer<T> & {
      value: T;
    } & {
      promise: Promise<void>;
    };

  export function slot<T>(value: T, newQueue?: Queue = newSkipQueue): Slot<T>;

  export function select<T>(
    generators: AsyncGenerator = [],
    transform: (values: any[]) => T
  ): AsyncGeneratorFunction<T>;
}
