import { type Observable, type QueueFactory } from "./types.ts";

export function iterator<T, E>(
  init: Observable<T, E>,
  newQueue?: QueueFactory
): () => AsyncGenerator<T> {
  // Uses the default queue (list) if the newQueue is undefined or null:
  newQueue = newQueue || (() => []);
  return async function* () {
    const queue = newQueue();
    let promise;
    let notify: undefined | (() => void | Promise<void>);
    let push = async (
      error: undefined | E,
      value: undefined | T,
      done: boolean
    ) => {
      const slot: {
        error?: E;
        value?: T;
        done: boolean;
        promise?: Promise<boolean>;
        notify?: (val: boolean) => void;
      } = { error, value, done };
      slot.promise = new Promise<boolean>((n) => (slot.notify = n));
      await queue.push(slot);
      notify && notify();
      notify = undefined;
      return slot.promise;
    };
    const unsubscribe = init({
      next: (value: T) => push(undefined, value, false),
      complete: () => push(undefined, undefined, true),
      error: (err: E) => push(err, undefined, true),
    });

    let slot;
    try {
      while (true) {
        slot = await queue.shift();
        if (slot) {
          try {
            if (slot.error) {
              throw slot.error;
            } else if (slot.done) {
              break;
            } else {
              yield slot.value;
            }
          } finally {
            slot.notify(true);
          }
        } else {
          await (promise = notify
            ? promise
            : new Promise<void>((n) => (notify = n)));
        }
      }
    } finally {
      notify && notify();
      push = async () => false; // Stop pushing in the queue...
      typeof unsubscribe === "function" && (await unsubscribe());
      while ((slot = await queue.shift())) {
        slot.notify(false);
      }
    }
  };
}
