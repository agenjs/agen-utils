import { iterator } from "./iterator.ts";
import { type QueueFactory, type Observable } from "./types.ts";

export async function* iterate<T, E = Error>(
  init: Observable<T, E>,
  newQueue?: QueueFactory
): AsyncGenerator<T> {
  yield* iterator<T, E>(init, newQueue)();
}
