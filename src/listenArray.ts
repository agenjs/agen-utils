import { listen } from "./listen.ts";
import { type IterableLike, type Observer, toObserver } from "./types.ts";

export function listenArray<T, E = Error>(
  generators: IterableLike<T>[],
  observer:
    | ((val: T[]) => void | boolean | Promise<void | boolean>)
    | Observer<T[], E>
): () => void {
  const o = toObserver<T[], E>(observer);
  let values: T[] = new Array(generators.length);
  const registrations = generators.map((gen, idx) =>
    listen<T, E>(gen, {
      next: async (value) => {
        values[idx] = value;
        for (let i = 0; i < values.length; i++) {
          if (values[i] === undefined) return true;
        }
        return await o.next(await Promise.all(values));
      },
      complete: o.complete,
      error: o.error,
    })
  );
  return () => registrations.forEach((r) => r());
}
