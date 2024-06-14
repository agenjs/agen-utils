import { iterator } from "./iterator.ts";
import { listen } from "./listen.ts";
import {
  type IterableLike,
  type Observer,
  type QueueFactory,
} from "./types.ts";

export function multiplexer<T, E = Error>(
  it: IterableLike<T>,
  newQueue: QueueFactory,
  awaitNew: boolean = false
) {
  let list: Observer<T, E>[] = [];
  let started = false;
  let done = false;
  let value: T;
  let error: E;
{
    const forAll = async (action: (o: Observer<T, E>) => void) => {
      await Promise.all(list.map(action));
      return true;
    };
    listen<T, E>(it, {
      next: async (v) => {
        started = true;
        value = v;
        return await forAll((o) => o.next(v));
      },
      complete: async () => {
        done = true;
        return await forAll((o) => o.complete());
      },
      error: async (e: E) => {
        error = e;
        done = true;
        return await forAll((o) => o.error(e));
      },
    });
  }
  return iterator<T, E>((observer: Observer<T, E>) => {
    if (!done) {
      list.push(observer);
      started && !awaitNew && observer.next(value);
      return () => {
        list = list.filter((o) => observer !== o);
      };
    } else {
      error ? observer.error(error) : observer.complete();
    }
  }, newQueue);
}
