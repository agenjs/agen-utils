import {
  type AcceptFilter,
  type IterableLike,
  toAsyncIterator,
} from "./types.ts";

export function series<T, E = Error>(split: AcceptFilter<T>) {
  return async function* (
    values: IterableLike<T>
  ): AsyncGenerator<AsyncGenerator<T>> {
    const it: AsyncGenerator<T> = toAsyncIterator<T>(values);
    if (!it) return;
    let error: undefined | E;

    let res: { done?: boolean; value: T } | undefined = undefined;
    let counter = -1;
    try {
      while (!res || !(res as any).done) {
        yield chunk();
      }
    } catch (err) {
      error = err as E;
      throw err;
    } finally {
      if (error) {
        it.throw && (await it.throw(error));
      } else {
        it.return && (await it.return(undefined));
      }
    }
    async function* chunk(): AsyncGenerator<T> {
      while (!res || !res.done) {
        if (res) yield res.value;
        res = await it.next();
        counter++;
        if (res.done || !!(await split(res.value, counter))) break;
      }
    }
  };
}
